// ========== Mock data (matches the vibe of your DB) ==========
const restaurants = [
  {
    id: 1,
    name: "Chic City Bites",
    city: "Miami",
    cuisine: "New American",
    price_range: "$$",
    image_url: "",
    avg_rating: 4.9,
    blurb: "Cozy New American spot with elevated plates and date-night energy."
  },
  {
    id: 2,
    name: "Oceanfront Osteria",
    city: "Miami Beach",
    cuisine: "Italian",
    price_range: "$$$",
    image_url: "",
    avg_rating: 4.7,
    blurb: "House-made pasta, seafood, and sunset views right off the water."
  },
  {
    id: 3,
    name: "Brickell Brunch Club",
    city: "Miami",
    cuisine: "Brunch",
    price_range: "$$",
    image_url: "",
    avg_rating: 4.4,
    blurb: "Bottomless brunch, upbeat music, and a very Instagrammable menu."
  },
  {
    id: 4,
    name: "SoHo Sky Lounge",
    city: "New York",
    cuisine: "Fusion",
    price_range: "$$$",
    image_url: "",
    avg_rating: 4.8,
    blurb: "Rooftop lounge with skyline views and shareable fusion plates."
  },
  {
    id: 5,
    name: "Queens Comfort Kitchen",
    city: "Queens",
    cuisine: "Comfort Food",
    price_range: "$",
    image_url: "",
    avg_rating: 4.5,
    blurb: "Neighborhood staple with comforting classics and big portions."
  }
];

const restaurantGrid = document.getElementById("restaurant-grid");
const emptyState = document.getElementById("empty-state");

const searchInput = document.getElementById("search");
const citySelect = document.getElementById("city");
const cuisineSelect = document.getElementById("cuisine");
const priceChips = document.getElementById("price-chips");
const backToTopBtn = document.getElementById("back-to-top");

let activePrice = "all";
let favorites = new Set();

// Load favorites from localStorage
(function loadFavorites() {
  try {
    const stored = JSON.parse(localStorage.getItem("cce_favorites"));
    if (Array.isArray(stored)) {
      favorites = new Set(stored);
    }
  } catch {
    favorites = new Set();
  }
})();

// ========== Render ==========
function renderRestaurants(list) {
  restaurantGrid.innerHTML = "";

  if (!list.length) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  list.forEach((r) => {
    const card = document.createElement("article");
    card.className = "restaurant-card";

    card.innerHTML = `
      <div class="card-header">
        <div class="card-title-area">
          <h3>${r.name}</h3>
          <p class="card-city">${r.city}</p>
          <div class="card-tags">
            <span class="tag-pill">${r.cuisine}</span>
            <span class="tag-pill">${r.price_range}</span>
          </div>
        </div>
        <div class="card-rating">
          ★ ${r.avg_rating.toFixed(1)}
        </div>
      </div>

      <div class="card-body">
        ${r.blurb}
      </div>

      <div class="card-footer">
        <button class="btn btn-primary" type="button">
          View details
        </button>
        <button
          class="btn btn-ghost btn-favorite ${favorites.has(r.id) ? "active" : ""}"
          type="button"
          data-id="${r.id}"
        >
          ${favorites.has(r.id) ? "★ Saved" : "☆ Save"}
        </button>
      </div>
    `;

    restaurantGrid.appendChild(card);
  });
}

// ========== Filter Logic ==========
function getFilteredRestaurants() {
  const text = searchInput.value.trim().toLowerCase();
  const city = citySelect.value;
  const cuisine = cuisineSelect.value;
  const price = activePrice;

  return restaurants.filter((r) => {
    const matchesText =
      !text ||
      r.name.toLowerCase().includes(text) ||
      r.city.toLowerCase().includes(text);

    const matchesCity = city === "all" || r.city === city;
    const matchesCuisine = cuisine === "all" || r.cuisine === cuisine;
    const matchesPrice = price === "all" || r.price_range === price;

    return matchesText && matchesCity && matchesCuisine && matchesPrice;
  });
}

function applyFilters() {
  renderRestaurants(getFilteredRestaurants());
}

// ========== Event Listeners ==========
// Text search + selects
searchInput.addEventListener("input", applyFilters);
citySelect.addEventListener("change", applyFilters);
cuisineSelect.addEventListener("change", applyFilters);

// Price chips
priceChips.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-price]");
  if (!btn) return;

  activePrice = btn.dataset.price;

  // update active styling
  document
    .querySelectorAll("#price-chips .chip")
    .forEach((chip) => chip.classList.remove("chip--active"));
  btn.classList.add("chip--active");

  applyFilters();
});

// Favorite buttons (event delegation)
restaurantGrid.addEventListener("click", (e) => {
  const favBtn = e.target.closest(".btn-favorite");
  if (!favBtn) return;

  const id = Number(favBtn.dataset.id);
  if (favorites.has(id)) {
    favorites.delete(id);
  } else {
    favorites.add(id);
  }

  // Persist favorites
  localStorage.setItem("cce_favorites", JSON.stringify([...favorites]));

  // Update button text/state
  if (favorites.has(id)) {
    favBtn.classList.add("active");
    favBtn.textContent = "★ Saved";
  } else {
    favBtn.classList.remove("active");
    favBtn.textContent = "☆ Save";
  }
});

// Smooth scroll for nav links
document.querySelectorAll(".main-nav a[href^='#']").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const id = link.getAttribute("href").slice(1);
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// Back to top
window.addEventListener("scroll", () => {
  if (window.scrollY > 280) {
    backToTopBtn.classList.add("show");
  } else {
    backToTopBtn.classList.remove("show");
  }
});

backToTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Initial render
renderRestaurants(restaurants);
