document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadStats();
    await loadUsers();
    await loadNews();
    await loadComments();
    await loadSuggestedNews(); // Добавьте эту строку
  } catch (error) {
    showAlert(`Ошибка: ${error.message}`, 'error');
    console.error(error);
  }
});

async function loadUsers() {
  try {
    const response = await fetch('/api/admin/users');
    const users = await response.json();
    renderUsers(users);
  } catch (error) {
    showAlert('Ошибка загрузки пользователей', 'error');
  }
}

function renderUsers(users) {
  const tbody = document.querySelector('#usersTable tbody');
  tbody.innerHTML = users.map(user => `
    <tr>
      <td>${user.User_id}</td>
      <td>${user.Name}</td>
      <td>${user.Email}</td>
      <td>${getRoleName(user.RoleID)}</td>
      <td>
        
      </td>
    </tr>
  `).join('');
}

// Вспомогательная функция
function getRoleName(roleId) {
  const roles = {
    1: 'Администратор',
    2: 'Редактор',
    3: 'Пользователь'
  };
  return roles[roleId] || 'Неизвестно';
}

function showAlert(message, type = 'error') {
  const alertDiv = document.getElementById('alert');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
}

// Заглушки для действий
window.editUser = async (id) => {
  try {
    // Загружаем данные пользователя
    const response = await fetch(`/api/admin/users/${id}`);
    if (!response.ok) throw new Error('Ошибка загрузки данных пользователя');

    const user = await response.json();

    // Создаем модальное окно для редактирования
    const modal = document.createElement('div');
    modal.className = 'modal fade show';
    modal.style.display = 'block';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Редактирование пользователя #${id}</h5>
            <button type="button" class="close" onclick="this.closest('.modal').remove()">
              <span>&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form id="editUserForm">
              <div class="form-group">
                <label>Имя</label>
                <input type="text" class="form-control" value="${user.Name}" disabled>
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" class="form-control" value="${user.Email}" disabled>
              </div>
              <div class="form-group">
                <label>Роль</label>
                <select class="form-control" id="userRoleSelect">
                  <option value="1" ${user.RoleID === 1 ? 'selected' : ''}>Администратор</option>
                  <option value="2" ${user.RoleID === 2 ? 'selected' : ''}>Редактор</option>
                  <option value="3" ${user.RoleID === 3 ? 'selected' : ''}>Пользователь</option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Отмена</button>
            <button type="button" class="btn btn-primary" onclick="saveUserChanges(${id})">Сохранить</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  } catch (error) {
    showAlert(`Ошибка: ${error.message}`, 'error');
    console.error(error);
  }
};

// Функция для сохранения изменений
window.saveUserChanges = async (userId) => {
  try {
    const roleSelect = document.getElementById('userRoleSelect');
    const newRoleId = parseInt(roleSelect.value);

    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        roleId: newRoleId
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Ошибка сохранения');
    }

    showAlert('Роль пользователя успешно изменена', 'success');
    document.querySelector('.modal').remove();
    await loadUsers(); // Обновляем таблицу
  } catch (error) {
    showAlert(`Ошибка: ${error.message}`, 'error');
    console.error(error);
  }
};



async function loadNews() {
  try {
    const response = await fetch('/api/admin/news');

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка загрузки новостей');
    }

    const news = await response.json();
    renderNews(news);
  } catch (error) {
    showAlert(`Ошибка при загрузке новостей: ${error.message}`, 'error');
    console.error('Ошибка loadNews:', error);
  }
}

function renderNews(newsList) {
  const tbody = document.querySelector('#newsTable tbody');
  if (!tbody) {
    console.error('Элемент tbody не найден');
    return;
  }

  tbody.innerHTML = newsList.map(news => `
    <tr>
      <td>${news.NewsID}</td>
      <td>${news.Title}</td>
      <td>${new Date(news.Date).toLocaleDateString()}</td>
      <td>${news.City?.CityName || 'Не указан'}</td>
      <td>${news.Author?.Name || 'Не указан'}</td>
      <td>
        <button class="btn btn-sm btn-edit" onclick="editNews(${news.NewsID})">
          <i class="fas fa-edit"></i> Редактировать
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteNews(${news.NewsID})">
          <i class="fas fa-trash"></i> Удалить
        </button>
      </td>
    </tr>
  `).join('');
}

