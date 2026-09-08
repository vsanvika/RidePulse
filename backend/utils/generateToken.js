const jwt = require("jsonwebtoken");

function generateToken(id, role) {
  const secret = process.env.JWT_SECRET || "ridepulse_secret_key_2026";
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign({ id, role }, secret, { expiresIn });
}

module.exports = { generateToken };
