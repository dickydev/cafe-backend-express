const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middlewares/validator');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');

const categoryValidation = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('description').optional().trim(),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Invalid color format'),
  body('display_order').optional().isInt({ min: 0 }).withMessage('Display order must be positive')
];

router.get('/', authenticate, getAllCategories);
router.get('/:id', authenticate, getCategoryById);
router.post('/', authenticate, authorize('admin'), categoryValidation, validate, createCategory);
router.put('/:id', authenticate, authorize('admin'), validate, updateCategory);
router.delete('/:id', authenticate, authorize('admin'), deleteCategory);

module.exports = router;