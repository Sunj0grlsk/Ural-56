// routes/cities.js
const express = require('express');
const router = express.Router();
const { City } = require('../models/associations');

// Получение списка всех городов
router.get('/', async (req, res) => {
    try {
        const cities = await City.findAll({
            attributes: ['CityID', 'CityName'],
            order: [['CityName', 'ASC']]
        });
        res.json(cities);
    } catch (error) {
        console.error('Error fetching cities:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;