const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middlewares/validator');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { getAllOrders, getOrderById, createOrder, updateOrder, updateOrderStatus, deleteOrder } = require('../controllers/orderController');

const orderValidation = [
  body('order_type').isIn(['dine-in', 'takeaway', 'delivery']).withMessage('Invalid order type'),
  body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
  body('items.*.product_id').notEmpty().withMessage('Product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

const statusValidation = [
  body('status').isIn(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']).withMessage('Invalid status')
];

router.get('/', authenticate, getAllOrders);
router.get('/:id', authenticate, getOrderById);
router.post('/', authenticate, authorize('admin', 'cashier', 'waiter'), orderValidation, validate, createOrder);
router.put('/:id', authenticate, authorize('admin', 'cashier'), updateOrder);
router.put('/:id/status', authenticate, statusValidation, validate, updateOrderStatus);
router.delete('/:id', authenticate, authorize('admin'), deleteOrder);

module.exports = router;