const express = require("express");
const {
  handleStartSimulation,
  handlePauseSimulation,
  handleResetSimulation,
  handleGetStatus,
  handleSimulationEvent,
} = require("../controllers/simulationController");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorize");

const router = express.Router();

router.get("/status", requireAuth, handleGetStatus);
router.post("/start", requireAuth, requireRole("ADMIN"), handleStartSimulation);
router.post("/pause", requireAuth, requireRole("ADMIN"), handlePauseSimulation);
router.post("/reset", requireAuth, requireRole("ADMIN"), handleResetSimulation);
router.post("/event", requireAuth, requireRole("ADMIN"), handleSimulationEvent);

module.exports = router;
