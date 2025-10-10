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

    // Move indicator
    const indicator = bottomNav.querySelector('.bottom-indicator');
    if (indicator && bottomActive) {
      const linkRect = bottomActive.getBoundingClientRect();
      const navRect = bottomNav.getBoundingClientRect();
      const left = linkRect.left - navRect.left + (linkRect.width - 44) / 2;
      indicator.style.left = `${left}px`;
    }
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
  // Initialize indicator position
  const activeBottom = document.querySelector('.bottom-nav .nav-link.active')
    || document.querySelector('.bottom-nav .nav-link');
  if (activeBottom) {
    const sectionId = activeBottom.dataset.section;
    if (sectionId) activateSection(sectionId);
  }
});

window.addEventListener('hashchange', () => {
  activateSection(getSectionIdFromHash());
});

// No sidebar drawer on mobile anymore; using bottom nav

// Chat slider logic
const chatFab = document.querySelector('.chat-fab');
const chatPanel = document.querySelector('.chat-panel');
const chatClose = document.querySelector('.chat-close');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-text');
const chatMessages = document.getElementById('chat-messages');

function addMessage(text, role = 'user') {
  const div = document.createElement('div');
  div.className = `chat-message ${role}`;
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function toggleChat(open) {
  if (!chatPanel) return;
  if (open) {
    chatPanel.hidden = false;
    requestAnimationFrame(() => chatPanel.classList.add('open'));
    setTimeout(() => chatInput && chatInput.focus(), 200);
  } else {
    chatPanel.classList.remove('open');
    setTimeout(() => (chatPanel.hidden = true), 300);
  }
}

if (chatFab) chatFab.addEventListener('click', () => toggleChat(true));
if (chatClose) chatClose.addEventListener('click', () => toggleChat(false));

if (chatForm) {
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    chatInput.value = '';
    addMessage(text, 'user');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      addMessage(data.reply || 'Thanks! I will get back to you.', 'bot');
    } catch (err) {
      addMessage('Sorry, something went wrong. Please try again later.', 'bot');
    }
  });
}

// Simple click ripple on buttons
document.addEventListener('click', (e) => {
  const target = e.target.closest('.btn, .nav-link, .contact-card');
  if (!target) return;
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  const rect = target.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
  target.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
});

// Lightweight analytics (localStorage only)
function getAnalytics() {
  try {
    return JSON.parse(localStorage.getItem('analytics') || '{}');
  } catch {
    return {};
  }
}

function saveAnalytics(data) {
  localStorage.setItem('analytics', JSON.stringify(data));
}

function track(event, label) {
  const data = getAnalytics();
  data.events = data.events || {};
  const key = `${event}:${label}`;
  data.events[key] = (data.events[key] || 0) + 1;
  saveAnalytics(data);
}

// Track nav clicks, contact, and buttons
document.addEventListener('click', (e) => {
  const nav = e.target.closest('.nav-link');
  if (nav && nav.dataset.section) track('click', `nav:${nav.dataset.section}`);

  const contact = e.target.closest('.contact-card');
  if (contact) {
    const title = contact.querySelector('.title')?.textContent?.trim() || 'contact';
    track('click', `contact:${title}`);
  }

  const btn = e.target.closest('.btn');
  if (btn) {
    const text = btn.textContent.trim().toLowerCase();
    track('click', `btn:${text}`);
  }
});

// Track section impressions
const impressed = new Set();
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const id = entry.target.id || 'section';
      if (!impressed.has(id)) {
        impressed.add(id);
        track('impression', id);
      }
    }
  });
}, { threshold: 0.35 });

sections.forEach((s) => io.observe(s));

// Track visit
track('visit', 'page');
