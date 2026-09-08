const express = require("express");
const {
  getDashboardMetrics,
  getAllUsers,
  updateUser,
  deleteUser,
  getAnalyticsData,
} = require("../controllers/adminController");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorize");

const router = express.Router();

router.get("/metrics", requireAuth, requireRole("ADMIN"), getDashboardMetrics);
router.get("/users", requireAuth, requireRole("ADMIN"), getAllUsers);
router.put("/users/:id", requireAuth, requireRole("ADMIN"), updateUser);
router.delete("/users/:id", requireAuth, requireRole("ADMIN"), deleteUser);
router.get("/analytics", requireAuth, requireRole("ADMIN"), getAnalyticsData);

module.exports = router;
