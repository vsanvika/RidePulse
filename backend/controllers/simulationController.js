const {
  startSimulation,
  pauseSimulation,
  resetSimulation,
  getSimulationStatus,
  applySimulationEvent,
} = require("../simulation/shuttleSimulator");
const { sendSuccess } = require("../utils/apiResponse");

async function handleStartSimulation(req, res, next) {
  try {
    const io = req.app.get("io");
    startSimulation(io);
    return sendSuccess(res, getSimulationStatus(), "Shuttle simulation started");
  } catch (error) {
    next(error);
  }
}

async function handlePauseSimulation(req, res, next) {
  try {
    pauseSimulation();
    return sendSuccess(res, getSimulationStatus(), "Shuttle simulation paused");
  } catch (error) {
    next(error);
  }
}

async function handleResetSimulation(req, res, next) {
  try {
    await resetSimulation();
    return sendSuccess(res, getSimulationStatus(), "Shuttle simulation reset");
  } catch (error) {
    next(error);
  }
}

async function handleGetStatus(req, res, next) {
  try {
    return sendSuccess(res, getSimulationStatus(), "Simulation status retrieved");
  } catch (error) {
    next(error);
  }
}

async function handleSimulationEvent(req, res, next) {
  try {
    const action = String(req.body.action || "").toUpperCase();
    const allowedActions = ["DELAY", "BREAKDOWN", "HIGH_CROWD", "RECOVER"];
    if (!allowedActions.includes(action)) {
      return res.status(400).json({ success: false, message: "Unsupported simulation action" });
    }
    const applied = applySimulationEvent(action, req.body.shuttleId);
    if (!applied) return res.status(404).json({ success: false, message: "No matching shuttle in simulation" });
    return sendSuccess(res, getSimulationStatus(), `Simulation event ${action} applied`);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  handleStartSimulation,
  handlePauseSimulation,
  handleResetSimulation,
  handleGetStatus,
  handleSimulationEvent,
};
