let likesChart; 
let ingredientsChart;

// Store recipes in memory for faster searching
let allRecipes = [];

// Load recipes when the page loads
document.addEventListener("DOMContentLoaded", loadRecipes);

// ---------------------------
// Fetch + Render Recipes
// ---------------------------
async function loadRecipes() {
    const res = await fetch("/recipes");
    allRecipes = await res.json();   // Save recipes in memory
    renderRecipes(allRecipes);

    // Render charts TOO
    renderLikesChart(allRecipes);
    renderIngredientsChart(allRecipes);
}

// Helper function to render recipe cards
function renderRecipes(recipes) {
    const feed = document.getElementById("recipeFeed");
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

// ---------------------------
// Add New Recipe
// ---------------------------
document.getElementById("recipeForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const newRecipe = {
        title: document.getElementById("title").value,
        ingredients: document.getElementById("ingredients").value,
        instructions: document.getElementById("instructions").value,
        imageUrl: document.getElementById("imageUrl").value,
        createdBy: document.getElementById("createdBy").value,
        category: document.getElementById("category").value   // ★ NEW FIELD
    };

    const res = await fetch("/recipes", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(newRecipe)
    });

    const created = await res.json();

    // Add to local memory + rerender
    allRecipes.push(created);
    renderRecipes(allRecipes);

    // Re-render charts because new data was added
    renderLikesChart(allRecipes);
    renderIngredientsChart(allRecipes);

    e.target.reset();
});

// ---------------------------
// Like Button Handler
// ---------------------------
document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("like-btn")) {
        const id = e.target.getAttribute("data-id");

        const res = await fetch(`/recipes/${id}/like`, {
            method: "POST"
        });

        const data = await res.json();

        // Update local memory
        const recipe = allRecipes.find(r => r.id == id);
        if (recipe) recipe.likes = data.likes;

        // Update UI
        e.target.innerHTML = `🤍 Like (${data.likes})`;

        // Update charts because likes changed
        renderLikesChart(allRecipes);
    }
});

// ---------------------------
// LIVE SEARCH FEATURE
// ---------------------------
document.getElementById("searchInput").addEventListener("input", function () {
    const searchText = this.value.toLowerCase();

    const filtered = allRecipes.filter(r =>
        r.title.toLowerCase().includes(searchText) ||
        r.ingredients.toLowerCase().includes(searchText) ||
        (r.createdBy || "").toLowerCase().includes(searchText) ||
        (r.category || "").toLowerCase().includes(searchText)  // ★ Also searchable
    );

    renderRecipes(filtered);
});

// ---------------------------
// CHART 1: Most Liked Recipes (Bar Chart)
// ---------------------------
function renderLikesChart(recipes) {
    const labels = recipes.map(r => r.title);
    const likes = recipes.map(r => r.likes);

    if (likesChart) likesChart.destroy();

    likesChart = new Chart(document.getElementById("likesChart"), {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Likes",
                data: likes,
                backgroundColor: "#ff92a9ff",
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// ---------------------------
// CHART 2: Top Ingredients (Pie Chart)
// ---------------------------
function renderIngredientsChart(recipes) {
    let ingredientCounts = {};

    recipes.forEach(recipe => {
        const items = recipe.ingredients.split("\n");
        items.forEach(item => {
            const cleaned = item.trim().toLowerCase();
            if (cleaned.length > 0) {
                ingredientCounts[cleaned] = (ingredientCounts[cleaned] || 0) + 1;
            }
        });
    });

    // Take top 5 ingredients
    const sorted = Object.entries(ingredientCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const labels = sorted.map(i => i[0]);
    const counts = sorted.map(i => i[1]);

    if (ingredientsChart) ingredientsChart.destroy();

    ingredientsChart = new Chart(document.getElementById("ingredientsChart"), {
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
        },
        options: { responsive: true }
    });
}
