// seeders/seed-cities.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('City', [  // Изменили 'Cities' на 'City'
      { 
        CityName: 'Москва', 
        Latitude: 55.7558, 
        Longitude: 37.6173,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { 
        CityName: 'Санкт-Петербург', 
        Latitude: 59.9343, 
        Longitude: 30.3351,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Добавьте другие города
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('City', null, {});  // Изменили 'Cities' на 'City'
  }
};