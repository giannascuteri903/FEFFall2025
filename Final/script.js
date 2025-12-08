// Same-origin API (served from the same port as the page)
const API_BASE = "";

// In-memory copies so we can re-render UI easily
let restaurants = [];
let reviews = [];
let ratingChart = null;

// Helper: fetch JSON with error handling
async function fetchJSON(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed ${res.status}: ${text}`);
  }

  return res.json();
}

// ---------- DOM HOOKS (make sure these IDs exist in your HTML) ----------
const els = {};

document.addEventListener("DOMContentLoaded", () => {
  els.spotsList = document.getElementById("spots-list");              // grid of cards
  els.reviewsList = document.getElementById("recent-reviews");        // list of reviews
  els.addSpotForm = document.getElementById("add-spot-form");         // left form
  els.addReviewForm = document.getElementById("add-review-form");     // right form
  els.reviewRestaurantSelect = document.getElementById("review-restaurant-select"); // dropdown
  els.ratingChartCanvas = document.getElementById("ratingChart");     // <canvas>

  setupFormHandlers();
  loadInitialData();
});

// ---------- INITIAL LOAD ----------
async function loadInitialData() {
  try {
    await Promise.all([loadRestaurants(), loadReviews()]);
  } catch (err) {
    console.error(err);
    alert("Error loading data from the server. Check the console for details.");
  }
}

// ---------- LOAD + RENDER RESTAURANTS ----------
async function loadRestaurants() {
  restaurants = await fetchJSON("/api/restaurants");
  renderRestaurantCards();
  populateRestaurantSelect();
}

function renderRestaurantCards() {
  if (!els.spotsList) return;

  if (!restaurants.length) {
    els.spotsList.innerHTML = `<p>No spots yet. Be the first to add one!</p>`;
    return;
  }

  els.spotsList.innerHTML = "";

  // Sort newest first
  const sorted = [...restaurants].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  sorted.forEach((r) => {
    const card = document.createElement("article");
    card.className = "spot-card";

    card.innerHTML = `
      <div class="spot-card-image">
        <img src="${r.image_url || "https://via.placeholder.com/400x260?text=Chic+City+Eats"}" 
             alt="${r.name}">
      </div>
      <div class="spot-card-body">
        <h3>${r.name}</h3>
        <p class="spot-meta">${r.city} • ${r.cuisine || "Vibes TBD"} • ${
      r.price_range || "$$"
    }</p>
        <p class="spot-creator">Added by ${
          r.created_by_username || "someone chic"
        }</p>
      </div>
    `;

    els.spotsList.appendChild(card);
  });
}

function populateRestaurantSelect() {
  if (!els.reviewRestaurantSelect) return;

  els.reviewRestaurantSelect.innerHTML = `<option value="">Select</option>`;

  restaurants.forEach((r) => {
    const opt = document.createElement("option");
    opt.value = r.id;
    opt.textContent = r.name;
    els.reviewRestaurantSelect.appendChild(opt);
  });
}

// ---------- LOAD + RENDER REVIEWS ----------
async function loadReviews() {
  reviews = await fetchJSON("/api/reviews");
  renderRecentReviews();
  updateRatingChart();
}

function renderRecentReviews() {
  if (!els.reviewsList) return;

  if (!reviews.length) {
    els.reviewsList.innerHTML = `<p>No reviews yet. Be the first to drop one!</p>`;
    return;
  }

  els.reviewsList.innerHTML = "";

  // newest first
  const sorted = [...reviews].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  sorted.forEach((rev) => {
    const li = document.createElement("li");
    li.className = "review-item";

    const restaurant = restaurants.find((r) => r.id === rev.restaurant_id);

    li.innerHTML = `
      <div class="review-header">
        <span class="review-restaurant">${restaurant?.name || "Unknown spot"}</span>
        <span class="review-rating">${"★".repeat(
          rev.rating
        )}${"☆".repeat(5 - rev.rating)}</span>
      </div>
      <div class="review-meta">
        <span>by ${rev.username || "anonymous foodie"}</span>
        <span>${new Date(rev.createdAt).toLocaleDateString()}</span>
      </div>
      ${
        rev.review_text
          ? `<p class="review-text">“${rev.review_text}”</p>`
          : `<p class="review-text muted">No comments, just vibes.</p>`
      }
    `;

    els.reviewsList.appendChild(li);
  });
}

// ---------- FORMS (ADD SPOT + ADD REVIEW) ----------
function setupFormHandlers() {
  if (els.addSpotForm) {
    els.addSpotForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await handleAddSpot();
    });
  }

  if (els.addReviewForm) {
    els.addReviewForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await handleAddReview();
    });
  }
}

async function handleAddSpot() {
  const username = document.getElementById("spot-username")?.value.trim();
  const name = document.getElementById("spot-name")?.value.trim();
  const city = document.getElementById("spot-city")?.value.trim();
  const cuisine = document.getElementById("spot-cuisine")?.value.trim();
  const priceRange = document.getElementById("spot-price")?.value;
  const imageUrl = document.getElementById("spot-image")?.value.trim();

  if (!username || !name || !city) {
    alert("Please fill in at least username, restaurant name, and city.");
    return;
  }

  try {
    const newRestaurant = await fetchJSON("/api/restaurants", {
      method: "POST",
      body: JSON.stringify({
        username,
        name,
        city,
        cuisine,
        price_range: priceRange || null,
        image_url: imageUrl || null,
      }),
    });

    restaurants.push(newRestaurant);
    renderRestaurantCards();
    populateRestaurantSelect();

    // Optionally clear some fields
    els.addSpotForm.reset();
  } catch (err) {
    console.error(err);
    alert("Error adding spot. Check console for details.");
  }
}

async function handleAddReview() {
  console.log("handleAddReview called"); // debug

  const username = els.reviewUsername.value.trim();
  const restaurantId = els.reviewRestaurant.value;
  const rating = els.reviewRating.value;
  const reviewText = els.reviewText.value.trim();

  // front-end validation
  if (!username || !restaurantId || !rating) {
    alert("Please enter your name, pick a spot, and choose a rating.");
    return;
  }

  try {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        restaurantId: Number(restaurantId),
        rating: Number(rating),
        reviewText,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Review submit failed:", res.status, text);
      alert("Could not submit review (server error). Check console.");
      return;
    }

    const data = await res.json();
    console.log("Review created:", data);

    // reset form
    els.addReviewForm.reset();
    // if you want to keep the same restaurant selected:
    // els.reviewRestaurant.value = restaurantId;

    // refresh UI pieces that depend on reviews
    await loadRecentReviews();
    await loadRatingStats();
    await loadRestaurants();

    alert("Review submitted ✨");
  } catch (err) {
    console.error("Error adding review:", err);
    alert("Could not submit review (network/JS error). See console.");
  }
}

// ---------- RATING DISTRIBUTION CHART ----------
function updateRatingChart() {
  if (!el.ratingChartCanvas) return;

  // Count reviews by rating 1–5
  const counts = [0, 0, 0, 0, 0];
  reviews.forEach((rev) => {
    if (rev.rating >= 1 && rev.rating <= 5) {
      counts[rev.rating - 1]++;
    }
  });

  const ctx = els.ratingChartCanvas.getContext("2d");

  if (!ratingChart) {
    ratingChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["1★", "2★", "3★", "4★", "5★"],
        datasets: [
          {
            label: "Number of reviews",
            data: counts,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: "#fff",
            },
          },
        },
        scales: {
          x: {
            ticks: { color: "#fff" },
          },
          y: {
            ticks: { color: "#fff" },
            beginAtZero: true,
            precision: 0,
          },
        },
      },
    });
  } else {
    ratingChart.data.datasets[0].data = counts;
    ratingChart.update();
  }
}
