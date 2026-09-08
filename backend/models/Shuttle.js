const mongoose = require("mongoose");

const shuttleSchema = new mongoose.Schema(
  {
    shuttleId: {
      type: String,
      required: [true, "Shuttle ID is required"],
      unique: true,
      trim: true,
      index: true,
    },
    vehicleNumber: {
      type: String,
      required: [true, "Vehicle number is required"],
      trim: true,
    },
    capacity: {
      type: Number,
      default: 40,
    },
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      default: null,
      index: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
    },
    currentLocation: {
      latitude: {
        type: Number,
        default: 17.4455,
      },
      longitude: {
        type: Number,
        default: 78.3482,
      },
    },
    currentStop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stop",
      default: null,
    },
    nextStop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stop",
      default: null,
    },
    speed: {
      type: Number,
      default: 0, // km/h
    },
    passengerCount: {
      type: Number,
      default: 0,
    },
    crowdLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "LOW",
    },
    status: {
      type: String,
      enum: [
        "ON_TIME",
        "DELAYED",
        "STOPPED",
        "BREAKDOWN",
        "COMPLETED",
        "OFFLINE",
      ],
      default: "ON_TIME",
      index: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Shuttle", shuttleSchema);
