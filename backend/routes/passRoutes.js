const express = require("express");
const {
  generatePass,
  getMyPasses,
  verifyPass,
} = require("../controllers/passController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/generate", requireAuth, generatePass);
router.get("/my-passes", requireAuth, getMyPasses);
router.post("/verify", requireAuth, verifyPass);

module.exports = router;
