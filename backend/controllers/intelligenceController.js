const Stop = require("../models/Stop");
const Shuttle = require("../models/Shuttle");
const Route = require("../models/Route");
const {
  haversineDistanceMeters,
  calculateWalkingTimeMins,
  calculateDynamicEta,
  planTripBetweenStops,
} = require("../utils/intelligenceEngine");
const { rankAndRecommendShuttles } = require("../utils/recommendationEngine");
const { sendSuccess, sendError } = require("../utils/apiResponse");

async function getNearestStops(req, res, next) {
  try {
    const latitude = parseFloat(req.query.lat) || 17.4458; // default SAC mock lat
    const longitude = parseFloat(req.query.lng) || 78.3530; // default SAC mock lng

    const userLoc = { latitude, longitude };
    const stops = await Stop.find({ active: true });

    const stopsWithDistance = stops.map((stop) => {
      const distMeters = haversineDistanceMeters(userLoc, stop.location);
      const walkingTimeMins = calculateWalkingTimeMins(distMeters);
      return {
        ...stop.toObject(),
        distanceMeters: Math.round(distMeters),
        walkingTimeMins,
      };
    });

    stopsWithDistance.sort((a, b) => a.distanceMeters - b.distanceMeters);

    return sendSuccess(
      res,
      {
        userLocation: userLoc,
        nearestStops: stopsWithDistance.slice(0, 5),
      },
      "Nearest stops calculated successfully"
    );
  } catch (error) {
    next(error);
  }
}

async function planTrip(req, res, next) {
  try {
    const { originStopId, destinationStopId } = req.body;
    if (!originStopId || !destinationStopId) {
      return sendError(res, "Please provide originStopId and destinationStopId", 400);
    }

    const [shuttles, routes, stops] = await Promise.all([
      Shuttle.find({}).populate("route").populate("currentStop").populate("nextStop"),
      Route.find({}).populate("stops"),
      Stop.find({}),
    ]);

    const result = planTripBetweenStops(originStopId, destinationStopId, shuttles, routes, stops);

    if (result.error) {
      return sendError(res, result.error, 400);
    }

    // Rank and attach smart recommendations
    result.tripOptions = rankAndRecommendShuttles(result.tripOptions);

    return sendSuccess(res, result, "Trip planning options retrieved");
  } catch (error) {
    console.error("Plan trip error:", error);
    next(error);
  }
}

async function getShuttleEta(req, res, next) {
  try {
    const { shuttleId, stopId } = req.params;
    const shuttle = await Shuttle.findById(shuttleId).populate("route");
    const stop = await Stop.findById(stopId);

    if (!shuttle || !stop) {
      return sendError(res, "Shuttle or Stop not found", 404);
    }

    const etaObj = calculateDynamicEta(
      shuttle.currentLocation,
      stop.location,
      shuttle.speed,
      shuttle.status
    );

    return sendSuccess(res, { shuttleId: shuttle.shuttleId, stopId: stop.stopId, ...etaObj }, "ETA calculated");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getNearestStops,
  planTrip,
  getShuttleEta,
};
