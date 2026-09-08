const { sendError } = require("../utils/apiResponse");

function notFound(req, res) {
  sendError(res, "Route not found", 404);
}

module.exports = { notFound };
