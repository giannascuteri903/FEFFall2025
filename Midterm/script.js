// Footer Year
document.getElementById("year").textContent = new Date().getFullYear();

// Lightbox
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

// Spotlight Carousel
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
