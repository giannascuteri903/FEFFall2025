//Change background color of body when clicking header
document.querySelector("header").addEventListener("click", () => {
  document.body.classList.toggle("magic-bg");
});

//Change Adventures text when hovering
document.querySelector("#adventures").addEventListener("mouseover", () => {
  document.querySelector("#adventures h2").innerHTML = "✨ Magical Adventures ✨";
});
document.querySelector("#adventures").addEventListener("mouseout", () => {
  document.querySelector("#adventures h2").innerHTML = "Some More of Princess Bella's Adventures";
});

//Toggle gallery border on click
document.querySelector("#images").addEventListener("click", () => {
  document.querySelectorAll(".gallery figure").forEach(fig => {
    fig.classList.toggle("highlight");
  });
});
