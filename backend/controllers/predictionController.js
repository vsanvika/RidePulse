const {
  predictCrowdByRoute,
  generateOperationalInsights,
} = require("../services/predictionService");
const { sendSuccess, sendError } = require("../utils/apiResponse");

async function getCrowdPrediction(req, res, next) {
  try {
    const { routeId } = req.params;
    const dayOfWeek = req.query.day || "Monday";

    const data = await predictCrowdByRoute(routeId, dayOfWeek);
    return sendSuccess(res, data, "Crowd prediction data retrieved successfully");
  } catch (error) {
    next(error);
  }
}

async function getInsights(req, res, next) {
  try {
    const data = await generateOperationalInsights();
    return sendSuccess(res, data, "Operational AI insights retrieved successfully");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCrowdPrediction,
  getInsights,
};
