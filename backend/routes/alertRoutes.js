const express = require("express");
const { getAllAlerts, createAlert, deleteAlert } = require("../controllers/alertController");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorize");

const router = express.Router();

router.get("/", requireAuth, getAllAlerts);
router.post("/", requireAuth, requireRole("ADMIN", "DRIVER"), createAlert);
router.delete("/:id", requireAuth, requireRole("ADMIN"), deleteAlert);

module.exports = router;
