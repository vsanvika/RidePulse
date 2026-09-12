const test = require("node:test");
const assert = require("node:assert/strict");

const { loadEnv, parseAllowedOrigins } = require("./env");

test("loadEnv resolves production values and parseAllowedOrigins handles comma-separated URLs", () => {
  process.env.MONGO_URI = "mongodb://localhost:27017/ridepulse";
  process.env.PORT = "5001";
  process.env.JWT_SECRET = "production-secret";
  process.env.CLIENT_URL = "https://app.example.com,https://admin.example.com";

  const config = loadEnv();

  assert.equal(config.port, 5001);
  assert.equal(config.jwtSecret, "production-secret");
  assert.equal(config.allowAllOrigins, false);
  assert.deepEqual(parseAllowedOrigins(process.env.CLIENT_URL), [
    "https://app.example.com",
    "https://admin.example.com",
  ]);
});
