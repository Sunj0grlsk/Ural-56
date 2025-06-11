
function updateDateTime() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
    };
    document.getElementById('datetime').textContent = now.toLocaleString('ru-RU', options);
}

// Обновляем дату и время каждую секунду
setInterval(updateDateTime, 1000);

// Инициализация при загрузке страницы
updateDateTime();

async function fetchExchangeRates() {
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD'); // Ссылка на API
        const data = await response.json();
        
        // Обновляем значения на странице
        document.getElementById('usd-rate').textContent = '' + data.rates.RUB + '';
        document.getElementById('eur-rate').textContent = '' + (data.rates.RUB / data.rates.EUR).toFixed(2) + '';
    } catch (error) {
        console.error('Ошибка при получении данных о курсе валют:', error);
        document.getElementById('exchange-rates').textContent = 'Ошибка при загрузке курсов валют';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const myBtn = document.getElementById('myBtn');

    myBtn.addEventListener('click', async function() {
        // Отправляем GET-запрос на сервер, чтобы проверить, авторизован ли пользователь
        const response = await fetch('/profile/data', {
            method: 'GET',
            credentials: 'include' // Включаем куки для сессии
        });

        if (response.ok) {
            // Если пользователь авторизован, перенаправляем его на личный кабинет
            window.location.href = '/lk.html';
        } else {
            // Если пользователь не авторизован, открываем модальное окно для входа
            document.getElementById('myModal').style.display = 'block';
        }
    });

    // Обработчики событий для закрытия модальных окон
    const closeModal = document.querySelector('.close');
    if (closeModal) {
        closeModal.onclick = function() {
            document.getElementById('myModal').style.display = 'none';
        };
    }

    const closeRegModal = document.querySelector('.close-reg');
    if (closeRegModal) {
        closeRegModal.onclick = function() {
            document.getElementById('regModal').style.display = 'none';
        };
    }

    // Обработчик для кнопки "Назад к авторизации"
    const backToLoginButton = document.getElementById('backToLoginButton');
    if (backToLoginButton) {
        backToLoginButton.onclick = function() {
            document.getElementById('regModal').style.display = 'none';
            document.getElementById('myModal').style.display = 'block';
        };
    }
});


fetchExchangeRates();

const apiKey = 'c737d5cfcbb580c95b2203f280b7183b'; // Замените на реальный ключ!

