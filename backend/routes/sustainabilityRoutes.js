const express = require("express");
const { getSustainabilityStats } = require("../controllers/sustainabilityController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/stats", requireAuth, getSustainabilityStats);

module.exports = router;
