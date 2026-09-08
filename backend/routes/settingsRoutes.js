const express = require("express");
const { getSettings, updateSettings } = require("../controllers/settingsController");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorize");
const router = express.Router();
router.get("/", requireAuth, requireRole("ADMIN"), getSettings);
router.put("/", requireAuth, requireRole("ADMIN"), updateSettings);
module.exports = router;