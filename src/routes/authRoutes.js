const express = require("express");
const { body } = require("express-validator");
const validate = require("../middlewares/validator");
const { authenticate } = require("../middlewares/authMiddleware");
const {
  register,
  login,
  getMe,
  updateMe,
  changePassword,
  logout,
} = require("../controllers/authController");

const router = express.Router();

// VALIDATIONS
const registerValidation = [
  body("username").trim().isLength({ min: 3 }),
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  body("full_name").notEmpty(),
];

const loginValidation = [body("email").isEmail(), body("password").notEmpty()];

const updateProfileValidation = [
  body("full_name").optional().notEmpty(),
  body("phone").optional().isMobilePhone(),
];

const changePasswordValidation = [
  body("currentPassword").notEmpty(),
  body("newPassword").isLength({ min: 6 }),
];

// ROUTES
router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);
router.get("/me", authenticate, getMe);
router.put("/me", authenticate, updateProfileValidation, validate, updateMe);
router.put(
  "/change-password",
  authenticate,
  changePasswordValidation,
  validate,
  changePassword
);
router.post("/logout", authenticate, logout);

module.exports = router;
