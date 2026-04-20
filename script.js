/* ================================================================
   CTW Cargo — Design System Docs · script.js
   ================================================================ */

// ── Sidebar ────────────────────────────────────────────────────
const sidebar   = document.getElementById('sidebar');
const overlay   = document.getElementById('sidebarOverlay');
const hamburger = document.getElementById('menuToggle');

hamburger?.addEventListener('click', () => toggleSidebar());
overlay?.addEventListener('click', () => closeSidebar());

function toggleSidebar() {
  const open = sidebar.classList.toggle('open');
  overlay.classList.toggle('show', open);
  document.body.style.overflow = open ? 'hidden' : '';
}
function closeSidebar() {
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
  document.body.style.overflow = '';
}

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeSidebar();
    closeAllDropdowns();
  }
});

// ── Active Nav (IntersectionObserver) ─────────────────────────
const navLinks   = document.querySelectorAll('.nav-link[data-section]');
const sections   = document.querySelectorAll('.ds-section');
const breadcrumb = document.getElementById('breadcrumb');

const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) activateNav(entry.target.id);
  });
}, { rootMargin: '-15% 0px -65% 0px' });

sections.forEach(s => io.observe(s));

function activateNav(id) {
  navLinks.forEach(link => {
    const active = link.dataset.section === id;
    link.classList.toggle('active', active);
    if (active && breadcrumb) breadcrumb.textContent = link.textContent.trim();
  });
}

// Nav click
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    gotoSection(link.dataset.section);
    if (window.innerWidth <= 820) closeSidebar();
  });
});

function gotoSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}
window.gotoSection = gotoSection; // expose for inline onclick

// ── Toast ───────────────────────────────────────────────────────
const toast    = document.getElementById('toast');
const toastMsg = document.getElementById('toast-msg');
let toastTimer;

function showToast(msg = 'Copied!') {
  toastMsg.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
}

// ── Copy ────────────────────────────────────────────────────────
function copyText(text, btn) {
  navigator.clipboard?.writeText(text).catch(() => fallbackCopy(text));
  if (btn) {
    const orig = btn.textContent;
    btn.textContent = '✓ Copied';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 2000);
  }
  showToast('Copied to clipboard!');
}
window.copyText = copyText;

function fallbackCopy(text) {
  const ta = Object.assign(document.createElement('textarea'), {
    value: text, style: 'position:fixed;opacity:0'
  });
  document.body.appendChild(ta);
  ta.select(); document.execCommand('copy');
  document.body.removeChild(ta);
}

// Code block copy buttons
document.querySelectorAll('.cb-copy').forEach(btn => {
  btn.addEventListener('click', () => copyText(btn.dataset.copy, btn));
});

// Semantic / neutral item click (inline onclick handler)
function copyHex(el) {
  const hex = el.dataset.hex;
  if (hex) { copyText(hex); showToast(`Copied ${hex}`); }
}

// Color swatch click — copy hex if available, else copy Figma style name
document.querySelectorAll('.swatch').forEach(swatch => {
  swatch.addEventListener('click', () => {
    const hex = swatch.dataset.hex;
    const styleName = swatch.dataset.style;
    if (hex) {
      copyText(hex);
      showToast(`Copied ${hex}`);
    } else if (styleName) {
      copyText(styleName);
      showToast(`Copied style name`);
    }
  });
});

// ── Radio Group interaction ──────────────────────────────────────
document.querySelectorAll('.rdo-btn:not(.rdo-dis):not(.rdo-static)').forEach(btn => {
  btn.addEventListener('click', () => {
    const label = btn.closest('[data-radio-group]');
    const groupId = label?.dataset.radioGroup;
    if (groupId) {
      // Deselect all in same group
      document.querySelectorAll(`[data-radio-group="${groupId}"] .rdo-btn`).forEach(r => {
        r.classList.remove('selected');
        r.setAttribute('aria-checked', 'false');
      });
    }
    btn.classList.add('selected');
    btn.setAttribute('aria-checked', 'true');
  });
  btn.addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); btn.click(); }
  });
});

