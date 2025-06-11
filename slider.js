let currentSlideIndex = 0;
let slideInterval;
const slideDuration = 5000; // 5 секунд

async function buildSliderFromExistingNews() {
    console.log('Building slider...');
    
    try {
        const response = await fetch('/news/latest');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const newsItems = await response.json();
        console.log('Received news:', newsItems);
        
        const mainSlider = document.getElementById('main-slider');
        const thumbnails = document.getElementById('thumbnails');
        
        if (!mainSlider || !thumbnails) {
            throw new Error('Slider elements not found!');
        }
        
        mainSlider.innerHTML = '';
        thumbnails.innerHTML = '';
        
        // Измененный обработчик клика в функции
        newsItems.slice(0, 4).forEach((news, index) => {
            // Main slide
            const slide = document.createElement('div');
            slide.className = 'slide';
            const newsId = news.id || news._id || news.NewsID;
            slide.dataset.newsId = newsId;
            
            slide.innerHTML = `
                <img src="${news.ImageUrl || 'styles/images/default-news.jpg'}" alt="${news.Title}">
                <div class="slide-content">
                    <h3 class="slide-title">${news.Title}</h3>
                    <p class="slide-date">${new Date(news.Date).toLocaleDateString('ru-RU')}</p>
                </div>
            `;
            
            // Новый обработчик клика с переходом на страницу новости
            slide.addEventListener('click', () => {
    if (newsId) {
        // Формируем URL без .html
        const newsUrl = `/news/${newsId}`;
        console.log('Navigating to:', newsUrl);
        window.location.href = newsUrl;
    } else {
        console.error('News ID not found:', news);
    }
});
            
            mainSlider.appendChild(slide);
            
            // Thumbnail (остается без изменений)
            const thumb = document.createElement('div');
            thumb.className = 'thumbnail';
            thumb.innerHTML = `
                <img src="${news.ImageUrl || 'styles/images/default-news.jpg'}" alt="${news.Title}">
                <span class="thumbnail-title">${news.Title}</span>
            `;
            thumb.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                showSlide(index);
                resetSlideInterval();
            });
            thumbnails.appendChild(thumb);
        });
        
        // Initialize slider
        showSlide(0);
        startSlideInterval();
        
    } catch (error) {
        console.error('Slider error:', error);
        // Fallback - show error message
        const sliderContainer = document.querySelector('.slider-container');
        if (sliderContainer) {
            sliderContainer.innerHTML = `<div class="slider-error">Ошибка загрузки слайдера: ${error.message}</div>`;
        }
    }
}

// Остальные функции остаются без изменений
function showSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const thumbs = document.querySelectorAll('.thumbnail');
    
    if (index >= slides.length) index = 0;
    if (index < 0) index = slides.length - 1;
    
    currentSlideIndex = index;
    
    slides.forEach(slide => slide.style.display = 'none');
    thumbs.forEach(thumb => thumb.classList.remove('active'));
    
    if (slides[index]) {
        slides[index].style.display = 'block';
        slides[index].style.opacity = 0;
        
        setTimeout(() => {
            slides[index].style.opacity = 1;
        }, 10);
    }
    
    if (thumbs[index]) thumbs[index].classList.add('active');
}

function nextSlide() {
    showSlide(currentSlideIndex + 1);
}

function prevSlide() {
    showSlide(currentSlideIndex - 1);
}

function startSlideInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, slideDuration);
}

function resetSlideInterval() {
    clearInterval(slideInterval);
    startSlideInterval();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded - initializing slider');
    buildSliderFromExistingNews();
});

// Останавливаем интервал при наведении мыши на слайдер
document.querySelector('.main-slider')?.addEventListener('mouseenter', () => {
    clearInterval(slideInterval);
});

// Возобновляем интервал при уходе мыши со слайдера
document.querySelector('.main-slider')?.addEventListener('mouseleave', () => {
    startSlideInterval();
});
