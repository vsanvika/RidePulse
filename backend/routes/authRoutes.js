const express = require("express");
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  toggleFavorite,
} = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, getMe);
router.put("/profile", requireAuth, updateProfile);
router.post("/favorites", requireAuth, toggleFavorite);

module.exports = router;
