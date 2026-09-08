const mongoose = require("mongoose");

const systemSettingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: "default" },
  breakdownTimeoutSeconds: { type: Number, default: 15, min: 5 },
  speedMultiplier: { type: Number, default: 1, min: 0.25, max: 4 },
  crowdThresholds: { lowMax: { type: Number, default: 40 }, mediumMax: { type: Number, default: 75 } },
}, { timestamps: true });

module.exports = mongoose.model("SystemSettings", systemSettingsSchema);