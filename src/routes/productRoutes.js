const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middlewares/validator');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { uploadSingle } = require('../middlewares/uploadMiddleware');
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');

const productValidation = [
  body('category_id').notEmpty().withMessage('Category is required'),
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('price').isDecimal({ decimal_digits: '0,2' }).withMessage('Invalid price'),
  body('cost').optional().isDecimal({ decimal_digits: '0,2' }).withMessage('Invalid cost'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be positive'),
  body('is_available').optional().isBoolean().withMessage('is_available must be boolean')
];

router.get('/', authenticate, getAllProducts);
router.get('/:id', authenticate, getProductById);
router.post('/', authenticate, authorize('admin'), uploadSingle('image'), productValidation, validate, createProduct);
router.put('/:id', authenticate, authorize('admin'), uploadSingle('image'), validate, updateProduct);
router.delete('/:id', authenticate, authorize('admin'), deleteProduct);

module.exports = router;