const Shuttle = require("../models/Shuttle");
const Driver = require("../models/Driver");
const { sendSuccess, sendError } = require("../utils/apiResponse");

async function getAllShuttles(req, res, next) {
  try {
    const shuttles = await Shuttle.find({})
      .populate("route")
      .populate({
        path: "driver",
        populate: { path: "user", select: "-password" },
      })
      .populate("currentStop")
      .populate("nextStop")
      .sort({ shuttleId: 1 });
    return sendSuccess(res, { shuttles, count: shuttles.length }, "Shuttles retrieved successfully");
  } catch (error) {
    next(error);
  }
}

async function getShuttleById(req, res, next) {
  try {
    const shuttle = await Shuttle.findById(req.params.id)
      .populate("route")
      .populate({
        path: "driver",
        populate: { path: "user", select: "-password" },
      })
      .populate("currentStop")
      .populate("nextStop");
    if (!shuttle) {
      return sendError(res, "Shuttle not found", 404);
    }
    return sendSuccess(res, { shuttle }, "Shuttle retrieved successfully");
  } catch (error) {
    next(error);
  }
}

async function createShuttle(req, res, next) {
  try {
    const {
      shuttleId,
      vehicleNumber,
      capacity,
      route,
      driver,
      currentLocation,
      currentStop,
      nextStop,
      speed,
      passengerCount,
      crowdLevel,
      status,
    } = req.body;

    if (!shuttleId || !vehicleNumber) {
      return sendError(res, "Please provide shuttleId and vehicleNumber", 400);
    }

    const existing = await Shuttle.findOne({ shuttleId: shuttleId.trim() });
    if (existing) {
      return sendError(res, `Shuttle ID '${shuttleId}' already exists`, 409);
    }

    const shuttle = await Shuttle.create({
      shuttleId: shuttleId.trim(),
      vehicleNumber: vehicleNumber.trim(),
      capacity: Number(capacity) || 40,
      route: route || null,
      driver: driver || null,
      currentLocation: currentLocation || { latitude: 17.4455, longitude: 78.3482 },
      currentStop: currentStop || null,
      nextStop: nextStop || null,
      speed: Number(speed) || 0,
      passengerCount: Number(passengerCount) || 0,
      crowdLevel: crowdLevel || "LOW",
      status: status || "ON_TIME",
    });

    const populated = await Shuttle.findById(shuttle._id)
      .populate("route")
      .populate({
        path: "driver",
        populate: { path: "user", select: "-password" },
      })
      .populate("currentStop")
      .populate("nextStop");

    return sendSuccess(res, { shuttle: populated }, "Shuttle created successfully", 201);
  } catch (error) {
    next(error);
  }
}

async function updateShuttle(req, res, next) {
  try {
    const shuttle = await Shuttle.findById(req.params.id);
    if (!shuttle) {
      return sendError(res, "Shuttle not found", 404);
    }

    const fields = [
      "vehicleNumber",
      "capacity",
      "route",
      "driver",
      "currentLocation",
      "currentStop",
      "nextStop",
      "speed",
      "passengerCount",
      "crowdLevel",
      "status",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        shuttle[field] = req.body[field];
      }
    });

    shuttle.lastUpdated = new Date();
    await shuttle.save();

    const updated = await Shuttle.findById(shuttle._id)
      .populate("route")
      .populate({
        path: "driver",
        populate: { path: "user", select: "-password" },
      })
      .populate("currentStop")
      .populate("nextStop");

    const io = req.app.get("io");
    if (io) {
      io.emit("shuttle:update", updated);
    }

    return sendSuccess(res, { shuttle: updated }, "Shuttle updated successfully");
  } catch (error) {
    next(error);
  }
}

async function updateShuttleTelemetry(req, res, next) {
  try {
    const { passengerCount, status } = req.body;
    const shuttle = await Shuttle.findById(req.params.id);

    if (!shuttle) {
      return sendError(res, "Shuttle not found", 404);
    }

    if (req.user.role === "DRIVER") {
      const driver = await Driver.findOne({ user: req.user._id });
      if (!driver || String(driver.assignedShuttle) !== String(shuttle._id)) {
        return sendError(res, "You can only update your assigned shuttle", 403);
      }
    }

    if (passengerCount !== undefined) {
      const count = Number(passengerCount);
      if (!Number.isInteger(count) || count < 0 || count > shuttle.capacity) {
        return sendError(res, `Passenger count must be between 0 and ${shuttle.capacity}`, 400);
      }
      shuttle.passengerCount = count;
      const occupancy = count / Math.max(shuttle.capacity, 1);
      shuttle.crowdLevel = occupancy >= 0.76 ? "HIGH" : occupancy >= 0.41 ? "MEDIUM" : "LOW";
    }

    if (status !== undefined) {
      const validStatuses = ["ON_TIME", "DELAYED", "BREAKDOWN"];
      if (!validStatuses.includes(status)) {
        return sendError(res, "Invalid vehicle operational status", 400);
      }
      shuttle.status = status;
    }

    shuttle.lastUpdated = new Date();
    await shuttle.save();

    const updated = await Shuttle.findById(shuttle._id)
      .populate("route")
      .populate("currentStop")
      .populate("nextStop");

    const io = req.app.get("io");
    if (io) {
      io.emit("shuttle:update", updated);
    }

    return sendSuccess(res, { shuttle: updated }, "Shuttle telemetry updated successfully");
  } catch (error) {
    next(error);
  }
}

async function resolveBreakdown(req, res, next) {
  try {
    const shuttle = await Shuttle.findById(req.params.id);
    if (!shuttle) {
      return sendError(res, "Shuttle not found", 404);
    }

    shuttle.status = "ON_TIME";
    shuttle.speed = 25;
    shuttle.lastUpdated = new Date();
    await shuttle.save();

    const updated = await Shuttle.findById(shuttle._id).populate("route");

    const io = req.app.get("io");
    if (io) {
      io.emit("shuttle:update", updated);
      io.emit("shuttle:status", { shuttleId: updated.shuttleId, status: "ON_TIME" });
    }

    return sendSuccess(res, { shuttle: updated }, "Breakdown resolved successfully");
  } catch (error) {
    next(error);
  }
}

async function disableShuttle(req, res, next) {
  try {
    const shuttle = await Shuttle.findById(req.params.id);
    if (!shuttle) {
      return sendError(res, "Shuttle not found", 404);
    }

    shuttle.status = "OFFLINE";
    shuttle.speed = 0;
    shuttle.lastUpdated = new Date();
    await shuttle.save();

    const updated = await Shuttle.findById(shuttle._id).populate("route");

    const io = req.app.get("io");
    if (io) {
      io.emit("shuttle:update", updated);
      io.emit("shuttle:status", { shuttleId: updated.shuttleId, status: "OFFLINE" });
    }

    return sendSuccess(res, { shuttle: updated }, "Shuttle disabled and set offline");
  } catch (error) {
    next(error);
  }
}

async function deleteShuttle(req, res, next) {
  try {
    const shuttle = await Shuttle.findByIdAndDelete(req.params.id);
    if (!shuttle) {
      return sendError(res, "Shuttle not found", 404);
    }
    return sendSuccess(res, {}, "Shuttle deleted successfully");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllShuttles,
  getShuttleById,
  createShuttle,
  updateShuttle,
  updateShuttleTelemetry,
  resolveBreakdown,
  disableShuttle,
  deleteShuttle,
};