// ── Checkbox interaction ─────────────────────────────────────────
function syncParentCheckbox(parentId) {
  const parentLabel = document.getElementById(parentId);
  if (!parentLabel) return;
  const parentBtn = parentLabel.querySelector('.chk-btn');
  const childrenWrap = document.querySelector(`.chk-children[data-parent="${parentId}"]`);
  if (!childrenWrap || !parentBtn) return;
  const children = childrenWrap.querySelectorAll('.chk-btn:not(.chk-dis):not(.chk-static)');
  const checkedCount = [...children].filter(c => c.classList.contains('selected')).length;
  parentBtn.classList.remove('selected', 'indeterminate');
  if (checkedCount === 0) {
    parentBtn.setAttribute('aria-checked', 'false');
  } else if (checkedCount === children.length) {
    parentBtn.classList.add('selected');
    parentBtn.setAttribute('aria-checked', 'true');
  } else {
    parentBtn.classList.add('indeterminate');
    parentBtn.setAttribute('aria-checked', 'mixed');
  }
}

// Parent checkbox click — toggles all children
document.querySelectorAll('.chk-parent .chk-btn:not(.chk-dis):not(.chk-static)').forEach(btn => {
  btn.addEventListener('click', () => {
    const parentLabel = btn.closest('.chk-parent');
    const parentId = parentLabel?.id;
    const childrenWrap = document.querySelector(`.chk-children[data-parent="${parentId}"]`);
    if (!childrenWrap) return;
    const children = childrenWrap.querySelectorAll('.chk-btn:not(.chk-dis):not(.chk-static)');
    const allChecked = [...children].every(c => c.classList.contains('selected'));
    children.forEach(c => {
      if (allChecked) {
        c.classList.remove('selected');
        c.setAttribute('aria-checked', 'false');
      } else {
        c.classList.add('selected');
        c.setAttribute('aria-checked', 'true');
      }
    });
    syncParentCheckbox(parentId);
  });
  btn.addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); btn.click(); }
  });
});

// Child checkbox click
document.querySelectorAll('.chk-child .chk-btn:not(.chk-dis):not(.chk-static)').forEach(btn => {
  btn.addEventListener('click', () => {
    const isSelected = btn.classList.toggle('selected');
    btn.classList.remove('indeterminate');
    btn.setAttribute('aria-checked', String(isSelected));
    const childrenWrap = btn.closest('.chk-children');
    if (childrenWrap?.dataset.parent) syncParentCheckbox(childrenWrap.dataset.parent);
  });
  btn.addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); btn.click(); }
  });
});

// ── Toggle interaction ───────────────────────────────────────────
document.querySelectorAll('.tgl-track:not(.tgl-disabled):not(.tgl-static)').forEach(track => {
  track.addEventListener('click', () => {
    const isActive = track.classList.toggle('active');
    track.setAttribute('aria-checked', String(isActive));
  });
  track.addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      track.click();
    }
  });
});

// Typography variant row click — copy Figma style path
document.querySelectorAll('.tsv-row').forEach(row => {
  row.addEventListener('click', () => {
    const stylePath = row.dataset.style;
    if (stylePath) {
      copyText(stylePath);
      showToast(`Copied: ${stylePath}`);
    }
  });
});

// ── Dropdown ────────────────────────────────────────────────────
function toggleDD(wrapperId) {
  const wrap = document.getElementById(wrapperId);
  const menu = document.getElementById(wrapperId + '-menu');
  if (!wrap || !menu) return;

  const willOpen = !menu.classList.contains('open');
  closeAllDropdowns();
  if (willOpen) {
    menu.classList.add('open');
    wrap.classList.add('is-open');
  }
}
window.toggleDD = toggleDD;

function closeAllDropdowns() {
  document.querySelectorAll('.dd-menu.open').forEach(m => {
    m.classList.remove('open');
    m.closest('.dd-wrap')?.classList.remove('is-open');
  });
}

document.addEventListener('click', e => {
  if (!e.target.closest('.dd-wrap')) closeAllDropdowns();
});

// Dropdown item selection
document.querySelectorAll('.dd-item:not(.dd-item-danger)').forEach(item => {
  item.addEventListener('click', () => {
    const menu = item.closest('.dd-menu');
    const wrap = item.closest('.dd-wrap');
    const trigger = wrap?.querySelector('.dd-trigger');

    // Update active state
    menu?.querySelectorAll('.dd-item').forEach(i => i.classList.remove('dd-item-active'));
    item.classList.add('dd-item-active');

    // Update trigger label (only for select-style dropdown)
    const sel = trigger?.querySelector('.dd-selected-text');
    if (sel) sel.textContent = item.textContent.trim();

    closeAllDropdowns();
  });
});

