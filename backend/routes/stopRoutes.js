const express = require("express");
const {
  getAllStops,
  getStopById,
  createStop,
  updateStop,
  deleteStop,
} = require("../controllers/stopController");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorize");

const router = express.Router();

router.get("/", getAllStops);
router.get("/:id", requireAuth, getStopById);
router.post("/", requireAuth, requireRole("ADMIN"), createStop);
router.put("/:id", requireAuth, requireRole("ADMIN"), updateStop);
router.delete("/:id", requireAuth, requireRole("ADMIN"), deleteStop);

module.exports = router;
