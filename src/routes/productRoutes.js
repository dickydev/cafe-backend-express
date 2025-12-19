const express = require("express");
const { body } = require("express-validator");
const validate = require("../middlewares/validate");
const { authenticate, authorize } = require("../middlewares/auth");
const { uploadSingle } = require("../middlewares/uploadMiddleware");
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const router = express.Router();

const productValidation = [
  body("category_id").notEmpty(),
  body("name").notEmpty(),
  body("price").isDecimal(),
  body("stock_quantity").optional().isInt({ min: 0 }),
];

router.get("/", authenticate, getAllProducts);
router.get("/:id", authenticate, getProductById);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  uploadSingle("image"),
  productValidation,
  validate,
  createProduct
);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  uploadSingle("image"),
  productValidation,
  validate,
  updateProduct
);

router.delete("/:id", authenticate, authorize("admin"), deleteProduct);

module.exports = router;
