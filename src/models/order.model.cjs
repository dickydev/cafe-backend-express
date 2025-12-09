const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Order extends Model {}

Order.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: DataTypes.INTEGER,
    table_id: DataTypes.INTEGER,
    order_number: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    order_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: { isIn: [["dine-in", "takeaway", "delivery"]] },
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: "pending",
      validate: {
        isIn: [
          [
            "pending",
            "confirmed",
            "preparing",
            "ready",
            "completed",
            "cancelled",
          ],
        ],
      },
    },
    subtotal: DataTypes.DECIMAL(10, 2),
    tax: DataTypes.DECIMAL(10, 2),
    discount: DataTypes.DECIMAL(10, 2),
    total: DataTypes.DECIMAL(10, 2),
    payment_method: DataTypes.STRING,
    payment_status: { type: DataTypes.STRING, defaultValue: "pending" },
    customer_name: DataTypes.STRING,
    customer_phone: DataTypes.STRING,
    notes: DataTypes.TEXT,
  },
  {
    sequelize,
    modelName: "Order",
    tableName: "orders",
    timestamps: true,
  }
);

module.exports = Order;
