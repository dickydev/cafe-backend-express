const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
    pool: {
      max: 20,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL connected successfully");
    return true;
  } catch (error) {
    console.error("❌ Unable to connect to MySQL:", error);
    return false;
  }
};

const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ alter: !force, force });
    console.log("📦 Database synchronized");
  } catch (error) {
    console.error("❌ Error syncing database:", error);
  }
};

module.exports = { sequelize, testConnection, syncDatabase };
