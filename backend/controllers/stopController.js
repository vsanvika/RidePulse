const Stop = require("../models/Stop");
const { sendSuccess, sendError } = require("../utils/apiResponse");

async function getAllStops(req, res, next) {
  try {
    const stops = await Stop.find({}).sort({ stopId: 1 });
    return sendSuccess(res, { stops, count: stops.length }, "Stops retrieved successfully");
  } catch (error) {
    next(error);
  }
}

async function getStopById(req, res, next) {
  try {
    const stop = await Stop.findById(req.params.id);
    if (!stop) {
      return sendError(res, "Stop not found", 404);
    }
    return sendSuccess(res, { stop }, "Stop retrieved successfully");
  } catch (error) {
    next(error);
  }
}

async function createStop(req, res, next) {
  try {
    const { stopId, name, code, location, facilities, active } = req.body;
    if (!stopId || !name || !code || !location || location.latitude === undefined || location.longitude === undefined) {
      return sendError(res, "Please provide stopId, name, code, and valid location (latitude, longitude)", 400);
    }

    const existing = await Stop.findOne({ stopId: stopId.trim() });
    if (existing) {
      return sendError(res, `Stop ID '${stopId}' already exists`, 409);
    }

    const stop = await Stop.create({
      stopId: stopId.trim(),
      name: name.trim(),
      code: code.trim(),
      location: {
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
      },
      facilities: Array.isArray(facilities) ? facilities : [],
      active: active !== undefined ? active : true,
    });

    return sendSuccess(res, { stop }, "Stop created successfully", 201);
  } catch (error) {
    next(error);
  }
}

async function updateStop(req, res, next) {
  try {
    const { name, code, location, facilities, active } = req.body;
    const stop = await Stop.findById(req.params.id);
    if (!stop) {
      return sendError(res, "Stop not found", 404);
    }

    if (name) stop.name = name.trim();
    if (code) stop.code = code.trim();
    if (location && location.latitude !== undefined && location.longitude !== undefined) {
      stop.location = {
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
      };
    }
    if (facilities !== undefined && Array.isArray(facilities)) {
      stop.facilities = facilities;
    }
    if (active !== undefined) stop.active = Boolean(active);

    await stop.save();
    return sendSuccess(res, { stop }, "Stop updated successfully");
  } catch (error) {
    next(error);
  }
}

async function deleteStop(req, res, next) {
  try {
    const stop = await Stop.findByIdAndDelete(req.params.id);
    if (!stop) {
      return sendError(res, "Stop not found", 404);
    }
    return sendSuccess(res, {}, "Stop deleted successfully");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllStops,
  getStopById,
  createStop,
  updateStop,
  deleteStop,
};
