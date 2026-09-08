const { sendSuccess } = require("../utils/apiResponse");
const { getMongoStatus } = require("../config/db");

function getHealth(req, res) {
  sendSuccess(
    res,
    {
      status: "ok",
      mongo: getMongoStatus(),
    },
    "RidePulse API is running"
  );
}

module.exports = { getHealth };
