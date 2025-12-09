const { User } = require("../models");
const { asyncHandler } = require("../middlewares/errorHandler");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../utils/responseHandler");
const { Op } = require("sequelize");

// GET ALL USERS
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, size = 10, role, is_active, search } = req.query;

  const where = {};
  if (role) where.role = role;
  if (is_active !== undefined) where.is_active = is_active;
  if (search) {
    where[Op.or] = [
      { username: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
      { full_name: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const limit = parseInt(size);
  const offset = (parseInt(page) - 1) * limit;

  const { count, rows } = await User.findAndCountAll({
    where,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return paginatedResponse(res, 200, "Users retrieved", rows, {
    page: parseInt(page),
    limit,
    totalItems: count,
  });
});

// GET USER BY ID
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return errorResponse(res, 404, "User not found");

  return successResponse(res, 200, "User retrieved", user);
});

// CREATE USER
exports.createUser = asyncHandler(async (req, res) => {
  const exists = await User.findOne({
    where: {
      [Op.or]: [{ email: req.body.email }, { username: req.body.username }],
    },
  });

  if (exists) return errorResponse(res, 400, "User already exists");

  const user = await User.create(req.body);
  return successResponse(res, 201, "User created", user);
});

// UPDATE USER
exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return errorResponse(res, 404, "User not found");

  await user.update(req.body);
  return successResponse(res, 200, "User updated", user);
});

// DELETE USER
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return errorResponse(res, 404, "User not found");

  if (user.id === req.user.id)
    return errorResponse(res, 400, "Cannot delete your own account");

  await user.destroy();
  return successResponse(res, 200, "User deleted");
});
