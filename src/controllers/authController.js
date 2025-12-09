const { User } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/helpers');
const logger = require('../utils/logger');

const register = async (req, res, next) => {
  try {
    const { username, email, password, full_name, phone, role } = req.body;
    const existingUser = await User.findOne({
      where: { [require('sequelize').Op.or]: [{ email }, { username }] }
    });
    if (existingUser) {
      return errorResponse(res, 400, 'User already exists');
    }
    const user = await User.create({ username, email, password, full_name, phone, role: role || 'waiter' });
    const token = generateToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });
    logger.info(`New user registered: ${user.email}`);
    return successResponse(res, 201, 'User registered successfully', { user, token, refreshToken });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !user.is_active) {
      return errorResponse(res, 401, 'Invalid credentials');
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return errorResponse(res, 401, 'Invalid credentials');
    }
    await user.update({ last_login: new Date() });
    const token = generateToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });
    logger.info(`User logged in: ${user.email}`);
    return successResponse(res, 200, 'Login successful', { user, token, refreshToken });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    return successResponse(res, 200, 'User profile retrieved', req.user);
  } catch (error) {
    next(error);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const { full_name, phone, avatar } = req.body;
    await req.user.update({ full_name, phone, avatar });
    return successResponse(res, 200, 'Profile updated', req.user);
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const isValid = await req.user.comparePassword(currentPassword);
    if (!isValid) {
      return errorResponse(res, 401, 'Current password is incorrect');
    }
    await req.user.update({ password: newPassword });
    return successResponse(res, 200, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return errorResponse(res, 400, 'Refresh token required');
    }
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findByPk(decoded.id);
    if (!user || !user.is_active) {
      return errorResponse(res, 401, 'Invalid refresh token');
    }
    const newToken = generateToken({ id: user.id, role: user.role });
    const newRefreshToken = generateRefreshToken({ id: user.id });
    return successResponse(res, 200, 'Token refreshed', { token: newToken, refreshToken: newRefreshToken });
  } catch (error) {
    return errorResponse(res, 401, 'Invalid refresh token');
  }
};

const logout = async (req, res, next) => {
  try {
    logger.info(`User logged out: ${req.user.email}`);
    return successResponse(res, 200, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateMe, changePassword, refreshToken, logout };