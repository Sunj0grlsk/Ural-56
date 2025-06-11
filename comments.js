const express = require('express');
const router = express.Router();
// const { Comment } = require('../models/comment');
const Comment = require('../models/comment');
const User = require('../models/user')
// const { User } = require('../models/user');
const { checkAuth } = require('../middleware/auth');

// Получение комментариев для новости
router.get('/news/:newsId', async (req, res) => {
    try {
        const comments = await Comment.findAll({
            where: { NewsID: req.params.newsId, IsApproved: true },
            include: [{
                model: User,
                attributes: ['Name', 'User_id']
            }],
            order: [['CreatedAt', 'DESC']]
        });
        
        res.json(comments);
    } catch (error) {
        console.error('Ошибка при получении комментариев:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Добавление комментария (только для авторизованных пользователей)
router.post('/', checkAuth, async (req, res) => {
    if (!req.session.User) {
        return res.status(401).json({ message: 'Необходима авторизация' });
    }

    try {
        const { NewsID, CommentText } = req.body;

        if (!NewsID || !CommentText) {
            return res.status(400).json({ message: 'NewsID и CommentText обязательны' });
        }
        
        const newComment = await Comment.create({
            NewsID: NewsID,
            UserID: req.session.User.id, // Используем UserID вместо User_id
            CommentText: CommentText,
            IsApproved: true
        });

        // Получаем данные пользователя для ответа
        const user = await User.findByPk(req.session.User.id, {
            attributes: ['Name', 'User_id']
        });

        res.status(201).json({
            ...newComment.get({ plain: true }),
            User: user // Возвращаем пользователя с фронтендом ожидаемым именем
        });
    } catch (error) {
        console.error('Ошибка при добавлении комментария:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Удаление комментария (только для админов или автора)
router.delete('/:id', checkAuth, async (req, res) => {
    try {
        const comment = await Comment.findByPk(req.params.id);
        
        if (!comment) {
            return res.status(404).json({ message: 'Комментарий не найден' });
        }

        // Проверка прав (админ или автор комментария)
        if (req.session.User.role !== 1 && comment.User_id !== req.session.User.id) {
            return res.status(403).json({ message: 'Нет прав для удаления' });
        }

        await comment.destroy();
        res.json({ message: 'Комментарий удален' });
    } catch (error) {
        console.error('Ошибка при удалении комментария:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

module.exports = router;