// ── Tab Interactivity ────────────────────────────────────────────
// Underline tabs
document.querySelectorAll('.tabs-ul').forEach(list => {
  list.querySelectorAll('.tab-ul:not(:disabled)').forEach(tab => {
    tab.addEventListener('click', () => {
      list.querySelectorAll('.tab-ul').forEach(t => t.classList.remove('tab-ul-active'));
      tab.classList.add('tab-ul-active');
    });
  });
});

// Pill tabs
document.querySelectorAll('.tabs-pill').forEach(list => {
  list.querySelectorAll('.tab-pill:not(:disabled)').forEach(tab => {
    tab.addEventListener('click', () => {
      list.querySelectorAll('.tab-pill').forEach(t => t.classList.remove('tab-pill-active'));
      tab.classList.add('tab-pill-active');
    });
  });
});

// ══════════════════════════════════════════════════════════════
// ── SEARCH ────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════

/* ── Search Index ─────────────────────────────────────────────
   Each entry: { id, title, desc, tags[], category, icon, color? }
   id → maps to <section id="..."> to scroll to
─────────────────────────────────────────────────────────────── */
const SEARCH_INDEX = [
  // ── Getting Started
  {
    id: 'overview', title: 'Overview', category: 'Getting Started',
    desc: 'หน้าแรก · Components, Foundation, Figma Integration',
    tags: ['overview', 'home', 'intro', 'start', 'หน้าแรก'],
    icon: 'started',
    svg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>`
  },
  {
    id: 'figma-connect', title: 'Figma Integration', category: 'Getting Started',
    desc: 'VS Code Extension · Code Connect · Publish mapping',
    tags: ['figma', 'vscode', 'code connect', 'plugin', 'integration', 'เชื่อมต่อ', 'extension'],
    icon: 'started',
    svg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"/><path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"/><path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"/><path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"/><path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"/></svg>`
  },

  // ── Foundation
  {
    id: 'colors', title: 'Colors', category: 'Foundation',
    desc: 'Primary Cargo · Semantic · Text — CSS color tokens',
    tags: ['color', 'palette', 'token', 'primary', 'สี', 'hex', 'css variable'],
    icon: 'foundation',
    svg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10"/><line x1="2" y1="12" x2="22" y2="12"/></svg>`
  },
  {
    id: 'typography', title: 'Typography', category: 'Foundation',
    desc: 'Display · H1–H3 · Body · Button · Caption — type scale',
    tags: ['typography', 'font', 'type', 'heading', 'body', 'text', 'ตัวอักษร', 'inter', 'scale'],
    icon: 'foundation',
    svg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>`
  },
  {
    id: 'spacing', title: 'Spacing', category: 'Foundation',
    desc: '4px base unit · --space-1 ถึง --space-16 · layout tokens',
    tags: ['spacing', 'space', 'margin', 'padding', 'gap', 'layout', 'ระยะห่าง', 'token'],
    icon: 'foundation',
    svg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 3H3"/><path d="M21 21H3"/><path d="M12 7v10"/><path d="M8 11l4-4 4 4"/></svg>`
  },

  // ── Components
  {
    id: 'buttons', title: 'Button', category: 'Components',
    desc: 'Primary · Secondary · Ghost · Danger · Gradient · Sizes · States',
    tags: ['button', 'btn', 'primary', 'secondary', 'ghost', 'danger', 'gradient', 'ปุ่ม', 'click'],
    icon: 'component',
    svg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="7" width="20" height="10" rx="5"/></svg>`
  },
  {
    id: 'badge', title: 'Badge', category: 'Components',
    desc: 'Filled · Outlined · Dot — status labels และ count',
    tags: ['badge', 'label', 'tag', 'status', 'chip', 'count', 'ป้าย', 'dot', 'success', 'error'],
    icon: 'component',
    svg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>`
  },
  {
    id: 'avatar', title: 'Avatar', category: 'Components',
    desc: 'XS · SM · MD · LG · XL · Colors · Group — user identity',
    tags: ['avatar', 'profile', 'user', 'image', 'group', 'initials', 'ผู้ใช้'],
    icon: 'component',
    svg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
  },
  {
    id: 'tabs', title: 'Tab', category: 'Components',
    desc: 'Underline · Pill — navigation และ content switcher',
    tags: ['tab', 'tabs', 'navigation', 'pill', 'underline', 'switch', 'แท็บ'],
    icon: 'component',
    svg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 3H5a2 2 0 0 0-2 2v4"/><path d="M9 3h6"/><path d="M15 3h4a2 2 0 0 1 2 2v4"/><rect x="3" y="9" width="18" height="12" rx="2"/></svg>`
  },
  {
    id: 'inputs', title: 'Input', category: 'Components',
    desc: 'TextField · TextArea · Error · Success · Disabled — form elements',
    tags: ['input', 'textfield', 'textarea', 'form', 'field', 'error', 'placeholder', 'ช่องกรอก'],
    icon: 'component',
    svg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="5" width="18" height="14" rx="2"/><line x1="7" y1="12" x2="7.01" y2="12" stroke-linecap="round" stroke-width="3"/></svg>`
  },
  {
    id: 'dropdown', title: 'Dropdown', category: 'Components',
    desc: 'Trigger · ListItem · Action menu — select และ options',
    tags: ['dropdown', 'select', 'menu', 'options', 'list', 'trigger', 'เมนู'],
    icon: 'component',
    svg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 9l6 6 6-6"/></svg>`
  },
  {
    id: 'divider', title: 'Divider', category: 'Components',
    desc: 'Horizontal · Vertical · With Label — separators',
    tags: ['divider', 'separator', 'line', 'horizontal', 'vertical', 'hr', 'เส้นแบ่ง'],
    icon: 'component',
    svg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="7" y2="6" opacity=".4"/></svg>`
  },

  // ── Color tokens — Figma Color Styles
  { id: 'colors', title: 'primaryCargoPrimaryCargo_800 · #3B509E', category: 'Color Token',
    desc: 'Primary Cargo / 800 · base brand color · --color-primary-800', tags: ['3b509e','primary 800','800','blue','indigo','base'], icon: 'color', hex: '#3B509E' },
  { id: 'colors', title: 'primaryCargoPrimaryCargo_950 · #1E2F6E', category: 'Color Token',
    desc: 'Primary Cargo / 950 · --color-primary-950', tags: ['1e2f6e','primary 950','950','dark blue'], icon: 'color', hex: '#1E2F6E' },
  { id: 'colors', title: 'primaryCargoPrimaryCargo_700 · #546BC0', category: 'Color Token',
    desc: 'Primary Cargo / 700 · --color-primary-700', tags: ['546bc0','primary 700','700'], icon: 'color', hex: '#546BC0' },
  { id: 'colors', title: 'primaryCargoPrimaryCargo_600 · #7189E2', category: 'Color Token',
    desc: 'Primary Cargo / 600 · --color-primary-600', tags: ['7189e2','primary 600','600'], icon: 'color', hex: '#7189E2' },
  { id: 'colors', title: 'primaryCargoPrimaryCargo_500 · #8FA6FF', category: 'Color Token',
    desc: 'Primary Cargo / 500 · --color-primary-500', tags: ['8fa6ff','primary 500','500','light blue'], icon: 'color', hex: '#8FA6FF' },
  { id: 'colors', title: 'primaryCargoPrimaryCargo_200 · #DAE2FF', category: 'Color Token',
    desc: 'Primary Cargo / 200 · --color-primary-200', tags: ['dae2ff','primary 200','200'], icon: 'color', hex: '#DAE2FF' },
  { id: 'colors', title: 'primaryCargoPrimaryCargo_100 · #EDF0FF', category: 'Color Token',
    desc: 'Primary Cargo / 100 · --color-primary-100', tags: ['edf0ff','primary 100','100'], icon: 'color', hex: '#EDF0FF' },
  { id: 'colors', title: 'primaryCargoPrimaryCargo_50 · #F5F7FF', category: 'Color Token',
    desc: 'Primary Cargo / 50 · --color-primary-50', tags: ['f5f7ff','primary 50','50'], icon: 'color', hex: '#F5F7FF' },
  { id: 'colors', title: 'TEXT_COLOR_TEXT · #28293D', category: 'Color Token',
    desc: 'Text / TEXT_COLOR_TEXT · main text color · --color-text', tags: ['28293d','text','dark','text color'], icon: 'color', hex: '#28293D' },
  { id: 'colors', title: 'TEXT_COLOR_DESCRIPTION · #8F90A6', category: 'Color Token',
    desc: 'Text / TEXT_COLOR_DESCRIPTION · secondary text · --color-text-desc', tags: ['8f90a6','description','muted','text description'], icon: 'color', hex: '#8F90A6' },
  { id: 'colors', title: 'LIGHT_COLOR_LIGHT_BG · #FFFFFF', category: 'Color Token',
    desc: 'Light / LIGHT_COLOR_LIGHT_BG · background · --color-bg', tags: ['ffffff','white','background','light bg'], icon: 'color', hex: '#FFFFFF' },
  { id: 'colors', title: 'Gardient — Primary Cargo gradient', category: 'Color Token',
    desc: 'Primary Cargo / Gardient / Gardient · linear-gradient(135deg, #27397c, #4768e2)', tags: ['gradient','gardient','primary','blue'], icon: 'color', hex: null, gradient: 'linear-gradient(135deg, #27397c, #4768e2)' },

  // ── Furcargo
  { id: 'colors', title: 'Furcargo Primary_800Base · #0e3151', category: 'Color Token',
    desc: 'Furcargo / Primary / Primary_800Base · base color', tags: ['0e3151','furcargo','primary','800','dark navy'], icon: 'color', hex: '#0e3151' },
  { id: 'colors', title: 'Furcargo Primary_950 · #0f2543', category: 'Color Token',
    desc: 'Furcargo / Primary / Primary_950', tags: ['0f2543','furcargo','primary','950'], icon: 'color', hex: '#0f2543' },
  { id: 'colors', title: 'Furcargo Primary_700 · #304b71', category: 'Color Token',
    desc: 'Furcargo / Primary / Primary_700', tags: ['304b71','furcargo','primary','700'], icon: 'color', hex: '#304b71' },
  { id: 'colors', title: 'Furcargo Primary_500 · #647894', category: 'Color Token',
    desc: 'Furcargo / Primary / Primary_500', tags: ['647894','furcargo','primary','500','steel blue'], icon: 'color', hex: '#647894' },
  { id: 'colors', title: 'Furcargo Primary_50 · #e5e9ed', category: 'Color Token',
    desc: 'Furcargo / Primary / Primary_50', tags: ['e5e9ed','furcargo','primary','50','light'], icon: 'color', hex: '#e5e9ed' },
  { id: 'colors', title: 'Furcargo Secondary_400Base · #ca915f', category: 'Color Token',
    desc: 'Furcargo / Secondary / Second_400Base · base accent color', tags: ['ca915f','furcargo','secondary','400','brown','sand'], icon: 'color', hex: '#ca915f' },
  { id: 'colors', title: 'Furcargo Secondary_950 · #443120', category: 'Color Token',
    desc: 'Furcargo / Secondary / Second_950', tags: ['443120','furcargo','secondary','950','dark brown'], icon: 'color', hex: '#443120' },
  { id: 'colors', title: 'Furcargo Secondary_50 · #fff7ef', category: 'Color Token',
    desc: 'Furcargo / Secondary / Second_50', tags: ['fff7ef','furcargo','secondary','50','cream'], icon: 'color', hex: '#fff7ef' },
];

/* ── Search engine ────────────────────────────────────────────── */
function searchQuery(q) {
  if (!q || q.trim().length < 1) return [];
  const lower = q.toLowerCase().trim();

  return SEARCH_INDEX.filter(item => {
    const haystack = [
      item.title, item.desc, item.category, ...(item.tags || [])
    ].join(' ').toLowerCase();
    return haystack.includes(lower);
  });
}

/* Highlight matched substring */
function highlight(text, q) {
  if (!q) return text;
  const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${safe})`, 'gi'), '<mark>$1</mark>');
}

