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
document.querySelectorAll('.dd-item:not(.dd-item-danger):not(.is-disabled)').forEach(item => {
  item.addEventListener('click', () => {
    const menu = item.closest('.dd-menu');
    const wrap = item.closest('.dd-wrap');
    const trigger = wrap?.querySelector('.dd-trigger');

    // Update selected state
    menu?.querySelectorAll('.dd-item').forEach(i => i.classList.remove('is-selected'));
    item.classList.add('is-selected');

    // Update trigger label and fill state
    const sel = trigger?.querySelector('.dd-selected-text');
    if (sel) {
      sel.textContent = item.textContent.trim();
      trigger?.classList.add('dd-has-value');
    }

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

// ── Calendar Component ───────────────────────────────────────
const _CAL_MF  = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
const _CAL_MS  = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
const _CAL_DAY = ['อา','จ','อ','พ','พฤ','ศ','ส'];
const _CAL_MF_SHORT = _CAL_MS;

class CTWCalendar {
  constructor(el, opts = {}) {
    this.el        = el;
    this.mode      = opts.mode || 'single';
    this.view      = opts.view || 'date';
    this.initView  = this.view;           // remember the picker's starting view
    this.today     = new Date();
    this.cursor    = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
    this.yearBase  = Math.floor(this.cursor.getFullYear() / 12) * 12;
    this.sel       = null;
    this.rangeA    = null;
    this.rangeB    = null;
    this.hoverDate = null;                // range hover preview
    this.focusDate = new Date(this.today); // roving tabindex target
    this.onChange  = opts.onChange || null;
    el._ctwcal     = this;
    this._draw();
    this._bind();
  }

  toBE(y) { return y + 543; }

  _same(a, b) {
    return a && b &&
      a.getFullYear() === b.getFullYear() &&
      a.getMonth()    === b.getMonth()    &&
      a.getDate()     === b.getDate();
  }

  // Effective range end — confirmed or hover-preview
  _rEnd() {
    return (this.rangeA && !this.rangeB) ? this.hoverDate : this.rangeB;
  }

  _isRangeStart(d) {
    const a = this.rangeA, b = this._rEnd();
    if (!a) return false;
    if (!b || this._same(a, b)) return this._same(d, a);
    return this._same(d, a <= b ? a : b);
  }

  _isRangeEnd(d) {
    const a = this.rangeA, b = this._rEnd();
    if (!a || !b || this._same(a, b)) return false;
    return this._same(d, a <= b ? b : a);
  }

  _inRange(d) {
    const a = this.rangeA, b = this._rEnd();
    if (!a || !b || this._same(a, b)) return false;
    const lo = a <= b ? a : b, hi = a <= b ? b : a;
    return d > lo && d < hi;
  }

  _draw() {
    if (this.view === 'month') this._drawMonth();
    else if (this.view === 'year')  this._drawYear();
    else this._drawDate();
  }

  _drawDate() {
    const Y = this.cursor.getFullYear(), M = this.cursor.getMonth();
    const firstDow = new Date(Y, M, 1).getDay();
    const lastDay  = new Date(Y, M + 1, 0).getDate();
    const prevLast = new Date(Y, M, 0).getDate();

    // Build flat cell list
    const cells = [];
    for (let i = firstDow - 1; i >= 0; i--)
      cells.push({ d: prevLast - i, other: true, date: new Date(Y, M - 1, prevLast - i) });
    for (let d = 1; d <= lastDay; d++)
      cells.push({ d, other: false, date: new Date(Y, M, d) });
    let nd = 1;
    while (cells.length % 7) { cells.push({ d: nd, other: true, date: new Date(Y, M + 1, nd) }); nd++; }

    // Determine which cell gets tabindex=0 (roving tabindex)
    const focusKey    = this.focusDate?.toISOString().split('T')[0];
    const focusInView = cells.some(c => !c.other && c.date.toISOString().split('T')[0] === focusKey);
    const selKey      = this.sel?.toISOString().split('T')[0];
    const fallbackKey = selKey || new Date(Y, M, 1).toISOString().split('T')[0];
    const activeKey   = focusInView ? focusKey : fallbackKey;

    // Group into weeks
    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

    const rows = weeks.map(wk =>
      `<div class="cal-row" role="row">${wk.map(c => {
        const dt  = c.date.toISOString().split('T')[0];
        const inR = this.mode === 'range' && this._inRange(c.date);
        const rS  = this.mode === 'range' && this._isRangeStart(c.date);
        const rE  = this.mode === 'range' && this._isRangeEnd(c.date);
        const sel = this.mode === 'single' && this._same(c.date, this.sel);
        const isT = this._same(c.date, this.today);

        const cls = ['cal-day',
          c.other ? 'other-month' : '',
          isT     ? 'today'       : '',
          sel     ? 'selected'    : '',
          rS      ? 'range-start' : '',
          rE      ? 'range-end'   : '',
          inR     ? 'in-range'    : '',
        ].filter(Boolean).join(' ');

        const ariaLbl = `${c.d} ${_CAL_MF[c.date.getMonth()]} ${this.toBE(c.date.getFullYear())}`;
        const ariaSel = (sel || rS || rE) ? 'true' : 'false';

        return `<button class="cal-cell${c.other ? ' other' : ''}" ` +
          `data-dt="${dt}" tabindex="${dt === activeKey ? '0' : '-1'}" ` +
          `role="gridcell" aria-selected="${ariaSel}" aria-label="${ariaLbl}">` +
          `<span class="${cls}">${c.d}</span></button>`;
      }).join('')}</div>`
    ).join('');

    this.el.innerHTML =
      `<div class="cal-header">
        <button class="cal-nav-btn" data-a="prev" aria-label="เดือนก่อนหน้า">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button class="cal-title" data-a="to-month">${_CAL_MF[M]} ${this.toBE(Y)}</button>
        <button class="cal-nav-btn" data-a="next" aria-label="เดือนถัดไป">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
      <div class="cal-weekdays" role="row">
        ${_CAL_DAY.map(d => `<span class="cal-weekday" role="columnheader">${d}</span>`).join('')}
      </div>
      <div class="cal-grid" role="grid" aria-label="${_CAL_MF[M]} ${this.toBE(Y)}">${rows}</div>
      <div class="cal-footer">
        <button class="cal-today-btn" data-a="goto-today">วันนี้</button>
      </div>`;
  }

  _drawMonth() {
    const Y = this.cursor.getFullYear();
    const rowsHtml = [0, 1, 2].map(r =>
      `<div class="cal-my-row">${[0, 1, 2, 3].map(c => {
        const m   = r * 4 + c;
        const isSel = this.sel && this.sel.getFullYear() === Y && this.sel.getMonth() === m;
        const isCur = this.today.getFullYear() === Y && this.today.getMonth() === m;
        const cls = ['cal-my-cell', isCur && !isSel ? 'cal-my-cur' : '', isSel ? 'cal-my-sel' : ''].filter(Boolean).join(' ');
        return `<button class="${cls}" data-m="${m}" aria-label="${_CAL_MF[m]} ${this.toBE(Y)}">${_CAL_MS[m]}</button>`;
      }).join('')}</div>`
    ).join('');
    this.el.innerHTML =
      `<div class="cal-header">
        <button class="cal-nav-btn" data-a="prev" aria-label="ปีก่อนหน้า">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button class="cal-title" data-a="to-year">${this.toBE(Y)}</button>
        <button class="cal-nav-btn" data-a="next" aria-label="ปีถัดไป">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
      <div class="cal-my-grid">${rowsHtml}</div>`;
  }

  _drawYear() {
    const base = this.yearBase;
    const rowsHtml = [0, 1, 2].map(r =>
      `<div class="cal-my-row">${[0, 1, 2, 3].map(c => {
        const yr    = base + r * 4 + c;
        const isSel = this.sel && this.sel.getFullYear() === yr;
        const isCur = this.today.getFullYear() === yr;
        const cls   = ['cal-my-cell', isCur && !isSel ? 'cal-my-cur' : '', isSel ? 'cal-my-sel' : ''].filter(Boolean).join(' ');
        return `<button class="${cls}" data-y="${yr}">${this.toBE(yr)}</button>`;
      }).join('')}</div>`
    ).join('');
    this.el.innerHTML =
      `<div class="cal-header">
        <button class="cal-nav-btn" data-a="prev" aria-label="ช่วงปีก่อนหน้า">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button class="cal-title no-act" aria-live="polite">${this.toBE(base)} – ${this.toBE(base + 11)}</button>
        <button class="cal-nav-btn" data-a="next" aria-label="ช่วงปีถัดไป">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
      <div class="cal-my-grid">${rowsHtml}</div>`;
  }

  // ── Select a date (single or range) ──────────────────────────
  _selectDate(d) {
    if (this.mode === 'single') {
      this.sel = d;
      if (this.onChange) this.onChange(d);
    } else {
      if (!this.rangeA || this.rangeB) {
        // Start fresh range
        this.rangeA = d; this.rangeB = null; this.hoverDate = null;
      } else {
        // Complete the range
        if (d < this.rangeA) { this.rangeB = this.rangeA; this.rangeA = d; }
        else if (this._same(d, this.rangeA)) { this.rangeB = d; } // same day
        else this.rangeB = d;
        this.hoverDate = null;
        if (this.onChange) this.onChange({ start: this.rangeA, end: this.rangeB });
      }
    }
  }

  // ── Sync focusDate when navigating months with arrow buttons ─
  _syncFocusAfterNav() {
    const Y = this.cursor.getFullYear(), M = this.cursor.getMonth();
    const lastDay = new Date(Y, M + 1, 0).getDate();
    const day     = Math.min(this.focusDate.getDate(), lastDay);
    this.focusDate = new Date(Y, M, day);
  }

  // ── Update tabindices without full redraw ─────────────────────
  _updateTabIndex() {
    const k = this.focusDate?.toISOString().split('T')[0];
    this.el.querySelectorAll('[data-dt]').forEach(btn => {
      btn.tabIndex = btn.dataset.dt === k ? 0 : -1;
    });
  }

  _bind() {
    // ── Click handler ─────────────────────────────────────────
    this.el.addEventListener('click', e => {
      const aBtn  = e.target.closest('[data-a]');
      const dtBtn = e.target.closest('[data-dt]');
      const mBtn  = e.target.closest('[data-m]');
      const yBtn  = e.target.closest('[data-y]');

      if (aBtn) {
        const a = aBtn.dataset.a;
        if (a === 'prev') {
          if (this.view === 'date') {
            this.cursor.setMonth(this.cursor.getMonth() - 1);
            this._syncFocusAfterNav();
          } else if (this.view === 'month') {
            this.cursor.setFullYear(this.cursor.getFullYear() - 1);
          } else {
            this.yearBase -= 12;
          }
        } else if (a === 'next') {
          if (this.view === 'date') {
            this.cursor.setMonth(this.cursor.getMonth() + 1);
            this._syncFocusAfterNav();
          } else if (this.view === 'month') {
            this.cursor.setFullYear(this.cursor.getFullYear() + 1);
          } else {
            this.yearBase += 12;
          }
        } else if (a === 'to-month')   { this.view = 'month'; }
        else if (a === 'to-year')      { this.view = 'year'; }
        else if (a === 'goto-today') {
          this.cursor    = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
          this.focusDate = new Date(this.today);
          this.view      = 'date';
        }
        this._draw();
      }

      if (dtBtn) {
        const d = new Date(dtBtn.dataset.dt + 'T00:00:00');
        // Navigate to the month of clicked cell (handles other-month clicks)
        if (dtBtn.classList.contains('other')) {
          this.cursor = new Date(d.getFullYear(), d.getMonth(), 1);
        }
        this.focusDate = d;
        this._selectDate(d);
        this._draw();
        requestAnimationFrame(() => {
          this.el.querySelector(`[data-dt="${dtBtn.dataset.dt}"]`)?.focus();
        });
      }

      if (mBtn) {
        this.cursor.setMonth(parseInt(mBtn.dataset.m));
        this.focusDate = new Date(this.cursor.getFullYear(), this.cursor.getMonth(), 1);
        if (this.initView === 'month') {
          // Month-only picker: select directly
          this.sel = new Date(this.cursor.getFullYear(), this.cursor.getMonth(), 1);
          if (this.onChange) this.onChange({ year: this.cursor.getFullYear(), month: this.cursor.getMonth() });
          this._draw();
        } else {
          this.view = 'date';
          this._draw();
        }
      }

      if (yBtn) {
        this.cursor.setFullYear(parseInt(yBtn.dataset.y));
        if (this.initView === 'year') {
          // Year-only picker: select directly
          this.sel = new Date(this.cursor.getFullYear(), 0, 1);
          if (this.onChange) this.onChange(this.cursor.getFullYear());
          this._draw();
        } else {
          this.view = 'month';
          this._draw();
        }
      }
    });

    // ── Range hover preview ───────────────────────────────────
    if (this.mode === 'range') {
      this.el.addEventListener('mouseover', e => {
        if (!this.rangeA || this.rangeB) return;
        const dtBtn = e.target.closest('[data-dt]');
        if (!dtBtn) return;
        const d = new Date(dtBtn.dataset.dt + 'T00:00:00');
        if (!this.hoverDate || !this._same(d, this.hoverDate)) {
          this.hoverDate = d;
          this._draw();
        }
      });
      this.el.addEventListener('mouseleave', () => {
        if (this.rangeA && !this.rangeB && this.hoverDate) {
          this.hoverDate = null;
          this._draw();
        }
      });
    }

    // ── Keyboard navigation (ARIA APG Date Picker pattern) ───
    this.el.addEventListener('keydown', e => {
      if (this.view !== 'date') return;
      const NAV_KEYS = [
        'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
        'PageUp', 'PageDown', 'Home', 'End', 'Enter', ' '
      ];
      if (!NAV_KEYS.includes(e.key)) return;
      e.preventDefault();

      if (e.key === 'Enter' || e.key === ' ') {
        this._selectDate(new Date(this.focusDate));
        this._draw();
        requestAnimationFrame(() => {
          const k = this.focusDate.toISOString().split('T')[0];
          this.el.querySelector(`[data-dt="${k}"]`)?.focus();
        });
        return;
      }

      const fd = new Date(this.focusDate);
      switch (e.key) {
        case 'ArrowLeft':  fd.setDate(fd.getDate() - 1); break;
        case 'ArrowRight': fd.setDate(fd.getDate() + 1); break;
        case 'ArrowUp':    fd.setDate(fd.getDate() - 7); break;
        case 'ArrowDown':  fd.setDate(fd.getDate() + 7); break;
        case 'PageUp':
          if (e.ctrlKey || e.shiftKey) fd.setFullYear(fd.getFullYear() - 1);
          else fd.setMonth(fd.getMonth() - 1);
          break;
        case 'PageDown':
          if (e.ctrlKey || e.shiftKey) fd.setFullYear(fd.getFullYear() + 1);
          else fd.setMonth(fd.getMonth() + 1);
          break;
        case 'Home': fd.setDate(fd.getDate() - fd.getDay()); break;          // → Sunday of week
        case 'End':  fd.setDate(fd.getDate() + (6 - fd.getDay())); break;    // → Saturday of week
      }

      this.focusDate = fd;

      const needsNav = fd.getFullYear() !== this.cursor.getFullYear() ||
                       fd.getMonth()    !== this.cursor.getMonth();
      if (needsNav) {
        this.cursor = new Date(fd.getFullYear(), fd.getMonth(), 1);
        this._draw();
      } else {
        // Lightweight update — only shift the roving tabindex
        this._updateTabIndex();
      }

      requestAnimationFrame(() => {
        const k = fd.toISOString().split('T')[0];
        this.el.querySelector(`[data-dt="${k}"]`)?.focus();
      });
    });
  }
}

/* ── Init all [data-cal] elements ──────────────────────────────── */
document.querySelectorAll('[data-cal]').forEach(el => {
  const cal = new CTWCalendar(el, {
    mode: el.dataset.calMode || 'single',
    view: el.dataset.calView || 'date',
  });
  const inputId = el.dataset.calInput;
  if (inputId) {
    const inp = document.getElementById(inputId);
    cal.onChange = d => {
      if (!inp || !(d instanceof Date)) return;
      inp.value = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear() + 543}`;
    };
  }
});

/* ── Calendar Input: open / close dropdown ──────────────────────── */
document.querySelectorAll('.cal-input-root').forEach(root => {
  const wrap = root.querySelector('.tf-input-wrap') || root.querySelector('.tf-input');
  const drop = root.querySelector('.cal-dropdown');
  if (!wrap || !drop) return;

  // Toggle on click of the entire input area (including icon)
  wrap.addEventListener('click', e => { e.stopPropagation(); drop.classList.toggle('open'); });

  // Close on Escape
  drop.addEventListener('keydown', e => { if (e.key === 'Escape') { drop.classList.remove('open'); wrap.querySelector('.tf-input')?.focus(); } });

  // Close on outside click
  document.addEventListener('click', e => { if (!root.contains(e.target)) drop.classList.remove('open'); });
});

/* ════════════════════════════════════════════════════════════════════
   CTWTimePicker  —  drum-roll scroll-wheel time picker
   Usage: add data-timepicker to a .tp-wrap element containing
          a .tp-trigger > .tp-display
   ════════════════════════════════════════════════════════════════════ */
class CTWTimePicker {
  constructor(wrap) {
    this.wrap    = wrap;
    this.trigger = wrap.querySelector('.tp-trigger');
    this.display = wrap.querySelector('.tp-display');
    this.hour    = null;   // confirmed value
    this.min     = null;
    this._pH     = 0;      // pending while menu is open
    this._pM     = 0;
    this._open   = false;
    this.onChange = null;

    this._buildMenu();
    this._bindTrigger();
    this._bindMenu();
    wrap._ctwtp = this;
  }

  /* ── Build the dropdown menu ────────────────────────────────── */
  _buildMenu() {
    const ITEM_H = 40;

    const menu = document.createElement('div');
    menu.className = 'tp-menu';
    menu.setAttribute('role', 'dialog');
    menu.setAttribute('aria-label', 'เลือกเวลา');

    menu.innerHTML = `
      <div class="tp-cols">
        <div class="tp-col-wrap" data-col="hour">
          <div class="tp-col" aria-label="ชั่วโมง">
            <div class="tp-col-inner" data-items="hour"></div>
          </div>
        </div>
        <div class="tp-colon">:</div>
        <div class="tp-col-wrap" data-col="min">
          <div class="tp-col" aria-label="นาที">
            <div class="tp-col-inner" data-items="min"></div>
          </div>
        </div>
      </div>
      <div class="tp-footer">
        <button class="tp-now-btn" type="button">เวลาตอนนี้</button>
        <button class="tp-confirm-btn" type="button">ยืนยัน</button>
      </div>`;

    this.wrap.appendChild(menu);
    this.menu = menu;

    /* Populate items 00-23 (hours) and 00-59 (mins) */
    this._hourInner = menu.querySelector('[data-items="hour"]');
    this._minInner  = menu.querySelector('[data-items="min"]');
    this._hourCol   = menu.querySelector('[data-col="hour"] .tp-col');
    this._minCol    = menu.querySelector('[data-col="min"]  .tp-col');

    for (let h = 0; h < 24; h++) {
      const el = document.createElement('div');
      el.className = 'tp-item';
      el.dataset.value = h;
      el.textContent = String(h).padStart(2, '0');
      this._hourInner.appendChild(el);
    }
    for (let m = 0; m < 60; m++) {
      const el = document.createElement('div');
      el.className = 'tp-item';
      el.dataset.value = m;
      el.textContent = String(m).padStart(2, '0');
      this._minInner.appendChild(el);
    }
  }

  /* ── Scroll a column to a specific value ───────────────────── */
  _scrollTo(col, value, animate = false) {
    const ITEM_H = 40;
    if (animate) {
      col.scrollTo({ top: value * ITEM_H, behavior: 'smooth' });
    } else {
      col.scrollTop = value * ITEM_H;
    }
  }

  /* ── Highlight the active item in a column ─────────────────── */
  _highlight(col, value) {
    col.querySelectorAll('.tp-item').forEach(el => {
      el.classList.toggle('is-active', Number(el.dataset.value) === value);
    });
  }

  /* ── Open the picker ────────────────────────────────────────── */
  openMenu() {
    if (this.trigger.disabled) return;
    const now = new Date();
    this._pH = this.hour ?? now.getHours();
    this._pM = this.min  ?? now.getMinutes();
    this.menu.classList.add('is-open');
    this._open = true;
    /* Scroll without animation first (instant snap to value) */
    this._scrollTo(this._hourCol, this._pH, false);
    this._scrollTo(this._minCol,  this._pM, false);
    this._highlight(this._hourCol, this._pH);
    this._highlight(this._minCol,  this._pM);
  }

  /* ── Close the picker ───────────────────────────────────────── */
  closeMenu() {
    this.menu.classList.remove('is-open');
    this._open = false;
  }

  /* ── Confirm selection ──────────────────────────────────────── */
  _confirm() {
    this.hour = this._pH;
    this.min  = this._pM;
    const hh = String(this.hour).padStart(2, '0');
    const mm = String(this.min).padStart(2, '0');
    if (this.display) {
      this.display.textContent = `${hh}:${mm}`;
    }
    this.trigger.classList.add('tp-has-value');
    /* Remove error state on confirm */
    this.trigger.classList.remove('is-error');
    if (this.onChange) this.onChange({ hour: this.hour, min: this.min, display: `${hh}:${mm}` });
    this.closeMenu();
  }

  /* ── Bind trigger click ─────────────────────────────────────── */
  _bindTrigger() {
    this.trigger.addEventListener('click', e => {
      e.stopPropagation();
      if (this._open) {
        this.closeMenu();
      } else {
        /* Close all other open pickers first */
        document.querySelectorAll('[data-timepicker]').forEach(w => {
          if (w !== this.wrap && w._ctwtp) w._ctwtp.closeMenu();
        });
        this.openMenu();
      }
    });
    /* Keyboard: Escape closes */
    this.wrap.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this._open) { this.closeMenu(); this.trigger.focus(); }
    });
  }

  /* ── Bind menu interactions ─────────────────────────────────── */
  _bindMenu() {
    const ITEM_H = 40;

    /* Scroll → update pending value + highlight */
    const onScroll = (col, isHour) => {
      const raw = col.scrollTop / ITEM_H;
      const idx = Math.round(raw);
      if (isHour) {
        this._pH = Math.max(0, Math.min(23, idx));
        this._highlight(col, this._pH);
      } else {
        this._pM = Math.max(0, Math.min(59, idx));
        this._highlight(col, this._pM);
      }
    };

    this._hourCol.addEventListener('scroll', () => onScroll(this._hourCol, true),  { passive: true });
    this._minCol.addEventListener( 'scroll', () => onScroll(this._minCol,  false), { passive: true });

    /* Click on item → snap there */
    this._hourCol.addEventListener('click', e => {
      const item = e.target.closest('.tp-item');
      if (!item) return;
      const v = Number(item.dataset.value);
      this._pH = v;
      this._scrollTo(this._hourCol, v, true);
      this._highlight(this._hourCol, v);
    });
    this._minCol.addEventListener('click', e => {
      const item = e.target.closest('.tp-item');
      if (!item) return;
      const v = Number(item.dataset.value);
      this._pM = v;
      this._scrollTo(this._minCol, v, true);
      this._highlight(this._minCol, v);
    });

    /* Wheel event for arrow-key-style scroll on desktop */
    [this._hourCol, this._minCol].forEach(col => {
      col.addEventListener('wheel', e => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 1 : -1;
        col.scrollBy({ top: delta * ITEM_H, behavior: 'smooth' });
      }, { passive: false });
    });

    /* Arrow key navigation inside open menu */
    this.menu.addEventListener('keydown', e => {
      const focused = document.activeElement;
      const inHour  = this._hourCol.contains(focused) || focused === this._hourCol;
      const col     = inHour ? this._hourCol : this._minCol;
      const isHour  = inHour;
      const cur     = isHour ? this._pH : this._pM;
      const max     = isHour ? 23 : 59;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nv = Math.min(cur + 1, max);
        if (isHour) this._pH = nv; else this._pM = nv;
        this._scrollTo(col, nv, true);
        this._highlight(col, nv);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const nv = Math.max(cur - 1, 0);
        if (isHour) this._pH = nv; else this._pM = nv;
        this._scrollTo(col, nv, true);
        this._highlight(col, nv);
      } else if (e.key === 'Enter') {
        this._confirm();
      }
    });

    /* "เวลาตอนนี้" button */
    this.menu.querySelector('.tp-now-btn').addEventListener('click', () => {
      const now = new Date();
      this._pH = now.getHours();
      this._pM = now.getMinutes();
      this._scrollTo(this._hourCol, this._pH, true);
      this._scrollTo(this._minCol,  this._pM, true);
      this._highlight(this._hourCol, this._pH);
      this._highlight(this._minCol,  this._pM);
    });

    /* "ยืนยัน" button */
    this.menu.querySelector('.tp-confirm-btn').addEventListener('click', () => this._confirm());

    /* Stop clicks inside menu from bubbling to the outside-click handler */
    this.menu.addEventListener('click', e => e.stopPropagation());
  }
}

/* ── Init all [data-timepicker] elements ──────────────────────────── */
document.querySelectorAll('[data-timepicker]').forEach(wrap => {
  const tp = new CTWTimePicker(wrap);
  /* Demo output wiring */
  tp.onChange = ({ display }) => {
    const out = document.getElementById('tp-output');
    const res = document.getElementById('tp-result');
    if (out && res) { res.textContent = display; out.style.display = 'block'; }
  };
});

/* Close time pickers on outside click */
document.addEventListener('click', e => {
  document.querySelectorAll('[data-timepicker]').forEach(wrap => {
    if (wrap._ctwtp && wrap._ctwtp._open && !wrap.contains(e.target)) {
      wrap._ctwtp.closeMenu();
    }
  });
});

/* ── Static Time Picker demo columns (scroll to active item) ─────── */
/* The static "Menu Panel" block in index.html has id=demo-hour-col / demo-min-col.
   They contain 5 items (indices 0-4); active is index 2 → scrollTop = 2 × 40 = 80. */
(function initStaticTPDemo() {
  const ITEM_H = 40;
  const hc = document.getElementById('demo-hour-col');
  const mc = document.getElementById('demo-min-col');
  if (hc) hc.scrollTop = 2 * ITEM_H;  /* centre the 3rd item (14 hours) */
  if (mc) mc.scrollTop = 2 * ITEM_H;  /* centre the 3rd item (30 mins)  */
})();

/* ── Range Shortcuts ─────────────────────────────────────────────── */
document.querySelectorAll('.cal-sel-btn[data-preset]').forEach(btn => {
  btn.addEventListener('click', () => {
    const calEl = btn.closest('.cal-with-sel')?.querySelector('[data-cal]');
    if (!calEl?._ctwcal) return;
    const cal = calEl._ctwcal;
    const now = new Date();

    btn.closest('.cal-sel-side').querySelectorAll('.cal-sel-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const p = btn.dataset.preset;
    if (p === 'today') {
      cal.rangeA = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      cal.rangeB = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      cal.sel    = null;
      cal.cursor = new Date(now.getFullYear(), now.getMonth(), 1);
      cal.focusDate = new Date(now);
    } else {
      const a = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const b = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (p === '30ago') a.setDate(a.getDate() - 30);
      else               b.setDate(b.getDate() + 30);
      cal.rangeA    = a;
      cal.rangeB    = b;
      cal.sel       = null;
      cal.hoverDate = null;
      cal.cursor    = new Date(a.getFullYear(), a.getMonth(), 1);
      cal.focusDate = new Date(a);
    }
    cal._draw();
  });
});
