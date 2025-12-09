  const express = require('express');
  const router = express.Router();
  const { body } = require('express-validator');
  const validate = require('../middlewares/validator');
  const { authenticate } = require('../middlewares/authMiddleware');
  const { register, login, getMe, updateMe, changePassword, refreshToken, logout } = require('../controllers/authController');

  // Validation rules
  const registerValidation = [
    body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('full_name').trim().notEmpty().withMessage('Full name is required'),
    body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
    body('role').optional().isIn(['admin', 'cashier', 'waiter', 'kitchen']).withMessage('Invalid role')
  ];

  const loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required')
  ];

  const updateProfileValidation = [
    body('full_name').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
    body('phone').optional().isMobilePhone().withMessage('Invalid phone number')
  ];

  const changePasswordValidation = [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
  ];

  // Routes
  router.post('/register', registerValidation, validate, register);
  router.post('/login', loginValidation, validate, login);
  router.get('/me', authenticate, getMe);
  router.put('/me', authenticate, updateProfileValidation, validate, updateMe);
  router.put('/change-password', authenticate, changePasswordValidation, validate, changePassword);
  router.post('/refresh-token', refreshToken);
  router.post('/logout', authenticate, logout);

  module.exports = router;