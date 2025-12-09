const express = require("express");
const router = express.Router();

router.use("/auth", require("./authRoutes"));
router.use("/users", require("./userRoutes"));
router.use("/categories", require("./categoryRoutes"));
router.use("/products", require("./productRoutes"));
router.use("/tables", require("./tableRoutes"));
router.use("/orders", require("./orderRoutes"));

router.get("/", (req, res) => {
  res.json({
    message: "Cafe Lab API",
    version: "1.0.0",
    modules: {
      auth: "/api/v1/auth",
      users: "/api/v1/users",
      products: "/api/v1/products",
      categories: "/api/v1/categories",
      tables: "/api/v1/tables",
      orders: "/api/v1/orders",
    },
  });
});

module.exports = router;
