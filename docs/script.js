const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const contactCard = document.getElementById('contact-card');

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

themeIcon.textContent = getTheme() === 'dark' ? '☀' : '☾';

fetch('data/social.json')
  .then(res => {
    if (!res.ok) throw new Error('Failed to load social.json');
    return res.json();
  })
  .then(buttons => {
    const container = document.getElementById('links');
    const theme = getTheme();

    buttons.forEach((btn, index) => {
      const a = document.createElement('a');
      a.href = btn.buttonhref;
      a.className = 'link-btn anim-in';
      a.style.animationDelay = `${0.11 + index * 0.06}s`;
      a.setAttribute('aria-label', btn.arialabel);
      a.setAttribute('role', 'listitem');
      a.target = '_blank';
      a.rel = 'noopener noreferrer';

      if (btn.useLogo) {
        const img = document.createElement('img');
        img.dataset.srcDark = 'img' + btn.logoSrc;
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
  if (items.length < 2) return;

  const before = items.map(el => el.getBoundingClientRect());
  fisherYates(items).forEach(el => container.appendChild(el));
  const after = items.map(el => el.getBoundingClientRect());

  items.forEach((el, i) => {
    el.style.transition = 'none';
    el.style.transform = `translateY(${before[i].top - after[i].top}px)`;
  });

  void container.offsetHeight;

  items.forEach(el => {
    el.style.transition = 'transform 0.55s cubic-bezier(0.2, 0.8, 0.2, 1)';
    el.style.transform = '';
    el.addEventListener('transitionend', () => {
      el.style.transition = '';
    }, { once: true });
  });
}

function startShuffle() {
  setInterval(shuffleLinks, 7500);
}

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  contactCard.addEventListener('pointermove', () => {});
} else {
  window.addEventListener('pointermove', (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 2;
    const y = (event.clientY / window.innerHeight - 0.5) * 2;

    contactCard.style.transform = `rotateX(${(-y * 3).toFixed(2)}deg) rotateY(${(x * 3).toFixed(2)}deg)`;

    document.querySelectorAll('.orb').forEach((orb, index) => {
      const depth = (index + 1) * 6;
      orb.style.transform = `translate(${(-x * depth).toFixed(1)}px, ${(-y * depth).toFixed(1)}px)`;
    });
  });

  window.addEventListener('pointerleave', () => {
    contactCard.style.transform = '';
    document.querySelectorAll('.orb').forEach(orb => {
      orb.style.transform = '';
    });
  });
}
