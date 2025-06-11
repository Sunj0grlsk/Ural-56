const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const City = sequelize.define('City', {
     CityID: {
      type: DataTypes.INTEGER,
      field: 'CityID', // Явное указание имени столбца
      primaryKey: true,
      autoIncrement: true
    },
    CityName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
     Latitude: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    Longitude: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
     CityName: {
      type: DataTypes.STRING,
      field: 'CityName' // Явное указание
    }
  }, {
    tableName: 'City',
    timestamps: false,
    // Для PostgreSQL важно указать схему
    schema: 'public'
  });
module.exports = City;