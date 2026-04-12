// Shared navigation logic
document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav toggle
  const navToggle = document.getElementById('nav-toggle');
  const navCenter = document.getElementById('nav-center');
  if (navToggle && navCenter) {
    navToggle.addEventListener('click', () => navCenter.classList.toggle('open'));
    navCenter.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => navCenter.classList.remove('open'))
    );
  }

  // Navbar background on scroll
  const mainNav = document.getElementById('main-nav');
  if (mainNav) {
    window.addEventListener('scroll', () => {
      mainNav.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  // Scroll reveal with Intersection Observer
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => revealObserver.observe(el));
  }

  // Active nav link highlighting based on current page
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-center a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkPage = href.split('/').pop().split('#')[0] || 'index.html';
    if (linkPage === currentPage) {
      link.classList.add('active');
    }
  });

  // Dynamic year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
