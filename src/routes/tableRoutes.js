const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middlewares/validator');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { getAllTables, getTableById, createTable, updateTable, deleteTable } = require('../controllers/tableController');

const tableValidation = [
  body('table_number').trim().notEmpty().withMessage('Table number is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('location').optional().trim(),
  body('status').optional().isIn(['available', 'occupied', 'reserved', 'maintenance']).withMessage('Invalid status')
];

router.get('/', authenticate, getAllTables);
router.get('/:id', authenticate, getTableById);
router.post('/', authenticate, authorize('admin'), tableValidation, validate, createTable);
router.put('/:id', authenticate, authorize('admin', 'cashier'), validate, updateTable);
router.delete('/:id', authenticate, authorize('admin'), deleteTable);

module.exports = router;