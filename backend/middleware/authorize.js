const { sendError } = require("../utils/apiResponse");

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, "Not authenticated.", 401);
    }

    const allowedRoles = Array.isArray(roles[0]) ? roles[0] : roles;

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Forbidden. Access restricted to role(s): ${allowedRoles.join(", ")}`,
        403
      );
    }

    next();
  };
}

module.exports = { requireRole };
