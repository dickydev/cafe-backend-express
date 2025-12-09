const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class OrderItem extends Model {}

OrderItem.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    product_name: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    price: DataTypes.DECIMAL(10, 2),
    discount: DataTypes.DECIMAL(10, 2),
    subtotal: DataTypes.DECIMAL(10, 2),
    notes: DataTypes.TEXT,
  },
  {
    sequelize,
    modelName: "OrderItem",
    tableName: "order_items",
    timestamps: true,
  }
);

module.exports = OrderItem;
