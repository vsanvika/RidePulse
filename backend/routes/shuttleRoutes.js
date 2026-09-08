const express = require("express");
const {
  getAllShuttles,
  getShuttleById,
  createShuttle,
  updateShuttle,
  resolveBreakdown,
  disableShuttle,
  deleteShuttle,
  updateShuttleTelemetry,
} = require("../controllers/shuttleController");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorize");

const router = express.Router();

router.get("/", requireAuth, getAllShuttles);
router.get("/:id", requireAuth, getShuttleById);
router.patch("/:id/telemetry", requireAuth, requireRole("DRIVER"), updateShuttleTelemetry);
router.post("/", requireAuth, requireRole("ADMIN"), createShuttle);
router.put("/:id", requireAuth, requireRole("ADMIN"), updateShuttle);
router.post("/:id/breakdown/resolve", requireAuth, requireRole("ADMIN"), resolveBreakdown);
router.post("/:id/breakdown/disable", requireAuth, requireRole("ADMIN"), disableShuttle);
router.delete("/:id", requireAuth, requireRole("ADMIN"), deleteShuttle);

module.exports = router;
