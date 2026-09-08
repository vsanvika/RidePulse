const SystemSettings = require("../models/SystemSettings");
const { sendSuccess } = require("../utils/apiResponse");

async function getSettings(req, res, next) {
  try {
    const settings = await SystemSettings.findOneAndUpdate({ key: "default" }, {}, { upsert: true, new: true, setDefaultsOnInsert: true });
    return sendSuccess(res, { settings }, "System settings retrieved");
  } catch (error) { next(error); }
}

async function updateSettings(req, res, next) {
  try {
    const allowed = ["breakdownTimeoutSeconds", "speedMultiplier", "crowdThresholds"];
    const update = {};
    allowed.forEach((field) => { if (req.body[field] !== undefined) update[field] = req.body[field]; });
    const settings = await SystemSettings.findOneAndUpdate({ key: "default" }, update, { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true });
    return sendSuccess(res, { settings }, "System settings updated");
  } catch (error) { next(error); }
}

module.exports = { getSettings, updateSettings };