document.addEventListener('DOMContentLoaded', async () => {
  // Получаем ID новости из URL
  const urlParams = new URLSearchParams(window.location.search);
  const newsId = urlParams.get('id');
  
  if (!newsId) {
    alert('Новость не найдена');
    window.location.href = 'admin-panel.html';
    return;
  }

  try {
    // Загружаем данные новости
    const response = await fetch(`/api/suggested-news/${newsId}`, {
      credentials: 'include'
    });
    
    if (!response.ok) throw new Error('Ошибка загрузки новости');
    
    const news = await response.json();
    
    // Заполняем форму данными новости
    populateForm(news);
    
    // Передаем статус новости в функцию настройки кнопок
    setupButtonsVisibility(news.status || 'pending'); // Используем статус новости или 'pending' по умолчанию
    
    // Проверяем роль пользователя для настройки кнопок
    const roleResponse = await fetch('/profile/data', { 
      credentials: 'include' 
    });
    
    if (roleResponse.ok) {
      const roleData = await roleResponse.json();
      // Здесь можно использовать roleData, если это необходимо
    }
    
    // Настраиваем обработчики событий
    setupEventHandlers(newsId);
  } catch (error) {
    console.error('Ошибка:', error);
    alert(error.message || 'Произошла ошибка');
    window.location.href = 'admin-panel.html';
  }
});

function populateForm(news) {
  try {
    // Создаем безопасную функцию для установки значений
    const setValue = (id, value) => {
      const element = document.getElementById(id);
      if (element) element.value = value || '';
    };

    const setHTML = (id, html) => {
      const element = document.getElementById(id);
      if (element) element.innerHTML = html || '';
    };

    // Устанавливаем значения для всех полей формы
    setValue('newsId', news.id);
    setValue('title', news.title);
    setValue('description', news.description);
    
    // Для contenteditable элемента
    const fullDescElement = document.getElementById('fullDescription');
    if (fullDescElement) {
      fullDescElement.innerHTML = news.fullDescription || '';
    }
    
    setValue('date', news.date ? news.date.split('T')[0] : '');
    setValue('author', news.authorName || news.SuggestedBy?.Name || '');
    setValue('city', news.cityId);
    setValue('status', news.status || 'pending');
    setValue('currentImageUrl', news.imageUrl);
    
    // Устанавливаем изображение, если оно есть
    if (news.imageUrl) {
      const currentImageElement = document.getElementById('currentImage');
      if (currentImageElement) {
        currentImageElement.innerHTML = `
          <p>Текущее изображение:</p>
          <img src="${news.imageUrl}" style="max-width: 200px; margin-top: 10px;">
        `;
      }
    }
  } catch (e) {
    console.error('Ошибка заполнения формы:', e);
    throw new Error('Ошибка отображения данных');
  }
}


function setupButtonsVisibility(newsStatus) {
  const isPublished = newsStatus === 'published';
  
  // Показываем кнопки "Опубликовать" и "Сохранить и опубликовать" только если новость не опубликована
  setupButtonsVisibility('publishBtn', !isPublished);
  setupButtonsVisibility('saveAndPublishBtn', !isPublished);
  
  // Всегда показываем кнопку "Удалить"
  setupButtonsVisibility('deleteBtn', true);
}

function setupEventHandlers(newsId) {
  const form = document.getElementById('editSuggestedNewsForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveNews(newsId, false);
  });

  const publishBtn = document.getElementById('publishBtn');
  if (publishBtn) {
    publishBtn.addEventListener('click', async () => {
      if (confirm('Опубликовать новость без дополнительных изменений?')) {
        await publishNews(newsId);
      }
    });
  }

  const saveAndPublishBtn = document.getElementById('saveAndPublishBtn');
  if (saveAndPublishBtn) {
    saveAndPublishBtn.addEventListener('click', async () => {
      if (confirm('Сохранить изменения и опубликовать новость?')) {
        await saveNews(newsId, true);
      }
    });
  }

  const deleteBtn = document.getElementById('deleteBtn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      if (confirm('Вы уверены, что хотите удалить эту новость?')) {
        await deleteNews(newsId);
      }
    });
  }
}




