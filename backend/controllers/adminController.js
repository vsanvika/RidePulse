const Shuttle = require("../models/Shuttle");
const User = require("../models/User");
const Route = require("../models/Route");
const Stop = require("../models/Stop");
const Ride = require("../models/Ride");
const Alert = require("../models/Alert");
const EmergencyReport = require("../models/EmergencyReport");
const Driver = require("../models/Driver");
const { sendSuccess, sendError } = require("../utils/apiResponse");

async function getDashboardMetrics(req, res, next) {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      shuttles,
      totalStudents,
      todaysRides,
      routes,
      openAlerts,
      activeEmergencies,
      totalDrivers,
    ] = await Promise.all([
      Shuttle.find({}),
      User.countDocuments({ role: "STUDENT" }),
      Ride.countDocuments({ createdAt: { $gte: todayStart } }),
      Route.find({}),
      Alert.countDocuments({ active: true }),
      EmergencyReport.countDocuments({ status: { $ne: "RESOLVED" } }),
      Driver.countDocuments({}),
    ]);

    const activeShuttles = shuttles.filter((s) => s.status !== "OFFLINE").length;
    const delayedShuttles = shuttles.filter(
      (s) => s.status === "DELAYED" || s.status === "BREAKDOWN"
    ).length;
    const highCrowdRoutes = shuttles.filter((s) => s.crowdLevel === "HIGH").length;

    return sendSuccess(
      res,
      {
        activeShuttles,
        totalShuttles: shuttles.length,
        totalStudents,
        todaysRides,
        delayedShuttles,
        highCrowdRoutes,
        openAlerts,
        activeEmergencies,
        totalDrivers,
        totalRoutes: routes.length,
      },
      "Admin metrics calculated from database"
    );
  } catch (error) {
    next(error);
  }
}

async function getAllUsers(req, res, next) {
  try {
    const { role } = req.query;
    const filter = {};
    if (role) filter.role = role.toUpperCase();

    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
    return sendSuccess(res, { users, count: users.length }, "Users retrieved successfully");
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const { name, email, role, phone, isActive, department } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    if (name) user.name = name.trim();
    if (email) user.email = email.trim();
    if (role) user.role = role;
    if (phone !== undefined) user.phone = phone;
    if (isActive !== undefined) user.isActive = Boolean(isActive);
    if (department !== undefined) user.department = department;

    await user.save();
    return sendSuccess(res, { user }, "User updated successfully");
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return sendError(res, "User not found", 404);
    }
    return sendSuccess(res, {}, "User deleted successfully");
  } catch (error) {
    next(error);
  }
}

async function getAnalyticsData(req, res, next) {
  try {
    const { timeRange = "7days" } = req.query;

    const days = timeRange === "30days" ? 30 : timeRange === "today" ? 1 : 7;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));
    const rides = await Ride.find({ createdAt: { $gte: start } }).populate("route boardingStop shuttle");

    const dayBuckets = new Map();
    const routeBuckets = new Map();
    const stopBuckets = new Map();
    rides.forEach((ride) => {
      const day = new Date(ride.createdAt).toLocaleDateString("en-US", { weekday: "short" });
      dayBuckets.set(day, (dayBuckets.get(day) || 0) + 1);
      const routeName = ride.route?.name || "Unknown route";
      routeBuckets.set(routeName, (routeBuckets.get(routeName) || 0) + 1);
      const stopName = ride.boardingStop?.name || "Unknown stop";
      stopBuckets.set(stopName, (stopBuckets.get(stopName) || 0) + 1);
    });

    const shuttles = await Shuttle.find({}).populate("route");
    const dailyRides = [...dayBuckets.entries()].map(([day, count]) => ({ day, rides: count }));
    const routeUsage = [...routeBuckets.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const mostUsedStops = [...stopBuckets.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const shuttleOccupancy = shuttles.map((shuttle) => ({
      shuttleId: shuttle.shuttleId,
      occupancy: shuttle.passengerCount,
      capacity: shuttle.capacity,
      utilization: shuttle.capacity ? Math.round((shuttle.passengerCount / shuttle.capacity) * 100) : 0,
    }));
    const crowdByHour = Array.from({ length: 24 }, (_, hour) => {
      const samples = shuttles.filter((shuttle) => new Date(shuttle.lastUpdated).getHours() === hour);
      const average = samples.length ? samples.reduce((sum, shuttle) => sum + (shuttle.capacity ? shuttle.passengerCount / shuttle.capacity * 100 : 0), 0) / samples.length : 0;
      return { time: `${String(hour).padStart(2, "0")}:00`, crowd: Math.round(average) };
    }).filter((bucket) => bucket.crowd > 0);
    const carbonSavings = [{ month: new Date().toLocaleDateString("en-US", { month: "short" }), co2Saved: Number((rides.length * 0.455).toFixed(2)) }];

    return sendSuccess(
      res,
      {
        timeRange,
        dailyRides,
        routeUsage,
        crowdByHour,
        shuttleOccupancy,
        mostUsedStops,
        waitingTimes: [],
        carbonSavings,
      },
      "Analytics data retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardMetrics,
  getAllUsers,
  updateUser,
  deleteUser,
  getAnalyticsData,
};
