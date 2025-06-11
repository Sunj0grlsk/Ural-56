const express = require('express');
const router = express.Router();
const { Category } = require('../models/associations');

router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['CategoryName', 'ASC']]
    });
    res.json(categories);
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
