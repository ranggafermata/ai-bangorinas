// Auth guard — protect pages and gated content behind login
(function () {
  // Redirect to login if not authenticated (for protected pages)
  function requireAuth() {
    initFirebase();
    onAuthChanged(user => {
      if (!user) {
        const returnUrl = encodeURIComponent(window.location.href);
        window.location.href = `login.html?redirect=${returnUrl}`;
      }
    });
  }

  // Show/hide elements based on auth state
  function initAuthGating() {
    initFirebase();
    onAuthChanged(user => {
      // Elements shown only when logged in
      document.querySelectorAll('[data-auth="required"]').forEach(el => {
        el.classList.toggle('hidden', !user);
      });
      // Elements shown only when logged out
      document.querySelectorAll('[data-auth="guest"]').forEach(el => {
        el.classList.toggle('hidden', !!user);
      });
    });
  }

  // Expose globally
  window.requireAuth = requireAuth;
  window.initAuthGating = initAuthGating;
})();