/* ── DOM refs ─────────────────────────────────────────────────── */
const backdrop      = document.getElementById('searchBackdrop');
const searchInput   = document.getElementById('searchInput');
const searchClear   = document.getElementById('searchClear');
const searchEmpty   = document.getElementById('searchEmpty');
const searchNoResult = document.getElementById('searchNoResult');
const searchNRQuery = document.getElementById('searchNoResultQuery');
const searchResults = document.getElementById('searchResults');

let activeIdx = -1;   // keyboard-nav cursor

/* ── Open / Close ─────────────────────────────────────────────── */
function openSearch() {
  backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => searchInput?.focus(), 60);
  renderResults('');   // show empty state
}
window.openSearch = openSearch;

function closeSearch() {
  backdrop.classList.remove('open');
  document.body.style.overflow = '';
  searchInput.value = '';
  searchClear.classList.remove('visible');
  renderResults('');   // reset
  activeIdx = -1;
}

/* Backdrop click closes */
backdrop?.addEventListener('click', e => {
  if (e.target === backdrop) closeSearch();
});

/* ── Keyboard shortcut: ⌘K / Ctrl+K ──────────────────────────── */
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    backdrop.classList.contains('open') ? closeSearch() : openSearch();
  }
  if (e.key === 'Escape' && backdrop.classList.contains('open')) {
    closeSearch();
  }
});

