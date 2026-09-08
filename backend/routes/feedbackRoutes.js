const express = require("express");
const { createFeedback, getMyFeedback, getAllFeedback, updateFeedbackStatus } = require("../controllers/feedbackController");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorize");

const router = express.Router();
router.post("/", requireAuth, createFeedback);
router.get("/mine", requireAuth, getMyFeedback);
router.get("/", requireAuth, requireRole("ADMIN"), getAllFeedback);
router.patch("/:id/status", requireAuth, requireRole("ADMIN"), updateFeedbackStatus);
module.exports = router;