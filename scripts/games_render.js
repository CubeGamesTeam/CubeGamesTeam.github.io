// Renders games into index and games pages
(function() {
  function statusBadge(status) {
    if (status === 'released') return '<div class="game-status game-status--left status-released">Выпущена</div>';
    return '<div class="game-status game-status--left status-development">В разработке</div>';
  }

  function gameCardFeatured(game) {
    return `
      <div class="game-card">
        <div class="game-image">
          <img src="${game.images.capsuleMain || game.images.header || ''}" alt="${game.title}">
        </div>
        <div class="game-info">
          <h4>${game.title}</h4>
          <p>${game.subtitle || ''}</p>
          <a href="game.html?slug=${encodeURIComponent(game.slug)}" class="btn btn-small btn-primary">Подробнее</a>
        </div>
      </div>
    `;
  }

  function renderPlatformButtons(platforms) {
    if (!platforms || typeof platforms !== 'object') return '';
    const entries = Object.entries(platforms).filter(([, url]) => typeof url === 'string' && url.trim());
    if (entries.length === 0) return '';
    return entries.map(([key, url]) => {
      const label = (window.CGS && window.CGS.brands && window.CGS.brands[key] && window.CGS.brands[key].label) || key;
      const iconHtml = (window.CGS && window.CGS.icons && window.CGS.icons[key]) ? window.CGS.icons[key] : '';
      return `<a href="${url}" class="btn btn-brand" target="_blank" rel="noopener noreferrer">${iconHtml}<span>${label}</span></a>`;
    }).join('');
  }

  function gameCardDetailed(game) {
    const tags = game.tags.map(t => `<span class="tag">${t}</span>`).join('');
    return `
      <div class="game-card-detailed" data-category="${[...game.genres, game.status].join(' ')}">
        <div class="game-image-large">
          <div class="game-placeholder-large">
            <img src="${game.images.capsuleMain || game.images.header || ''}" alt="${game.title}">
          </div>
          ${statusBadge(game.status)}
        </div>
        <div class="game-info-detailed">
          <div class="game-header">
            <h3>${game.title}</h3>
          </div>
          <!-- <div class="game-tags">${tags}</div> -->
          <p class="game-description">${game.description[0] || ''}</p>
        </div>
        <div class="game-actions">
          ${renderPlatformButtons(game.platforms)}
          <a href="game.html?slug=${encodeURIComponent(game.slug)}" class="btn btn-brand"><span>Подробнее</span></a>
        </div>
      </div>
    `;
  }

  function renderIndexFeatured(games) {
    const grid = document.querySelector('.featured-games .games-grid');
    if (!grid) return;
    const featured = games.filter(g => g.featured).slice(0, 3);
    grid.innerHTML = featured.map(gameCardFeatured).join('');
    grid.removeAttribute('data-loading');
    // Notify index page that featured games are ready
    window.dispatchEvent(new CustomEvent('gamesFeaturedRendered'));
  }

  function renderGamesList(games) {
    const grid = document.querySelector('.games-grid-detailed');
    if (!grid) return;
    grid.innerHTML = games.map(gameCardDetailed).join('');
    grid.removeAttribute('data-loading');
  }

  function updateStudioStats(games) {
    const released = games.filter(g => g.status === 'released').length;
    const development = games.filter(g => g.status !== 'released').length;
    const elReleased = document.getElementById('stats-released');
    const elDevelopment = document.getElementById('stats-development');
    if (elReleased) elReleased.textContent = String(released);
    if (elDevelopment) elDevelopment.textContent = String(development);
  }

  async function init() {
    if (!window.CGS || !window.CGS.loadGames) return;
    try {
      const games = await window.CGS.loadGames();
      // Make brand labels available for platform buttons
      if (!window.CGS.brands) {
        try {
          const res = await fetch('assets/data/brands.json', { cache: 'no-store' });
          window.CGS.brands = await res.json();
        } catch {}
      }
      // Wait for icons to be ready if needed
      if (!window.CGS.icons || Object.keys(window.CGS.icons).length === 0) {
        await new Promise(resolve => {
          if (window.CGS.icons && Object.keys(window.CGS.icons).length > 0) return resolve();
          window.addEventListener('iconsLoaded', resolve, { once: true });
          // Safety timeout
          setTimeout(resolve, 500);
        });
      }
      // Index page
      if (!document.body.classList.contains('page-news') && document.querySelector('.featured-games .games-grid')) {
        renderIndexFeatured(games);
      }
      // Games page
      if (document.querySelector('.games-grid-detailed')) {
        renderGamesList(games);
        updateStudioStats(games);
        const stats = document.querySelector('.studio-stats');
        if (stats) stats.removeAttribute('data-loading');
      }
      // Mark page as ready for unified reveal
      document.body && document.body.setAttribute('data-ready', 'true');
    } catch (e) {
      console.error('Failed to load games:', e);
      // Even on error, avoid invisible page
      document.body && document.body.setAttribute('data-ready', 'true');
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();


