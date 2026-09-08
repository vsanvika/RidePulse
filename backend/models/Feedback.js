const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  shuttle: { type: mongoose.Schema.Types.ObjectId, ref: "Shuttle", default: null },
  rating: { type: Number, min: 1, max: 5, default: null },
  type: { type: String, enum: ["FEEDBACK", "ISSUE"], default: "FEEDBACK" },
  comment: { type: String, required: true, trim: true },
  status: { type: String, enum: ["OPEN", "REVIEWED", "RESOLVED"], default: "OPEN" },
}, { timestamps: true });

module.exports = mongoose.model("Feedback", feedbackSchema);