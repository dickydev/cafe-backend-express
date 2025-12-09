const express = require("express");
const { body } = require("express-validator");
const validate = require("../middlewares/validator");
const { authenticate, authorize } = require("../middlewares/authMiddleware");
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const router = express.Router();

const categoryValidation = [
  body("name").notEmpty(),
  body("display_order").optional().isInt({ min: 0 }),
];

router.get("/", authenticate, getAllCategories);
router.get("/:id", authenticate, getCategoryById);
router.post(
  "/",
  authenticate,
  authorize("admin"),
  categoryValidation,
  validate,
  createCategory
);
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  categoryValidation,
  validate,
  updateCategory
);
router.delete("/:id", authenticate, authorize("admin"), deleteCategory);

module.exports = router;
