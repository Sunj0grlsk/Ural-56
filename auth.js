// auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const path = require('path');
const { User, Role } = require('../models/associations');

router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).send('Пожалуйста, заполните все поля');
    }

    try {
        const existingEmail = await User.findOne({ where: { Email: email } });

        if (existingEmail) {
            return res.status(400).send('Пользователь с таким Email уже существует.');
        }

        const role = await Role.findOne({ where: { RoleName: 'user' } });
        if (!role) {
            return res.status(400).send('Роль пользователя не найдена.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            Name: name,
            Email: email,
            Password: hashedPassword,
            RoleID: role.RoleID
        });

        // Используем role.RoleName, а не User.Role.RoleName
        req.session.User = {
            id: User.User_id,
            role: User.Role ? User.Role.RoleID : null, // Используем RoleID вместо RoleName
        };
        req.session.save((err) => {
            if (err) {
                console.error('Ошибка при сохранении сессии:', err);
                return res.status(500).send('Ошибка при сохранении сессии');
            }
            res.redirect('/lk.html');
        });

    } catch (error) {
        console.error('Ошибка при регистрации пользователя:', error);
        res.status(500).send('Ошибка при регистрации пользователя.');
    }
});


router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({
            where: { Email: email },
            include: [{ model: Role, attributes: ['RoleName'] }],
            raw: false,
        });

        if (!user) {
            return res.status(400).send('Неверный E-mail или пароль.');
        }

        const passwordMatch = await bcrypt.compare(password, user.Password);

        if (!passwordMatch) {
            return res.status(400).send('Неверный E-mail или пароль.');
        }

        req.session.User = {
            id: user.User_id,
            role: user.Role ? user.Role.RoleName.trim() : null,
        };

        req.session.save((err) => {
            if (err) {
                console.error('Ошибка при сохранении сессии:', err);
                return res.status(500).send('Ошибка при сохранении сессии');
            }
            res.redirect('/lk.html');
        });

    } catch (error) {
        console.error('Ошибка при входе пользователя:', error);
        res.status(500).send('Ошибка при входе пользователя.');
    }
});


router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Ошибка при выходе:', err);
            return res.status(500).send('Ошибка при выходе.');
        }
        res.redirect('/');
    });
});

function checkAuth(req, res, next) {
    if (req.session.User) {
        return next();
    }
    res.status(401).json({ message: 'Необходима авторизация' });
}

module.exports = { checkAuth };

router.get('/current', async (req, res) => {
    try {
        // Проверяем, авторизован ли пользователь
        if (!req.session.User || !req.session.User.id) {
            return res.status(401).json({ error: 'Не авторизован' });
        }

        // Ищем пользователя в БД
        const user = await User.findByPk(req.session.User.id, {
            attributes: ['User_id', 'Name', 'Email'],
            include: [{
                model: Role,
                attributes: ['RoleName']
            }]
        });

        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        // Формируем ответ
        res.json({
            User_id: user.User_id,
            Name: user.Name,
            Email: user.Email,
            Role: user.Role ? user.Role.RoleName : null
        });
    } catch (error) {
        console.error('Ошибка при получении пользователя:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;