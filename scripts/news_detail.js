(function() {
  const NEWS_JSON = 'assets/data/news.json';

  function qs(name) {
    const p = new URLSearchParams(location.search);
    return p.get(name) || '';
  }

  function formatDate(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch (_) {
      return iso;
    }
  }

  async function load() {
    const slug = qs('slug');
    if (!slug) return;
    try {
      const res = await fetch(NEWS_JSON, { cache: 'no-store' });
      const items = await res.json();
      const item = items.find(n => n.slug === slug);
      if (!item) return;

      // Title, subtitle, meta, tags
      const titleEl = document.getElementById('news-title');
      const metaEl = document.getElementById('news-meta');
      const tagsEl = document.getElementById('news-tags');
      if (titleEl) titleEl.textContent = item.title;
      if (metaEl) metaEl.textContent = formatDate(item.date);
      if (tagsEl && Array.isArray(item.tags)) {
        tagsEl.innerHTML = item.tags.map(t => `<span class="tag">${t}</span>`).join('');
      }

      const bcTitle = document.getElementById('news-breadcrumb-title');
      if (bcTitle) bcTitle.textContent = item.title;

      // Image (use detailImage if provided)
      const imgWrap = document.getElementById('news-image');
      if (imgWrap) {
        imgWrap.innerHTML = ''; // Clear placeholder
        const detailSrc = item.detailImage || item.image || '';
        imgWrap.innerHTML = `<img src="${detailSrc}" alt="${item.title}">`;
      }

      // Content
      const contentEl = document.getElementById('news-content');
      if (contentEl) {
        contentEl.innerHTML = ''; // Clear placeholder
        const htmlRes = await fetch(item.contentUrl, { cache: 'no-store' });
        const html = await htmlRes.text();
        contentEl.innerHTML = html;

        // CTA buttons
        if (Array.isArray(item.cta) && item.cta.length) {
          // Ждем загрузки иконок, если они еще не загружены или реестр пустой
          const waitIconsIfNeeded = async () => {
            const iconsReady = () => (window.CGS && window.CGS.icons && Object.keys(window.CGS.icons).length > 0);
            if (iconsReady()) return;
            await new Promise(resolve => {
              if (iconsReady()) {
                resolve();
              } else {
                window.addEventListener('iconsLoaded', resolve, { once: true });
                // Fallback timeout
                setTimeout(resolve, 1200);
              }
            });
          };
          await waitIconsIfNeeded();
          
          const ctaWrap = document.createElement('div');
          ctaWrap.className = 'cta-buttons';
          item.cta.forEach(btn => {
            const a = document.createElement('a');
            a.className = 'btn btn-brand';
            a.href = btn.href;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            
            // Используем иконку из JSON по ключу variant или по умолчанию external
            const iconKey = (btn.variant || 'external').toLowerCase();
            let iconHtml = '';
            
            if (window.CGS && window.CGS.icons && window.CGS.icons[iconKey]) {
              iconHtml = window.CGS.icons[iconKey];
            } else {
              // Пробуем подставить прямую ссылку на svg по ключу, если такой файл есть в проекте
              // Даже если файла нет, браузер просто не покажет img, но это лучше, чем external
              iconHtml = `<img class="icon-svg" src="assets/icons/${iconKey}.svg" alt="${iconKey} icon">`;
            }
            
            // Создаем структуру кнопки с иконкой и текстом
            a.innerHTML = `
              ${iconHtml}
              <span>${btn.label}</span>
            `;
            
            ctaWrap.appendChild(a);
          });
          contentEl.appendChild(ctaWrap);
        }
      }

      // Update title
      document.title = item.title + ' - CubeGamesStudio';
      // Reveal content section without hiding entire page
      const wrap = document.getElementById('news-content-wrapper');
      if (wrap) wrap.removeAttribute('data-loading');
      
      // Dispatch event to show the page
      window.dispatchEvent(new CustomEvent('newsDetailLoaded'));
    } catch (e) {
      console.error('Failed to load news detail:', e);
      // Show error message to user
      const contentEl = document.getElementById('news-content');
      if (contentEl) {
        contentEl.innerHTML = `
          <div class="error-message">
            <h3>Ошибка загрузки</h3>
            <p>Не удалось загрузить новость. Пожалуйста, попробуйте обновить страницу.</p>
          </div>
        `;
      }
      
      // Remove loading state
      const wrap = document.getElementById('news-content-wrapper');
      if (wrap) wrap.removeAttribute('data-loading');
      
      // Always dispatch event to show the page
      window.dispatchEvent(new CustomEvent('newsDetailLoaded'));
    }
  }

  document.addEventListener('DOMContentLoaded', load);
})();

