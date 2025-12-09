/* --------------------------------------------------
   GLOBAL STATE
-------------------------------------------------- */
let likesChart;
let ingredientsChart;
let allRecipes = [];

/* --------------------------------------------------
   PAGE ROUTING — runs only what each page needs
-------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    const page = window.location.pathname;

    if (page.includes("feed")) setupFeedPage();
    if (page.includes("add")) setupAddPage();
    if (page.includes("insights")) setupInsightsPage();
    if (page.includes("index")) setupLandingPage();
});

/* --------------------------------------------------
   LANDING PAGE — LOGIN + SIGNUP MODALS
-------------------------------------------------- */
function setupLandingPage() {
    const loginBtn = document.getElementById("loginBtn");
    const signupBtn = document.getElementById("signupBtn");
    const guestBtn = document.getElementById("guestBtn");

    if (loginBtn) loginBtn.onclick = () => openModal("loginModal");
    if (signupBtn) signupBtn.onclick = () => openModal("signupModal");
    if (guestBtn) guestBtn.onclick = () => window.location.href = "feed.html";
}

function openModal(id) {
    document.getElementById(id).classList.add("show");
}

function closeModal(id) {
    document.getElementById(id).classList.remove("show");
}

function fakeLogin() {
    alert("Logged in! (Demo only)");
    window.location.href = "feed.html";
}

function fakeSignup() {
    alert("Account created! (Demo only)");
    window.location.href = "feed.html";
}

/* --------------------------------------------------
   FEED PAGE SETUP
-------------------------------------------------- */
function setupFeedPage() {
    loadRecipes();

    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.addEventListener("input", handleSearch);

    document.addEventListener("click", likeButtonHandler);
}

/* --------------------------------------------------
   ADD PAGE SETUP
-------------------------------------------------- */
function setupAddPage() {
    const form = document.getElementById("recipeForm");
    if (form) form.addEventListener("submit", submitRecipe);
}

/* --------------------------------------------------
   INSIGHTS PAGE SETUP
-------------------------------------------------- */
function setupInsightsPage() {
    loadRecipesForCharts();
}

/* --------------------------------------------------
   LOAD RECIPES FOR FEED
-------------------------------------------------- */
async function loadRecipes() {
    const res = await fetch("/recipes");
    allRecipes = await res.json();
    renderRecipes(allRecipes);
}

/* --------------------------------------------------
   LOAD RECIPES FOR CHARTS
-------------------------------------------------- */
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
    if (!feed) return;

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
   SUBMIT NEW RECIPE
-------------------------------------------------- */
async function submitRecipe(e) {
    e.preventDefault();

    const recipe = {
        title: document.getElementById("title").value,
        category: document.getElementById("category").value,
        ingredients: document.getElementById("ingredients").value,
        instructions: document.getElementById("instructions").value,
        imageUrl: document.getElementById("imageUrl").value,
        createdBy: document.getElementById("createdBy").value
    };

    try {
        const res = await fetch("/recipes", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(recipe)
        });

        const created = await res.json();
        allRecipes.push(created);

        alert("Recipe added!");
        window.location.href = "feed.html";

    } catch (err) {
        console.error("Error creating recipe:", err);
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
    const text = this.value.toLowerCase();

    const filtered = allRecipes.filter(r =>
        r.title.toLowerCase().includes(text) ||
        r.ingredients.toLowerCase().includes(text) ||
        (r.createdBy || "").toLowerCase().includes(text) ||
        (r.category || "").toLowerCase().includes(text)
    );

    renderRecipes(filtered);
}

/* --------------------------------------------------
   CHART: MOST LIKED
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
            labels,
            datasets: [{
                label: "Likes",
                data: likes,
                backgroundColor: "#ff92a9"
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
}

/* --------------------------------------------------
   CHART: TOP INGREDIENTS
-------------------------------------------------- */
function renderIngredientsChart(recipes) {
    const ctx = document.getElementById("ingredientsChart");
    if (!ctx) return;

    const ingredientCounts = {};

    recipes.forEach(recipe => {
        recipe.ingredients.split("\n").forEach(item => {
            const key = item.trim().toLowerCase();
            if (key) ingredientCounts[key] = (ingredientCounts[key] || 0) + 1;
        });
    });

    const sorted = Object.entries(ingredientCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const labels = sorted.map(([k]) => k);
    const counts = sorted.map(([_, v]) => v);

    if (ingredientsChart) ingredientsChart.destroy();

    ingredientsChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels,
            datasets: [{
                data: counts,
                backgroundColor: [
                    "#ffbdcb", "#aed1e8", "#fef0cb", "#ccf7f7", "#dccbfd"
                ]
            }]
        }
    });
}
