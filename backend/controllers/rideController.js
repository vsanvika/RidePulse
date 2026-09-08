const Ride = require("../models/Ride");
const { sendSuccess, sendError } = require("../utils/apiResponse");

async function getMyRideHistory(req, res, next) {
  try {
    const rides = await Ride.find({ student: req.user._id })
      .populate("shuttle")
      .populate("route")
      .populate("boardingStop")
      .populate("destinationStop")
      .sort({ createdAt: -1 });

    return sendSuccess(res, { rides, count: rides.length }, "Ride history retrieved");
  } catch (error) {
    next(error);
  }
}

async function recordRide(req, res, next) {
  try {
    const { shuttleId, routeId, boardingStopId, destinationStopId } = req.body;
    if (!shuttleId || !routeId || !boardingStopId || !destinationStopId) {
      return sendError(res, "Missing required ride parameters", 400);
    }

    const ride = await Ride.create({
      student: req.user._id,
      shuttle: shuttleId,
      route: routeId,
      boardingStop: boardingStopId,
      destinationStop: destinationStopId,
      status: "COMPLETED",
      completedAt: new Date(),
    });

    const populated = await Ride.findById(ride._id)
      .populate("shuttle")
      .populate("route")
      .populate("boardingStop")
      .populate("destinationStop");

    return sendSuccess(res, { ride: populated }, "Ride recorded successfully", 201);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMyRideHistory,
  recordRide,
};
