const Route = require("../models/Route");
const { sendSuccess, sendError } = require("../utils/apiResponse");

async function getAllRoutes(req, res, next) {
  try {
    const routes = await Route.find({})
      .populate("stops")
      .sort({ routeId: 1 });
    return sendSuccess(res, { routes, count: routes.length }, "Routes retrieved successfully");
  } catch (error) {
    next(error);
  }
}

async function getRouteById(req, res, next) {
  try {
    const route = await Route.findById(req.params.id).populate("stops");
    if (!route) {
      return sendError(res, "Route not found", 404);
    }
    return sendSuccess(res, { route }, "Route retrieved successfully");
  } catch (error) {
    next(error);
  }
}

async function createRoute(req, res, next) {
  try {
    const { routeId, name, code, color, stops, estimatedDuration, active } = req.body;
    if (!routeId || !name || !code) {
      return sendError(res, "Please provide routeId, name, and code", 400);
    }

    const existing = await Route.findOne({ routeId: routeId.trim() });
    if (existing) {
      return sendError(res, `Route ID '${routeId}' already exists`, 409);
    }

    const route = await Route.create({
      routeId: routeId.trim(),
      name: name.trim(),
      code: code.trim(),
      color: color || "#4F46E5",
      stops: Array.isArray(stops) ? stops : [],
      estimatedDuration: Number(estimatedDuration) || 20,
      active: active !== undefined ? active : true,
    });

    const populatedRoute = await Route.findById(route._id).populate("stops");
    return sendSuccess(res, { route: populatedRoute }, "Route created successfully", 201);
  } catch (error) {
    next(error);
  }
}

async function updateRoute(req, res, next) {
  try {
    const { name, code, color, stops, estimatedDuration, active } = req.body;
    const route = await Route.findById(req.params.id);
    if (!route) {
      return sendError(res, "Route not found", 404);
    }

    if (name) route.name = name.trim();
    if (code) route.code = code.trim();
    if (color) route.color = color.trim();
    if (stops !== undefined && Array.isArray(stops)) route.stops = stops;
    if (estimatedDuration !== undefined) route.estimatedDuration = Number(estimatedDuration);
    if (active !== undefined) route.active = Boolean(active);

    await route.save();
    const updatedRoute = await Route.findById(route._id).populate("stops");
    return sendSuccess(res, { route: updatedRoute }, "Route updated successfully");
  } catch (error) {
    next(error);
  }
}

async function deleteRoute(req, res, next) {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) {
      return sendError(res, "Route not found", 404);
    }
    return sendSuccess(res, {}, "Route deleted successfully");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
};
