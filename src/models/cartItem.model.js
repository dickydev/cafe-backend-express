const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class CartItem extends Model {}

CartItem.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cart_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  },
  {
    sequelize,
    modelName: "CartItem",
    tableName: "cart_items",
    timestamps: true,
  }
);

module.exports = CartItem;
