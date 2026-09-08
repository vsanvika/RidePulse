const mongoose = require("mongoose");

const emergencyReportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: ["Medical Emergency", "Accident", "Unsafe Situation", "Vehicle Problem", "Other"],
      default: "Other",
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    shuttleId: {
      type: String,
      default: "N/A",
    },
    location: {
      latitude: Number,
      longitude: Number,
      landmark: String,
    },
    status: {
      type: String,
      enum: ["PENDING", "INVESTIGATING", "RESOLVED"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("EmergencyReport", emergencyReportSchema);
