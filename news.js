const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const City = require('./city');
const User = require('./user')

const News = sequelize.define('News', {
    NewsID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    FullDescription: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    ImageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    Date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    Author: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    CityID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'City',
            key: 'CityID'
        }
    },
    CategoryID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Category',
            key: 'CategoryID'
        }
    }
}, {
    tableName: 'News',
    timestamps: false
});
News.belongsTo(City, { foreignKey: 'CityID' })

module.exports = News;