/* ── Live search as user types ────────────────────────────────── */
searchInput?.addEventListener('input', () => {
  const q = searchInput.value;
  searchClear.classList.toggle('visible', q.length > 0);
  activeIdx = -1;
  renderResults(q);
});

/* Clear button */
searchClear?.addEventListener('click', () => {
  searchInput.value = '';
  searchClear.classList.remove('visible');
  searchInput.focus();
  activeIdx = -1;
  renderResults('');
});

/* ── Keyboard navigation ──────────────────────────────────────── */
searchInput?.addEventListener('keydown', e => {
  const items = searchResults.querySelectorAll('.sr-item');

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    activeIdx = Math.min(activeIdx + 1, items.length - 1);
    updateActive(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    activeIdx = Math.max(activeIdx - 1, 0);
    updateActive(items);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    const active = items[activeIdx] || items[0];
    active?.click();
  }
});

function updateActive(items) {
  items.forEach((el, i) => {
    el.classList.toggle('sr-active', i === activeIdx);
  });
  items[activeIdx]?.scrollIntoView({ block: 'nearest' });
}

/* ── Render results ───────────────────────────────────────────── */
function renderResults(q) {
  const trimmed = q.trim();

  if (!trimmed) {
    // Empty state
    searchEmpty.style.display = '';
    searchNoResult.style.display = 'none';
    searchResults.style.display = 'none';
    return;
  }

  const hits = searchQuery(trimmed);

  if (hits.length === 0) {
    searchEmpty.style.display = 'none';
    searchNoResult.style.display = '';
    searchResults.style.display = 'none';
    searchNRQuery.textContent = `"${trimmed}"`;
    return;
  }

  // Group results by category
  const groups = {};
  hits.forEach(item => {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
  });

  const categoryOrder = ['Getting Started', 'Foundation', 'Components', 'Color Token'];

  let html = '';
  let first = true;

  categoryOrder.forEach(cat => {
    if (!groups[cat]) return;
    if (!first) html += '<div class="sr-sep"></div>';
    first = false;

    html += `<div class="sr-group">`;
    html += `<div class="sr-group-label">${cat}</div>`;

    groups[cat].forEach(item => {
      const titleHL = highlight(item.title, trimmed);
      const descHL  = highlight(item.desc,  trimmed);

      /* Icon element */
      let iconEl = '';
      if (item.gradient) {
        iconEl = `<div class="sr-color-dot" style="background:${item.gradient};border-radius:var(--r-md)"></div>`;
      } else if (item.hex) {
        iconEl = `<div class="sr-color-dot" style="background:${item.hex};border-radius:var(--r-md);${item.hex==='#FFFFFF'?'border:1px solid #e0e0e0':''}"></div>`;
      } else {
        const bgClass = item.icon === 'foundation' ? 'ic-foundation'
                      : item.icon === 'started'    ? 'ic-started'
                      : 'ic-component';
        iconEl = `<div class="sr-icon ${bgClass}">${item.svg || ''}</div>`;
      }

      html += `
        <div class="sr-item" data-section="${item.id}" tabindex="-1">
          ${iconEl}
          <div class="sr-body">
            <div class="sr-title">${titleHL}</div>
            <div class="sr-desc">${descHL}</div>
          </div>
          <span class="sr-tag">${item.category}</span>
          <svg class="sr-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </div>`;
    });

    html += `</div>`;
  });

  searchResults.innerHTML = html;
  searchResults.style.display = '';
  searchNoResult.style.display = 'none';
  searchEmpty.style.display = 'none';

  /* Attach click handlers */
  searchResults.querySelectorAll('.sr-item').forEach(el => {
    el.addEventListener('click', () => {
      const sectionId = el.dataset.section;
      closeSearch();
      setTimeout(() => gotoSection(sectionId), 120);
    });
    el.addEventListener('mouseenter', () => {
      const items = searchResults.querySelectorAll('.sr-item');
      activeIdx = [...items].indexOf(el);
      updateActive(items);
    });
  });
}

