// =============================
// City Bites – JS (external)
// Interactive elements:
// 1) Tabs (NYC / Miami)
// 2) Lightbox gallery (click any card image)
// 3) "Surprise Me" button scroll-to-random card
// 4) Bonus: Favorite toggle hearts
// =============================

const tabNYC = document.getElementById('tab-nyc');
const tabMIA = document.getElementById('tab-miami');
const panelNYC = document.getElementById('nyc');
const panelMIA = document.getElementById('miami');

function selectTab(target) {
  const isNYC = target.id === 'tab-nyc';
  tabNYC.setAttribute('aria-selected', isNYC);
  tabMIA.setAttribute('aria-selected', !isNYC);
  panelNYC.hidden = !isNYC;
  panelMIA.hidden = isNYC;
  // move focus to panel for a11y on selection
  (isNYC ? panelNYC : panelMIA).setAttribute('tabindex', '-1');
  (isNYC ? panelNYC : panelMIA).focus({ preventScroll: true });
}

tabNYC.addEventListener('click', () => selectTab(tabNYC));
tabMIA.addEventListener('click', () => selectTab(tabMIA));

// Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');

document.addEventListener('click', (e) => {
  const img = e.target.closest('article.card img');
  if (!img) return;
  const full = img.getAttribute('data-full') || img.src;
  lightboxImg.src = full;
  const title = img.closest('.card')?.querySelector('h4')?.textContent || 'Photo';
  lightboxCaption.textContent = title;
  if (typeof lightbox.showModal === 'function') {
    lightbox.showModal();
  } else {
    lightbox.setAttribute('open', '');
  }
});

document.querySelector('.lightbox .close').addEventListener('click', () => {
  if (typeof lightbox.close === 'function') lightbox.close();
  else lightbox.removeAttribute('open');
});

// Surprise Me (scroll to a random card)
const surpriseBtn = document.getElementById('surpriseBtn');
surpriseBtn.addEventListener('click', () => {
  const cards = Array.from(document.querySelectorAll('article.card'));
  if (!cards.length) return;
  const random = cards[Math.floor(Math.random() * cards.length)];
  // ensure its city tab is visible
  const inMiami = random.dataset.city === 'miami';
  selectTab(inMiami ? tabMIA : tabNYC);
  random.scrollIntoView({ behavior: 'smooth', block: 'center' });
  random.animate([
    { transform: 'scale(1)' },
    { transform: 'scale(1.02)' },
    { transform: 'scale(1)' }
  ], { duration: 600 });
});

// Favorite toggles (bonus interaction)
document.addEventListener('click', (e) => {
  const fav = e.target.closest('.fav-btn');
  if (!fav) return;
  const pressed = fav.getAttribute('aria-pressed') === 'true';
  fav.setAttribute('aria-pressed', String(!pressed));
  fav.textContent = pressed ? '♡' : '❤';
});
