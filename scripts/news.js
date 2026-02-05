// Simple news rendering for index and news pages
(function() {
  const NEWS_JSON = 'assets/data/news.json';

  function formatDate(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch (_) {
      return iso;
    }
  }

  function getPreviewImage(item) {
    return item.previewImage || item.image || '';
  }

  function createNewsCard(item) {
    const article = document.createElement('article');
    article.className = 'news-card';
    article.innerHTML = `
      <div class="news-image"><img src="${getPreviewImage(item)}" alt="${item.title}"></div>
      <div class="news-date">${formatDate(item.date)}</div>
      <h4>${item.title}</h4>
      <p>${item.excerpt}</p>
      <div class="news-card-footer">
        <!-- ${Array.isArray(item.tags) && item.tags.length ? `<div class="news-card-tags">${item.tags.map(t => `<a class=\"tag\" href=\"news.html?tag=${encodeURIComponent(t)}\">${t}</a>`).join('')}</div>` : ''} -->
        <a class="btn btn-small btn-primary" href="news_post.html?slug=${encodeURIComponent(item.slug)}">Подробнее</a>
      </div>
    `;
    return article;
  }

  function renderIntoGrid(grid, items) {
    grid.innerHTML = '';
    const frag = document.createDocumentFragment();
    items.forEach(item => frag.appendChild(createNewsCard(item)));
    grid.appendChild(frag);
  }

  async function loadAndRender() {
    try {
      const res = await fetch(NEWS_JSON, { cache: 'no-store' });
      const all = await res.json();
      // Sort by date desc
      let items = [...all].sort((a, b) => new Date(b.date) - new Date(a.date));

      // Index page latest-news block
      const indexGrid = document.querySelector('.latest-news .news-grid');
      if (indexGrid && !document.body.classList.contains('page-news')) {
        renderIntoGrid(indexGrid, items.slice(0, 3));
        indexGrid.removeAttribute('data-loading');
        window.dispatchEvent(new CustomEvent('newsRendered'));
      }

      // News page full list
      const newsPageGrid = document.querySelector('.page-news .latest-news .news-grid');
      if (newsPageGrid) {
        const url = new URL(location.href);
        const activeTag = url.searchParams.get('tag');
        if (activeTag) {
          items = items.filter(n => Array.isArray(n.tags) && n.tags.includes(activeTag));
          const info = document.createElement('div');
          info.className = 'tag-filter-info';
          info.innerHTML = `<span>Показаны новости с тегом: <strong class="tag-name">«${activeTag}»</strong></span> <a class="clear-filter" href="news.html">Сбросить</a>`;
          const container = newsPageGrid.closest('.container');
          container && container.insertBefore(info, newsPageGrid);
        }

        // Pagination (Load more)
        const PAGE_SIZE = 6;
        let rendered = 0;

        function renderNext() {
          const slice = items.slice(rendered, rendered + PAGE_SIZE);
          if (!slice.length) return false;
          const frag = document.createDocumentFragment();
          slice.forEach(item => frag.appendChild(createNewsCard(item)));
          newsPageGrid.appendChild(frag);
          rendered += slice.length;
          return rendered < items.length;
        }

        // Initial render
        newsPageGrid.innerHTML = '';
        let hasMore = renderNext();
        newsPageGrid.removeAttribute('data-loading');

        // Hook up Load More button
        const loadMoreBtn = document.getElementById('load-more');
        if (loadMoreBtn) {
          const updateBtn = () => {
            if (!hasMore) loadMoreBtn.style.display = 'none';
          };
          updateBtn();
          loadMoreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            hasMore = renderNext();
            updateBtn();
          });
        }
      }
      // Mark page as ready for unified reveal
      document.body && document.body.setAttribute('data-ready', 'true');
    } catch (e) {
      // Silent fail for now
      console.error('Failed to load news:', e);
      document.body && document.body.setAttribute('data-ready', 'true');
    }
  }

  document.addEventListener('DOMContentLoaded', loadAndRender);
})();