// ── TextArea Rich Text Editor ───────────────────────────────
/* Toggle toolbar on/off */
document.querySelectorAll('.tf-rte-toggle').forEach(toggleBtn => {
  toggleBtn.addEventListener('click', () => {
    const wrap     = toggleBtn.closest('.tf-wrap');
    const rteWrap  = wrap.querySelector('.tf-rte-wrap');
    const bar      = rteWrap.querySelector('.tf-rte-bar');
    const content  = rteWrap.querySelector('.tf-rte-content');
    const wasActive = bar.classList.contains('active');

    bar.classList.toggle('active', !wasActive);
    toggleBtn.classList.toggle('active', !wasActive);
    toggleBtn.setAttribute('aria-pressed', String(!wasActive));

    const lbl = toggleBtn.querySelector('.tf-rte-lbl');
    if (!wasActive) {
      content.contentEditable = 'true';
      content.focus();
      if (lbl) lbl.textContent = 'ปิด Editor';
    } else {
      content.contentEditable = 'false';
      if (lbl) lbl.textContent = 'Text Editor';
    }
  });
});

/* Toolbar command buttons — preventDefault keeps focus in the editable area */
document.querySelectorAll('.tf-rte-btn').forEach(btn => {
  btn.addEventListener('mousedown', e => {
    e.preventDefault();
    document.execCommand(btn.dataset.cmd, false, btn.dataset.val ?? null);
    syncRteBar(btn.closest('.tf-rte-bar'));
  });
});

