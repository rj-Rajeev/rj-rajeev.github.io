// Navigation between sections
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
const sidebar = document.querySelector('.sidebar');
const navToggle = document.querySelector('.nav-toggle');

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

  // Close sidebar on mobile after navigation
  if (sidebar && sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
  }
}

// Click handlers
navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    const id = link.dataset.section;
    if (id) activateSection(id);
  });
});

// Load initial section from hash
window.addEventListener('DOMContentLoaded', () => {
  activateSection(getSectionIdFromHash());
});

window.addEventListener('hashchange', () => {
  activateSection(getSectionIdFromHash());
});

// Mobile sidebar toggle
if (navToggle) {
  navToggle.addEventListener('click', () => {
    if (sidebar) sidebar.classList.toggle('open');
  });
}
