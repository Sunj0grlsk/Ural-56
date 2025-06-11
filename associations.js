// models/associations.js
const { sequelize } = require('../config/database');
const User = require('./user');
const Role = require('./role');
const News = require('./news');
const Comment = require('./comment');
const City = require('./city');
const SuggestedNews = require('./SuggestedNews')
const Category = require('./categories')


Comment.belongsTo(User, { foreignKey: 'UserID' });
Comment.belongsTo(News, { foreignKey: 'NewsID' });

User.hasMany(Comment, { foreignKey: 'UserID' });
News.hasMany(Comment, { foreignKey: 'NewsID' });
// Устанавливаем ассоциации
User.belongsTo(Role, { foreignKey: 'RoleID' });
Role.hasMany(User, { foreignKey: 'RoleID' });

News.belongsTo(City, { foreignKey: 'CityID' });
City.hasMany(News, { foreignKey: 'CityID' });

News.belongsTo(User, {foreignKey: 'AuthorID', as: 'AuthorUser'});
User.hasMany(News, {foreignKey: 'AuthorID'});

SuggestedNews.belongsTo(User, { foreignKey: 'userId', as: 'SuggestedBy' });
SuggestedNews.belongsTo(City, { foreignKey: 'CityID' });

News.belongsTo(Category, { foreignKey: 'CategoryID' });
Category.hasMany(News, { foreignKey: 'CategoryID' });

module.exports = {
    sequelize,
    User,
    News,
    Role,
    City,
    Comment,
    SuggestedNews,
    Category
};