// Load recipes on page load
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
            <p><strong>By:</strong> ${r.createdBy || "Anonymous"}</p>
            <p><strong>Ingredients:</strong><br>${r.ingredients.replace(/\n/g, "<br>")}</p>
            <p><strong>Instructions:</strong><br>${r.instructions}</p>
            ${r.imageUrl ? `<img src="${r.imageUrl}" alt="${r.title}">` : ""}
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
