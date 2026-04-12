// Theme toggle — dark/light mode with localStorage persistence
(function () {
  const STORAGE_KEY = 'bangorinas-theme';

  function getPreferred() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    // Update toggle icon
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.innerHTML = theme === 'light' ? '&#9790;' : '&#9728;';
      btn.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
    });
  }

  // Apply immediately to prevent flash
  apply(getPreferred());

  // Bind toggle buttons once DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    apply(getPreferred()); // re-apply to set icon after DOM loaded
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        apply(current === 'dark' ? 'light' : 'dark');
      });
    });
  });
})();
