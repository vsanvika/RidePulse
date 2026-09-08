const QRPass = require("../models/QRPass");
const Route = require("../models/Route");
const Shuttle = require("../models/Shuttle");
const Ride = require("../models/Ride");
const Stop = require("../models/Stop");
const { sendSuccess, sendError } = require("../utils/apiResponse");

async function generatePass(req, res, next) {
  try {
    const { routeId, date } = req.body;
    if (!routeId) {
      return sendError(res, "Please select a route for your boarding pass", 400);
    }

    const route = await Route.findById(routeId);
    if (!route) {
      return sendError(res, "Selected route not found", 404);
    }

    // Generate unique pass code
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const passCode = `RPASS-${req.user.studentId || "STU"}-${randomSuffix}`;

    const validDate = date ? new Date(date) : new Date();

    const pass = await QRPass.create({
      student: req.user._id,
      passCode,
      route: route._id,
      validDate,
      status: "ACTIVE",
    });

    const populated = await QRPass.findById(pass._id)
      .populate("student", "name email studentId department")
      .populate("route");

    return sendSuccess(res, { pass: populated }, "Boarding pass generated successfully", 201);
  } catch (error) {
    next(error);
  }
}

async function getMyPasses(req, res, next) {
  try {
    const passes = await QRPass.find({ student: req.user._id })
      .populate("route")
      .sort({ createdAt: -1 });

    return sendSuccess(res, { passes, count: passes.length }, "Student passes retrieved");
  } catch (error) {
    next(error);
  }
}

async function verifyPass(req, res, next) {
  try {
    const { passCode, shuttleId } = req.body;
    if (!passCode) {
      return sendError(res, "Pass Code is required for verification", 400);
    }

    const pass = await QRPass.findOne({ passCode: passCode.trim() })
      .populate("student", "name email studentId department")
      .populate("route");

    if (!pass) {
      return sendSuccess(
        res,
        { isValid: false, reason: "Pass Code does not exist in system database." },
        "Verification result"
      );
    }

    if (pass.status !== "ACTIVE") {
      return sendSuccess(
        res,
        { isValid: false, reason: `Pass is marked ${pass.status}. Cannot reuse pass.` },
        "Verification result"
      );
    }

    // Check date validity (same day)
    const todayStr = new Date().toISOString().split("T")[0];
    const passDateStr = new Date(pass.validDate).toISOString().split("T")[0];
    if (passDateStr !== todayStr) {
      pass.status = "EXPIRED";
      await pass.save();
      return sendSuccess(
        res,
        { isValid: false, reason: `Pass expired (Valid for ${passDateStr}, Today is ${todayStr}).` },
        "Verification result"
      );
    }

    // Mark pass as USED
    pass.status = "USED";
    await pass.save();

    // Find a shuttle and route stops to automatically record ride
    const shuttle = shuttleId
      ? await Shuttle.findById(shuttleId).populate("route")
      : await Shuttle.findOne({ route: pass.route._id });

    const stops = await Stop.find({ active: true });
    const originStop = stops[0] || null;
    const destinationStop = stops[1] || null;

    if (shuttle && originStop && destinationStop) {
      await Ride.create({
        student: pass.student._id,
        shuttle: shuttle._id,
        route: pass.route._id,
        boardingStop: originStop._id,
        destinationStop: destinationStop._id,
        status: "COMPLETED",
        completedAt: new Date(),
      });
    }

    return sendSuccess(
      res,
      {
        isValid: true,
        studentName: pass.student.name,
        studentId: pass.student.studentId || "N/A",
        department: pass.student.department || "General",
        routeName: pass.route.name,
        routeId: pass.route.routeId,
        passCode: pass.passCode,
        verifiedAt: new Date(),
      },
      "Pass verified successfully. Student boarded!"
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  generatePass,
  getMyPasses,
  verifyPass,
};
