const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendError } = require("../utils/apiResponse");

async function requireAuth(req, res, next) {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return sendError(res, "Not authorized. No token provided.", 401);
  }

  try {
    const secret = process.env.JWT_SECRET || "ridepulse_secret_key_2026";
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return sendError(res, "User account no longer exists.", 401);
    }

    if (!user.isActive) {
      return sendError(res, "User account is inactive. Please contact support.", 403);
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, "Not authorized. Invalid or expired token.", 401);
  }
}

module.exports = { requireAuth };
