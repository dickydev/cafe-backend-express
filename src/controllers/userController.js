const { User } = require('../models');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');
const { getPagination } = require('../utils/helpers');
const logger = require('../utils/logger');

const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, size = 10, role, is_active, search } = req.query;
    const { limit, offset } = getPagination(page, size);
    
    const where = {};
    if (role) where.role = role;
    if (is_active !== undefined) where.is_active = is_active;
    if (search) {
      where[require('sequelize').Op.or] = [
        { username: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { email: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { full_name: { [require('sequelize').Op.iLike]: `%${search}%` } }
      ];
    }
    
    const { count, rows } = await User.findAndCountAll({ where, limit, offset, order: [['created_at', 'DESC']] });
    
    return paginatedResponse(res, 200, 'Users retrieved', rows, { page: parseInt(page), limit, totalItems: count });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }
    return successResponse(res, 200, 'User retrieved', user);
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { username, email, password, full_name, phone, role } = req.body;
    const existingUser = await User.findOne({
      where: { [require('sequelize').Op.or]: [{ email }, { username }] }
    });
    if (existingUser) {
      return errorResponse(res, 400, 'User already exists');
    }
    const user = await User.create({ username, email, password, full_name, phone, role });
    logger.info(`User created: ${user.email}`);
    return successResponse(res, 201, 'User created', user);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }
    const { username, email, full_name, phone, role, is_active, avatar } = req.body;
    await user.update({ username, email, full_name, phone, role, is_active, avatar });
    logger.info(`User updated: ${user.email}`);
    return successResponse(res, 200, 'User updated', user);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }
    if (user.id === req.user.id) {
      return errorResponse(res, 400, 'Cannot delete yourself');
    }
    await user.destroy();
    logger.info(`User deleted: ${user.email}`);
    return successResponse(res, 200, 'User deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };