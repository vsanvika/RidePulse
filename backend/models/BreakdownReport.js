const mongoose = require("mongoose");

const breakdownReportSchema = new mongoose.Schema(
  {
    shuttle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shuttle",
      required: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    issueDescription: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      latitude: Number,
      longitude: Number,
    },
    status: {
      type: String,
      enum: ["REPORTED", "IN_PROGRESS", "RESOLVED"],
      default: "REPORTED",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BreakdownReport", breakdownReportSchema);
