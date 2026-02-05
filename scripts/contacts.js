(function() {
  const CONTACTS_JSON = 'assets/data/contacts.json';

  function iconHtml(iconIdOrChar) {
    if (!iconIdOrChar) return '';
    
    // If it's a registered icon key, use the SVG
    if (window.CGS && window.CGS.icons && window.CGS.icons[iconIdOrChar]) {
      return window.CGS.icons[iconIdOrChar];
    }
    
    // Fallback: plain character (for email)
    return `<span class="icon-svg" aria-hidden="true">${iconIdOrChar}</span>`;
  }

  function brandButton(item) {
    const isMailto = typeof item.href === 'string' && item.href.trim().toLowerCase().startsWith('mailto:');
    const base = `${iconHtml(item.icon)}<span>${item.label}</span>`;
    if (isMailto) {
      // Для mailto не открываем в новой вкладке, чтобы не появлялась пустая страница
      return `<a class="btn btn-brand" href="${item.href}">${base}</a>`;
    }
    return `<a class="btn btn-brand" href="${item.href}" target="_blank" rel="noopener noreferrer">${base}</a>`;
  }

  async function init() {
    const mount = document.getElementById('contacts-buttons');
    if (!mount) return;
    
    try {
      const res = await fetch(CONTACTS_JSON, { cache: 'no-store' });
      const items = await res.json();
      
      // Wait for icons to be loaded if they're not ready yet
      if (!window.CGS || !window.CGS.icons || Object.keys(window.CGS.icons).length === 0) {
        await new Promise(resolve => {
          if (window.CGS && Object.keys(window.CGS.icons).length > 0) {
            resolve();
          } else {
            window.addEventListener('iconsLoaded', resolve, { once: true });
          }
        });
      }
      
      mount.innerHTML = items.map(brandButton).join('');
      mount.removeAttribute('data-loading');
    } catch (e) {
      console.error('Failed to render contacts:', e);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


