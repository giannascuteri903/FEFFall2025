const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* 1) Tabs: NYC / Miami */
const tabNYC = document.getElementById('tab-nyc');
const tabMIA = document.getElementById('tab-miami');
const panelNYC = document.getElementById('nyc');
const panelMIA = document.getElementById('miami');

function selectTab(which) {
  const nycActive = which === 'nyc';
  tabNYC.setAttribute('aria-selected', nycActive);
  tabMIA.setAttribute('aria-selected', !nycActive);
  panelNYC.hidden = !nycActive;
  panelMIA.hidden = nycActive;
}

if (tabNYC && tabMIA && panelNYC && panelMIA) {
  // default: NYC shown
  panelNYC.hidden = false;
  panelMIA.hidden = false; // show both by default so it doesn't jump on first render
  // then switch to NYC as active
  selectTab('nyc');

  tabNYC.addEventListener('click', () => selectTab('nyc'));
  tabMIA.addEventListener('click', () => selectTab('miami'));
}

/* 2) Lightbox Gallery: click any card image */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');

function openLightbox(imgEl) {
  const src = imgEl.getAttribute('data-full') || imgEl.src;
  lightboxImg.src = src;
  const title = imgEl.closest('.card')?.querySelector('h4')?.textContent || 'Photo';
  lightboxCaption.textContent = title;

  if (lightbox && typeof lightbox.showModal === 'function') {
    lightbox.showModal();
  } else if (lightbox) {
    lightbox.setAttribute('open', '');
  }
}

function closeLightbox() {
  if (!lightbox) return;
  if (typeof lightbox.close === 'function') lightbox.close();
  else lightbox.removeAttribute('open');
}

document.addEventListener('click', (e) => {
  const img = e.target.closest('article.card img');
  if (img && lightbox) {
    openLightbox(img);
    return;
  }
  if (e.target.matches('.lightbox-close')) {
    closeLightbox();
  }
});

/* 3) Surprise Me: scroll to a random card, switch tab if needed */
const surpriseBtn = document.getElementById('surpriseBtn');
if (surpriseBtn) {
  surpriseBtn.addEventListener('click', () => {
    const cards = Array.from(document.querySelectorAll('article.card'));
    if (!cards.length) return;
    const choice = cards[Math.floor(Math.random() * cards.length)];
    const isMiami = choice.closest('#miami') !== null;

    // ensure correct tab visible
    selectTab(isMiami ? 'miami' : 'nyc');

    choice.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // subtle emphasis animation
    choice.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.02)' }, { transform: 'scale(1)' }],
      { duration: 600, easing: 'ease' }
    );
  });
}
