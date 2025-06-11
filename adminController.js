// controllers/adminController.js

// Получение статистики
exports.getStats = async (req, res) => {
    try {
        const [totalUsers, totalNews, weeklyNews] = await Promise.all([
            User.count(),
            News.count(),
            News.count({
                where: {
                    createdAt: {
                        [Op.gte]: new Date(new Date() - 7 * 24 * 60 * 60 * 1000)
                    }
                }
            })
        ]);

        res.json({ totalUsers, totalNews, weeklyNews });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ 
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

// Получение списка новостей
exports.getNews = async (req, res) => {
    try {
        const news = await News.findAll({
            attributes: ['id', 'title', 'author', 'createdAt'],
            order: [['createdAt', 'DESC']],
            limit: 100
        });
        res.json(news);
    } catch (error) {
        console.error('News list error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};