// Заглушки для действий с новостями
window.editNews = async (id) => {
  try {
    // Загружаем данные новости
    const response = await fetch(`/api/admin/news/${id}`);
    if (!response.ok) throw new Error('Ошибка загрузки данных новости');

    const news = await response.json();

    // Загружаем список городов
    const citiesResponse = await fetch('/api/cities');
    const cities = await citiesResponse.json();

    // Загружаем список авторов
    const authorsResponse = await fetch('/api/admin/users');
    const authors = await authorsResponse.json();

    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.className = 'modal fade show';
    modal.style.display = 'block';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.innerHTML = `
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Редактирование новости #${id}</h5>
            <button type="button" class="close" onclick="this.closest('.modal').remove()">
              <span>&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form id="editNewsForm">
              <div class="form-group">
                <label>Заголовок</label>
                <input type="text" class="form-control" id="newsTitle" value="${news.Title || ''}">
              </div>
              <div class="form-group">
                <label>Краткое описание</label>
                <textarea class="form-control" id="newsShortDesc">${news.ShortDescription || ''}</textarea>
              </div>
              <div class="form-group">
                <label>Полное описание</label>
                <textarea class="form-control" id="newsFullDesc" rows="5">${news.FullDescription || ''}</textarea>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group">
                    <label>Город</label>
                    <select class="form-control" id="newsCity">
                      <option value="">Не выбрано</option>
                      ${cities.map(city =>
      `<option value="${city.CityID}" ${news.CityID === city.CityID ? 'selected' : ''}>
                          ${city.CityName}
                        </option>`
    ).join('')}
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label>Автор</label>
                    <select class="form-control" id="newsAuthor">
                      <option value="">Не выбрано</option>
                      ${authors.map(author =>
      `<option value="${author.User_id}" ${news.AuthorID === author.User_id ? 'selected' : ''}>
                          ${author.Name} (${author.Email})
                        </option>`
    ).join('')}
                    </select>
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label>Дата публикации</label>
                <input type="datetime-local" class="form-control" id="newsDate" 
                       value="${news.Date ? new Date(news.Date).toISOString().slice(0, 16) : ''}">
              </div>
              <div class="form-group">
                <label>Изображение</label>
                <input type="file" class="form-control" id="newsImageFile" accept="image/*">
                ${news.ImageUrl ? `
                  <div class="mt-2">
                    <small>Текущее изображение:</small>
                    <img src="${news.ImageUrl}" style="max-height: 100px;" class="img-thumbnail">
                  </div>
                ` : ''}
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Отмена</button>
            <button type="button" class="btn btn-primary" onclick="saveNewsChanges(${id})">Сохранить</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  } catch (error) {
    showAlert(`Ошибка: ${error.message}`, 'error');
    console.error(error);
  }
};

window.saveNewsChanges = async (newsId) => {
  try {
    const formData = new FormData();

    // Добавляем текстовые данные
    formData.append('title', document.getElementById('newsTitle').value || '');
    formData.append('shortDescription', document.getElementById('newsShortDesc').value || '');
    formData.append('fullDescription', document.getElementById('newsFullDesc').value || '');

    const citySelect = document.getElementById('newsCity');
    if (citySelect.value) formData.append('cityId', citySelect.value);

    const authorSelect = document.getElementById('newsAuthor');
    if (authorSelect.value) formData.append('authorId', authorSelect.value);

    const dateInput = document.getElementById('newsDate');
    if (dateInput.value) formData.append('date', dateInput.value);

    // Добавляем файл изображения, если выбран
    const imageFile = document.getElementById('newsImageFile').files[0];
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await fetch(`/api/admin/news/${newsId}`, {
      method: 'PUT',
      body: formData // FormData автоматически устанавливает заголовок Content-Type с boundary
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Ошибка сохранения');
    }

    showAlert('Новость успешно обновлена', 'success');
    document.querySelector('.modal').remove();
    await loadNews(); // Обновляем таблицу
  } catch (error) {
    showAlert(`Ошибка: ${error.message}`, 'error');
    console.error(error);
  }
};

window.deleteUser = async (id) => {
  if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return;

  try {
    const response = await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Ошибка удаления');
    }

    showAlert('Пользователь успешно удален', 'success');
    await loadUsers(); // Обновляем список пользователей
  } catch (error) {
    showAlert(`Ошибка: ${error.message}`, 'error');
    console.error(error);
  }
};

window.deleteNews = async (id) => {
  if (!confirm('Удалить новость?')) return;

  try {
    const response = await fetch(`/api/admin/news/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Ошибка удаления');
    }

    showAlert('Новость успешно удалена', 'success');
    await loadNews(); // Обновляем список новостей
  } catch (error) {
    showAlert(`Ошибка: ${error.message}`, 'error');
    console.error(error);
  }
};



