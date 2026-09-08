const Driver = require("../models/Driver");
const User = require("../models/User");
const Trip = require("../models/Trip");
const Shuttle = require("../models/Shuttle");
const BreakdownReport = require("../models/BreakdownReport");
const EmergencyReport = require("../models/EmergencyReport");
const { sendSuccess, sendError } = require("../utils/apiResponse");

async function ensureDriverProfile(userId) {
  let driver = await Driver.findOne({ user: userId });
  if (!driver) {
    driver = await Driver.create({
      user: userId,
      licenseNumber: `PENDING-${String(userId).slice(-8)}`,
      assignedShuttle: null,
    });
  }
  return driver;
}

async function getAllDrivers(req, res, next) {
  try {
    const drivers = await Driver.find({})
      .populate("user", "-password")
      .populate("assignedShuttle");
    return sendSuccess(res, { drivers, count: drivers.length }, "Drivers retrieved successfully");
  } catch (error) {
    next(error);
  }
}

async function getDriverById(req, res, next) {
  try {
    const driver = await Driver.findById(req.params.id)
      .populate("user", "-password")
      .populate("assignedShuttle");
    if (!driver) {
      return sendError(res, "Driver not found", 404);
    }
    return sendSuccess(res, { driver }, "Driver retrieved successfully");
  } catch (error) {
    next(error);
  }
}

async function getMyAssignedShuttle(req, res, next) {
  try {
    const driver = await ensureDriverProfile(req.user._id);
    const populatedDriver = await Driver.findById(driver._id)
      .populate({
        path: "assignedShuttle",
        populate: [
          { path: "route" },
          { path: "currentStop" },
          { path: "nextStop" },
        ],
      });

    if (!populatedDriver.assignedShuttle) return sendSuccess(res, { shuttle: null }, "No shuttle assigned");

    return sendSuccess(res, { shuttle: populatedDriver.assignedShuttle }, "Assigned shuttle retrieved successfully");
  } catch (error) {
    next(error);
  }
}

async function getMyTrip(req, res, next) {
  try {
    const driver = await ensureDriverProfile(req.user._id);
    await driver.populate("assignedShuttle");
    if (!driver?.assignedShuttle) return sendError(res, "No shuttle assigned", 404);
    const trip = await Trip.findOne({ driver: driver._id, status: "ACTIVE" }).populate("shuttle route");
    return sendSuccess(res, { trip, shuttle: driver.assignedShuttle }, "Driver trip retrieved successfully");
  } catch (error) { next(error); }
}

async function startTrip(req, res, next) {
  try {
    const driver = await ensureDriverProfile(req.user._id);
    await driver.populate("assignedShuttle");
    if (!driver?.assignedShuttle?.route) return sendError(res, "Assign a routed shuttle before starting a trip", 400);
    const existing = await Trip.findOne({ driver: driver._id, status: "ACTIVE" });
    if (existing) return sendError(res, "An active trip already exists", 409);
    const trip = await Trip.create({ driver: driver._id, shuttle: driver.assignedShuttle._id, route: driver.assignedShuttle.route });
    await Shuttle.findByIdAndUpdate(driver.assignedShuttle._id, { status: "ON_TIME" });
    return sendSuccess(res, { trip }, "Trip started successfully", 201);
  } catch (error) { next(error); }
}

async function endTrip(req, res, next) {
  try {
    const driver = await ensureDriverProfile(req.user._id);
    const trip = await Trip.findOneAndUpdate({ driver: driver?._id, status: "ACTIVE" }, { status: "COMPLETED", endedAt: new Date() }, { new: true });
    if (!trip) return sendError(res, "No active trip found", 404);
    return sendSuccess(res, { trip }, "Trip ended successfully");
  } catch (error) { next(error); }
}

async function reportIssue(req, res, next) {
  try {
    const driver = await ensureDriverProfile(req.user._id);
    await driver.populate("assignedShuttle");
    if (!driver?.assignedShuttle) return sendError(res, "No shuttle assigned", 404);
    const { type = "DELAY", description = "Driver reported an operational issue", location } = req.body;
    if (type === "BREAKDOWN") {
      const report = await BreakdownReport.create({ shuttle: driver.assignedShuttle._id, reportedBy: req.user._id, issueDescription: description, location });
      await Shuttle.findByIdAndUpdate(driver.assignedShuttle._id, { status: "BREAKDOWN", speed: 0 });
      const io = req.app.get("io");
      if (io) io.to("admin").emit("breakdown:new", report);
      return sendSuccess(res, { report }, "Breakdown reported", 201);
    }
    if (type === "EMERGENCY") {
      const report = await EmergencyReport.create({ reportedBy: req.user._id, category: "Vehicle Problem", description, shuttleId: driver.assignedShuttle.shuttleId, location });
      const io = req.app.get("io");
      if (io) io.to("admin").emit("emergency:new", report);
      return sendSuccess(res, { report }, "Emergency reported", 201);
    }
    await Shuttle.findByIdAndUpdate(driver.assignedShuttle._id, { status: "DELAYED" });
    const io = req.app.get("io");
    if (io) io.to("admin").emit("shuttle:status", { shuttleId: driver.assignedShuttle.shuttleId, status: "DELAYED" });
    return sendSuccess(res, {}, "Delay reported");
  } catch (error) { next(error); }
}

