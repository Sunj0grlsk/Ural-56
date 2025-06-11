document.addEventListener('DOMContentLoaded', function () {
    // Координаты городов Оренбургской области
    const cityCoordinates = {
        'Оренбург': [51.768199, 55.096955],
        'Орск': [51.229306, 58.475185],
        'Новотроицк': [51.203012, 58.326653],
        'Бугуруслан': [53.655785, 52.442287],
        'Бузулук': [52.788597, 52.262631],
        'Гай': [51.4666, 58.4546],
        'Медногорск': [51.4039, 57.5833],
        'Сорочинск': [52.4333, 53.1500],
        'Кувандык': [51.4833, 57.3500]
    };

    // Инициализация карты
    ymaps.ready(initMap);

    function initMap() {
        const map = new ymaps.Map('news-map', {
            center: [51.768199, 55.096955], // Центр на Оренбург
            zoom: 7
        });

        // Создаем коллекцию для меток новостей
        const newsCollection = new ymaps.GeoObjectCollection(null, {
            preset: 'islands#redIcon'
        });

        // Создаем коллекцию для меток городов
        const cityCollection = new ymaps.GeoObjectCollection(null, {
            preset: 'islands#blueIcon'
        });

        // Добавляем коллекции на карту
        map.geoObjects.add(newsCollection);
        map.geoObjects.add(cityCollection);

        // Загрузка новостей
        loadNews(map, newsCollection, cityCollection);

        // Инициализация фильтров
        initFilters(map, newsCollection, cityCollection);
    }

    // Загрузка новостей
    async function loadNews(map, newsCollection, cityCollection, city = 'all') {
    try {
        const url = city === 'all' ? '/news' : `/news?city=${city}`;
        const response = await fetch(url);

        if (!response.ok) throw new Error('Ошибка загрузки новостей');

        const news = await response.json();
        displayNews(news, city); // Передаем выбранный город в displayNews
        placeMarkers(news, map, newsCollection, cityCollection, city);
    } catch (error) {
        console.error('Ошибка:', error);
        document.getElementById('news-list-container').innerHTML =
            '<div class="no-news">Ошибка загрузки новостей</div>';
    }
}

    // Отображение новостей в сайдбаре
    function displayNews(news, filterCity = 'all') {
    const container = document.getElementById('news-list-container');

    if (!news || news.length === 0) {
        container.innerHTML = '<div class="no-news">Новостей нет</div>';
        return;
    }

    // Фильтруем новости по городу
    const filteredNews = filterCity === 'all' 
        ? news 
        : news.filter(item => {
            const itemCity = item.city || item.City?.CityName || '';
            return itemCity.toLowerCase() === filterCity.toLowerCase();
        });

    if (filteredNews.length === 0) {
        container.innerHTML = `<div class="no-news">Новостей для города ${filterCity} нет</div>`;
        return;
    }

    container.innerHTML = filteredNews.map(item => {
        const cityName = item.city || item.City?.CityName || 'Не указан';
        const newsDate = item.date || item.Date;
        const newsId = item.id || item.NewsID;
        const title = item.title || item.Title;
        const preview = item.preview || item.ShortDescription || '';
        
        return `
            <div class="news-item-map" data-id="${newsId}" data-city="${cityName}">
                <h4>${title}</h4>
                <div class="news-meta">
                    <span class="news-date">${new Date(newsDate).toLocaleDateString('ru-RU')}</span>
                    <span class="news-city">${cityName}</span>
                </div>
                <p class="news-preview">${preview}</p>
            </div>
        `;
    }).join('');

    // Добавляем обработчики клика на новости
    document.querySelectorAll('.news-item-map').forEach(item => {
        item.addEventListener('click', () => {
            const newsId = item.dataset.id;
            window.location.href = `/news/${newsId}.html`;
        });
    });
}

    // Размещение маркеров на карте
    function placeMarkers(news, map, newsCollection, cityCollection, filterCity = 'all') {
        // Очищаем коллекции
        newsCollection.removeAll();
        cityCollection.removeAll();

        // Считаем количество новостей по городам
        const cityCounts = {};
        news.forEach(item => {
            if (cityCoordinates[item.City?.CityName]) {
                cityCounts[item.City?.CityName] = (cityCounts[item.City?.CityName] || 0) + 1;
            }
        });

        // Добавляем метки городов с количеством новостей
        Object.entries(cityCounts).forEach(([city, count]) => {
            const coordinates = cityCoordinates[city];
            if (coordinates) {
                const placemark = new ymaps.Placemark(coordinates, {
                    hintContent: `${city}: ${count} новостей`,
                    balloonContent: `<b>${city}</b><br>Новостей: ${count}`
                }, {
                    preset: 'islands#blueStretchyIcon',
                    iconCaption: count.toString()
                });

                placemark.events.add('click', () => {
                    filterNewsByCity(city, map, newsCollection, cityCollection);
                });

                cityCollection.add(placemark);
            }
        });

        // Добавляем метки отдельных новостей
        news.forEach(item => {
            // Пропускаем если фильтр по городу активен и новость не из этого города
            const itemCityName = item.city || item.City?.CityName;
if (filterCity !== 'all' && (!itemCityName || itemCityName.toLowerCase() !== filterCity.toLowerCase())) return;

            if (cityCoordinates[item.city]) {
                const placemark = new ymaps.Placemark([item.City?.Latitude, item.City?.Longitude], {
                    hintContent: item.title,
                    balloonContent: `
                        <b>${item.title}</b><br>
                        <small>${item.city}, ${new Date(item.date).toLocaleDateString('ru-RU')}</small><br>
                        ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.title}" style="max-width: 200px; margin: 5px 0;">` : ''}
                        <p>${item.preview}</p>
                        <a href="/news/${item.id}.html" class="read-more">Читать полностью</a>
                    `
                }, {
                    preset: 'islands#redIcon'
                });

                newsCollection.add(placemark);
            }
        });
    }

    // Фильтрация новостей по городу
function filterNewsByCity(city, map, newsCollection, cityCollection) {
    // Обновляем активную кнопку фильтра
    document.querySelectorAll('#city-filter .filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.city === city);
    });

    // Загружаем новости для этого города
    loadNews(map, newsCollection, cityCollection, city === 'all' ? 'all' : city);

    // Если выбран конкретный город, центрируем карту на нем
    if (city !== 'all' && cityCoordinates[city]) {
        map.setCenter(cityCoordinates[city], 11);
    }
}

    // Инициализация фильтров
    function initFilters(map, newsCollection, cityCollection) {
        document.querySelectorAll('#city-filter .filter-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const city = this.dataset.city;
                filterNewsByCity(city, map, newsCollection, cityCollection);
            });
        });
    }
});