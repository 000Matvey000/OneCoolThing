// ── Theme ────────────────────────────────────────────────────────────────────

const themeToggle = document.getElementById('theme-toggle');
const themeIcon   = document.getElementById('theme-icon');

function getTheme() {
  return document.documentElement.getAttribute('data-theme') || 'dark';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  themeIcon.textContent = theme === 'dark' ? '☀' : '☾';

  document.querySelectorAll('.btn-logo').forEach(img => {
    img.src = theme === 'dark' ? img.dataset.srcDark : img.dataset.srcLight;
    img.style.filter = theme === 'light' ? (img.dataset.filterLight || '') : '';
  });
}

themeToggle.addEventListener('click', () => {
  applyTheme(getTheme() === 'dark' ? 'light' : 'dark');
});

// Sync icon with initial theme (set before JS ran via inline script)
themeIcon.textContent = getTheme() === 'dark' ? '☀' : '☾';

// ── Social links ─────────────────────────────────────────────────────────────

fetch('data/social.json')
  .then(res => {
    if (!res.ok) throw new Error('Failed to load social.json');
    return res.json();
  })
  .then(buttons => {
    const container = document.getElementById('links');
    const theme = getTheme();

    buttons.forEach(btn => {
      const a = document.createElement('a');
      a.href = btn.buttonhref;
      a.className = 'link-btn';
      a.setAttribute('aria-label', btn.arialabel);
      a.setAttribute('role', 'listitem');
      a.target = '_blank';
      a.rel = 'noopener noreferrer';

      if (btn.useLogo) {
        const img = document.createElement('img');
        img.dataset.srcDark  = 'img' + btn.logoSrc;
        img.dataset.srcLight = 'img' + (btn.logoSrcLight || btn.logoSrc);
        if (btn.logoFilterLight) img.dataset.filterLight = btn.logoFilterLight;

        img.src = theme === 'dark' ? img.dataset.srcDark : img.dataset.srcLight;
        if (theme === 'light' && btn.logoFilterLight) img.style.filter = btn.logoFilterLight;

        img.alt = '';
        img.className = 'btn-logo';
        a.appendChild(img);
      }

      const span = document.createElement('span');
      span.textContent = btn.arialabel;
      a.appendChild(span);

      container.appendChild(a);
    });

    startShuffle();
  })
  .catch(err => console.error(err));

// ── Shuffle ──────────────────────────────────────────────────────────────────

function fisherYates(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shuffleLinks() {
  const container = document.getElementById('links');
  const items = Array.from(container.children);

  // FIRST: snapshot positions before reorder
  const before = items.map(el => el.getBoundingClientRect());

  // Reorder DOM
  fisherYates(items).forEach(el => container.appendChild(el));

  // LAST: snapshot positions after reorder
  const after = items.map(el => el.getBoundingClientRect());

  // INVERT: apply transforms that move each tile back to where it was
  items.forEach((el, i) => {
    el.style.transition = 'none';
    el.style.transform = `translateY(${before[i].top - after[i].top}px)`;
  });

  // Force reflow so the browser registers the inverted transforms
  void container.offsetHeight;

  // PLAY: release transforms — browser animates each tile to its new position
  items.forEach(el => {
    el.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    el.style.transform = '';
    el.addEventListener('transitionend', () => { el.style.transition = ''; }, { once: true });
  });
}

function startShuffle() {
  setInterval(shuffleLinks, 7500);
}
