const express = require("express");
const { body } = require("express-validator");
const validate = require("../middlewares/validate");
const { authenticate, authorize } = require("../middlewares/auth");
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");

const router = express.Router();

const orderValidation = [
  body("order_type").isIn(["dine-in", "takeaway", "delivery"]),
  body("items").isArray({ min: 1 }),
  body("items.*.product_id").notEmpty(),
  body("items.*.quantity").isInt({ min: 1 }),
];

const statusValidation = [
  body("status").isIn([
    "pending",
    "confirmed",
    "preparing",
    "ready",
    "completed",
    "cancelled",
  ]),
];

router.get("/", authenticate, getAllOrders);
router.get("/:id", authenticate, getOrderById);

router.post(
  "/",
  authenticate,
  authorize("admin", "cashier", "waiter"),
  orderValidation,
  validate,
  createOrder
);

router.put("/:id", authenticate, authorize("admin", "cashier"), updateOrder);

router.put(
  "/:id/status",
  authenticate,
  statusValidation,
  validate,
  updateOrderStatus
);

router.delete("/:id", authenticate, authorize("admin"), deleteOrder);

module.exports = router;
