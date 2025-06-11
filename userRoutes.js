// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Импортируем модель User

// Получение данных о пользователе по ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findOne({ where: { id: req.params.id } });
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User  not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Создание нового пользователя
router.post('/', async (req, res) => {
    const { name, email, password } = req.body; // Предполагаем, что данные приходят в теле запроса

    try {
        const newUser  = await User.create({ name, email, password });
        res.status(201).json(newUser );
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Обновление данных о пользователе
router.put('/:id', async (req, res) => {
    const { name, email } = req.body;

    try {
        const user = await User.findOne({ where: { id: req.params.id } });
        if (user) {
            user.name = name || user.name;
            user.email = email || user.email;
            await user.save();
            res.json(user);
        } else {
            res.status(404).json({ message: 'User  not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Удаление пользователя
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findOne({ where: { id: req.params.id } });
        if (user) {
            await user.destroy();
            res.status(204).send(); // Успешное удаление, без содержимого
        } else {
            res.status(404).json({ message: 'User  not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Экспортируем маршруты
module.exports = router;
