const mongoose = require("mongoose");

const stopSchema = new mongoose.Schema(
  {
    stopId: {
      type: String,
      required: [true, "Stop ID is required"],
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Stop name is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Stop code is required"],
      trim: true,
    },
    location: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    facilities: [
      {
        type: String,
        trim: true,
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Stop", stopSchema);
