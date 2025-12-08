// Load recipes when page loads
document.addEventListener("DOMContentLoaded", loadRecipes);

// ---------------------------
// Fetch + Render Recipes
// ---------------------------
async function loadRecipes() {
    const res = await fetch("/recipes");
    const recipes = await res.json();
    renderRecipes(recipes);
}

// Helper function to render recipe cards
function renderRecipes(recipes) {
    const feed = document.getElementById("recipeFeed");
    feed.innerHTML = "";

    recipes.forEach(r => {
        const card = document.createElement("div");
        card.classList.add("recipe-card");

        card.innerHTML = `
            <h3>${r.title}</h3>
            <p class="creator">Posted by <strong>${r.createdBy || "Anonymous"}</strong></p>

            ${r.imageUrl ? `<img src="${r.imageUrl}" alt="${r.title}">` : ""}

            <p class="section-title">Ingredients:</p>
            <p>${r.ingredients.replace(/\n/g, "<br>")}</p>

            <p class="section-title">Instructions:</p>
            <p>${r.instructions}</p>

            <button class="like-btn" data-id="${r.id}">
                🖤 Like (${r.likes})
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
        createdBy: document.getElementById("createdBy").value
    };

    await fetch("/recipes", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(newRecipe)
    });

    loadRecipes();      // Refresh feed
    e.target.reset();   // Clear form
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

        // Update button text immediately
        e.target.innerHTML = `🖤 Like (${data.likes})`;
    }
});

// ---------------------------
// LIVE SEARCH FEATURE
// ---------------------------
document.getElementById("searchInput").addEventListener("input", async function () {
    const searchText = this.value.toLowerCase();

    const res = await fetch("/recipes");
    const recipes = await res.json();

    const filtered = recipes.filter(r =>
        r.title.toLowerCase().includes(searchText) ||
        r.ingredients.toLowerCase().includes(searchText) ||
        (r.createdBy || "").toLowerCase().includes(searchText)
    );

    renderRecipes(filtered);
});
