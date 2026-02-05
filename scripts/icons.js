// Direct icon registry for stores and socials
(function() {
  // Known brand icons mapping
  const icons = {
    steam: `<img class="icon-svg" src="assets/icons/steam.svg" alt="Steam icon">`,
    vkplay: `<img class="icon-svg" src="assets/icons/vkplay.svg" alt="VK Play icon">`,
    yandex: `<img class="icon-svg" src="assets/icons/yandex.svg" alt="Yandex Games icon">`,
    insite: `<img class="icon-svg" src="assets/icons/logo.png" alt="insite icon">`,
    rustore: `<img class="icon-svg" src="assets/icons/rustore.svg" alt="RuStore icon">`,
    googleplay: `<img class="icon-svg" src="assets/icons/googleplay.svg" alt="Google Play icon">`,
    // Add more icons as needed
  };

  // Initialize
  window.CGS = window.CGS || {};
  window.CGS.icons = icons;

  // Trigger a custom event to notify that icons are ready
  window.dispatchEvent(new CustomEvent('iconsLoaded'));
})();
