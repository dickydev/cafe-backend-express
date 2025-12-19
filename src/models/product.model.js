const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Product extends Model {}

Product.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    category_id: { type: DataTypes.INTEGER },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    image_url: { type: DataTypes.TEXT },
    is_available: { type: DataTypes.BOOLEAN, defaultValue: true },
    is_featured: { type: DataTypes.BOOLEAN, defaultValue: false },
    stock_quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
    preparation_time: { type: DataTypes.INTEGER, defaultValue: 10 },
  },
  {
    sequelize,
    modelName: "Product",
    tableName: "products",
    timestamps: true,
  }
);

module.exports = Product;