async function loadSuggestedNews(user) {
  try {
    let url;
    if (user.role === 'admin') {
      url = '/api/suggested-news/admin';
    } else if (user.role === 'redactor') {
      url = '/api/suggested-news/for-redactor'; // ИЗМЕНЕНО: URL для редактора
    } else {
      url = '/api/suggested-news/my';
    }

    const response = await fetch(url, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Ошибка загрузки новостей');
    }

    const newsList = await response.json();
    const container = document.getElementById('suggested-news-container');

    if (!container) return;

    container.innerHTML = '';

    if (newsList.length === 0) {
      container.innerHTML = '<p>Нет предложенных новостей</p>';
      return;
    }

    newsList.forEach(news => {
      const newsItem = document.createElement('div');
      newsItem.className = 'news-item';
      newsItem.innerHTML = `
        <h3>${news.title}</h3>
        <p>${news.description}</p>
        <p>Статус: ${getStatusText(news.status)}</p>
        <p>Автор: ${news.SuggestedBy?.Name || news.authorName || 'Не указан'}</p>
        <p>Дата: ${new Date(news.createdAt).toLocaleDateString()}</p>
        ${news.status === 'pending' || user.role === 'admin' || user.role === 'redactor'
          ? `<a href="edit-suggested-news.html?id=${news.id}" class="edit-btn">Редактировать</a>`
          : ''}
      `;
      container.appendChild(newsItem);
    });
  } catch (error) {
    console.error('Ошибка загрузки новостей:', error);
    const container = document.getElementById('suggested-news-container');
    if (container) {
      container.innerHTML = '<p>Не удалось загрузить новости</p>';
    }
  }
}

// Остальные вспомогательные функции
function getStatusText(status) {
  const statuses = {
    'pending': 'На рассмотрении',
    'approved': 'Одобрено',
    'rejected': 'Отклонено',
    'published': 'Опубликовано'
  };
  return statuses[status] || status;
}

async function handleProfileEdit(e) {
  e.preventDefault();

  try {
    const newName = document.getElementById('newName').value.trim();
    const newPassword = document.getElementById('newPassword').value.trim();

    if (!newName && !newPassword) {
      alert('Заполните хотя бы одно поле (имя или пароль)');
      return;
    }

    const requestBody = {};
    if (newName) {
      requestBody.username = newName;
    }
    if (newPassword) {
      requestBody.password = newPassword;
    }

    const response = await fetch('/edit-profile', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      alert('Данные успешно обновлены!');
      // Перезагружаем страницу для отображения изменений
      window.location.reload();
    } else {
      try {
        const error = await response.json();
        alert(error.message || 'Ошибка при обновлении данных');
      } catch (parseError) {
        // Если не удалось распарсить JSON, показываем общее сообщение об ошибке
        alert('Ошибка при обновлении данных (не удалось распарсить ответ сервера)');
        console.error('Ошибка парсинга JSON:', parseError);
      }
    }
  } catch (error) {
    console.error('Ошибка:', error);
    alert('Ошибка при сохранении изменений');
  }
}

async function saveNews(newsId, andPublish = false) {
  try {
    const form = document.getElementById('editSuggestedNewsForm');
    const formData = new FormData(form);
    
    // Добавляем HTML содержимое редактора
    const fullDesc = document.getElementById('fullDescription').innerHTML;
    formData.append('fullDescription', fullDesc);
    
    // Показываем индикатор загрузки
    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Сохранение...';
    
    const response = await fetch(`/api/suggested-news/${newsId}`, {
      method: 'PUT',
      credentials: 'include', // Важно для отправки кук
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Ошибка сохранения');
    }
    
    if (andPublish) {
      await publishNews(newsId);
    } else {
      alert('Изменения сохранены');
      window.location.href = 'admin-panel.html';
    }
  } catch (error) {
    console.error('Ошибка сохранения:', error);
    alert(`Ошибка сохранения: ${error.message}`);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Сохранить';
  }
}

async function publishNews(newsId) {
  try {
    const response = await fetch(`/api/suggested-news/${newsId}/publish`, {
      method: 'POST',
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Ошибка публикации');
    }
    
    alert('Новость опубликована');
    window.location.href = 'admin-panel.html';
  } catch (error) {
    console.error('Ошибка публикации:', error);
    alert(error.message || 'Ошибка публикации новости');
  }
}

async function deleteNews(newsId) {
  try {
    const response = await fetch(`/api/suggested-news/${newsId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Ошибка удаления');
    }
    
    alert('Новость удалена');
    window.location.href = 'admin-panel.html';
  } catch (error) {
    console.error('Ошибка удаления:', error);
    alert(error.message || 'Ошибка удаления новости');
  }
}