const sequelize = require('../config/database');
const News = require('./news');

// syncModel.js или в месте, где вы синхронизируете модели
const { User, Role } = require('../models/associations');

async function syncModels() {
    try {
        await sequelize.sync({ force: false }); // force: true для пересоздания таблиц (осторожно!)

        // Проверяем, есть ли роли, и создаем их если нет
        const roles = await Role.findAll();
        if (roles.length === 0) {
            await Role.bulkCreate([
                { RoleName: 'admin' },
                { RoleName: 'user' }
            ]);
            console.log('Базовые роли созданы');
        }
    } catch (error) {
        console.error('Ошибка при синхронизации моделей:', error);
        throw error;
    }
}

module.exports = syncModels;