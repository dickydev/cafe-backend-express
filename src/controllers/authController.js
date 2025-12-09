const { User } = require("../models");
const { successResponse, errorResponse } = require("../utils/responseHandler");
const { asyncHandler } = require("../middlewares/errorHandler");
const logger = require("../utils/logger");
const bcrypt = require("bcrypt");

exports.register = asyncHandler(async (req, res) => {
  const { username, email, password, full_name, phone, role } = req.body;

  const exists = await User.findOne({ where: { email } });
  if (exists) return errorResponse(res, 400, "User already exists");

  const user = await User.create({
    username,
    email,
    password,
    full_name,
    phone,
    role: role || "waiter",
  });

  logger.info(`New user registered: ${user.email}`);

  return successResponse(res, 201, "User registered successfully", {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user || !user.is_active)
    return errorResponse(res, 401, "Invalid credentials");

  const match = await bcrypt.compare(password, user.password);
  if (!match) return errorResponse(res, 401, "Invalid credentials");

  // Set session
  req.session.userId = user.id;

  logger.info(`User logged in: ${user.email}`);

  return successResponse(res, 200, "Login successful", {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    sessionId: req.sessionID,
  });
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.session.userId, {
    attributes: ["id", "username", "email", "full_name", "phone", "role"],
  });

  return successResponse(res, 200, "User profile retrieved", user);
});

exports.updateMe = asyncHandler(async (req, res) => {
  const { full_name, phone, avatar } = req.body;

  const user = await User.findByPk(req.session.userId);
  await user.update({ full_name, phone, avatar });

  return successResponse(res, 200, "Profile updated", user);
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findByPk(req.session.userId);

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) return errorResponse(res, 401, "Wrong current password");

  await user.update({ password: newPassword });

  return successResponse(res, 200, "Password changed successfully");
});

exports.logout = asyncHandler(async (req, res) => {
  req.session.destroy();

  return successResponse(res, 200, "Logged out successfully");
});
