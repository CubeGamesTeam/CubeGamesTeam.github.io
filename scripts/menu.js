// Ждём, пока загрузится HTML
document.addEventListener("DOMContentLoaded", function() {
    const menuToggle = document.getElementById("menu-toggle");
    const navMenu = document.getElementById("nav-menu");

    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", function() {
            navMenu.classList.toggle("active");
        });
    }

    // Подсветка активного пункта в навигации на всех страницах
    if (navMenu) {
        const links = navMenu.querySelectorAll('a[href]');

        const path = window.location.pathname;
        let current = path.split('/').pop() || 'index.html';

        // Нормализация для детальных страниц
        if (current === '' || current === null) current = 'index.html';
        if (current === 'news_post.html') current = 'news.html';
        if (current === 'guns_are_funs.html') current = 'games.html';
        if (current === 'game.html') current = 'games.html';

        const normalize = (href) => {
            try {
                const s = href.split('?')[0].split('#')[0];
                const seg = s.split('/').pop();
                return seg || 'index.html';
            } catch (_) {
                return href;
            }
        };

        links.forEach(a => a.classList.remove('active'));
        links.forEach(a => {
            const linkPage = normalize(a.getAttribute('href') || '');
            if (linkPage === current) {
                a.classList.add('active');
            }
        });
    }
  // Reveal immediately on pages without manual data loading
  try {
    const body = document.body;
    if (body) {
      const manualRevealClasses = ['page-index','page-news','page-games','page-contacts','page-game'];
      const needsManualReveal = manualRevealClasses.some(cls => body.classList.contains(cls));
      if (!needsManualReveal) {
        body.setAttribute('data-ready', 'true');
      }
    }
  } catch {}
});