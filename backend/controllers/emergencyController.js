const EmergencyReport = require("../models/EmergencyReport");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { sendSuccess, sendError } = require("../utils/apiResponse");

async function createEmergencyReport(req, res, next) {
  try {
    const { category, description, shuttleId, location } = req.body;
    if (!description) {
      return sendError(res, "Please provide an emergency description", 400);
    }

    const report = await EmergencyReport.create({
      reportedBy: req.user._id,
      category: category || "Other",
      description,
      shuttleId: shuttleId || "N/A",
      location: location || { latitude: 17.4145852, longitude: 78.6654997, landmark: "Venkatapur village" },
      status: "PENDING",
    });

    const populated = await EmergencyReport.findById(report._id).populate("reportedBy", "name email phone");

    // Broadcast Socket.IO emergency alert
    const io = req.app.get("io");
    if (io) {
      io.emit("emergency:new", populated);

      const admins = await User.find({ role: "ADMIN", isActive: true }).select("_id");
      await Notification.insertMany(admins.map((admin) => ({
        recipient: admin._id,
        title: `🚨 EMERGENCY REPORTED: ${category}`,
        message: `${req.user.name} reported: ${description} (Location: ${location?.landmark || "Campus"})`,
        type: "EMERGENCY",
      })));
      io.to("admin").emit("notification:new", {
        title: `🚨 EMERGENCY REPORTED: ${category}`,
        message: `${req.user.name} reported: ${description}`,
        type: "EMERGENCY",
      });
    }

    return sendSuccess(res, populated, "Emergency report submitted successfully", 201);
  } catch (error) {
    next(error);
  }
}

async function getAllEmergencyReports(req, res, next) {
  try {
    const reports = await EmergencyReport.find({})
      .populate("reportedBy", "name email phone")
      .sort({ createdAt: -1 });

    const activeCount = reports.filter((r) => r.status !== "RESOLVED").length;

    return sendSuccess(res, { activeCount, reports }, "Emergency reports retrieved");
  } catch (error) {
    next(error);
  }
}

async function updateEmergencyStatus(req, res, next) {
  try {
    const { status } = req.body;
    const report = await EmergencyReport.findById(req.params.id);

    if (!report) {
      return sendError(res, "Emergency report not found", 404);
    }

    report.status = status || report.status;
    await report.save();

    const io = req.app.get("io");
    if (io) {
      io.emit("emergency:update", report);
    }

    return sendSuccess(res, report, `Emergency status updated to ${status}`);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createEmergencyReport,
  getAllEmergencyReports,
  updateEmergencyStatus,
};
