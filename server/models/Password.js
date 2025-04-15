const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Password = sequelize.define(
  "Password",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    encrypted_password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    iv: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "passwords",
    timestamps: true,
  }
);

// Define associations
Password.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Password, { foreignKey: "user_id" });

module.exports = Password;
