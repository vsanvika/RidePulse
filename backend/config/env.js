const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
require("dotenv").config({ path: path.join(__dirname, "../.env") });

function parseAllowedOrigins(rawOrigins = "") {
  const defaults = ["http://localhost:5173", "http://127.0.0.1:5173"];
  const origins = rawOrigins
    ? rawOrigins.split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : defaults;

  return [...new Set(origins.map((origin) => origin.replace(/\/$/, "")))];
}

function loadEnv() {
  const nodeEnv = process.env.NODE_ENV || "development";
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  const jwtSecret = process.env.JWT_SECRET;

  if (!mongoUri) {
    throw new Error(
      "MONGO_URI is missing. Copy .env.example to .env at the project root."
    );
  }

  if (!jwtSecret) {
    throw new Error(
      "JWT_SECRET is missing. Set it in the project root .env before starting the server."
    );
  }

  const clientUrl =
    process.env.CLIENT_URL ||
    process.env.FRONTEND_URL ||
    "http://localhost:5173";
  const allowAllOrigins =
    process.env.CORS_ALLOW_ALL === "true" ||
    (nodeEnv === "production" && process.env.CORS_ALLOW_ALL !== "false");

  return {
    port: Number(process.env.PORT) || 5000,
    mongoUri,
    jwtSecret,
    clientUrl,
    allowedOrigins: parseAllowedOrigins(clientUrl),
    nodeEnv,
    allowAllOrigins,
  };
}

module.exports = { loadEnv, parseAllowedOrigins };
