const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middlewares/validator');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { getAllUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/userController');

const userValidation = [
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('role').optional().isIn(['admin', 'cashier', 'waiter', 'kitchen']).withMessage('Invalid role')
];

router.use(authenticate, authorize('admin'));

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', userValidation, validate, createUser);
router.put('/:id', validate, updateUser);
router.delete('/:id', deleteUser);

module.exports = router;