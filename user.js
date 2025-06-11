const { DataTypes } = require('sequelize');
const sequelize = require("../config/database");


const User = sequelize.define('User', {
    User_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    Name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    Password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    RoleID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

module.exports = User;