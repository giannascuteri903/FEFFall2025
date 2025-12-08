// script.js

const API_BASE = ''; // same origin, so we can use relative paths

let ratingChart = null;

document.addEventListener('DOMContentLoaded', () => {
  fetchAndRenderRestaurants();
  setupAddRestaurantForm();
  setupAddReviewForm();
});

// Fetch restaurants and render UI
async function fetchAndRenderRestaurants() {
  try {
    const res = await fetch(`${API_BASE}/api/restaurants`);
    const data = await res.json();

    renderRestaurantGrid(data);
    populateReviewSelect(data);
    renderRatingChart(data);
  } catch (err) {
    console.error('Failed to load restaurants:', err);
    const grid = document.getElementById('restaurant-grid');
    if (grid) {
      grid.innerHTML = `<p class="error">Could not load restaurants. Try refreshing.</p>`;
    }
  }
}

function renderRestaurantGrid(restaurants) {
  const grid = document.getElementById('restaurant-grid');
  grid.innerHTML = '';

  if (!restaurants || restaurants.length === 0) {
    grid.innerHTML = `<p>No spots yet. Be the first to add one!</p>`;
    return;
  }

  restaurants.forEach((r) => {
    const avg = r.avg_rating == null ? '—' : `${r.avg_rating}★`;
    const count = r.review_count || 0;
    const vibeLabel =
      r.avg_rating == null
        ? 'Needs more data'
        : r.avg_rating >= 4.5
        ? 'Elite vibes'
        : r.avg_rating >= 4
        ? 'Great energy'
        : r.avg_rating >= 3
        ? 'Mixed reviews'
        : 'Risky pick';

    const card = document.createElement('article');
    card.className = 'restaurant-card';

    const imgUrl =
      r.image_url ||
      'https://via.placeholder.com/400x250?text=Chic+City+Eats';

    card.innerHTML = `
      <div class="card-image-wrap">
        <img src="${imgUrl}" alt="${r.name}" />
        <span class="price-tag">${r.price_range || '$$'}</span>
      </div>
      <div class="card-body">
        <h3>${r.name}</h3>
        <p class="card-location">${r.city}${
      r.cuisine ? ' · ' + r.cuisine : ''
    }</p>
        <div class="card-rating-row">
          <span class="rating-pill">${avg}</span>
          <span class="rating-count">${count} review${
      count === 1 ? '' : 's'
    }</span>
        </div>
        <p class="vibe-label">${vibeLabel}</p>
        ${renderMiniReviews(r.Reviews || [])}
      </div>
    `;

    grid.appendChild(card);
  });
}

function renderMiniReviews(reviews) {
  if (!reviews || reviews.length === 0) {
    return `<p class="no-reviews">No written reviews yet. Be the first to share the vibes.</p>`;
  }

  const topThree = reviews.slice(0, 3);

  const items = topThree
    .map(
      (rv) => `
      <li>
        <span class="mini-rating">${rv.rating}★</span>
        <span class="mini-text">${
          rv.review_text ? escapeHtml(rv.review_text) : '(no text)'
        }</span>
      </li>
    `
    )
    .join('');

  return `
    <ul class="mini-reviews">
      ${items}
    </ul>
  `;
}

function populateReviewSelect(restaurants) {
  const select = document.getElementById('review-restaurant-select');
  select.innerHTML = `<option value="">Select a restaurant…</option>`;

  restaurants.forEach((r) => {
    const opt = document.createElement('option');
    opt.value = r.id;
    opt.textContent = `${r.name} (${r.city})`;
    select.appendChild(opt);
  });
}

// Add-restaurant form
function setupAddRestaurantForm() {
  const form = document.getElementById('add-restaurant-form');
  const msg = document.getElementById('add-restaurant-message');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';
    msg.classList.remove('error', 'success');

    const formData = new FormData(form);
    const payload = {
      username: formData.get('username').trim(),
      name: formData.get('name').trim(),
      city: formData.get('city').trim(),
      cuisine: formData.get('cuisine').trim() || null,
      price_range: formData.get('price_range') || null,
      image_url: formData.get('image_url').trim() || null
    };

    if (!payload.username || !payload.name || !payload.city) {
      msg.textContent = 'Please fill out username, name, and city.';
      msg.classList.add('error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/restaurants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to add restaurant');
      }

      msg.textContent = 'Spot added! It’s now in the feed.';
      msg.classList.add('success');
      form.reset();

      // Refresh list + chart
      fetchAndRenderRestaurants();
    } catch (err) {
      console.error(err);
      msg.textContent = err.message || 'Something went wrong.';
      msg.classList.add('error');
    }
  });
}

// Add-review form
function setupAddReviewForm() {
  const form = document.getElementById('add-review-form');
  const msg = document.getElementById('add-review-message');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';
    msg.classList.remove('error', 'success');

    const formData = new FormData(form);
    const username = formData.get('username').trim();
    const restaurant_id = formData.get('restaurant_id');
    const rating = Number(formData.get('rating'));
    const review_text = formData.get('review_text').trim();

    if (!username || !restaurant_id || !rating) {
      msg.textContent = 'Please fill username, restaurant, and rating.';
      msg.classList.add('error');
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/api/restaurants/${restaurant_id}/reviews`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            rating,
            review_text: review_text || null
          })
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to add review');
      }

      msg.textContent = 'Review added! Thanks for sharing the vibes.';
      msg.classList.add('success');
      form.reset();

      // Refresh feed + chart
      fetchAndRenderRestaurants();
    } catch (err) {
      console.error(err);
      msg.textContent = err.message || 'Something went wrong.';
      msg.classList.add('error');
    }
  });
}

// Rating distribution chart
function renderRatingChart(restaurants) {
  const ctx = document.getElementById('ratingChart');
  if (!ctx) return;

  // Count how many reviews at each rating 1–5
  const buckets = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  restaurants.forEach((r) => {
    (r.Reviews || []).forEach((rv) => {
      if (buckets[rv.rating] != null) {
        buckets[rv.rating] += 1;
      }
    });
  });

  const labels = ['1★', '2★', '3★', '4★', '5★'];
  const values = [buckets[1], buckets[2], buckets[3], buckets[4], buckets[5]];

  // If chart already exists, destroy to avoid duplication
  if (ratingChart) {
    ratingChart.destroy();
  }

  ratingChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Number of reviews',
          data: values
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
}

// Basic HTML escaping for reviews
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
