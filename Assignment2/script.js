//Change background color of body when clicking header
document.querySelector("header").addEventListener("click", () => {
  document.body.classList.toggle("magic-bg");
});

// Change Adventures text when hovering
const adventures = document.querySelector("#adventures");
const adventuresTitle = adventures?.querySelector("h2");

if (adventures && adventuresTitle) {
  adventures.addEventListener("mouseover", () => {
    adventuresTitle.textContent = "✨ Magical Adventures ✨";
    adventuresTitle.classList.add("fancy-title");
  });

  adventures.addEventListener("mouseout", () => {
    adventuresTitle.textContent = "Some More of Princess Bella's Adventures";
    adventuresTitle.classList.remove("fancy-title");
  });
}

//Toggle gallery border on click
document.querySelector("#images").addEventListener("click", () => {
  document.querySelectorAll(".gallery figure").forEach(fig => {
    fig.classList.toggle("highlight");
  });
});

//"Make a Wish" 
const wishes = [
  "A meadow that blooms all year 🌼",
  "Endless riddles to make everyone laugh 🤭",
  "A feather that writes stories in the sky 🪶",
  "Moonlight that glows in your pocket 🌙",
  "A crown of flowers that never wilts 🌸"
];

const wishBtn = document.getElementById("wishBtn");
const wishResult = document.getElementById("wishResult");

wishBtn?.addEventListener("click", () => {
  const choice = wishes[Math.floor(Math.random() * wishes.length)];
  wishResult.innerHTML = `Your wish drifts into the cave: <strong>${choice}</strong>`;
});
