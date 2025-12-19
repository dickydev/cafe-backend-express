const sequelize = require("./database");

exports.testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL connected successfully");
    return true;
  } catch (error) {
    console.error("❌ Unable to connect to MySQL:", error);
    return false;
  }
};

exports.syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ alter: !force, force });
    console.log("📦 Database synchronized");
  } catch (error) {
    console.error("❌ Error syncing database:", error);
  }
};
