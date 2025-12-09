const { Table, Order } = require("../models");
const { asyncHandler } = require("../middlewares/errorHandler");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../utils/responseHandler");
const { Op } = require("sequelize");

// GET ALL TABLES
exports.getAllTables = asyncHandler(async (req, res) => {
  const { page, size, status, location, is_active } = req.query;

  const where = {};
  if (status) where.status = status;
  if (location) where.location = location;
  if (is_active !== undefined) where.is_active = is_active;

  if (page && size) {
    const limit = parseInt(size);
    const offset = (parseInt(page) - 1) * limit;

    const { count, rows } = await Table.findAndCountAll({
      where,
      limit,
      offset,
      order: [["table_number", "ASC"]],
    });

    return paginatedResponse(res, 200, "Tables retrieved", rows, {
      page: parseInt(page),
      limit,
      totalItems: count,
    });
  }

  const tables = await Table.findAll({
    where,
    order: [["table_number", "ASC"]],
  });

  return successResponse(res, 200, "Tables retrieved", tables);
});

// GET TABLE BY ID
exports.getTableById = asyncHandler(async (req, res) => {
  const table = await Table.findByPk(req.params.id, {
    include: [
      {
        model: Order,
        as: "orders",
        where: {
          status: { [Op.in]: ["pending", "confirmed", "preparing"] },
        },
        required: false,
      },
    ],
  });

  if (!table) return errorResponse(res, 404, "Table not found");

  return successResponse(res, 200, "Table retrieved", table);
});

// CREATE TABLE
exports.createTable = asyncHandler(async (req, res) => {
  const table = await Table.create(req.body);
  return successResponse(res, 201, "Table created", table);
});

// UPDATE TABLE
exports.updateTable = asyncHandler(async (req, res) => {
  const table = await Table.findByPk(req.params.id);
  if (!table) return errorResponse(res, 404, "Table not found");

  await table.update(req.body);
  return successResponse(res, 200, "Table updated", table);
});

// DELETE TABLE
exports.deleteTable = asyncHandler(async (req, res) => {
  const table = await Table.findByPk(req.params.id);

  if (!table) return errorResponse(res, 404, "Table not found");
  if (table.status === "occupied")
    return errorResponse(res, 400, "Cannot delete occupied table");

  await table.destroy();
  return successResponse(res, 200, "Table deleted");
});
