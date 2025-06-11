
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


document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1. Получаем новости с сервера
        const response = await fetch('/news');
        if (!response.ok) throw new Error('Ошибка загрузки новостей');
        
        const allNews = await response.json();
        
        // 2. Фильтруем по CategoryID (предположим, что ID спорта = 1)
        const socityCategoryId = 4; // Замените на реальный ID категории "Спорт"
        const socityNews = allNews.filter(newsItem => 
            newsItem.CategoryID === socityCategoryId
        );
        
        console.log('Найдено спортивных новостей:', socityNews.length, socityNews);
        
        // 3. Отображаем отфильтрованные новости
        displaySportNews(socityNews);
        
    } catch (error) {
        console.error('Ошибка:', error);
        document.getElementById('news-list').innerHTML = `
            <div class="error-message">
                Ошибка загрузки: ${error.message}
                <p>Попробуйте обновить страницу</p>
            </div>
        `;
    }
});

function displaySportNews(news) {
    const newsList = document.getElementById('news-list');
    
    if (!newsList) {
        console.error('Элемент news-list не найден!');
        return;
    }
    
    if (!news || news.length === 0) {
        newsList.innerHTML = `
            <div class="no-news">
                Спортивных новостей нет. Проверьте позже.
            </div>
        `;
        return;
    }
    
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
}