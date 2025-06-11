const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Comment = sequelize.define('Comment', {
    CommentID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    NewsID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'News',
            key: 'NewsID'
        }
    },
    UserID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'User_id'
        }
    },
    CommentText: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    CreatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    IsApproved: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'Comments',
    timestamps: false
});

module.exports = Comment;