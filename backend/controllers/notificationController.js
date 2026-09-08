const Notification = require("../models/Notification");
const { sendSuccess, sendError } = require("../utils/apiResponse");

async function getUserNotifications(req, res, next) {
  try {
    const notifications = await Notification.find({
      $or: [{ recipient: req.user._id }, { recipient: null }],
    })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = notifications.filter((n) => !n.read).length;

    return sendSuccess(
      res,
      { unreadCount, notifications },
      "Notifications retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
}

async function markNotificationAsRead(req, res, next) {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return sendError(res, "Notification not found", 404);
    }

    notification.read = true;
    await notification.save();

    return sendSuccess(res, notification, "Notification marked as read");
  } catch (error) {
    next(error);
  }
}

async function markAllNotificationsAsRead(req, res, next) {
  try {
    await Notification.updateMany(
      { $or: [{ recipient: req.user._id }, { recipient: null }] },
      { read: true }
    );

    return sendSuccess(res, null, "All notifications marked as read");
  } catch (error) {
    next(error);
  }
}

async function createNotification(req, res, next) {
  try {
    const { title, message, type, recipient } = req.body;
    const notification = await Notification.create({
      recipient: recipient || req.user._id,
      title,
      message,
      type: type || "INFO",
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("notification:new", notification);
    }

    return sendSuccess(res, notification, "Notification created successfully", 201);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification,
};
