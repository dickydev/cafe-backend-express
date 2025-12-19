const sequelize = require("../config/database.js");
const User = require("./user.model");
const Category = require("./category.model");
const Product = require("./product.model");
const Table = require("./table.model");
const Order = require("./order.model");
const OrderItem = require("./orderItem.model");
const Reservation = require("./reservation.model");
const Review = require("./review.model");
const Cart = require("./cart.model");
const CartItem = require("./cartItem.model");

// RELATIONS ---------------------

// Category -> Product
Category.hasMany(Product, { foreignKey: "category_id", as: "products" });
Product.belongsTo(Category, { foreignKey: "category_id", as: "category" });

// Product -> Review
Product.hasMany(Review, { foreignKey: "product_id", as: "reviews" });
Review.belongsTo(Product, { foreignKey: "product_id", as: "product" });

// User -> Review
User.hasMany(Review, { foreignKey: "user_id" });
Review.belongsTo(User, { foreignKey: "user_id" });

// User -> Order
User.hasMany(Order, { foreignKey: "user_id" });
Order.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Table -> Order
Table.hasMany(Order, { foreignKey: "table_id" });
Order.belongsTo(Table, { foreignKey: "table_id", as: "table" });

// Order -> OrderItem
Order.hasMany(OrderItem, { foreignKey: "order_id", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "order_id" });

// Product -> OrderItem
Product.hasMany(OrderItem, { foreignKey: "product_id" });
OrderItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });

// Reservation
User.hasMany(Reservation, { foreignKey: "user_id" });
Reservation.belongsTo(User, { foreignKey: "user_id" });

Table.hasMany(Reservation, { foreignKey: "table_id" });
Reservation.belongsTo(Table, { foreignKey: "table_id" });

// Cart
User.hasOne(Cart, { foreignKey: "user_id" });
Cart.belongsTo(User, { foreignKey: "user_id" });

// CartItem
Cart.hasMany(CartItem, { foreignKey: "cart_id", as: "items" });
CartItem.belongsTo(Cart, { foreignKey: "cart_id" });

Product.hasMany(CartItem, { foreignKey: "product_id" });
CartItem.belongsTo(Product, { foreignKey: "product_id" });

// EXPORT
module.exports = {
  sequelize,
  User,
  Category,
  Product,
  Table,
  Order,
  OrderItem,
  Reservation,
  Review,
  Cart,
  CartItem,
};
