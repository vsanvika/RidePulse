const express = require("express");
const {
  getNearestStops,
  planTrip,
  getShuttleEta,
} = require("../controllers/intelligenceController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/nearest-stops", requireAuth, getNearestStops);
router.post("/plan-trip", requireAuth, planTrip);
router.get("/eta/:shuttleId/:stopId", requireAuth, getShuttleEta);

module.exports = router;
