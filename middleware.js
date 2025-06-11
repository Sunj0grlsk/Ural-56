// middleware.js

function isEditorOrAdmin(req, res, next) {
  // Предположим, что информация о пользователе хранится в req.user
  // Это может быть результатом аутентификации, например, через Passport.js или JWT

  if (req.user && (req.user.role === 'editor' || req.user.role === 'admin')) {
    return next(); // Если роль соответствует, продолжаем выполнение следующего middleware
  }

  return res.status(403).json({ error: 'Нет доступа' }); // Если нет, возвращаем ошибку
}

module.exports = { isEditorOrAdmin }; // Экспортируем функцию
function isAuthenticated(req, res, next) {
  // Например, всегда разрешаем
  next();
}

module.exports = { isAuthenticated };
