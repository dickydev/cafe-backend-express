const { User } = require("../models");
const { successResponse, errorResponse } = require("../utils/responseHandler");
const { asyncHandler } = require("../middlewares/errorHandler");
const bcrypt = require("bcrypt");
const logger = console;

// ===============================
// REGISTER
// ===============================
exports.register = asyncHandler(async (req, res) => {
  const { username, email, password, full_name, phone, role } = req.body;

  const exists = await User.findOne({ where: { email } });
  if (exists) return errorResponse(res, 400, "User already exists");

  const user = await User.create({
    username,
    email,
    password, // plaintext
    full_name,
    phone,
    role: role || "waiter",
  });

  return successResponse(res, 201, "User registered successfully", {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  });
});

// ===============================
// LOGIN
// ===============================
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user || !user.is_active) {
    return errorResponse(res, 401, "Invalid credentials");
  }

  // 🔥 TANPA BCRYPT
  if (password !== user.password) {
    return errorResponse(res, 401, "Invalid credentials");
  }

  req.session.userId = user.id;

  return successResponse(res, 200, "Login successful", {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
});

// ===============================
// GET ME
// ===============================
exports.getMe = asyncHandler(async (req, res) => {
  if (!req.user) {
    return errorResponse(res, 401, "Not authenticated");
  }

  return successResponse(res, 200, "User profile retrieved", {
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
    full_name: req.user.full_name,
    phone: req.user.phone,
    role: req.user.role,
  });
});

// ===============================
// UPDATE PROFILE
// ===============================
exports.updateMe = asyncHandler(async (req, res) => {
  if (!req.user) {
    return errorResponse(res, 401, "Not authenticated");
  }

  const { full_name, phone, avatar } = req.body;

  await req.user.update({ full_name, phone, avatar });

  return successResponse(res, 200, "Profile updated", req.user);
});

// ===============================
// CHANGE PASSWORD
// ===============================
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!req.user) {
    return errorResponse(res, 401, "Not authenticated");
  }

  const match = await bcrypt.compare(currentPassword, req.user.password);
  if (!match) {
    return errorResponse(res, 401, "Wrong current password");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await req.user.update({ password: newPassword });

  return successResponse(res, 200, "Password changed successfully");
});

// ===============================
// LOGOUT
// ===============================
exports.logout = asyncHandler(async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return errorResponse(res, 500, "Failed to logout");
    }

    res.clearCookie(process.env.SESSION_NAME || "cafe-lab.sid");

    return successResponse(res, 200, "Logged out successfully");
  });
});
