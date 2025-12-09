const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Cart extends Model {}

Cart.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: DataTypes.INTEGER,
  },
  {
    sequelize,
    modelName: "Cart",
    tableName: "carts",
    timestamps: true,
  }
);

module.exports = Cart;
