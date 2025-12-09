const { Category, Product } = require('../models');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');
const { getPagination } = require('../utils/helpers');

const getAllCategories = async (req, res, next) => {
  try {
    const { page, size, is_active, search } = req.query;
    const where = {};
    if (is_active !== undefined) where.is_active = is_active;
    if (search) where.name = { [require('sequelize').Op.iLike]: `%${search}%` };
    
    if (page && size) {
      const { limit, offset } = getPagination(page, size);
      const { count, rows } = await Category.findAndCountAll({
        where, limit, offset, order: [['display_order', 'ASC'], ['name', 'ASC']]
      });
      return paginatedResponse(res, 200, 'Categories retrieved', rows, { page: parseInt(page), limit, totalItems: count });
    }
    
    const categories = await Category.findAll({ where, order: [['display_order', 'ASC'], ['name', 'ASC']] });
    return successResponse(res, 200, 'Categories retrieved', categories);
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id, { include: [{ model: Product, as: 'products' }] });
    if (!category) {
      return errorResponse(res, 404, 'Category not found');
    }
    return successResponse(res, 200, 'Category retrieved', category);
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    return successResponse(res, 201, 'Category created', category);
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return errorResponse(res, 404, 'Category not found');
    }
    await category.update(req.body);
    return successResponse(res, 200, 'Category updated', category);
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return errorResponse(res, 404, 'Category not found');
    }
    const productCount = await Product.count({ where: { category_id: category.id } });
    if (productCount > 0) {
      return errorResponse(res, 400, 'Cannot delete category with products');
    }
    await category.destroy();
    return successResponse(res, 200, 'Category deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };