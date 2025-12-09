const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
const bcrypt = require("bcrypt");

class User extends Model {
  async comparePassword(password) {
    return bcrypt.compare(password, this.password);
  }
}

User.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING(50), unique: true, allowNull: false },
    email: { type: DataTypes.STRING(255), unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    full_name: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING(20) },
    role: {
      type: DataTypes.STRING(20),
      defaultValue: "waiter",
      validate: {
        isIn: [["admin", "cashier", "waiter", "kitchen", "customer"]],
      },
    },
    avatar: { type: DataTypes.TEXT },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    last_login: { type: DataTypes.DATE },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
  }
);

// Hash before save
User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});

User.beforeUpdate(async (user) => {
  if (user.changed("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

module.exports = User;
