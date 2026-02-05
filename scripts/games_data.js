// Simple loader for games.json
(function() {
  const GAMES_JSON = 'assets/data/games.json';

  async function loadGames() {
    const res = await fetch(GAMES_JSON, { cache: 'no-store' });
    const all = await res.json();
    // Ensure slugs and required fields
    return all.map(g => ({
      slug: g.slug,
      title: g.title,
      subtitle: g.subtitle || '',
      status: g.status || 'development',
      featured: Boolean(g.featured),
      tags: Array.isArray(g.tags) ? g.tags : [],
      genres: Array.isArray(g.genres) ? g.genres : [],
      platforms: g.platforms || {},
      images: g.images || {},
      screenshots: Array.isArray(g.screenshots) ? g.screenshots : [],
      description: Array.isArray(g.description) ? g.description : [],
      features: Array.isArray(g.features) ? g.features : []
    }));
  }

  // Expose globally in a minimal way
  window.CGS = window.CGS || {};
  window.CGS.loadGames = loadGames;
})();