// Функция для получения погоды
async function getWeather(city = 'Оренбург') {
    try {
        // Запрос к API (units=metric для температуры в °C)
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=ru`
        );

        if (!response.ok) {
            throw new Error('Ошибка загрузки погоды');
        }

        const data = await response.json();

        // Обновляем данные на странице
       
        document.getElementById('temperature').textContent = Math.round(data.main.temp);
        document.getElementById('feels-like').textContent = Math.round(data.main.feels_like);
        


    } catch (error) {
        console.error('Ошибка:', error);
        document.getElementById('city-name').textContent = 'Ошибка загрузки';
    }
}

// Запускаем при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    getWeather();
});


const buttons = document.querySelectorAll('.city');


buttons.forEach(button => {
    button.addEventListener('click', () => {
        button.classList.toggle('active');
    });
})

const links = document.querySelectorAll('.go');

links.forEach(link => {
    link.addEventListener('click', (e) => {
        // Предотвращаем переход по ссылке (если это необходимо)
        // Переключаем класс 'active' для текущей ссылки
        link.classList.toggle('actives');
    });
});

var loginModal = document.getElementById('myModal');
var regModal = document.getElementById('regModal');
var loginButton = document.getElementById("myBtn");
var closeButton = document.getElementsByClassName("close")[0];
var closeRegButton = document.getElementsByClassName("close-reg")[0];
var regButton = document.getElementById("reg");
var backToLoginButton = document.getElementById("backToLoginButton");

loginButton.onclick = function() {
    loginModal.style.display = "block";
}

closeButton.onclick = function() {
    loginModal.style.display = "none";
}

closeRegButton.onclick = function() {
    regModal.style.display = "none";
}

regButton.onclick = function() {
    loginModal.style.display = "none";  // Скрыть модальное окно авторизации
    regModal.style.display = "block";    // Показать модальное окно регистрации
}

// Обработчик для кнопки "Назад к авторизации"
backToLoginButton.onclick = function() {
    regModal.style.display = "none";     // Скрыть модальное окно регистрации
    loginModal.style.display = "block";  // Показать модальное окно авторизации
}

window.onclick = function(event) {
    if (event.target == loginModal) {
        loginModal.style.display = "none";
    }
    if (event.target == regModal) {
        regModal.style.display = "none";
    }
}


fetchNews();
// Функция для получения новостей
async function fetchNews() {
    try {
        const response = await fetch('/news');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const news = await response.json();
        const newsListDiv = document.getElementById('news-list');
        newsListDiv.innerHTML = ''; // Очищаем контейнер

        news.forEach(newsItem => {
            const newsDiv = document.createElement('div');
            newsDiv.classList.add('news-item'); // Добавьте соответствующий класс из вашего CSS

            // Заголовок
            const title = document.createElement('h2');
            title.textContent = newsItem.Title;
            newsDiv.appendChild(title);

            // Краткое описание
            

            // Дата
            const date = new Date(newsItem.Date);
            const dateElement = document.createElement('p');
            dateElement.textContent = date.toLocaleDateString('ru-RU');
            newsDiv.appendChild(dateElement);

            // Изображение (если есть)
            if (newsItem.ImageUrl) {
                const img = document.createElement('img');
                img.src = newsItem.ImageUrl;
                img.alt = newsItem.Title;
                img.classList.add('news-image');
                newsDiv.appendChild(img);
            }

            newsListDiv.appendChild(newsDiv);
        });
    } catch (error) {
        console.error("Ошибка загрузки новостей:", error);
        const newsListDiv = document.getElementById('news-list');
        newsListDiv.textContent = "Ошибка загрузки новостей";
    }
}



document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Получаем элементы DOM
        const newsList = document.getElementById('news-list');
        const cityButtons = document.querySelectorAll('.city');
        
        // Функция загрузки и отображения новостей
        async function loadNews(cityId = null) {
            try {
                // Формируем URL с учетом фильтра
                let url = '/news';
                if (cityId) {
                    url += `?cityId=${cityId}`;
                }
                
                const response = await fetch(url);
                if (!response.ok) throw new Error('Ошибка загрузки новостей');
                
                const news = await response.json();
                
                // Отрисовываем новости в текущем формате
                newsList.innerHTML = news.map(item => `
                    <div class="news-item">
                        <a href="/news/${item.NewsID}.html">
                            ${item.ImageUrl ? 
                                `<img src="${item.ImageUrl}" alt="${item.Title}" class="news-image">` : 
                                ''
                            }
                            <h2>${item.Title}</h2>
                            <span>${new Date(item.Date).toLocaleDateString('ru-RU')}</span>
                        </a>
                    </div>
                `).join('');
            } catch (error) {
                console.error('Ошибка:', error);
                newsList.innerHTML = '<p>Ошибка загрузки новостей</p>';
            }
        }
        
        // Добавляем обработчики для кнопок фильтра
        cityButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Удаляем класс active у всех кнопок
                cityButtons.forEach(btn => btn.classList.remove('active'));
                // Добавляем класс active текущей кнопке
                button.classList.add('active');
                
                // Получаем cityId из data-атрибута
                const cityId = button.getAttribute('data-city-id');
                // Загружаем новости с учетом фильтра
                loadNews(cityId);
            });
        });
        
        // Первоначальная загрузка всех новостей
        await loadNews();
        
        
    } catch (error) {
        console.error('Ошибка:', error);
        document.getElementById('news-list').innerHTML = '<p>Ошибка загрузки новостей</p>';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchForm = document.getElementById('searchForm'); // Добавили определение формы
    const searchResults = document.getElementById('searchResults');
    let debounceTimer;

    // Проверка и создание контейнера для результатов, если его нет
    if (!searchResults) {
        const resultsDiv = document.createElement('div');
        resultsDiv.id = 'searchResults';
        resultsDiv.className = 'search-results';
        searchInput.parentNode.appendChild(resultsDiv);
        searchResults = resultsDiv; // Обновляем ссылку
    }

    searchInput.addEventListener('input', async function() {
        const searchQuery = searchInput.value.trim();
        
        clearTimeout(debounceTimer);
        
        if (searchQuery.length < 2) {
            searchResults.innerHTML = '';
            searchResults.classList.remove('active');
            return;
        }
        
        debounceTimer = setTimeout(async () => {
            try {
                const response = await fetch(`/search?query=${encodeURIComponent(searchQuery)}`);
                if (!response.ok) throw new Error('Ошибка при поиске');
                
                const results = await response.json();
                
                // Проверка на пустой результат
                if (!results || !Array.isArray(results)) {
                    throw new Error('Некорректный формат ответа');
                }
                
                displaySearchResults(results);
            } catch (error) {
                console.error('Ошибка:', error);
                searchResults.innerHTML = '<div class="search-result-item">Ошибка при поиске</div>';
                searchResults.classList.add('active');
            }
        }, 300);
    });

    function displaySearchResults(results) {
        searchResults.innerHTML = '';
        
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-result-item">Ничего не найдено</div>';
            searchResults.classList.add('active');
            return;
        }
        
        results.forEach(item => {
            const resultItem = document.createElement('div');
            resultItem.classList.add('search-result-item');
            resultItem.innerHTML = `
                <h3>${item.Title}</h3>
                <p>${new Date(item.Date).toLocaleDateString('ru-RU')}</p>
            `;
            
            resultItem.addEventListener('click', () => {
                window.location.href = `/news/${item.NewsID}.html`;
            });
            
            searchResults.appendChild(resultItem);
        });
        
        searchResults.classList.add('active');
    }

    // Закрываем результаты поиска при клике вне области
    document.addEventListener('click', (e) => {
        if (!searchForm.contains(e.target)) {
            searchResults.classList.remove('active');
        }
    });
});

// Внутри newsHtml, в секции <script>:
const currentId = document.getElementById('related-news').dataset.currentId;
async function loadRelatedNews() {
    try {
        const currentId = document.getElementById('related-news').dataset.newsId;
        console.log('Загрузка похожих новостей для ID:', currentId);
        
        const response = await fetch('/news/related/' + currentId);
        if (!response.ok) {
            throw new Error('Ошибка загрузки: ' + response.status);
        }
        
        const relatedNews = await response.json();
        const container = document.getElementById('related-news');
        
        if (!Array.isArray(relatedNews)) {
            throw new Error('Некорректный формат данных');
        }

        if (relatedNews.length > 0) {
            container.innerHTML = relatedNews.map(item => `
                <div class="related-news-item">
                    <a href="/news/${item.NewsID}.html">
                        ${item.ImageUrl ? `<img src="${item.ImageUrl}" alt="${item.Title}" class="relared-pic">` : ''}
                        <div class="related-txt">
                        <h3 class="related-h3">${item.Title}</h3>
                        <span class="related-span">${new Date(item.Date).toLocaleDateString('ru-RU')}</span>
                        </div>
                    </a>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p>Другие новости не найдены</p>';
        }
    } catch (error) {
        console.error('Ошибка загрузки похожих новостей:', error);
        document.getElementById('related-news').innerHTML = `
            <p>Ошибка загрузки похожих новостей</p>
            <button onclick="loadRelatedNews()">Повторить попытку</button>
        `;
    }
}

