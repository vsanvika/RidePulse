const Feedback = require("../models/Feedback");
const { sendSuccess, sendError } = require("../utils/apiResponse");

async function createFeedback(req, res, next) {
  try {
    const { shuttle, rating, comment, type = "FEEDBACK" } = req.body;
    if (!comment?.trim()) return sendError(res, "Please provide feedback details", 400);
    if (type === "FEEDBACK" && (!rating || rating < 1 || rating > 5)) return sendError(res, "A rating from 1 to 5 is required", 400);
    const feedback = await Feedback.create({ student: req.user._id, shuttle: shuttle || null, rating: rating || null, comment, type });
    const io = req.app.get("io");
    if (io) io.to("admin").emit("feedback:new", feedback);
    return sendSuccess(res, { feedback }, "Feedback submitted successfully", 201);
  } catch (error) { next(error); }
}

async function getMyFeedback(req, res, next) {
  try {
    const feedback = await Feedback.find({ student: req.user._id }).populate("shuttle").sort({ createdAt: -1 });
    return sendSuccess(res, { feedback }, "Feedback retrieved successfully");
  } catch (error) { next(error); }
}

async function getAllFeedback(req, res, next) {
  try {
    const feedback = await Feedback.find({}).populate("student", "name email").populate("shuttle").sort({ createdAt: -1 });
    return sendSuccess(res, { feedback }, "Feedback retrieved successfully");
  } catch (error) { next(error); }
}

async function updateFeedbackStatus(req, res, next) {
  try {
    const feedback = await Feedback.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!feedback) return sendError(res, "Feedback not found", 404);
    return sendSuccess(res, { feedback }, "Feedback status updated");
  } catch (error) { next(error); }
}

module.exports = { createFeedback, getMyFeedback, getAllFeedback, updateFeedbackStatus };