function showAlert(message, type = 'error') {
  const alertDiv = document.getElementById('alert');
  alertDiv.innerHTML = '';

  const alertContent = document.createElement('div');
  alertContent.className = `alert alert-${type}`;

  const icon = document.createElement('i');
  icon.className = type === 'error' ? 'fas fa-exclamation-circle' :
    type === 'success' ? 'fas fa-check-circle' : 'fas fa-info-circle';

  const text = document.createElement('span');
  text.textContent = message;

  alertContent.appendChild(icon);
  alertContent.appendChild(text);
  alertDiv.appendChild(alertContent);

  setTimeout(() => {
    alertContent.style.opacity = '0';
    setTimeout(() => alertDiv.removeChild(alertContent), 300);
  }, 5000);
}

// Заглушки для действий


document.addEventListener('DOMContentLoaded', function () {
  // Элементы модального окна
  const modal = document.getElementById('addUserModal');
  const addBtn = document.querySelector('.table-actions .btn-primary');
  const closeBtn = document.querySelector('.modal-header .close');
  const cancelBtn = document.querySelector('.btn-cancel');
  const addUserForm = document.getElementById('addUserForm');

  // Открытие/закрытие модального окна
  addBtn.addEventListener('click', () => modal.style.display = 'block');
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  window.addEventListener('click', (e) => e.target === modal && closeModal());

  function closeModal() {
    modal.style.display = 'none';
    addUserForm.reset();
  }

  // Обработка формы
  addUserForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = {
      name: document.getElementById('userName').value.trim(),
      email: document.getElementById('userEmail').value.trim(),
      password: document.getElementById('userPassword').value,
      roleId: document.getElementById('userRole').value
    };

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Ошибка сервера');
      }

      showAlert('Пользователь добавлен!', 'success');
      closeModal();
      await loadUsers(); // Обновляем таблицу
    } catch (error) {
      showAlert(error.message, 'error');
      console.error('Ошибка:', error);
    }
  });
});

// Добавим в начало функции loadStats
async function loadStats() {
  try {
    const response = await fetch('/api/admin/stats');

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Ошибка сервера');
    }

    const stats = await response.json();

    document.getElementById('totalNews').textContent = stats.totalNews;
    document.getElementById('totalUsers').textContent = stats.totalUsers;
    

  } catch (error) {
    console.error('Ошибка загрузки статистики:', error);
    showAlert(`Не удалось загрузить статистику: ${error.message}`, 'error');
  }
}

// Функция для загрузки комментариев
async function loadComments() {
  try {
    const response = await fetch('/api/admin/comments');
    const comments = await response.json();
    renderComments(comments);
  } catch (error) {
    showAlert('Ошибка загрузки комментариев', 'error');
  }
}

