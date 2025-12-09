const express = require("express");
const { body } = require("express-validator");
const validate = require("../middlewares/validator");
const { authenticate, authorize } = require("../middlewares/authMiddleware");
const {
  getAllTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
} = require("../controllers/tableController");

const router = express.Router();

const tableValidation = [
  body("table_number").notEmpty(),
  body("capacity").isInt({ min: 1 }),
];

router.get("/", authenticate, getAllTables);
router.get("/:id", authenticate, getTableById);
router.post(
  "/",
  authenticate,
  authorize("admin"),
  tableValidation,
  validate,
  createTable
);
router.put(
  "/:id",
  authenticate,
  authorize("admin", "cashier"),
  tableValidation,
  validate,
  updateTable
);
router.delete("/:id", authenticate, authorize("admin"), deleteTable);

module.exports = router;
