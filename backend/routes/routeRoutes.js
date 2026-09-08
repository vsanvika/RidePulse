const express = require("express");
const {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
} = require("../controllers/routeController");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorize");

const router = express.Router();

router.get("/", getAllRoutes);
router.get("/:id", requireAuth, getRouteById);
router.post("/", requireAuth, requireRole("ADMIN"), createRoute);
router.put("/:id", requireAuth, requireRole("ADMIN"), updateRoute);
router.delete("/:id", requireAuth, requireRole("ADMIN"), deleteRoute);

module.exports = router;
