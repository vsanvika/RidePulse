const express = require("express");
const { getMyRideHistory, recordRide } = require("../controllers/rideController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/history", requireAuth, getMyRideHistory);
router.post("/", requireAuth, recordRide);

module.exports = router;
