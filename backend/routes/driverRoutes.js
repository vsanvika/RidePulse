const express = require("express");
const {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
  getMyAssignedShuttle,
  getMyTrip,
  startTrip,
  endTrip,
  reportIssue,
  markStopReached,
} = require("../controllers/driverController");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorize");

const router = express.Router();

router.get("/", requireAuth, requireRole("ADMIN"), getAllDrivers);
router.get("/me/shuttle", requireAuth, requireRole("DRIVER"), getMyAssignedShuttle);
router.get("/me/trip", requireAuth, requireRole("DRIVER"), getMyTrip);
router.post("/me/trip/start", requireAuth, requireRole("DRIVER"), startTrip);
router.post("/me/trip/end", requireAuth, requireRole("DRIVER"), endTrip);
router.post("/me/report", requireAuth, requireRole("DRIVER"), reportIssue);
router.post("/me/stop/reached", requireAuth, requireRole("DRIVER"), markStopReached);
router.get("/:id", requireAuth, getDriverById);
router.post("/", requireAuth, requireRole("ADMIN"), createDriver);
router.put("/:id", requireAuth, requireRole("ADMIN"), updateDriver);
router.delete("/:id", requireAuth, requireRole("ADMIN"), deleteDriver);

module.exports = router;
