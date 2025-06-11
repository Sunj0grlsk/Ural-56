// scripts/suggestedNews.js
document.getElementById('addNewsForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    // Валидация обязательных полей (title, description, cityId)
    if (!formData.get('title') || !formData.get('description') || !formData.get('cityId')) {
        alert('Пожалуйста, заполните обязательные поля: Заголовок, Описание и Город.');
        return;
    }

    try {
        const response = await fetch('/api/suggested-news', {
            method: 'POST',
            credentials: 'include', // чтобы отправлять куки сессии
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert('Ошибка: ' + (errorData.error || 'Неизвестная ошибка'));
            return;
        }

        alert('Новость успешно предложена! Ожидайте модерации.');
        form.reset();
    } catch (err) {
        alert('Ошибка при отправке: ' + err.message);
    }
});
