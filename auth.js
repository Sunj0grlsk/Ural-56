function checkAuth(req, res, next) {
    // Проверяем наличие пользователя в сессии
    if (!req.session.User) {
        console.log('Unauthorized: No user in session');
        return res.status(401).json({ message: 'Необходима авторизация' });
    }
    
    // Добавляем пользователя в объект запроса
    req.user = req.session.User; // Обратите внимание на заглавную "U" в User
    next();
}

function checkAdmin(req, res, next) {
    // Сначала проверяем авторизацию
    if (!req.session.User) {
        return res.status(401).json({ message: 'Необходима авторизация' });
    }
    
    // Затем проверяем роль
    if (req.session.User.role !== 1) {
        console.log(`Forbidden: User role is ${req.session.User.role}`);
        return res.status(403).json({ message: 'Доступ запрещен' });
    }
    
    req.user = req.session.User;
    next();
}

module.exports = { checkAuth, checkAdmin };