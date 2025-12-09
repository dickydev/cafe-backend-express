const { Product, Category } = require("../models");
const { asyncHandler } = require("../middlewares/errorHandler");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../utils/responseHandler");
const { Op } = require("sequelize");
const { deleteFile } = require("../middlewares/uploadMiddleware");

exports.getAllProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    size = 10,
    category_id,
    is_available,
    is_featured,
    search,
    min_price,
    max_price,
  } = req.query;

  const where = {};

  if (category_id) where.category_id = category_id;
  if (is_available !== undefined) where.is_available = is_available;
  if (is_featured !== undefined) where.is_featured = is_featured;

  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
    ];
  }

  if (min_price) where.price = { [Op.gte]: min_price };
  if (max_price) where.price = { ...(where.price || {}), [Op.lte]: max_price };

  const limit = parseInt(size);
  const offset = (parseInt(page) - 1) * limit;

  const { count, rows } = await Product.findAndCountAll({
    where,
    limit,
    offset,
    include: [{ model: Category, as: "category", attributes: ["id", "name"] }],
    order: [["createdAt", "DESC"]],
  });

  return paginatedResponse(res, 200, "Products retrieved", rows, {
    page: parseInt(page),
    limit,
    totalItems: count,
  });
});

exports.getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id, {
    include: [{ model: Category, as: "category" }],
  });

  if (!product) return errorResponse(res, 404, "Product not found");

  return successResponse(res, 200, "Product retrieved", product);
});

exports.createProduct = asyncHandler(async (req, res) => {
  const data = { ...req.body };

  if (req.file) {
    data.image_url = `/uploads/${req.file.filename}`;
  }

  const product = await Product.create(data);

  const fullProduct = await Product.findByPk(product.id, {
    include: [{ model: Category, as: "category" }],
  });

  return successResponse(res, 201, "Product created", fullProduct);
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) {
    if (req.file) deleteFile(req.file.path);
    return errorResponse(res, 404, "Product not found");
  }

  const updateData = { ...req.body };

  if (req.file) {
    if (product.image_url) {
      deleteFile(`uploads/${product.image_url.split("/").pop()}`);
    }
    updateData.image_url = `/uploads/${req.file.filename}`;
  }

  await product.update(updateData);

  const updatedProduct = await Product.findByPk(product.id, {
    include: [{ model: Category, as: "category" }],
  });

  return successResponse(res, 200, "Product updated", updatedProduct);
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id);

  if (!product) return errorResponse(res, 404, "Product not found");

  if (product.image_url) {
    deleteFile(`uploads/${product.image_url.split("/").pop()}`);
  }

  await product.destroy();

  return successResponse(res, 200, "Product deleted");
});