/* Highlight active toolbar buttons based on cursor state */
function syncRteBar(bar) {
  if (!bar) return;
  bar.querySelectorAll('[data-cmd]').forEach(btn => {
    try {
      btn.classList.toggle('tf-rte-active', document.queryCommandState(btn.dataset.cmd));
    } catch (_) {}
  });
}

document.addEventListener('selectionchange', () => {
  document.querySelectorAll('.tf-rte-bar.active').forEach(bar => syncRteBar(bar));
});

// ── Section Preview / Code Tabs ─────────────────────────────
(function initSectionTabs() {
  const PREVIEW_ICO = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`;
  const CODE_ICO    = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`;

  document.querySelectorAll('.ds-section').forEach(section => {
    /* Only sections that have direct-child .comp-block elements */
    const compBlocks = [...section.querySelectorAll(':scope > .comp-block')];
    if (!compBlocks.length) return;
    const codeBlock = section.querySelector(':scope > .codeblock');

    /* ── Tab nav ── */
    const tabNav = document.createElement('div');
    tabNav.className = 'sec-tab-nav';
    tabNav.innerHTML = `
      <button class="sec-tab-btn active" data-pane="preview">${PREVIEW_ICO} Preview</button>
      <button class="sec-tab-btn"        data-pane="code">${CODE_ICO} Code</button>`;

    /* ── Preview pane (holds all comp-blocks) ── */
    const previewPane = document.createElement('div');
    previewPane.className = 'sec-pane';
    previewPane.dataset.pane = 'preview';
    compBlocks.forEach(b => previewPane.appendChild(b));

    /* ── Code pane (holds the codeblock) ── */
    const codePane = document.createElement('div');
    codePane.className = 'sec-pane hidden';
    codePane.dataset.pane = 'code';
    if (codeBlock) codePane.appendChild(codeBlock);

    /* Insert after the last header-like direct child (section-header > section-desc > section-title) */
    const anchor =
      section.querySelector(':scope > .section-header') ||
      section.querySelector(':scope > .section-desc')   ||
      section.querySelector(':scope > .section-title');
    anchor.after(tabNav, previewPane, codePane);

    /* ── Click handler ── */
    tabNav.querySelectorAll('.sec-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        tabNav.querySelectorAll('.sec-tab-btn').forEach(b => b.classList.remove('active'));
        section.querySelectorAll(':scope > .sec-pane').forEach(p => p.classList.add('hidden'));
        btn.classList.add('active');
        const target = section.querySelector(`:scope > .sec-pane[data-pane="${btn.dataset.pane}"]`);
        if (target) target.classList.remove('hidden');
      });
    });
  });
})();
