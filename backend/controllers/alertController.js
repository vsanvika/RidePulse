const Alert = require("../models/Alert");
const Notification = require("../models/Notification");
const { sendSuccess, sendError } = require("../utils/apiResponse");

async function getAllAlerts(req, res, next) {
  try {
    const alerts = await Alert.find({ active: true })
      .populate("route")
      .populate("shuttle")
      .sort({ createdAt: -1 });
    return sendSuccess(res, { alerts, count: alerts.length }, "Alerts retrieved successfully");
  } catch (error) {
    next(error);
  }
}

async function createAlert(req, res, next) {
  try {
    const { title, description, message, severity, route, startTime, endTime } = req.body;
    const descText = description || message;
    if (!title || !descText) {
      return sendError(res, "Please provide alert title and description", 400);
    }

    const alert = await Alert.create({
      title: title.trim(),
      description: descText.trim(),
      severity: severity || "INFO",
      route: route || null,
      startTime: startTime || new Date(),
      endTime: endTime || null,
      active: true,
    });

    const populated = await Alert.findById(alert._id).populate("route");

    // Global notifications are visible to every authenticated student/driver/admin.
    const io = req.app.get("io");
    if (io) {
      io.emit("alert:new", populated);
      const notification = await Notification.create({
        recipient: null,
        title: `📢 SERVICE ALERT: ${title}`,
        message: descText.trim(),
        type: severity === "CRITICAL" ? "EMERGENCY" : "INFO",
      });
      io.to("fleet").emit("notification:new", notification);
    }

    return sendSuccess(res, { alert: populated }, "Alert created successfully", 201);
  } catch (error) {
    next(error);
  }
}

async function deleteAlert(req, res, next) {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    if (!alert) {
      return sendError(res, "Alert not found", 404);
    }

    const io = req.app.get("io");
    if (io) {
      io.emit("alert:delete", { _id: req.params.id });
    }

    return sendSuccess(res, {}, "Alert deleted successfully");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllAlerts,
  createAlert,
  deleteAlert,
};
