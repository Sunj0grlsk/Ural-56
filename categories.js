const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  CategoryID: {
    type: DataTypes.INTEGER,
    field: 'CategoryID',
    primaryKey: true,
    autoIncrement: true
  },
  CategoryName: {
    type: DataTypes.STRING,
    field: 'CategoryName',
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'categories',
  timestamps: false,
  schema: 'public'
});

module.exports = Category;
