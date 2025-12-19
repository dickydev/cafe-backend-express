const app = require("./app");
const sequelize = require("./config/database");
const config = require("./config/config");
const seedAdmin = require("./seeders/admin.seeder");

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    if (config.nodeEnv === "development") {
      //   await sequelize.sync({ alter: true });
      await sequelize.sync();
      console.log("📦 Database synced");
      await seedAdmin();
    }

    app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
    });
  } catch (err) {
    console.error("❌ Server failed to start:", err);
    process.exit(1);
  }
};

startServer();
