const express = require("express");
const { body } = require("express-validator");
const validate = require("../middlewares/validator");
const { authenticate, authorize } = require("../middlewares/authMiddleware");
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const router = express.Router();

router.use(authenticate, authorize("admin"));

const userValidation = [
  body("username").optional().isLength({ min: 3 }),
  body("email").optional().isEmail(),
  body("password").optional().isLength({ min: 6 }),
];

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/", userValidation, validate, createUser);
router.put("/:id", userValidation, validate, updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
