// script.js

const els = {
  spotsList: document.getElementById("spots-list"),
  statsSummary: document.getElementById("stats-summary"),
  ratingChartCanvas: document.getElementById("rating-chart"),

  addSpotForm: document.getElementById("add-spot-form"),
  spotUsername: document.getElementById("spot-username"),
  spotName: document.getElementById("spot-name"),
  spotCity: document.getElementById("spot-city"),
  spotCuisine: document.getElementById("spot-cuisine"),
  spotPrice: document.getElementById("spot-price"),
  spotImage: document.getElementById("spot-image"),

  addReviewForm: document.getElementById("add-review-form"),
  reviewUsername: document.getElementById("review-username"),
  reviewSpot: document.getElementById("review-spot"),
  reviewRating: document.getElementById("review-rating"),
  reviewText: document.getElementById("review-text")
};

let state = {
  spots: [],
  reviews: [],
  chart: null
};

// ---------- API HELPERS ----------

async function apiGet(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`GET ${path} failed`);
  return res.json();
}

async function apiPost(path, data) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`POST ${path} failed: ${msg}`);
  }
  return res.json();
}

// ---------- RENDERING ----------

function renderSpots() {
  if (!els.spotsList) return;

  if (state.spots.length === 0) {
    els.spotsList.innerHTML =
      '<p class="panel-intro">No spots yet. Be the first to drop one on the map.</p>';
    return;
  }

  els.spotsList.innerHTML = "";

  state.spots.forEach((spot) => {
    const card = document.createElement("article");
    card.className = "spot-card";

    const thumb = document.createElement("img");
    thumb.className = "spot-thumb";
    thumb.alt = spot.name;

    if (spot.imageUrl) {
      thumb.src = spot.imageUrl;
    } else {
      // a subtle placeholder
      thumb.src =
        "https://images.unsplash.com/photo-1526481280695-3c687fd543c0?auto=format&fit=crop&w=400&q=60";
    }

    const main = document.createElement("div");
    main.className = "spot-main";

    const title = document.createElement("h3");
    title.textContent = spot.name;

    const meta = document.createElement("p");
    meta.className = "spot-meta";
    meta.textContent = `${spot.city} • ${spot.cuisine} • ${spot.priceRange}`;

    const tagline = document.createElement("p");
    tagline.className = "spot-tagline";
    tagline.textContent = "A new pin on the Chic City Eats map.";

    main.appendChild(title);
    main.appendChild(meta);
    main.appendChild(tagline);

    const extra = document.createElement("div");
    extra.className = "spot-extra";

    const addedBy = document.createElement("span");
    addedBy.className = "added-by";
    addedBy.textContent = `Added by ${spot.username}`;

    // compute average rating for this spot from its reviews
    const reviews = spot.Reviews || [];
    let ratingText = "No reviews yet";
    if (reviews.length > 0) {
      const total = reviews.reduce((sum, r) => sum + r.rating, 0);
      const avg = (total / reviews.length).toFixed(1);
      ratingText = `${avg}★ from ${reviews.length} review${
        reviews.length > 1 ? "s" : ""
      }`;
    }

    const ratingSpan = document.createElement("span");
    ratingSpan.textContent = ratingText;

    extra.appendChild(addedBy);
    extra.appendChild(ratingSpan);

    card.appendChild(thumb);
    card.appendChild(main);
    card.appendChild(extra);

    els.spotsList.appendChild(card);
  });
}

function populateReviewSpotSelect() {
  if (!els.reviewSpot) return;
  els.reviewSpot.innerHTML =
    '<option value="">Select a spot you\'ve added or love</option>';

  state.spots.forEach((spot) => {
    const opt = document.createElement("option");
    opt.value = spot.id;
    opt.textContent = `${spot.name} (${spot.city})`;
    els.reviewSpot.appendChild(opt);
  });
}

