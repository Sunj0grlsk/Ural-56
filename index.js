const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Bütün model dosyalarını yükle
fs.readdirSync(__dirname)
  .filter(file => (
    file.indexOf('.') !== 0 &&
    file !== basename &&
    file.slice(-3) === '.js'
  ))
  .forEach(file => {
    const modelPath = path.join(__dirname, file);
    const model = require(modelPath); // Загружаем модель как есть

    // Проверяем, является ли модель функцией
    if (typeof model === 'function') {
      // Если это функция, вызываем ее с sequelize и DataTypes
      const initializedModel = model(sequelize, Sequelize.DataTypes);
      db[initializedModel.name] = initializedModel;
    } else {
      // Если это не функция, предполагаем, что это уже инициализированная модель
      db[model.name] = model;
    }
  });

// İlişkilendirmeleri uygula
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) db[modelName].associate(db);
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