// Функция для отображения комментариев
function renderComments(comments) {
  const tbody = document.querySelector('#commentsTable tbody');
  tbody.innerHTML = comments.map(comment => `
    <tr>
      <td>${comment.CommentID}</td>
      <td>${comment.CommentText.length > 50 ?
      comment.CommentText.substring(0, 50) + '...' :
      comment.CommentText}</td>
      <td>${comment.User ? comment.User.Name : 'Аноним'}</td>
      <td>${comment.News ? comment.News.Title.substring(0, 30) + '...' : 'Новость удалена'}</td>
      <td>${new Date(comment.CreatedAt).toLocaleDateString()}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="deleteComment(${comment.CommentID})">
          <i class="fas fa-trash"></i> Удалить
        </button>
      </td>
    </tr>
  `).join('');
}

// Функция для удаления комментария
window.deleteComment = async (id) => {
  if (!confirm('Вы уверены, что хотите удалить этот комментарий?')) return;

  try {
    const response = await fetch(`/api/admin/comments/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Ошибка удаления');
    }

    showAlert('Комментарий успешно удален', 'success');
    await loadComments(); // Обновляем список комментариев
  } catch (error) {
    showAlert(`Ошибка: ${error.message}`, 'error');
    console.error(error);
  }
};

// Функция для обновления комментариев
window.refreshComments = async () => {
  await loadComments();
  showAlert('Список комментариев обновлен', 'success');
};

// Добавьте эту функцию в ваш admin-panel.js
async function generateReport() {
  try {
    showAlert('Генерация отчета...', 'info');

    // Используем fetch для получения PDF
    const response = await fetch('/api/admin/generate-report');

    if (!response.ok) {
      throw new Error('Ошибка при генерации отчета');
    }

    // Создаем blob из ответа
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    // Создаем ссылку для скачивания
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Ural56-Report.pdf';
    document.body.appendChild(a);
    a.click();

    // Очищаем
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    showAlert('Отчет успешно сгенерирован!', 'success');
  } catch (error) {
    showAlert(`Ошибка: ${error.message}`, 'error');
    console.error(error);
  }
}

async function loadSuggestedNews(filter = 'all') {
  try {
    const response = await fetch(`/api/suggested-news/for-redactor/all?filter=${filter}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Ошибка загрузки предложенных новостей');
    }

    const suggestions = await response.json();
    renderSuggestedNews(suggestions);
  } catch (error) {
    console.error('Ошибка:', error);
    showAlert('Ошибка загрузки предложенных новостей', 'error');
  }
}

