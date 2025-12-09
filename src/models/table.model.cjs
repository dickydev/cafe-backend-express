const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Table extends Model {}

Table.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    table_number: {
      type: DataTypes.STRING(10),
      unique: true,
      allowNull: false,
    },
    capacity: { type: DataTypes.INTEGER, allowNull: false },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: "available",
      validate: {
        isIn: [["available", "occupied", "reserved", "maintenance"]],
      },
    },
    location: { type: DataTypes.STRING(50) },
  },
  {
    sequelize,
    modelName: "Table",
    tableName: "tables",
    timestamps: true,
  }
);

module.exports = Table;
