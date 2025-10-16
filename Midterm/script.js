// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Tabs
const tabNYC = document.getElementById("tab-nyc");
const tabMIA = document.getElementById("tab-miami");
const nyc = document.getElementById("nyc");
const miami = document.getElementById("miami");

function switchTab(city) {
  const isMiami = city === "miami";
  tabMIA.setAttribute("aria-selected", isMiami);
  tabNYC.setAttribute("aria-selected", !isMiami);
  miami.hidden = !isMiami;
  nyc.hidden = isMiami;
}

if (tabNYC && tabMIA) {
  tabMIA.addEventListener("click", () => switchTab("miami"));
  tabNYC.addEventListener("click", () => switchTab("nyc"));
}

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
  if (e.target.matches(".lightbox-close")) {
    lightbox.close();
  }
});

// Surprise Me
const surprise = document.getElementById("surpriseBtn");
if (surprise) {
  surprise.addEventListener("click", () => {
    const cards = Array.from(document.querySelectorAll("article.card"));
    const pick = cards[Math.floor(Math.random() * cards.length)];
    const isMiami = pick.closest("#miami");
    switchTab(isMiami ? "miami" : "nyc");
    pick.scrollIntoView({ behavior: "smooth", block: "center" });
    pick.animate([{ transform: "scale(1)" }, { transform: "scale(1.03)" }, { transform: "scale(1)" }], {
      duration: 600,
    });
  });
}
