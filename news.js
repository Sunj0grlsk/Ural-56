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
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
            mode: 'no-cors',
        }); // Ссылка на API
        const data = await response.json();
        
        // Обновляем значения на странице
        document.getElementById('usd-rate').textContent = '' + data.rates.RUB + '';
        document.getElementById('eur-rate').textContent = '' + (data.rates.RUB / data.rates.EUR).toFixed(2) + '';
    } catch (error) {
        console.error('Ошибка при получении данных о курсе валют:', error);
        document.getElementById('exchange-rates').textContent = 'Ошибка при загрузке курсов валют';
    }
}

// Запуск функции получения курсов
fetchExchangeRates();

const apiKey = 'demo_yandex_weather_api_key_ca6d09349ba0'; // Ваш API-ключ
const city = 'Москва'; // Замените на нужный город

async function fetchWeather() {
    try {
        const response = await fetch(`https://api.yandex.com/weather?city=${city}&apikey=${apiKey}`,{
            mode: 'no-cors',
        });
        const data = await response.json();

        const dayTemp = data.now.c; // Температура
        const eveningTemp = dayTemp - 5; // Примерная температура вечером (можно изменить логику)

        document.getElementById('day-temp').textContent = dayTemp.toFixed(1);
        document.getElementById('evening-temp').textContent = eveningTemp.toFixed(1);

        const iconUrl = data.now.icon; // Код иконки
        const weatherIcon = document.getElementById('weather-icon');
        weatherIcon.src = iconUrl;
        weatherIcon.style.display = 'block';
        document.body.style.backgroundImage = `url(${iconUrl})`; // Установка фона
    } catch (error) {
        console.error('Ошибка при получении данных о погоде:', error);
        document.getElementById('weather').textContent = 'Ошибка при загрузке погоды';
    }
}

fetchWeather();

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



// Функция для отображения нового комментария на странице
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

// Функция для отображения новостей
async function fetchAndDisplayNews() {
    try {
      const response = await fetch('/news');
      if (!response.ok) throw new Error('Ошибка загрузки новостей');
      
      const news = await response.json();
      const newsList = document.getElementById('news-list');
      
      newsList.innerHTML = news.map(item => `
        <div class="news-item">
            <a href="/news/${item.NewsID}.html">  <!-- Добавляем .html здесь -->
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
  
  // Обработчик формы добавления новости
  document.getElementById('addNewsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    try {
        const response = await fetch('/news', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        
        if (response.ok) {
            // Показываем уведомление и обновляем список новостей
            alert(result.message || 'Новость успешно добавлена!');
            await fetchAndDisplayNews(); // Обновляем список новостей
            
            // Переход на страницу созданной новости
            window.location.href = `/news/${result.newsItem.id}.html`; // Переходим к созданной новости
        } else {
            alert(result.message || 'Ошибка при добавлении новости');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка сети');
    }
});
  
  // Инициализация
  document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayNews();
    
    // Проверка прав администратора
    fetch('/profile/data')
      .then(res => res.json())
      .then(data => {
        if (data.user?.roleId !== 1) {
          document.getElementById('addNews').style.display = 'none';
        }
      });
  });