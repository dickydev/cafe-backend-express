const { Table, Order } = require('../models');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');
const { getPagination, generateQRCode } = require('../utils/helpers');

const getAllTables = async (req, res, next) => {
  try {
    const { page, size, status, location, is_active } = req.query;
    const where = {};
    if (status) where.status = status;
    if (location) where.location = location;
    if (is_active !== undefined) where.is_active = is_active;
    
    if (page && size) {
      const { limit, offset } = getPagination(page, size);
      const { count, rows } = await Table.findAndCountAll({
        where, limit, offset, order: [['table_number', 'ASC']]
      });
      return paginatedResponse(res, 200, 'Tables retrieved', rows, { page: parseInt(page), limit, totalItems: count });
    }
    
    const tables = await Table.findAll({ where, order: [['table_number', 'ASC']] });
    return successResponse(res, 200, 'Tables retrieved', tables);
  } catch (error) {
    next(error);
  }
};

const getTableById = async (req, res, next) => {
  try {
    const table = await Table.findByPk(req.params.id, {
      include: [{
        model: Order,
        as: 'orders',
        where: { status: { [require('sequelize').Op.in]: ['pending', 'confirmed', 'preparing'] } },
        required: false
      }]
    });
    if (!table) {
      return errorResponse(res, 404, 'Table not found');
    }
    return successResponse(res, 200, 'Table retrieved', table);
  } catch (error) {
    next(error);
  }
};

const createTable = async (req, res, next) => {
  try {
    const tableData = { ...req.body };
    if (!tableData.qr_code) {
      tableData.qr_code = generateQRCode(tableData.table_number);
    }
    const table = await Table.create(tableData);
    return successResponse(res, 201, 'Table created', table);
  } catch (error) {
    next(error);
  }
};

const updateTable = async (req, res, next) => {
  try {
    const table = await Table.findByPk(req.params.id);
    if (!table) {
      return errorResponse(res, 404, 'Table not found');
    }
    await table.update(req.body);
    return successResponse(res, 200, 'Table updated', table);
  } catch (error) {
    next(error);
  }
};

const deleteTable = async (req, res, next) => {
  try {
    const table = await Table.findByPk(req.params.id);
    if (!table) {
      return errorResponse(res, 404, 'Table not found');
    }
    if (table.status === 'occupied') {
      return errorResponse(res, 400, 'Cannot delete occupied table');
    }
    await table.destroy();
    return successResponse(res, 200, 'Table deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllTables, getTableById, createTable, updateTable, deleteTable };