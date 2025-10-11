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

// Prevent footer overlap with bottom bar by adding spacer on mobile
function updateFooterSpacer() {
  const content = document.querySelector('.content');
  const bottom = document.querySelector('.bottom-nav');
  if (!content || !bottom) return;
  const isMobile = getComputedStyle(bottom).display !== 'none';
  content.style.paddingBottom = isMobile ? `calc(var(--bottom-nav-height) + 16px + env(safe-area-inset-bottom))` : '';
}
window.addEventListener('resize', updateFooterSpacer);
window.addEventListener('DOMContentLoaded', updateFooterSpacer);

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
  // Theme init
  try {
    const pref = localStorage.getItem('theme') || 'dark';
    setTheme(pref);
  } catch {}
  // Enable smooth theme transition after first paint
  requestAnimationFrame(() => {
    document.querySelector('.app')?.classList.add('theme-anim');
  });
  // Set footer year
  const y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());
});

window.addEventListener('hashchange', () => {
  activateSection(getSectionIdFromHash());
});

// Recalculate bottom indicator on resize/orientation
window.addEventListener('resize', () => {
  const active = document.querySelector('.bottom-nav .nav-link.active');
  if (active) {
    const id = active.dataset.section;
    if (id) activateSection(id);
  }
});

// No sidebar drawer on mobile anymore; using bottom nav

// Chat slider logic
const chatFab = document.querySelector('.chat-fab');
const chatPanel = document.querySelector('.chat-panel');
const chatClose = document.querySelector('.chat-close');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-text');
const chatMessages = document.getElementById('chat-messages');
const chatTyping = document.getElementById('chat-typing');
const chatScrollBottom = document.getElementById('chat-scroll-bottom');
const chatClear = document.querySelector('.chat-clear');
const chatSettingsBtn = document.querySelector('.chat-settings');
const chatSettingsPanel = document.getElementById('chat-settings-panel');
const chatApiKeyInput = document.getElementById('chat-api-key');
const chatSaveKey = document.getElementById('save-key');
const chatStatus = document.getElementById('chat-status');

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
if (chatClear) chatClear.addEventListener('click', () => {
  chatMessages.innerHTML = '';
});
if (chatSettingsBtn) chatSettingsBtn.addEventListener('click', () => {
  const opened = !chatSettingsPanel.hidden;
  chatSettingsPanel.hidden = opened;
});
if (chatSaveKey) chatSaveKey.addEventListener('click', () => {
  const key = chatApiKeyInput.value.trim();
  if (key) {
    localStorage.setItem('openai_key', key);
    chatStatus.textContent = 'Online';
  }
});

if (chatForm) {
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    chatInput.value = '';
    addMessage(text, 'user');
    const key = localStorage.getItem('openai_key');
    if (!key) {
      addMessage('Please add your OpenAI API key in settings ⚙ to chat.', 'bot');
      return;
    }
    try {
      chatTyping.hidden = false;
      chatStatus.textContent = 'Typing…';
      const reply = await openAiClientChat(text, key);
      addMessage(reply, 'bot');
    } catch (err) {
      addMessage('Sorry, something went wrong. Please try again later.', 'bot');
    } finally {
      chatTyping.hidden = true;
      chatStatus.textContent = 'Online';
    }
  });
}

// Scroll-bottom affordance
if (chatMessages && chatScrollBottom) {
  chatMessages.addEventListener('scroll', () => {
    const nearBottom = chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight < 80;
    chatScrollBottom.hidden = nearBottom;
  });
  chatScrollBottom.addEventListener('click', () => {
    chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
  });
}

// OpenAI client using fetch (no server)
async function openAiClientChat(message, apiKey) {
  const system = `You are Rajeev's AI assistant for his portfolio site. Persona: Friendly, concise, professional. Context: Full Stack Developer at Prutor.ai (@IIT Kanpur). Skills: React, Next.js, TypeScript, Node.js, MongoDB, Tailwind, Redux Toolkit. Projects: Habitix. Keep replies short (1-3 sentences).`;

  // Use Chat Completions for broad compatibility
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: message }
      ],
      temperature: 0.5,
      max_tokens: 200
    })
  });
  if (!res.ok) throw new Error('OpenAI API error');
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || 'Thanks! I will get back to you.';
}

// Contact form (dummy submit)
const cf = document.getElementById('contact-form');
const cfStatus = document.getElementById('cf-status');
if (cf) {
  cf.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = new FormData(cf);
    cfStatus.textContent = 'Sending…';
    await new Promise((r) => setTimeout(r, 800));
    cfStatus.textContent = 'Thanks! I will get back to you soon.';
    cf.reset();
  });
}

// Reveal-on-scroll
const revealEls = document.querySelectorAll('.card, .section-title, .project-card');
const ioReveal = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) {
      en.target.classList.add('in');
      ioReveal.unobserve(en.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach((el) => {
  el.classList.add('reveal');
  ioReveal.observe(el);
});

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

// Project cards: open modal with full details
const modal = document.getElementById('project-modal');
const modalBody = document.getElementById('project-modal-body');
const modalClose = document.getElementById('project-modal-close');

function openProjectModal(fromCard) {
  if (!modal || !modalBody) return;
  const title = fromCard.querySelector('h3')?.textContent?.trim() || 'Project';
  const imgSrc = fromCard.querySelector('.project-image')?.getAttribute('src');
  const desc = fromCard.querySelector('p')?.textContent?.trim() || '';
  const actions = fromCard.querySelector('.actions')?.cloneNode(true);
  modal.querySelector('#project-modal-title').textContent = title;
  modalBody.innerHTML = '';
  if (imgSrc) {
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = title;
    img.style.width = '100%';
    img.style.borderRadius = '12px';
    img.style.border = '1px solid var(--border)';
    modalBody.appendChild(img);
  }
  const p = document.createElement('p');
  p.style.margin = '12px 0 16px';
  p.textContent = desc;
  modalBody.appendChild(p);
  if (actions) modalBody.appendChild(actions);
  modal.hidden = false;
  requestAnimationFrame(() => modal.classList.add('open'));
  modal.setAttribute('aria-hidden', 'false');
}

function closeProjectModal() {
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  setTimeout(() => (modal.hidden = true), 250);
}

document.querySelectorAll('.project-card').forEach((card) => {
  card.setAttribute('tabindex', '0');
  card.addEventListener('click', (e) => {
    // Ignore clicks on action buttons
    if (e.target.closest('.actions') || e.target.closest('a')) return;
    openProjectModal(card);
  });
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openProjectModal(card);
    }
  });
});

if (modalClose) modalClose.addEventListener('click', closeProjectModal);
if (modal) modal.addEventListener('click', (e) => {
  if (e.target === modal) closeProjectModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal && !modal.hidden) closeProjectModal();
});

// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
function setTheme(mode) {
  const dark = mode === 'dark';
  document.documentElement.dataset.theme = mode;
  if (themeToggle) themeToggle.textContent = dark ? '🌙' : '☀️';
  try { localStorage.setItem('theme', mode); } catch {}
}
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme || 'dark';
    // temporarily ensure transition class is present
    const app = document.querySelector('.app');
    if (app && !app.classList.contains('theme-anim')) app.classList.add('theme-anim');
    setTheme(current === 'dark' ? 'light' : 'dark');
  });
}

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
