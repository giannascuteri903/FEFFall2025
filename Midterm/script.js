//Footer 
document.getElementById("year").textContent = new Date().getFullYear();

//Lightbox
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxCaption = document.getElementById("lightboxCaption");

document.addEventListener("click", (e) => {
  const img = e.target.closest("article.card img");
  if (img) {
    lightboxImg.src = img.src;
    lightboxCaption.textContent = img.alt;
    lightbox.showModal();
  }
  if (e.target.matches(".lightbox-close")) lightbox.close();
});

//Spotlight Carousel
const track = document.querySelector(".carousel-track");
const slides = Array.from(track.querySelectorAll("img"));
const nextBtn = document.querySelector(".carousel-btn.next");
const prevBtn = document.querySelector(".carousel-btn.prev");
let current = 0;

function updateCarousel(index) {
  slides.forEach((slide, i) => slide.classList.toggle("active", i === index));
}

nextBtn?.addEventListener("click", () => {
  current = (current + 1) % slides.length;
  updateCarousel(current);
});
prevBtn?.addEventListener("click", () => {
  current = (current - 1 + slides.length) % slides.length;
  updateCarousel(current);
});
setInterval(() => {
  current = (current + 1) % slides.length;
  updateCarousel(current);
}, 5000);

/* ========== Viewer Rating for Spotlight ========== */
const rateBtn = document.getElementById('rateBtn');
const rateDialog = document.getElementById('rateDialog');
const rateForm = document.getElementById('rateForm');
const rateCancel = document.getElementById('rateCancel');
const rateSubmit = document.getElementById('rateSubmit');
const rateResult = document.getElementById('rateResult');

const RATING_KEY = 'rating_nobu_miami';

function starsText(n) {
  n = Number(n) || 0;
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

function showSavedRating() {
  const saved = localStorage.getItem(RATING_KEY);
  if (saved) {
    rateResult.textContent = `Viewer rating saved: ${starsText(saved)} (${saved}/5)`;
  }
}

showSavedRating();

rateBtn?.addEventListener('click', () => {
  rateDialog?.showModal();
});

rateCancel?.addEventListener('click', () => {
  rateDialog?.close();
});

rateForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const chosen = rateForm.querySelector('input[name="rating"]:checked')?.value;
  if (!chosen) {
    alert('Please choose 1–5 stars to rate your visit.');
    return;
  }
  localStorage.setItem(RATING_KEY, chosen);
  rateDialog.close();
  // Update inline result below the button
  rateResult.textContent = `Viewer rating saved: ${starsText(chosen)} (${chosen}/5)`;
});
