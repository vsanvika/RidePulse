const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema(
  {
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: true,
    },
    stop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stop",
      default: null,
    },
    timeSlot: {
      type: String, // e.g. "09:00-09:30"
      required: true,
    },
    dayOfWeek: {
      type: Number, // 0 = Sunday, 1 = Monday, etc.
      required: true,
    },
    predictedCrowd: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },
    predictedOccupancy: {
      type: Number, // percentage e.g. 75
      default: 50,
    },
    source: {
      type: String,
      default: "TREND_V1",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Prediction", predictionSchema);