function renderStatsAndChart() {
  // Summary
  const spotCount = state.spots.length;
  const reviewCount = state.reviews.length;

  let avg = null;
  if (reviewCount > 0) {
    const total = state.reviews.reduce((sum, r) => sum + r.rating, 0);
    avg = (total / reviewCount).toFixed(2);
  }

  if (els.statsSummary) {
    if (reviewCount === 0 && spotCount === 0) {
      els.statsSummary.textContent =
        "No data yet — drop a spot and a review to start drawing the city’s mood.";
    } else {
      els.statsSummary.innerHTML = `
        <span>${spotCount}</span> spot${spotCount === 1 ? "" : "s"} ·
        <span>${reviewCount}</span> review${reviewCount === 1 ? "" : "s"}${
        avg ? ` · average rating <span>${avg}★</span>` : ""
      }
      `;
    }
  }

  // Chart: counts of each rating
  if (!els.ratingChartCanvas) return;

  const counts = [1, 2, 3, 4, 5].map(
    (rating) => state.reviews.filter((r) => r.rating === rating).length
  );

  const ctx = els.ratingChartCanvas.getContext("2d");

  if (state.chart) {
    state.chart.data.datasets[0].data = counts;
    state.chart.update();
    return;
  }

  state.chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["1★", "2★", "3★", "4★", "5★"],
      datasets: [
        {
          label: "Number of reviews",
          data: counts
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: "#ffffff"
          }
        }
      },
      scales: {
        x: {
          ticks: { color: "#ffffff" },
          grid: { color: "rgba(255,255,255,0.08)" }
        },
        y: {
          ticks: { color: "#ffffff" },
          grid: { color: "rgba(255,255,255,0.08)" }
        }
      }
    }
  });
}

// ---------- FORM HANDLERS ----------

async function handleAddSpot() {
  const payload = {
    username: els.spotUsername.value.trim(),
    name: els.spotName.value.trim(),
    city: els.spotCity.value.trim(),
    cuisine: els.spotCuisine.value.trim(),
    priceRange: els.spotPrice.value,
    imageUrl: els.spotImage.value.trim() || null
  };

  if (
    !payload.username ||
    !payload.name ||
    !payload.city ||
    !payload.cuisine ||
    !payload.priceRange
  ) {
    alert("Please fill in all required fields for the spot.");
    return;
  }

  try {
    const created = await apiPost("/api/spots", payload);
    // push to state and refresh
    state.spots.unshift({ ...created, Reviews: [] });
    renderSpots();
    populateReviewSpotSelect();
    renderStatsAndChart();

    els.addSpotForm.reset();
  } catch (err) {
    console.error(err);
    alert("Could not add spot. Please try again.");
  }
}

async function handleAddReview() {
  const payload = {
    username: els.reviewUsername.value.trim(),
    spotId: Number(els.reviewSpot.value),
    rating: Number(els.reviewRating.value),
    text: els.reviewText.value.trim()
  };

  if (!payload.username || !payload.spotId || !payload.rating) {
    alert("Please choose a spot, rating, and enter your handle.");
    return;
  }

  try {
    const created = await apiPost("/api/reviews", payload);
    state.reviews.unshift(created);

    // also attach to the matching spot in state.spots (for avg rating on card)
    const spot = state.spots.find((s) => s.id === created.spotId);
    if (spot) {
      if (!spot.Reviews) spot.Reviews = [];
      spot.Reviews.push(created);
    }

    renderSpots();
    renderStatsAndChart();
    els.addReviewForm.reset();
  } catch (err) {
    console.error(err);
    alert("Could not submit review. Please try again.");
  }
}

// ---------- INIT ----------

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

async function init() {
  try {
    const [spots, reviews] = await Promise.all([
      apiGet("/api/spots"),
      apiGet("/api/reviews")
    ]);

    state.spots = spots;
    state.reviews = reviews;

    renderSpots();
    populateReviewSpotSelect();
    renderStatsAndChart();
    setupFormHandlers();
  } catch (err) {
    console.error("Failed to initialize app:", err);
  }
}

document.addEventListener("DOMContentLoaded", init);
