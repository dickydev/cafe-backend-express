const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Review extends Model {}

Review.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    rating: { type: DataTypes.INTEGER, validate: { min: 1, max: 5 } },
    comment: DataTypes.TEXT,
    is_approved: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize,
    modelName: "Review",
    tableName: "reviews",
    timestamps: true,
  }
);

module.exports = Review;