async function markStopReached(req, res, next) {
  try {
    const driver = await ensureDriverProfile(req.user._id);
    await driver.populate({ path: "assignedShuttle", populate: { path: "route", populate: { path: "stops" } } });
    const shuttle = driver?.assignedShuttle;
    if (!shuttle?.route?.stops?.length) return sendError(res, "No routed shuttle assigned", 404);
    const stopIndex = shuttle.route.stops.findIndex((stop) => String(stop._id) === String(shuttle.nextStop?._id || shuttle.nextStop));
    const currentIndex = stopIndex >= 0 ? stopIndex : 0;
    const nextIndex = (currentIndex + 1) % shuttle.route.stops.length;
    shuttle.currentStop = shuttle.route.stops[currentIndex]._id;
    shuttle.nextStop = shuttle.route.stops[nextIndex]._id;
    shuttle.lastUpdated = new Date();
    await shuttle.save();
    const io = req.app.get("io");
    if (io) io.emit("shuttle:update", shuttle);
    return sendSuccess(res, { shuttle }, "Stop marked as reached");
  } catch (error) { next(error); }
}

async function createDriver(req, res, next) {
  try {
    const { userId, licenseNumber, assignedShuttle, isActive } = req.body;
    if (!userId || !licenseNumber) {
      return sendError(res, "Please provide userId and licenseNumber", 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    if (user.role !== "DRIVER") {
      user.role = "DRIVER";
      await user.save();
    }

    const existingDriver = await Driver.findOne({ user: userId });
    if (existingDriver) {
      return sendError(res, "Driver profile already exists for this user", 409);
    }

    if (assignedShuttle) {
      const shuttle = await Shuttle.findById(assignedShuttle);
      if (!shuttle) return sendError(res, "Assigned shuttle not found", 404);
      if (shuttle.driver) return sendError(res, "This shuttle is already assigned to another driver", 409);
    }

    const driver = await Driver.create({
      user: userId,
      licenseNumber: licenseNumber.trim(),
      assignedShuttle: assignedShuttle || null,
      isActive: isActive !== undefined ? isActive : true,
    });
    if (assignedShuttle) await Shuttle.findByIdAndUpdate(assignedShuttle, { driver: driver._id });

    const populated = await Driver.findById(driver._id)
      .populate("user", "-password")
      .populate("assignedShuttle");

    return sendSuccess(res, { driver: populated }, "Driver profile created successfully", 201);
  } catch (error) {
    next(error);
  }
}

async function updateDriver(req, res, next) {
  try {
    const { licenseNumber, assignedShuttle, isActive } = req.body;
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return sendError(res, "Driver not found", 404);
    }

    if (licenseNumber) driver.licenseNumber = licenseNumber.trim();
    if (assignedShuttle !== undefined && String(assignedShuttle || "") !== String(driver.assignedShuttle || "")) {
      if (assignedShuttle) {
        const shuttle = await Shuttle.findById(assignedShuttle);
        if (!shuttle) return sendError(res, "Assigned shuttle not found", 404);
        if (shuttle.driver && String(shuttle.driver) !== String(driver._id)) return sendError(res, "This shuttle is already assigned to another driver", 409);
      }
      if (driver.assignedShuttle) await Shuttle.findByIdAndUpdate(driver.assignedShuttle, { driver: null });
      if (assignedShuttle) {
        const shuttle = await Shuttle.findById(assignedShuttle);
        shuttle.driver = driver._id;
        await shuttle.save();
      }
      driver.assignedShuttle = assignedShuttle || null;
    }
    if (isActive !== undefined) driver.isActive = Boolean(isActive);

    await driver.save();
    const updated = await Driver.findById(driver._id)
      .populate("user", "-password")
      .populate("assignedShuttle");

    return sendSuccess(res, { driver: updated }, "Driver profile updated successfully");
  } catch (error) {
    next(error);
  }
}

async function deleteDriver(req, res, next) {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) {
      return sendError(res, "Driver not found", 404);
    }
    return sendSuccess(res, {}, "Driver profile deleted successfully");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllDrivers,
  getDriverById,
  getMyAssignedShuttle,
  getMyTrip,
  startTrip,
  endTrip,
  reportIssue,
  markStopReached,
  createDriver,
  updateDriver,
  deleteDriver,
};
