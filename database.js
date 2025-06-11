const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  database: `Ural 56`, // Убедитесь, что имя БД точно совпадает
  username: 'postgres',
  password: '310185', // Пароль как строка (у вас уже правильно)
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  dialectOptions: {
    ssl: false, // Если не используете SSL
    // Для современных версий PostgreSQL может потребоваться:
    authentication: {
      type: 'md5' // Или 'plain' в зависимости от настроек pg_hba.conf
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  logging: false // Отключаем логирование SQL-запросов
});

// Тест подключения с более подробным логом
sequelize.authenticate()
  .then(() => {
    console.log('✅ Подключение к PostgreSQL установлено');
    
    // Дополнительная проверка таблицы City
    sequelize.query('SELECT 1 FROM "City" LIMIT 1')
      .then(() => console.log('✅ Таблица City доступна'))
      .catch(err => console.error('❌ Таблица City не найдена:', err.message));
  })
  .catch(err => {
    console.error('❌ Ошибка подключения к PostgreSQL:', err.original || err);
    
    // Проверка конкретных ошибок
    if (err.original && err.original.code === '28P01') {
      console.error('Неверный логин/пароль');
    } else if (err.original && err.original.code === '3D000') {
      console.error('База данных не существует');
    }
  });

module.exports = sequelize;