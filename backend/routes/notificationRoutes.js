const express = require("express");
const {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification,
} = require("../controllers/notificationController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, getUserNotifications);
router.put("/read-all", requireAuth, markAllNotificationsAsRead);
router.put("/:id/read", requireAuth, markNotificationAsRead);
router.post("/", requireAuth, createNotification);

module.exports = router;
