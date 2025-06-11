document.addEventListener('DOMContentLoaded', async () => {
    const newsId = new URLSearchParams(window.location.search).get('id');
    const newsContent = document.getElementById('news-content');
  
    if (!newsId) {
      newsContent.innerHTML = '<p>Новость не найдена</p>';
      return;
    }
  
    try {
      const response = await fetch(`/news/${newsId}`);
      if (!response.ok) throw new Error('Новость не найдена');
      
      const newsItem = await response.json();
      
      newsContent.innerHTML = `
        <h1>${newsItem.Title}</h1>
        <div class="article-meta">
          <span>Автор: ${newsItem.Author}</span>
          <span>Дата: ${new Date(newsItem.Date).toLocaleDateString('ru-RU')}</span>
        </div>
        ${newsItem.ImageUrl ? 
          `<img src="${newsItem.ImageUrl}" alt="${newsItem.Title}" class="article-image">` : 
          ''
        }
        <div class="article-text">${newsItem.FullDescription}</div>
      `;
    } catch (error) {
      console.error(error);
      newsContent.innerHTML = `
        <p>Ошибка загрузки статьи. <a href="/">Вернуться на главную</a></p>
      `;
    }
  });

  router.get('/latest', async (req, res) => {
      try {
          const limit = parseInt(req.query.limit) || 4;
          const latestNews = await News.findAll({
              order: [['Date', 'DESC']],
              limit: limit,
              include: [City]
          });
          
          res.json(latestNews);
      } catch (error) {
          console.error('Error fetching latest news:', error);
          res.status(500).json({ message: 'Ошибка при загрузке новостей' });
      }
  });