// Функция для отображения предложенных новостей в таблице
function renderSuggestedNews(suggestions) {
  const tbody = document.querySelector('#suggestionsTable tbody');
  tbody.innerHTML = '';

  if (suggestions.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">Нет предложенных новостей</td>
      </tr>
    `;
    return;
  }

  suggestions.forEach(suggestion => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${suggestion.id}</td>
      <td>${suggestion.title}</td>
      <td>${suggestion.authorName || suggestion.SuggestedBy?.Name || 'Аноним'}</td>
      <td>${suggestion.City?.CityName || suggestion.cityId || 'Не указан'}</td>
      <td>${new Date(suggestion.date || suggestion.createdAt).toLocaleDateString()}</td>
      <td><span class="badge badge-${suggestion.status}">${getStatusText(suggestion.status)}</span></td>
      <td>
        <div class="action-btns">
          <button class="btn btn-sm btn-edit" onclick="viewSuggestion(${suggestion.id})">
            <i class="fas fa-eye"></i>
          </button>
          ${suggestion.status === 'pending' ? `
            <button class="btn btn-sm btn-primary" onclick="approveSuggestion(${suggestion.id})">
              <i class="fas fa-check"></i>
            </button>
            <button class="btn btn-sm btn-danger" onclick="rejectSuggestion(${suggestion.id})">
              <i class="fas fa-times"></i>
            </button>
          ` : ''}
          ${suggestion.status === 'approved' ? `
            <button class="btn btn-sm btn-primary" onclick="publishSuggestion(${suggestion.id})">
              <i class="fas fa-upload"></i> Опубликовать
            </button>
          ` : ''}
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Вспомогательная функция для получения текста статуса
function getStatusText(status) {
  const statusMap = {
    'pending': 'На рассмотрении',
    'approved': 'Одобрена',
    'rejected': 'Отклонена',
    'published': 'Опубликована'
  };
  return statusMap[status] || status;
}

// Функции для действий с новостями
async function viewSuggestion(id) {
  window.open(`/admin/suggested-news/${id}`, '_blank');
}

async function approveSuggestion(id) {
  if (!confirm('Одобрить эту новость?')) return;

  try {
    const response = await fetch(`/api/suggested-news/${id}/approve`, {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Ошибка одобрения');

    showAlert('Новость одобрена', 'success');
    loadSuggestedNews(document.getElementById('suggestionFilter').value);
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

async function rejectSuggestion(id) {
  const reason = prompt('Укажите причину отклонения:');
  if (!reason) return;

  try {
    const response = await fetch(`/api/suggested-news/${id}/reject`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason })
    });

    if (!response.ok) throw new Error('Ошибка отклонения');

    showAlert('Новость отклонена', 'success');
    loadSuggestedNews(document.getElementById('suggestionFilter').value);
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

async function publishSuggestion(id) {
  if (!confirm('Опубликовать эту новость на главной странице?')) return;

  try {
    const response = await fetch(`/api/suggested-news/${id}/publish`, {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Ошибка публикации');

    showAlert('Новость опубликована', 'success');
    loadSuggestedNews(document.getElementById('suggestionFilter').value);
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

function refreshSuggestions() {
  loadSuggestedNews(document.getElementById('suggestionFilter').value);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  // Добавляем обработчик изменения фильтра
  document.getElementById('suggestionFilter').addEventListener('change', function () {
    loadSuggestedNews(this.value);
  });

  // Загружаем предложенные новости
  loadSuggestedNews();
});

function renderSuggestedNews(suggestions) {
  const tbody = document.querySelector('#suggestionsTable tbody');
  tbody.innerHTML = '';

  if (suggestions.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">Нет предложенных новостей</td>
      </tr>
    `;
    return;
  }

  suggestions.forEach(suggestion => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${suggestion.id}</td>
      <td>${suggestion.title}</td>
      <td>${suggestion.authorName || suggestion.SuggestedBy?.Name || 'Аноним'}</td>
      <td>${suggestion.City?.CityName || suggestion.cityId || 'Не указан'}</td>
      <td>${new Date(suggestion.date || suggestion.createdAt).toLocaleDateString()}</td>
      <td><span class="badge badge-${suggestion.status}">${getStatusText(suggestion.status)}</span></td>
      <td>
  <div class="action-btns">
    <button class="btn btn-sm btn-edit" onclick="editSuggestion(${suggestion.id})">
      <i class="fas fa-pencil-alt"></i> Редактировать
    </button>
    ${suggestion.status === 'pending' ? `
      <button class="btn btn-sm btn-primary" onclick="approveSuggestion(${suggestion.id})">
        <i class="fas fa-check"></i> Одобрить
      </button>
      <button class="btn btn-sm btn-danger" onclick="rejectSuggestion(${suggestion.id})">
        <i class="fas fa-times"></i> Отклонить
      </button>
    ` : ''}
    ${suggestion.status === 'approved' ? `
      <button class="btn btn-sm btn-success" onclick="publishSuggestion(${suggestion.id})">
        <i class="fas fa-upload"></i> Опубликовать
      </button>
    ` : ''}
  </div>
</td>`;
    tbody.appendChild(tr);
  });
}

// Функция для открытия страницы редактирования
function editSuggestion(id) {
  window.location.href = `/edit-suggested-news.html?id=${id}`;
}