const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { User, News, City } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Настройка Multer для загрузки изображений
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../public/uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Images only!');
    }
  }
});

// ==================== Пользователи ====================

// Получить всех пользователей
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'roleId', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении пользователей' });
  }
});

// Создать нового пользователя
router.post('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, email, password, roleId } = req.body;
    
    // Валидация
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
    }
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }
    
    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      roleId: roleId || 3 // По умолчанию обычный пользователь
    });
    
    res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      roleId: newUser.roleId
    });
  } catch (error) {
    console.error('Ошибка при создании пользователя:', error);
    res.status(500).json({ error: 'Ошибка сервера при создании пользователя' });
  }
});

// Изменить пользователя
router.put('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, roleId } = req.body;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    // Обновляем только те поля, которые пришли в запросе
    if (name) user.name = name;
    if (email) user.email = email;
    if (roleId) user.roleId = roleId;
    
    await user.save();
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      roleId: user.roleId
    });
  } catch (error) {
    console.error('Ошибка при обновлении пользователя:', error);
    res.status(500).json({ error: 'Ошибка сервера при обновлении пользователя' });
  }
});

// Удалить пользователя
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    // Нельзя удалить самого себя
    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'Вы не можете удалить себя' });
    }
    
    await user.destroy();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка при удалении пользователя:', error);
    res.status(500).json({ error: 'Ошибка сервера при удалении пользователя' });
  }
});

// ==================== Новости ====================

// Получить все новости
router.get('/news', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const news = await News.findAll({
      include: [
        { model: User, as: 'Author', attributes: ['id', 'name', 'email'] },
        { model: City, attributes: ['id', 'name'] }
      ],
      order: [['date', 'DESC']]
    });
    
    res.json(news);
  } catch (error) {
    console.error('Ошибка при получении новостей:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении новостей' });
  }
});

// Создать новость
router.post('/news', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, shortDescription, fullDescription, cityId, date } = req.body;
    const authorId = req.user.id;
    
    if (!title || !shortDescription || !fullDescription) {
      return res.status(400).json({ error: 'Заголовок и описание обязательны' });
    }
    
    const news = await News.create({
      title,
      shortDescription,
      fullDescription,
      cityId: cityId || null,
      authorId,
      date: date || new Date(),
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null
    });
    
    res.status(201).json(news);
  } catch (error) {
    console.error('Ошибка при создании новости:', error);
    res.status(500).json({ error: 'Ошибка сервера при создании новости' });
  }
});

// Обновить новость
router.put('/news/:id', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, shortDescription, fullDescription, cityId, date } = req.body;
    
    const news = await News.findByPk(id);
    if (!news) {
      return res.status(404).json({ error: 'Новость не найдена' });
    }
    
    // Обновляем поля
    news.title = title || news.title;
    news.shortDescription = shortDescription || news.shortDescription;
    news.fullDescription = fullDescription || news.fullDescription;
    news.cityId = cityId || news.cityId;
    news.date = date || news.date;
    
    // Если загружено новое изображение
    if (req.file) {
      // Удаляем старое изображение, если оно есть
      if (news.imageUrl) {
        const oldImagePath = path.join(__dirname, '../public', news.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      news.imageUrl = `/uploads/${req.file.filename}`;
    }
    
    await news.save();
    
    res.json(news);
  } catch (error) {
    console.error('Ошибка при обновлении новости:', error);
    res.status(500).json({ error: 'Ошибка сервера при обновлении новости' });
  }
});

// Удалить новость
router.delete('/news/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const news = await News.findByPk(id);
    if (!news) {
      return res.status(404).json({ error: 'Новость не найдена' });
    }
    
    // Удаляем связанное изображение
    if (news.imageUrl) {
      const imagePath = path.join(__dirname, '../public', news.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await news.destroy();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка при удалении новости:', error);
    res.status(500).json({ error: 'Ошибка сервера при удалении новости' });
  }
});

module.exports = router;