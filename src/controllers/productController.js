const { Product, Category } = require('../models');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');
const { getPagination } = require('../utils/helpers');
const { deleteFile } = require('../middlewares/uploadMiddleware');

const getAllProducts = async (req, res, next) => {
  try {
    const { page = 1, size = 10, category_id, is_available, is_featured, search, min_price, max_price } = req.query;
    const { limit, offset } = getPagination(page, size);
    
    const where = {};
    if (category_id) where.category_id = category_id;
    if (is_available !== undefined) where.is_available = is_available;
    if (is_featured !== undefined) where.is_featured = is_featured;
    if (search) {
      where[require('sequelize').Op.or] = [
        { name: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { description: { [require('sequelize').Op.iLike]: `%${search}%` } }
      ];
    }
    if (min_price) where.price = { [require('sequelize').Op.gte]: min_price };
    if (max_price) where.price = { ...where.price, [require('sequelize').Op.lte]: max_price };
    
    const { count, rows } = await Product.findAndCountAll({
      where,
      limit,
      offset,
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'color', 'icon'] }],
      order: [['created_at', 'DESC']]
    });
    
    return paginatedResponse(res, 200, 'Products retrieved', rows, { page: parseInt(page), limit, totalItems: count });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, as: 'category' }]
    });
    if (!product) {
      return errorResponse(res, 404, 'Product not found');
    }
    return successResponse(res, 200, 'Product retrieved', product);
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body };
    if (req.file) {
      productData.image = `/uploads/${req.file.filename}`;
    }
    const product = await Product.create(productData);
    const fullProduct = await Product.findByPk(product.id, {
      include: [{ model: Category, as: 'category' }]
    });
    return successResponse(res, 201, 'Product created', fullProduct);
  } catch (error) {
    if (req.file) deleteFile(req.file.path);
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      if (req.file) deleteFile(req.file.path);
      return errorResponse(res, 404, 'Product not found');
    }
    
    const updateData = { ...req.body };
    if (req.file) {
      if (product.image) deleteFile(`uploads/${product.image.split('/').pop()}`);
      updateData.image = `/uploads/${req.file.filename}`;
    }
    
    await product.update(updateData);
    const updatedProduct = await Product.findByPk(product.id, {
      include: [{ model: Category, as: 'category' }]
    });
    return successResponse(res, 200, 'Product updated', updatedProduct);
  } catch (error) {
    if (req.file) deleteFile(req.file.path);
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return errorResponse(res, 404, 'Product not found');
    }
    if (product.image) deleteFile(`uploads/${product.image.split('/').pop()}`);
    await product.destroy();
    return successResponse(res, 200, 'Product deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };