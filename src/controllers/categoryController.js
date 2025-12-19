const { Category, Product } = require("../models");
const { asyncHandler } = require("../middlewares/errorHandler.js");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../utils/responseHandler");
const { Op } = require("sequelize");

exports.getAllCategories = asyncHandler(async (req, res) => {
  const { page, size, is_active, search } = req.query;

  const where = {};
  if (is_active !== undefined) where.is_active = is_active;
  if (search) where.name = { [Op.iLike]: `%${search}%` };

  if (page && size) {
    const limit = parseInt(size);
    const offset = (parseInt(page) - 1) * limit;

    const { count, rows } = await Category.findAndCountAll({
      where,
      limit,
      offset,
      order: [
        ["display_order", "ASC"],
        ["name", "ASC"],
      ],
    });

    return paginatedResponse(res, 200, "Categories retrieved", rows, {
      page: parseInt(page),
      limit,
      totalItems: count,
    });
  }

  const categories = await Category.findAll({
    where,
    order: [
      ["display_order", "ASC"],
      ["name", "ASC"],
    ],
  });

  return successResponse(res, 200, "Categories retrieved", categories);
});

exports.getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findByPk(req.params.id, {
    include: [{ model: Product, as: "products" }],
  });

  if (!category) return errorResponse(res, 404, "Category not found");

  return successResponse(res, 200, "Category retrieved", category);
});

exports.createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  return successResponse(res, 201, "Category created", category);
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) return errorResponse(res, 404, "Category not found");

  await category.update(req.body);
  return successResponse(res, 200, "Category updated", category);
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) return errorResponse(res, 404, "Category not found");

  const productCount = await Product.count({
    where: { category_id: category.id },
  });
  if (productCount > 0)
    return errorResponse(
      res,
      400,
      "Cannot delete category with existing products"
    );

  await category.destroy();
  return successResponse(res, 200, "Category deleted");
});
