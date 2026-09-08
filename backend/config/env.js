const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
require("dotenv").config({ path: path.join(__dirname, "../.env") });

function loadEnv() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error(
      "MONGO_URI is missing. Copy .env.example to .env at the project root."
    );
  }

  return {
    port: Number(process.env.PORT) || 5000,
    mongoUri,
    jwtSecret: process.env.JWT_SECRET || "",
    clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
    nodeEnv: process.env.NODE_ENV || "development",
  };
}

module.exports = { loadEnv };
