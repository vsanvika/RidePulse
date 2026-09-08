const User = require("../models/User");
const Driver = require("../models/Driver");
const { generateToken } = require("../utils/generateToken");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const {
  validateRegisterInput,
  validateLoginInput,
} = require("../validators/authValidators");

async function register(req, res, next) {
  try {
    const { isValid, errors } = validateRegisterInput(req.body);
    if (!isValid) {
      return sendError(res, errors.join(". "), 400);
    }

    const { name, email, password, role, studentId, department, phone } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return sendError(res, "An account with this email already exists.", 409);
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: role === "DRIVER" ? "DRIVER" : "STUDENT",
      studentId: studentId || "",
      department: department || "",
      phone: phone || "",
    });

    if (user.role === "DRIVER") {
      await Driver.create({
        user: user._id,
        licenseNumber: `PENDING-${String(user._id).slice(-8)}`,
      });
    }

    const token = generateToken(user._id, user.role);

    const userObject = user.toObject();
    delete userObject.password;

    return sendSuccess(
      res,
      { token, user: userObject },
      "Registration successful",
      201
    );
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { isValid, errors } = validateLoginInput(req.body);
    if (!isValid) {
      return sendError(res, errors.join(". "), 400);
    }

    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user) {
      return sendError(res, "Invalid email or password.", 401);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, "Invalid email or password.", 401);
    }

    if (!user.isActive) {
      return sendError(res, "User account is inactive. Please contact support.", 403);
    }

    const token = generateToken(user._id, user.role);

    const userObject = user.toObject();
    delete userObject.password;

    return sendSuccess(
      res,
      { token, user: userObject },
      "Login successful",
      200
    );
  } catch (error) {
    next(error);
  }
}

async function logout(req, res) {
  return sendSuccess(res, {}, "Logout successful");
}

async function getMe(req, res) {
  return sendSuccess(
    res,
    { user: req.user },
    "User profile retrieved successfully"
  );
}

async function updateProfile(req, res, next) {
  try {
    const { name, phone, department, avatar } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, "User not found.", 404);
    }

    if (name !== undefined) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (department !== undefined) user.department = department.trim();
    if (avatar !== undefined) user.avatar = avatar.trim();

    await user.save();

    const userObject = user.toObject();
    delete userObject.password;

    return sendSuccess(
      res,
      { user: userObject },
      "Profile updated successfully"
    );
  } catch (error) {
    next(error);
  }
}

async function toggleFavorite(req, res, next) {
  try {
    const { type, id } = req.body;
    if (!id || !["route", "stop"].includes(type)) return sendError(res, "Favorite type and id are required", 400);
    const field = type === "route" ? "favoriteRoutes" : "favoriteStops";
    const values = req.user[field].map(String);
    const index = values.indexOf(String(id));
    if (index === -1) req.user[field].push(id);
    else req.user[field].splice(index, 1);
    await req.user.save();
    return sendSuccess(res, { favorites: req.user[field], active: index === -1 }, "Favorite updated");
  } catch (error) { next(error); }
}

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  toggleFavorite,
};
