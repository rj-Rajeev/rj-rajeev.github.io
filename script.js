// Navigation between sections
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
const sidebar = document.querySelector('.sidebar');

function getSectionIdFromHash() {
  const h = window.location.hash.replace('#', '').trim();
  return h || 'about';
}

function activateSection(sectionId) {
  sections.forEach((s) => s.classList.remove('active'));
  navLinks.forEach((l) => l.classList.remove('active'));

  const target = document.getElementById(sectionId);
  if (target) target.classList.add('active');

  const activeLink = Array.from(navLinks).find(
    (l) => l.dataset.section === sectionId
  );
  if (activeLink) activeLink.classList.add('active');

  // Update hash without jumping
  if (window.location.hash !== `#${sectionId}`) {
    history.replaceState(null, '', `#${sectionId}`);
  }

  // Sync active state to bottom nav
  const bottomNav = document.querySelector('.bottom-nav');
  if (bottomNav) {
    const bottomLinks = bottomNav.querySelectorAll('.nav-link');
    bottomLinks.forEach((l) => l.classList.remove('active'));
    const bottomActive = Array.from(bottomLinks).find(
      (l) => l.dataset.section === sectionId
    );
    if (bottomActive) bottomActive.classList.add('active');
  }
}

// Click handlers
navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    const id = link.dataset.section;
    if (id) activateSection(id);
  });
});

// Bottom nav handlers
const bottomNav = document.querySelector('.bottom-nav');
if (bottomNav) {
  bottomNav.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      const id = link.dataset.section;
      if (id) activateSection(id);
    });
  });
}

// Load initial section from hash
window.addEventListener('DOMContentLoaded', () => {
  activateSection(getSectionIdFromHash());
});

window.addEventListener('hashchange', () => {
  activateSection(getSectionIdFromHash());
});

// No sidebar drawer on mobile anymore; using bottom nav
