document.addEventListener("DOMContentLoaded", loadRecipes);

async function loadRecipes() {
    const res = await fetch("/recipes");
    const recipes = await res.json();

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
        `;

        feed.appendChild(card);
    });
}

// Add new recipe
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

    loadRecipes();  // Refresh feed
    e.target.reset(); // Clear form
});
