// Renders single game detail page from games.json
(function() {
  function qs(name) {
    const p = new URLSearchParams(location.search);
    return p.get(name) || '';
  }

  function buildThumbnails(screens) {
    return screens.map((src, idx) => `
      <div class="thumbnail ${idx === 0 ? 'active' : ''}"><img src="${src}" alt="Скриншот ${idx+1}"></div>
    `).join('');
  }

  function tagsLarge(tags) {
    return tags.map(t => `<span class="tag-large">${t}</span>`).join('');
  }

  // function similarBlock(games, currentSlug) {
  //   const others = games.filter(g => g.slug !== currentSlug).slice(0, 2);
  //   if (!others.length) return '';
  //   const cards = others.map(g => `
  //     <div class="game-card">
  //       <div class="game-image"><img src="${g.images.capsuleMain || g.images.header || ''}" alt="${g.title}"></div>
  //       <div class="game-info">
  //         <h4>${g.title}</h4>
  //         <p>${g.subtitle || ''}</p>
  //         <a href="game.html?slug=${encodeURIComponent(g.slug)}" class="btn btn-small btn-primary">Подробнее</a>
  //       </div>
  //     </div>
  //   `).join('');
  //   return `<section class="similar-games"><div class="container"><h2>Вам также может понравиться</h2><div class="games-grid">${cards}</div></div></section>`;
  // }

  function similarBlock(games, currentSlug) {
    const currentGame = games.find(g => g.slug === currentSlug);
    if (!currentGame) return '';

    const others = games
        .filter(g => g.slug !== currentSlug)
        .map(g => {
          let score = 0;

          // Совпадение жанров (важнее всего)
          const commonGenres = g.genres.filter(genre => currentGame.genres.includes(genre));
          score += commonGenres.length * 2;

          // Совпадение тегов
          const commonTags = g.tags.filter(tag => currentGame.tags.includes(tag));
          score += commonTags.length * 1;

          // Совпадение платформ (считаем только непустые)
          const currentPlatforms = Object.keys(currentGame.platforms).filter(p => currentGame.platforms[p]);
          const gPlatforms = Object.keys(g.platforms).filter(p => g.platforms[p]);
          const commonPlatforms = gPlatforms.filter(p => currentPlatforms.includes(p));
          score += commonPlatforms.length * 1;

          return { game: g, score };
        })
        .sort((a, b) => {
          if (b.score === a.score) {
            // Рандомный порядок, если одинаковый score
            return Math.random() - 0.5;
          }
          return b.score - a.score;
        })
        .slice(0, 3) // берём только 3
        .map(o => o.game);

    if (!others.length) return '';

    const cards = others.map(g => `
    <div class="game-card">
      <div class="game-image"><img src="${g.images.capsuleMain || g.images.header || ''}" alt="${g.title}"></div>
      <div class="game-info">
        <h4>${g.title}</h4>
        <p>${g.subtitle || ''}</p>
        <a href="game.html?slug=${encodeURIComponent(g.slug)}" class="btn btn-small btn-primary">Подробнее</a>
      </div>
    </div>
  `).join('');

    return `<section class="similar-games"><div class="container"><h2>Вам также может понравиться</h2><div class="games-grid">${cards}</div></div></section>`;
  }



  function getPlatformLabel(platform) {
    const labels = {
      steam: 'Steam',
      vkplay: 'VK Play',
      yandex: 'Яндекс Игры',
      rustore: 'RuStore',
      googleplay: 'Google Play',
      insite: 'Играть'
    };
    return labels[platform] || platform;
  }

  async function renderPurchaseButtons(game) {
    const container = document.querySelector('.purchase-buttons');
    if (!container || !game.platforms) return;

    // Wait for icons to be loaded
    if (window.CGS && window.CGS.components) {
      await window.CGS.components.waitForIcons();
    }

    // Используем точно такой же контейнер/сетки как на странице контактов
    container.classList.add('contacts-buttons');

    const buttonsHtml = Object.entries(game.platforms)
      .filter(([platform, url]) => Boolean(url))
      .map(([platform, url]) => {
        const label = getPlatformLabel(platform);
        const icon = (window.CGS && window.CGS.icons && window.CGS.icons[platform]) ? window.CGS.icons[platform] : '';
        return `<a href="${url}" class="btn btn-brand" target="_blank" rel="noopener noreferrer">${icon}<span>${label}</span></a>`;
      })
      .join('');

    container.innerHTML = buttonsHtml;
  }

  async function init() {
    if (!window.CGS || !window.CGS.loadGames) return;
    const slug = qs('slug');
    if (!slug) return;
    try {
      const games = await window.CGS.loadGames();
      const game = games.find(g => g.slug === slug);
      if (!game) return;

      // Breadcrumbs
      const bcTitle = document.querySelector('.breadcrumbs span:last-child');
      if (bcTitle) bcTitle.textContent = game.title;

      // Media
      const mainImg = document.getElementById('main-image');
      if (mainImg) mainImg.src = (game.screenshots[0] || game.images.capsuleMain || '');
      const thumbs = document.querySelector('.screenshot-thumbnails');
      if (thumbs) {
        thumbs.innerHTML = buildThumbnails(game.screenshots);
        // Сообщаем галерее, что миниатюры готовы
        window.dispatchEvent(new CustomEvent('thumbnailsReady'));
      }

      // Sidebar
      const titleEl = document.querySelector('.game-title');
      if (titleEl) titleEl.textContent = game.title;
      const subtitleEl = document.querySelector('.game-subtitle');
      if (subtitleEl) subtitleEl.textContent = game.subtitle || '';
      const tagsEl = document.querySelector('.game-tags-large');
      if (tagsEl) tagsEl.innerHTML = tagsLarge(game.tags);
      await renderPurchaseButtons(game);

      // Description
      const descWrap = document.querySelector('.description-content');
      if (descWrap) descWrap.innerHTML = (game.description || []).map(p => `<p>${p}</p>`).join('');

      // Features
      const featuresGrid = document.querySelector('.features-grid');
      if (featuresGrid) {
        featuresGrid.innerHTML = (game.features || []).map(f => {
          const fObj = (typeof f === 'object' && f !== null) ? f : { text: String(f) };
          const text = (fObj.text || String(f)).trim();
          const image = fObj.image || '';
          return `
            <div class="feature-card">
              ${image ? `<div class="feature-card-image"><img src="${image}" alt="${text}"></div>` : ''}
              <p class="feature-text">${text}</p>
            </div>
          `;
        }).join('');
      }

      // Similar
      const similarMount = document.getElementById('similar-mount');
      if (similarMount) similarMount.outerHTML = similarBlock(games, game.slug);

      // Update title
      document.title = game.title + ' - CubeGamesStudio';

      // Reveal main sections without hiding the whole page
      const hero = document.querySelector('.game-hero');
      if (hero) hero.removeAttribute('data-loading');
      const features = document.querySelector('.game-features');
      if (features) features.removeAttribute('data-loading');
    } catch (e) {
      console.error('Failed to render game detail:', e);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();


