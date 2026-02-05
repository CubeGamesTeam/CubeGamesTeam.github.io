// Components for store and social buttons
(function() {
  // Store button component
  function storeButton(platform, href, label = null) {
    if (!window.CGS || !window.CGS.icons || !window.CGS.icons[platform]) {
      return `<a href="${href}" class="btn btn-store" target="_blank" rel="noopener noreferrer">${label || platform}</a>`;
    }
    
    const icon = window.CGS.icons[platform];
    const displayLabel = label || platform;
    return `<a href="${href}" class="btn btn-store" target="_blank" rel="noopener noreferrer">${icon}<span>${displayLabel}</span></a>`;
  }

  // Social media button component
  function socialButton(platform, href, label = null) {
    if (!window.CGS || !window.CGS.icons || !window.CGS.icons[platform]) {
      return `<a href="${href}" class="btn btn-social" target="_blank" rel="noopener noreferrer">${label || platform}</a>`;
    }
    
    const icon = window.CGS.icons[platform];
    const displayLabel = label || platform;
    return `<a href="${href}" class="btn btn-social" target="_blank" rel="noopener noreferrer">${icon}<span>${displayLabel}</span></a>`;
  }

  // Wait for icons to be loaded
  async function waitForIcons() {
    if (!window.CGS || !window.CGS.icons || Object.keys(window.CGS.icons).length === 0) {
      await new Promise(resolve => {
        if (window.CGS && Object.keys(window.CGS.icons).length > 0) {
          resolve();
        } else {
          window.addEventListener('iconsLoaded', resolve, { once: true });
        }
      });
    }
  }

  // Export components
  window.CGS = window.CGS || {};
  window.CGS.components = {
    storeButton,
    socialButton,
    waitForIcons
  };
})();


