// Final/script.js

document.addEventListener('DOMContentLoaded', () => {
  const restaurantListEl = document.getElementById('restaurant-list');      // cards container
  const ratingChartCanvas = document.getElementById('ratingChart');         // <canvas> for chart
  const addSpotForm = document.getElementById('add-spot-form');             // "Add a New Spot" form
  const reviewForm = document.getElementById('review-form');                // "Drop a Review" form
  const reviewRestaurantSelect = document.getElementById('review-restaurant-select'); // <select>
  const statusEl = document.getElementById('status-message');               // optional status text

  let ratingChart = null;

  //
  // Helper – show quick status messages
  //
  function showStatus(message, type = 'info') {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = `status status-${type}`;
    if (message) {
      setTimeout(() => {
        statusEl.textContent = '';
        statusEl.className = 'status';
      }, 3000);
    }
  }

  //
  // 1. Load restaurants from API and render cards + dropdown
  //
  async function loadRestaurants() {
    try {
      const res = await fetch('/api/restaurants');
      const restaurants = await res.json();
      renderRestaurantList(restaurants);
      populateRestaurantSelect(restaurants);
    } catch (err) {
      console.error('Error loading restaurants:', err);
      showStatus('Failed to load restaurants.', 'error');
    }
  }

  function renderRestaurantList(restaurants) {
    if (!restaurantListEl) return;

    if (restaurants.length === 0) {
      restaurantListEl.innerHTML = `
        <p class="empty-message">No spots yet. Be the first to add one!</p>
      `;
      return;
    }

    restaurantListEl.innerHTML = restaurants
      .map((r) => {
        const price = r.priceRange || '—';
        const img = r.imageUrl
          ? `<div class="card-image" style="background-image:url('${r.imageUrl}')"></div>`
          : `<div class="card-image card-image-placeholder">No image</div>`;

        return `
          <article class="restaurant-card">
            ${img}
            <div class="restaurant-card-body">
              <h3 class="restaurant-name">${r.name}</h3>
              <p class="restaurant-meta">
                <span>${r.city || 'Unknown city'}</span> • 
                <span>${r.cuisine || 'Any cuisine'}</span> • 
                <span class="price-range">${price}</span>
              </p>
              <p class="restaurant-created">
                Added: ${new Date(r.createdAt).toLocaleDateString()}
              </p>
            </div>
          </article>
        `;
      })
      .join('');
  }

  function populateRestaurantSelect(restaurants) {
    if (!reviewRestaurantSelect) return;

    reviewRestaurantSelect.innerHTML = '<option value="">Select</option>';

    restaurants.forEach((r) => {
      const opt = document.createElement('option');
      opt.value = r.id;
      opt.textContent = r.name;
      reviewRestaurantSelect.appendChild(opt);
    });
  }

  //
  // 2. Handle "Add Spot" form -> POST /api/restaurants
  //
  async function handleAddSpot(e) {
    e.preventDefault();
    showStatus('');

    // ⚠️ Make sure these IDs match your HTML inputs.
    const usernameInput = document.getElementById('spot-username');
    const nameInput = document.getElementById('spot-name');
    const cityInput = document.getElementById('spot-city');
    const cuisineInput = document.getElementById('spot-cuisine');
    const priceInput = document.getElementById('spot-price');
    const imageInput = document.getElementById('spot-image');

    const username = usernameInput?.value.trim();
    const name = nameInput?.value.trim();
    const city = cityInput?.value.trim();
    const cuisine = cuisineInput?.value.trim();
    const priceRange = priceInput?.value;
    const imageUrl = imageInput?.value.trim();

    if (!name) {
      showStatus('Please enter a restaurant name.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, city, cuisine, priceRange, imageUrl }),
      });

      if (!res.ok) {
        throw new Error('Bad response from server');
      }

      await res.json();
      showStatus('Spot added!', 'success');
      if (addSpotForm) addSpotForm.reset();

      // Reload restaurants + dropdown
      await loadRestaurants();
    } catch (err) {
      console.error('Error adding restaurant:', err);
      showStatus('Failed to add spot.', 'error');
    }
  }

  //
  // 3. Handle "Submit Review" form -> POST /api/reviews
  //
  async function handleAddReview(e) {
    e.preventDefault();
    showStatus('');

    // ⚠️ Ensure IDs match your HTML
    const usernameInput = document.getElementById('review-username');
    const ratingInput = document.getElementById('review-rating');
    const textInput = document.getElementById('review-text');

    const username = usernameInput?.value.trim();
    const rating = parseInt(ratingInput?.value, 10);
    const reviewText = textInput?.value.trim();
    const restaurantId = reviewRestaurantSelect?.value;

    if (!username || !restaurantId || !rating) {
      showStatus('Please fill in username, restaurant, and rating.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, rating, reviewText, restaurantId }),
      });

      if (!res.ok) {
        throw new Error('Bad response from server');
      }

      await res.json();
      showStatus('Review submitted!', 'success');
      if (reviewForm) reviewForm.reset();

      // Reload chart data after a new review
      await loadRatingsSummary();
    } catch (err) {
      console.error('Error adding review:', err);
      showStatus('Failed to submit review.', 'error');
    }
  }

  //
  // 4. Ratings summary -> chart
  //
  async function loadRatingsSummary() {
    if (!ratingChartCanvas) return;

    try {
      const res = await fetch('/api/ratings-summary');
      const summary = await res.json();
      renderRatingChart(summary);
    } catch (err) {
      console.error('Error loading ratings summary:', err);
    }
  }

  function renderRatingChart(summary) {
    if (!ratingChartCanvas) return;

    const ctx = ratingChartCanvas.getContext('2d');
    const labels = ['1★', '2★', '3★', '4★', '5★'];
    const data = [
      summary[1] || 0,
      summary[2] || 0,
      summary[3] || 0,
      summary[4] || 0,
      summary[5] || 0,
    ];

    if (!window.Chart) {
      console.warn('Chart.js is not loaded, cannot render chart.');
      return;
    }

    if (ratingChart) {
      ratingChart.data.datasets[0].data = data;
      ratingChart.update();
      return;
    }

    ratingChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Number of reviews',
            data,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
          },
        },
      },
    });
  }

  //
  // 5. Wire up event listeners and initial loads
  //
  if (addSpotForm) {
    addSpotForm.addEventListener('submit', handleAddSpot);
  }

  if (reviewForm) {
    reviewForm.addEventListener('submit', handleAddReview);
  }

  loadRestaurants();
  loadRatingsSummary();
});
