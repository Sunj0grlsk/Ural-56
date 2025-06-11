const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const newsRoutes = require('./routes/news');
const bcrypt = require('bcrypt');
const authRoutes = require('./routes/auth');
const cors = require('cors')
const syncModel = require('./models/syncModel');
const { User, Role, City, News, Comment, Category } = require('./models/associations');
const router = express.Router();
const { Pool } = require('pg');
const commentRoutes = require('./routes/comments');
const { Sequelize } = require('sequelize');
const { Op } = require('sequelize');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const PDFDocument = require('pdfkit');
const streamBuffers = require('stream-buffers');
const suggestedNewsRoutes = require('./routes/suggestedNews');
const citiesRouter = require('./routes/cities');
const userRouter = require('./routes/auth');
const categoriesRouter = require('./routes/categories'); // путь к вашему файлу
const app = express();



// Важные middleware
app.use(cors({
  origin: 'http://localhost:3000', // Без массива, если один origin
  credentials: true,
  exposedHeaders: ['set-cookie']
}));
const pgSession = require('connect-pg-simple')(session);
app.use('/cities', citiesRouter);
app.use('/api/user', userRouter);
app.use('/categories', categoriesRouter); // это должно быть ДО app.listen()
app.use(
  session({
    secret: 'aboba',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // true для HTTPS
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 день
    },

  })
);


// Защищённый роут



const PORT = process.env.PORT || 3000;
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 
app.use('/api/news', newsRoutes); // Префикс /api/news


// Настройка сессии (должно быть в начале, перед роутами)


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // Укажите ваш фронтенд-адрес
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// routes/news.js


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));




