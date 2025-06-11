const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SuggestedNews = sequelize.define('SuggestedNews', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: { // краткое описание или shortDescription
    type: DataTypes.TEXT,
    allowNull: false
  },
  fullDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cityId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  authorName: { // имя автора - необязательно
    type: DataTypes.STRING,
    allowNull: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  imageUrl: { // путь к изображению
    type: DataTypes.STRING,
    allowNull: true
  },
  status: { // статус заявки: "pending", "published", "rejected"
    type: DataTypes.ENUM('pending', 'published', 'rejected'),
    defaultValue: 'pending'
  },
  userId: { // кто предложил новость (если авторизован)
    type: DataTypes.INTEGER,
    allowNull: true
  },
  publishedId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  isFromReader: { // пометка "прислано читателем"
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  rejectionReason: {
  type: DataTypes.TEXT,
  allowNull: true
}
}, {
  tableName: 'suggested_news',
  timestamps: true
});

module.exports = SuggestedNews;




