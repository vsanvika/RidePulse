const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema(
  {
    routeId: {
      type: String,
      required: [true, "Route ID is required"],
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Route name is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Route code is required"],
      trim: true,
    },
    color: {
      type: String,
      default: "#4F46E5",
    },
    stops: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stop",
        required: true,
      },
    ],
    estimatedDuration: {
      type: Number,
      default: 20, // in minutes
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Route", routeSchema);
