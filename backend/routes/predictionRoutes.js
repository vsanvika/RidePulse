const express = require("express");
const {
  getCrowdPrediction,
  getInsights,
} = require("../controllers/predictionController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/crowd/:routeId", requireAuth, getCrowdPrediction);
router.get("/insights", requireAuth, getInsights);

module.exports = router;