app.use('/auth', authRoutes);
app.use('/news', newsRoutes);
app.get('/profile', (req, res) => {
    if (req.session.User) {
        res.redirect('/profile.html');
    } else {
        res.redirect('/index.html');
    }
});
app.use('/comments', commentRoutes);
app.get('/weather', async (req, res) => {
    const city = req.query.city || 'Москва';
    const apiKey = 'demo_yandex_weather_api_key_ca6d09349ba0';
    try {
        const response = await fetch(`https://api.yandex.com/weather?city=${city}&apikey=${apiKey}`);
        if (!response.ok) {
            throw new Error(`HTTP ошибка! статус: ${response.status}`);
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Ошибка при получении данных о погоде:', error);
        res.status(500).json({ message: 'Ошибка при получении данных о погоде' });
    }
});
app.get('/profile/data', async (req, res) => {
    if (req.session.User) {
        try {
            const userData = await User.findOne({ where: { User_id: req.session.User.id },
                include: [{ model: Role, attributes: ['RoleName', 'RoleID'] }] });
            if (userData) {
                console.log('User data:', userData); // Логируем данные пользователя
                res.json({
                    user: {
                        name: userData.Name,
                        email: userData.Email,
                        roleId: userData.Role.RoleID,
                    }
                });
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: 'Server error' });
        }
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
});



// Маршрут для получения данных профиля


// Маршрут для обновления данных профиля
app.post('/edit-profile', async (req, res) => {
    if (!req.session.User) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { username, password } = req.body;

    try {
        const user = await User.findOne({ where: { User_id: req.session.User.id } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Обновляем имя
        user.Name = username;

        // Обновляем пароль, если он предоставлен
        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.Password = hashedPassword;
        }

        await user.save();

        res.json({ success: true, user: { name: username } });
    } catch (error) {
        console.error('Ошибка при обновлении профиля:', error);
        res.status(500).json({ message: 'Ошибка при обновлении профиля' });
    }
});


app.get('/', (req, res) => {
res.sendFile(path.join(__dirname, 'public/index.html'));
});


syncModel()
.then(() => {
    app.listen(PORT, () => {
        console.log(`Сервер запущен на http://localhost:${PORT}`);
    });
})
.catch(error => {
  console.error('Ошибка при запуске сервера:', error);
});

app.get('/api/admin/check', async (req, res) => {
  try {
    if (!req.session.User) {
      return res.status(401).json({ isAdmin: false });
    }

    // Если хотите получить данные из базы, то можно, но обычно достаточно сессии
    // const user = await User.findOne({
    //   where: { User_id: req.session.User.id },
    //   include: [Role]
    // });

    res.json({ 
      isAdmin: req.session.User.role === 'admin',
      user: {
        id: req.session.User.id,
        role: req.session.User.role,
        // name можно добавить, если храните
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

const checkAdmin = async (req, res, next) => {
  console.log('Сессия:', req.session); // Логируем сессию

  if (!req.session.User) {
    return res.status(401).json({ error: 'Не авторизован' });
  }

  // Измените проверку роли, так как у вас role записывается как строка
  if (req.session.User.role !== 'admin') {
    return res.status(403).json({ error: 'Требуются права администратора' });
  }

  next();
};

app.get('/api/admin/news/:id', async (req, res) => {
  try {
    const news = await News.findByPk(req.params.id, {
      include: [
        { model: City, attributes: ['CityID', 'CityName'] },
        { model: User, as: 'AuthorUser', attributes: ['User_id', 'Name', 'Email'] }
      ]
    });

    if (!news) {
      return res.status(404).json({ error: 'Новость не найдена' });
    }

    res.json({
      NewsID: news.NewsID,
      Title: news.Title,
      ShortDescription: news.ShortDescription,
      FullDescription: news.FullDescription,
      CityID: news.CityID,
      AuthorID: news.AuthorID,
      Date: news.Date,
      ImageUrl: news.ImageUrl,
      City: news.City,
      Author: news.AuthorUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.delete('/news/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const newsId = parseInt(req.params.id);
    if (isNaN(newsId)) {
      return res.status(400).json({ error: 'Некорректный ID новости' });
    }

    // Проверяем, существует ли новость
    const news = await News.findByPk(newsId);
    if (!news) {
      return res.status(404).json({ error: 'Новость не найдена' });
    }

    // Удаляем
    await news.destroy();
    res.json({ message: 'Новость удалена' });

  } catch (error) {
    console.error('Ошибка при удалении:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновление новости
app.put('/api/admin/news/:id', upload.single('image'), async (req, res) => {
  try {
    const news = await News.findByPk(req.params.id);
    if (!news) {
      return res.status(404).json({ error: 'Новость не найдена' });
    }

    // Обновляем поля
    if (req.body.title !== undefined) news.Title = req.body.title;
    if (req.body.shortDescription !== undefined) news.ShortDescription = req.body.shortDescription;
    if (req.body.fullDescription !== undefined) news.FullDescription = req.body.fullDescription;
    if (req.body.cityId !== undefined) news.CityID = req.body.cityId || null;
    if (req.body.authorId !== undefined) news.AuthorID = req.body.authorId || null;
    if (req.body.date !== undefined) news.Date = req.body.date || null;

    // Обработка загруженного изображения
    if (req.file) {
      // Здесь должна быть логика сохранения файла и получения его URL
      // Например, загрузка в облачное хранилище или перемещение в публичную папку
      const imageUrl = `/uploads/${req.file.filename}`; // Примерный URL
      news.ImageUrl = imageUrl;
    }

    await news.save();

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});



router.get('/cities', async (req, res) => {
  try {
    // 1. Логируем параметры подключения
    console.log('Sequelize config:', sequelize.config);

    // 2. Проверяем доступ к таблицам
    const tables = await sequelize.showAllSchemas();
    console.log('Available tables:', tables);

    // 3. Альтернативный запрос
    const cities = await sequelize.query(`
      SELECT "CityID", "CityName" 
      FROM "City"
      ORDER BY "CityName" ASC
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('Cities from raw query:', cities);
    res.json(cities);
  } catch (error) {
    console.error('Full error:', {
      message: error.message,
      stack: error.stack,
      original: error.original
    });
    res.status(500).json({ 
      error: 'Database error',
      details: error.message 
    });
  }
});

router.get('/debug-cities', async (req, res) => {
  try {
    // 1. Проверка через прямой запрос
    const [rawResults] = await sequelize.query('SELECT * FROM "City"');
    console.log('Raw SQL results:', rawResults);

    // 2. Проверка через модель
    const modelResults = await City.findAll();
    console.log('Model results:', modelResults.map(c => c.toJSON()));

    // 3. Проверка атрибутов модели
    console.log('City model attributes:', Object.keys(City.rawAttributes));

    res.json({
      rawQuery: rawResults,
      viaModel: modelResults,
      modelAttributes: Object.keys(City.rawAttributes)
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});


app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin-panel.html'));
});

app.get('/admin/js/admin-panel.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/scripts/admin-panel.js'));
});

app.use('/api', (req, res, next) => {
  if (req.accepts('json')) {
    next();
  } else {
    res.status(406).json({ error: "Accept only JSON" });
  }
});

// 2. Простой эндпоинт для проверки
app.get('/api/admin/ping', (req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});


// Защищенный маршрут для добавления новости
app.use(express.static(path.join(__dirname, 'public')));

router.get('/news/:id(\\d+).html', async (req, res) => {
    console.log('Запрос к новости:', req.params.id);
    const newsId = parseInt(req.params.id);
    console.log('ID после parseInt:', newsId); 
    
    if (isNaN(newsId)) {
        return res.status(400).json({ message: 'Неверный идентификатор новости' });
    }

    try {
        const newsItem = await News.findOne({ where: { NewsID: newsId } });
        if (!newsItem) {
            return res.status(404).json({ message: 'Новость не найдена' });
        }

        // Отправляем HTML-страницу
        res.sendFile(path.join(__dirname, '../public/news', `${newsItem.NewsID}.html`));
    } catch (error) {
        console.error("Ошибка при получении новости:", error);
        res.status(500).send('Ошибка сервера');
    }
});

app.get('/search', async (req, res) => {
    const query = req.query.query;
    console.log('Поисковый запрос:', query);

    if (!query || query.length < 2) {
        return res.json([]);
    }

    try {
        const results = await News.findAll({
            where: {
                [Op.or]: [
                    { Title: { [Op.iLike]: `%${query}%` } },  // Поиск по Title (с учетом вашей модели)
                    { FullDescription: { [Op.iLike]: `%${query}%` } }  // Поиск по FullDescription
                ]
            },
            order: [['Date', 'DESC']],  // Сортировка по дате (новые сначала)
            limit: 10  // Ограничение результатов
        });

        // Форматируем данные для фронтенда
        const formattedResults = results.map(item => ({
            NewsID: item.NewsID,  // Используем NewsID, как в модели
            Title: item.Title,
            Date: item.Date,
            Author: item.Author,
            ImageUrl: item.ImageUrl,
            City: item.City ? item.City.Name : null  // Если есть связь с City
        }));

        res.json(formattedResults);
    } catch (error) {
        console.error('Ошибка поиска:', error);
        res.status(500).json({ error: 'Ошибка при выполнении поиска' });
    }
});
async function syncModels() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        
        // Синхронизация всех моделей
        await sequelize.sync({ alter: true });
        console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error;
    }
}

async function startServer() {
    try {
        await sequelize.sync({ alter: true }); // или { force: true } для пересоздания таблиц
        console.log('Модели синхронизированы с БД');
    } catch (err) {
        console.error('Ошибка синхронизации моделей:', err);
    }
}

app.post('/reviews', async (req, res) => {
    try {
        const { CommentText, NewsID, User_id } = req.body;

        const newComment = await Comment.create({
            CommentText,
            NewsID,
            User_id,
            // IsApproved и CreatedAt добавятся автоматически (из модели)
        });

        // Перенаправляем пользователя или отправляем успешный ответ
        res.redirect('/news/' + NewsID); // Например, обратно на страницу новости
        // Или можно отправить JSON:
        // res.status(201).json({ success: true, comment: newComment });
    } catch (error) {
        console.error(error);
        res.status(500).send("Ошибка при сохранении комментария");
    }
});

// Добавляем после других маршрутов
// Маршруты для панели администратора
app.get('/api/admin/stats', async (req, res) => {
  try {
    const stats = {
      totalUsers: await User.count(),
      totalNews: await News.count(),
      activeUsers: await User.count({
        where: { createdAt: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
      })
    };
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ 
      where: { Email: email },
      include: [Role]
    });

    if (user && bcrypt.compareSync(password, user.Password)) {
      req.session.User = {
        id: user.id, // сохраняем ID, если он нужен в будущем
        role: user.Role.roleName // предполагаем, что roleName хранит название роли
      };
      
      return res.json({ success: true });
    }
    
    res.status(401).json({ error: 'Неверные данные' });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});
// Получение списка пользователей
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.findAll({
      include: [Role],
      order: [['User_id', 'ASC']]
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получение списка новостей


// Удаление пользователя
app.delete('/api/admin/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        await user.destroy(); // Удаляем пользователя
        res.json({ success: true, message: 'Пользователь успешно удален' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получение данных пользователя
app.get('/api/admin/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['User_id', 'Name', 'Email', 'RoleID']
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/admin/news', async (req, res) => {
  try {
    const news = await News.findAll({
      order: [['Date', 'DESC']],
      include: [
        { 
          model: City, 
          attributes: ['CityName'] 
        },
        { 
          model: User, 
          attributes: ['Name'],
          as: 'AuthorUser' 
        }
      ]
    });
    res.json(news);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/admin/news', (req, res, next) => {
  console.log('Admin news access attempt:', {
    session: req.session,
    headers: req.headers
  });
  next();
}, checkAdmin, async (req, res) => {
  if (!req.session.User || req.session.User.roleId !== 'admin') {
    console.log('Доступ запрещен. Сессия:', req.session);
    return res.status(403).json({ error: 'Forbidden' });
  }
});
// В вашем роутере для новостей
router.get('/latest', async (req, res) => {
    try {
        const latestNews = await News.findAll({
            order: [['Date', 'DESC']],
            limit: 10, // Получаем 10 последних новостей, из них выберем 4 случайных
            include: [{ model: City }] // Если у вас есть связь с городами
        });
        
        res.json(latestNews);
    } catch (error) {
        console.error('Error fetching latest news:', error);
        res.status(500).json({ message: 'Ошибка при загрузке новостей' });
    }
});
app.get('/news/latest', async (req, res) => {
  console.log("Запрос к /news/latest получен"); // Логируем факт запроса

  try {
    const latestNews = await News.findAll({
      order: [['Date', 'DESC']],
      limit: 4,
      include: [
        { 
          model: City, 
          attributes: ['CityName'] 
        },
        { 
          model: User, 
          as: 'AuthorUser', 
          attributes: ['Name'] 
        }
      ]
    });

    console.log("Найдены новости:", latestNews); // Логируем результат
    res.json(latestNews);

  } catch (error) {
    console.error("Ошибка в /news/latest:", error); // Подробный лог ошибки
    res.status(500).json({ 
      error: "Ошибка сервера",
      details: error.message 
    });
  }
});
router.get('/profile/data', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Не авторизован' });
    }
    
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'name', 'email', 'roleId'],
            include: [{
                model: Role,
                attributes: ['RoleName']
            }]
        });
        
        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                roleId: user.roleId,
                roleName: user.Role.RoleName
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});
router.get('/api/news/latest', async (req, res) => {
    try {
        const news = await News.find().sort({ date: -1 }).limit(4);
        res.json(news);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Получение конкретной новости
router.get('/news/:id', async (req, res) => {
    try {
        const news = await News.findOne({ _id: req.params.id });
        if (!news) return res.status(404).render('404');
        res.render('news/view', { news });
    } catch (err) {
        res.status(500).render('error');
    }
});



console.log(City === undefined); // Проверка, не является ли City undefined

const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'ваш-домен.ru'],
  credentials: true,
  exposedHeaders: ['set-cookie'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

app.use(cors(corsOptions));

// Для express-session:



router.post('/login', async (req, res) => {
  const user = await User.findOne({
    where: { Email: req.body.email },
    include: [{ model: Role }]
  });

  if (user && bcrypt.compareSync(req.body.password, user.Password)) {
    req.session.User = {
      id: user.User_id,
      role: user.Role.RoleID, // Сохраняем числовое значение роли
      name: user.Name,
      email: user.Email
    };
    
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Неверные данные' });
  }
});

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get('/api/debug/session', (req, res) => {
  res.json({
    session: req.session,
    isAdmin: req.session.User?.role === 'admin'
  });
});

console.log('News модель:', News);
console.log('City модель:', City);
console.log('Categoty модель:', Category);

app.post('/api/admin/users', async (req, res) => {
  try {
    const { name, email, password, roleId } = req.body;
    
    // Простая валидация
    if (!name || !email || !password || !roleId) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    // Проверка существующего email
    const existingUser = await User.findOne({ where: { Email: email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email уже используется' });
    }
    
    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Создание пользователя
    const newUser = await User.create({
      Name: name,
      Email: email,
      Password: hashedPassword,
      RoleID: roleId
    });
    
    res.json({ 
      success: true, 
      user: {
        id: newUser.User_id,
        name: newUser.Name,
        email: newUser.Email,
        roleId: newUser.RoleID
      }
    });
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/api/users', async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['User_id', 'Name']  // Используем правильные имена полей из модели
        });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Получение статистики
app.get('/api/admin/stats', async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const stats = {
      totalNews: await News.count(),
      totalUsers: await User.count(),
      weeklyNews: await News.count({
        where: {
          Date: {
            [Op.gte]: oneWeekAgo
          }
        }
      }),
      totalComments: await Comment.count()
    };
    
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получение списка комментариев
app.get('/api/admin/comments', async (req, res) => {
  try {
    const comments = await Comment.findAll({
      include: [
        { model: User, attributes: ['User_id', 'Name'] },
        { model: News, attributes: ['NewsID', 'Title'] }
      ],
      order: [['CreatedAt', 'DESC']]
    });
    
    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удаление комментария
app.delete('/api/admin/comments/:id', async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ error: 'Комментарий не найден' });
    }
    
    await comment.destroy();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/admin/generate-report', async (req, res) => {
  try {
    // Получаем данные для отчета
    const stats = await getAdminStats();
    const users = await User.findAll({ 
      limit: 10, 
      order: [['createdAt', 'DESC']],
      attributes: ['Name', 'Email', 'createdAt'] // Оптимизация: выбираем только нужные поля
    });
    
    const news = await News.findAll({ 
      limit: 10, 
      order: [['Date', 'DESC']],
      include: [{
        model: City,
        attributes: ['CityName']
      }],
      attributes: ['NewsID', 'Title', 'Date', 'ImageUrl']
    });
    
    const comments = await Comment.findAll({ 
      limit: 10, 
      order: [['CreatedAt', 'DESC']],
      include: [
        {
          model: User,
          attributes: ['Name']
        },
        {
          model: News,
          attributes: ['Title']
        }
      ],
      attributes: ['CommentID', 'CommentText', 'CreatedAt']
    });

    // Создаем PDF документ
    const doc = new PDFDocument();
    
    // Устанавливаем заголовки
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=Ural56-Report.pdf');
    
    // Пайпим PDF прямо в ответ
    doc.pipe(res);
    
    // Добавляем логотип (если нужно)
    // doc.image('path/to/logo.png', 50, 45, { width: 50 });
    
    // Заголовок отчета
    doc.font('Helvetica-Bold')
       .fontSize(20)
       .text('Отчет администратора Урал56', { 
         align: 'center',
         underline: true
       });
    
    doc.moveDown();
    
    // Блок общей статистики
    doc.font('Helvetica-Bold')
       .fontSize(16)
       .fillColor('#3498db') // Синий цвет
       .text('Общая статистика:', { underline: false });
    
    doc.font('Helvetica')
       .fontSize(12)
       .fillColor('#000000') // Черный цвет
       .text(`• Всего новостей: ${stats.totalNews}`, { indent: 20 })
       .text(`• Новостей за неделю: ${stats.weeklyNews}`, { indent: 20 })
       .text(`• Всего пользователей: ${stats.totalUsers}`, { indent: 20 })
       .text(`• Новых пользователей за неделю: ${stats.weeklyUsers}`, { indent: 20 })
       .text(`• Всего комментариев: ${stats.totalComments}`, { indent: 20 })
       .text(`• Комментариев за неделю: ${stats.weeklyComments}`, { indent: 20 });
    
    doc.moveDown();
    
    // Блок последних пользователей
    doc.addPage() // Новая страница (опционально)
       .font('Helvetica-Bold')
       .fontSize(16)
       .fillColor('#3498db')
       .text('Последние зарегистрированные пользователи:', { underline: false });
    
    users.forEach(user => {
      doc.font('Helvetica')
         .fontSize(12)
         .fillColor('#000000')
         .text(`- ${user.Name} (${user.Email})`, { indent: 20 })
         .text(`  Дата регистрации: ${formatDate(user.createdAt)}`, { indent: 30 });
    });
    
    doc.moveDown();
    
    // Блок последних новостей
    doc.addPage()
       .font('Helvetica-Bold')
       .fontSize(16)
       .fillColor('#3498db')
       .text('Последние добавленные новости:', { underline: false });
    
    news.forEach(item => {
      doc.font('Helvetica')
         .fontSize(12)
         .text(`- "${item.Title}"`, { indent: 20 })
         .text(`  Город: ${item.City?.CityName || 'Не указан'}`, { indent: 30 })
         .text(`  Дата публикации: ${formatDate(item.Date)}`, { indent: 30 });
      
      // Добавляем миниатюру если есть изображение
      if (item.ImageUrl) {
        // doc.image(item.ImageUrl, { width: 100, align: 'center' });
      }
    });
    
    doc.moveDown();
    
    // Блок последних комментариев
    doc.addPage()
       .font('Helvetica-Bold')
       .fontSize(16)
       .fillColor('#3498db')
       .text('Последние комментарии:', { underline: false });
    
    comments.forEach(comment => {
      doc.font('Helvetica')
         .fontSize(12)
         .text(`- Пользователь: ${comment.User.Name}`, { indent: 20 })
         .text(`  Комментарий: "${truncate(comment.CommentText, 50)}"`, { indent: 30 })
         .text(`  К новости: "${truncate(comment.News.Title, 30)}"`, { indent: 30 })
         .text(`  Дата: ${formatDate(comment.CreatedAt)}`, { indent: 30 })
         .moveDown(0.5);
    });
    
    // Графическая статистика (опционально)
    doc.addPage()
       .font('Helvetica-Bold')
       .fontSize(16)
       .text('Графики статистики', { align: 'center' });
    
    // Здесь можно добавить графики, если преобразуете их в изображения
    
    // Футер
    doc.fontSize(10)
       .text(`Отчет сгенерирован: ${new Date().toLocaleString('ru-RU')}`, {
         align: 'right'
       });
    
    // Завершаем документ
    doc.end();
    
  } catch (error) {
    console.error('Ошибка генерации отчета:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Ошибка генерации отчета',
        details: error.message 
      });
    }
  }
});

// Вспомогательные функции
function formatDate(date) {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function truncate(text, length) {
  return text.length > length ? text.substring(0, length) + '...' : text;
}

// Функция для получения статистики
async function getAdminStats() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  return {
    totalNews: await News.count(),
    totalUsers: await User.count(),
    weeklyNews: await News.count({ 
      where: { 
        Date: { [Op.gte]: oneWeekAgo } 
      } 
    }),
    weeklyUsers: await User.count({ 
      where: { 
        createdAt: { [Op.gte]: oneWeekAgo } 
      } 
    }),
    totalComments: await Comment.count(),
    weeklyComments: await Comment.count({ 
      where: { 
        CreatedAt: { [Op.gte]: oneWeekAgo } 
      } 
    })
  };
}

// Функция для получения статистики
async function getAdminStats() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  return {
    totalNews: await News.count(),
    totalUsers: await User.count(),
    weeklyNews: await News.count({ where: { Date: { [Op.gte]: oneWeekAgo } }}),
    weeklyUsers: await User.count({ where: { createdAt: { [Op.gte]: oneWeekAgo } }}),
    totalComments: await Comment.count(),
    weeklyComments: await Comment.count({ where: { CreatedAt: { [Op.gte]: oneWeekAgo } }})
  };
}

router.get('/:id', async (req, res) => {
  try {
    const news = await SuggestedNews.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'Author',
          attributes: ['User_id', 'Name']
        },
        {
          model: City,
          attributes: ['CityID', 'CityName']
        }
      ]
    });
    
    if (!news) {
      return res.status(404).json({ error: 'Новость не найдена' });
    }
    
    res.json({
      id: news.NewsID,
      title: news.Title,
      description: news.FullDescription,
      cityId: news.CityID,
      cityName: news.City?.CityName,
      authorName: news.Author?.Name,
      status: news.Status,
      date: news.Date,
      imageUrl: news.ImageUrl
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновление предложенной новости
router.put('/:id', upload.single('img'), async (req, res) => {
  try {
    if (!req.session.User || (req.session.User.roleId !== 1 && req.session.User.roleId !== 2)) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }
    
    const news = await SuggestedNews.findByPk(req.params.id);
    if (!news) {
      return res.status(404).json({ error: 'Новость не найдена' });
    }
    
    // Обновляем поля
    news.Title = req.body.title;
    news.FullDescription = req.body.description;
    news.CityID = req.body.cityId;
    news.Status = req.body.status;
    
    if (req.body.date) {
      news.Date = new Date(req.body.date);
    }
    
    // Обновляем изображение, если загружено новое
    if (req.file) {
      // Удаляем старое изображение, если оно есть
      if (news.ImageUrl) {
        const oldImagePath = path.join(__dirname, '..', 'public', news.ImageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      // Сохраняем новое изображение
      const ext = path.extname(req.file.originalname);
      const newFileName = `news_${Date.now()}${ext}`;
      const newPath = path.join(__dirname, '..', 'public', 'uploads', newFileName);
      
      fs.renameSync(req.file.path, newPath);
      news.ImageUrl = `/uploads/${newFileName}`;
    }
    
    await news.save();
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/current', async (req, res) => {
    try {
        // Проверяем, авторизован ли пользователь
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Не авторизован' });
        }

        // Ищем пользователя в БД
        const user = await User.findByPk(req.session.userId, {
            attributes: ['User_id', 'Name', 'Email', 'RoleID'] // Не возвращаем пароль!
        });

        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        res.json(user);
    } catch (error) {
        console.error('Ошибка при получении пользователя:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


app.use(express.static('public')); // Или ваша папка со статикой
app.use('/styles', express.static('styles')); // Явно разрешаем доступ к стилям

app.use('/api/suggested-news', suggestedNewsRoutes);
module.exports = router;

