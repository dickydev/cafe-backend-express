const { User } = require("../models");

const seedAdmin = async () => {
  try {
    const adminEmail = "admin@cafelab.com";

    const existingAdmin = await User.findOne({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log("ℹ️ Admin user already exists");
      return;
    }

    const admin = await User.create({
      username: "admin",
      email: adminEmail,
      password: "password123",
      full_name: "Admin Cafe Lab",
      phone: "081234567890",
      role: "admin",
      is_active: true,
    });

    console.log("✅ Admin user created successfully");
    console.log({
      id: admin.id,
      email: admin.email,
      role: admin.role,
    });
  } catch (error) {
    console.error("❌ Failed to seed admin user:", error);
  }
};

module.exports = seedAdmin;
