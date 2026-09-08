const express = require("express");
const {
  createEmergencyReport,
  getAllEmergencyReports,
  updateEmergencyStatus,
} = require("../controllers/emergencyController");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorize");

const router = express.Router();

router.post("/", requireAuth, createEmergencyReport);
router.get("/", requireAuth, requireRole("ADMIN"), getAllEmergencyReports);
router.put("/:id/status", requireAuth, requireRole("ADMIN"), updateEmergencyStatus);

module.exports = router;