async function loadComments() {
    try {
        // Более надежное извлечение newsId из URL
        const pathParts = window.location.pathname.split('/');
        const newsId = pathParts[pathParts.length - 1].replace('.html', '');
        
        if (!newsId) {
            console.error('Не удалось извлечь ID новости из URL');
            return;
        }

        const response = await fetch(`/comments/news/${newsId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const comments = await response.json();
        
        // Проверка, что comments является массивом
        if (!Array.isArray(comments)) {
            throw new Error('Полученные данные не являются массивом комментариев');
        }
        
        const commentsList = document.getElementById('comments-list');
        
        if (!commentsList) {
            console.error('Элемент comments-list не найден на странице');
            return;
        }
        
        commentsList.innerHTML = comments.map(comment => `
            <div class="comment" data-comment-id="${comment.CommentID}">
                <div class="comment-header">
                    <span class="comment-author">${comment.User.Name || 'Аноним'}</span>
                    <span class="comment-date">${new Date(comment.CreatedAt).toLocaleString('ru-RU')}</span>
                </div>
                <div class="comment-text">${comment.CommentText}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Ошибка загрузки комментариев:', error);
        // Можно добавить отображение ошибки для пользователя
        const commentsList = document.getElementById('comments-list');
        if (commentsList) {
            commentsList.innerHTML = '<div class="error">Не удалось загрузить комментарии</div>';
        }
    }
}

// Не забудьте вызвать функцию
document.addEventListener('DOMContentLoaded', loadComments);

// Проверка авторизации и отображение формы
async function checkAuthAndSetupForm() {
    try {
        const response = await fetch('/profile/data');
        if (response.ok) {
            document.getElementById('comment-form-container').style.display = 'block';
            document.getElementById('login-to-comment').style.display = 'none';
        } else {
            document.getElementById('comment-form-container').style.display = 'none';
            document.getElementById('login-to-comment').style.display = 'block';
        }
    } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
    }
}

// Обработчик отправки формы
document.getElementById('comment-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const commentText = document.getElementById('comment-text').value.trim();
    if (!commentText) return;
    
    try {
        const newsId = window.location.pathname.split('/')[2].replace('.html', '');
        const response = await fetch('/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                NewsID: newsId,
                CommentText: commentText
            })
        });
        
        if (response.ok) {
            document.getElementById('comment-text').value = '';
            loadComments(); // Перезагружаем комментарии
        }
    } catch (error) {
        console.error('Ошибка отправки комментария:', error);
    }
});

// Обработчик ссылки "войдите"
document.getElementById('login-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('myModal').style.display = 'block';
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadComments();
    checkAuthAndSetupForm();
});
async function syncModel() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        
        // Синхронизация всех моделей
        await sequelize.sync({ alter: true });
        console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error;
    }
}


// Вызываем при загрузке страницы
document.addEventListener('DOMContentLoaded', loadRelatedNews);

