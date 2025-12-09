let likesChart;
let ingredientsChart;

// Store recipes in memory
let allRecipes = [];

/* --------------------------------------------------
   PAGE ROUTING (detect which HTML file you're on)
-------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    const page = window.location.pathname;

    if (page.includes("feed")) {
        setupFeedPage();
    }
    if (page.includes("add")) {
        setupAddPage();
    }
    if (page.includes("insights")) {
        setupInsightsPage();
    }
});

/* --------------------------------------------------
   SETUP: FEED PAGE
-------------------------------------------------- */
function setupFeedPage() {
    loadRecipes();

    const search = document.getElementById("searchInput");
    if (search) {
        search.addEventListener("input", handleSearch);
    }

    // Like button handler must always work on this page
    document.addEventListener("click", likeButtonHandler);
}

/* --------------------------------------------------
   SETUP: ADD PAGE
-------------------------------------------------- */
function setupAddPage() {
    const form = document.getElementById("recipeForm");
    if (form) {
        form.addEventListener("submit", submitRecipe);
    }
}

/* --------------------------------------------------
   SETUP: INSIGHTS PAGE
-------------------------------------------------- */
function setupInsightsPage() {
    loadRecipesForCharts();
}

/* --------------------------------------------------
   FETCH RECIPES FOR FEED + CHARTS
-------------------------------------------------- */
async function loadRecipes() {
    const res = await fetch("/recipes");
    allRecipes = await res.json();

    renderRecipes(allRecipes);
}

async function loadRecipesForCharts() {
    const res = await fetch("/recipes");
    allRecipes = await res.json();

    renderLikesChart(allRecipes);
    renderIngredientsChart(allRecipes);
}

/* --------------------------------------------------
   RENDER FEED CARDS
-------------------------------------------------- */
function renderRecipes(recipes) {
    const feed = document.getElementById("recipeFeed");
    if (!feed) return; // Not on feed page

    feed.innerHTML = "";

    recipes.forEach(r => {
        const card = document.createElement("div");
        card.classList.add("recipe-card");

        const categoryTag = r.category
            ? `<span class="category-tag">${r.category}</span>`
            : "";

        card.innerHTML = `
            ${categoryTag}
            <h3>${r.title}</h3>
            <p class="creator">Posted by <strong>${r.createdBy || "Anonymous"}</strong></p>
            ${r.imageUrl ? `<img src="${r.imageUrl}" alt="${r.title}">` : ""}
            <p class="section-title">Ingredients:</p>
            <p>${r.ingredients.replace(/\n/g, "<br>")}</p>
            <p class="section-title">Instructions:</p>
            <p>${r.instructions}</p>
            <button class="like-btn" data-id="${r.id}">
                🤍 Like (${r.likes})
            </button>
        `;
        feed.appendChild(card);
    });
}

/* --------------------------------------------------
   ADD NEW RECIPE
-------------------------------------------------- */
async function submitRecipe(e) {
    e.preventDefault();

    const newRecipe = {
        title: document.getElementById("title").value,
        ingredients: document.getElementById("ingredients").value,
        instructions: document.getElementById("instructions").value,
        imageUrl: document.getElementById("imageUrl").value,
        createdBy: document.getElementById("createdBy").value,
        category: document.getElementById("category").value
    };

    try {
        const res = await fetch("/recipes", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(newRecipe)
        });

        const created = await res.json();
        allRecipes.push(created);

        // Optional redirect after adding:
        alert("Recipe added!");
        window.location.href = "feed.html";

    } catch (err) {
        console.error("Error adding recipe:", err);
    }

    e.target.reset();
}

/* --------------------------------------------------
   LIKE BUTTON FUNCTIONALITY
-------------------------------------------------- */
async function likeButtonHandler(e) {
    if (!e.target.classList.contains("like-btn")) return;

    const id = e.target.getAttribute("data-id");

    const res = await fetch(`/recipes/${id}/like`, { method: "POST" });
    const data = await res.json();

    const recipe = allRecipes.find(r => r.id == id);
    if (recipe) recipe.likes = data.likes;

    e.target.innerHTML = `🤍 Like (${data.likes})`;

    if (document.getElementById("likesChart")) {
        renderLikesChart(allRecipes);
    }
}

/* --------------------------------------------------
   LIVE SEARCH
-------------------------------------------------- */
function handleSearch() {
    const searchText = this.value.toLowerCase();

    const filtered = allRecipes.filter(r =>
        r.title.toLowerCase().includes(searchText) ||
        r.ingredients.toLowerCase().includes(searchText) ||
        (r.createdBy || "").toLowerCase().includes(searchText) ||
        (r.category || "").toLowerCase().includes(searchText)
    );

    renderRecipes(filtered);
}

/* --------------------------------------------------
   CHART 1: MOST LIKED RECIPES
-------------------------------------------------- */
function renderLikesChart(recipes) {
    const ctx = document.getElementById("likesChart");
    if (!ctx) return;

    const labels = recipes.map(r => r.title);
    const likes = recipes.map(r => r.likes);

    if (likesChart) likesChart.destroy();

    likesChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Likes",
                data: likes,
                backgroundColor: "#ff92a9ff"
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
}

/* --------------------------------------------------
   CHART 2: TOP INGREDIENTS
-------------------------------------------------- */
function renderIngredientsChart(recipes) {
    const ctx = document.getElementById("ingredientsChart");
    if (!ctx) return;

    let ingredientCounts = {};

    recipes.forEach(recipe => {
        recipe.ingredients.split("\n").forEach(item => {
            const cleaned = item.trim().toLowerCase();
            if (cleaned.length > 0) {
                ingredientCounts[cleaned] = (ingredientCounts[cleaned] || 0) + 1;
            }
        });
    });

    const sorted = Object.entries(ingredientCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const labels = sorted.map(i => i[0]);
    const counts = sorted.map(i => i[1]);

    if (ingredientsChart) ingredientsChart.destroy();

    ingredientsChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                data: counts,
                backgroundColor: [
                    "#ffbdcbff",
                    "#aed1e8ff",
                    "#fef0cbff",
                    "#ccf7f7ff",
                    "#dccbfdff"
                ]
            }]
        }
    });
}
