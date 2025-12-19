const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Reservation extends Model {}

Reservation.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: DataTypes.INTEGER,
    table_id: DataTypes.INTEGER,
    customer_name: { type: DataTypes.STRING, allowNull: false },
    customer_phone: { type: DataTypes.STRING, allowNull: false },
    number_of_guests: DataTypes.INTEGER,
    reservation_date: DataTypes.DATE,
    reservation_time: DataTypes.TIME,
    duration_minutes: { type: DataTypes.INTEGER, defaultValue: 120 },
    status: { type: DataTypes.STRING, defaultValue: "pending" },
    special_requests: DataTypes.TEXT,
  },
  {
    sequelize,
    modelName: "Reservation",
    tableName: "reservations",
    timestamps: true,
  }
);

module.exports = Reservation;
