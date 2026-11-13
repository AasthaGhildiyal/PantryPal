
const sampleRecipes = [
  {
    name: "Aloo Tomato Curry",
    emoji: "🍛",
    time: "20 minutes",
    description: "A comforting everyday curry using simple kitchen staples.",
    ingredients: ["potato", "tomato", "onion"],
    steps: [
      "Wash, peel and chop the potatoes.",
      "Heat oil in a pan and sauté chopped onion.",
      "Add tomatoes, salt and spices. Cook until soft.",
      "Add potatoes and a little water.",
      "Cover and cook until the potatoes are tender."
    ]
  },
  {
    name: "Vegetable Fried Rice",
    emoji: "🍚",
    time: "15 minutes",
    description: "A quick way to turn leftover rice into a satisfying meal.",
    ingredients: ["rice", "onion", "carrot", "peas"],
    steps: [
      "Heat a little oil in a pan.",
      "Add chopped onion and available vegetables.",
      "Add cooked rice and mix gently.",
      "Season with salt, pepper and soy sauce if available.",
      "Stir-fry for a few minutes and serve."
    ]
  },
  {
    name: "Masala Omelette",
    emoji: "🍳",
    time: "10 minutes",
    description: "A protein-rich and flavourful quick breakfast.",
    ingredients: ["egg", "onion", "tomato"],
    steps: [
      "Beat eggs in a bowl.",
      "Mix in chopped onion, tomato, salt and spices.",
      "Heat a little oil in a pan.",
      "Pour in the egg mixture.",
      "Cook both sides until set."
    ]
  },
  {
    name: "Simple Tomato Rice",
    emoji: "🥘",
    time: "20 minutes",
    description: "A tangy, budget-friendly rice dish.",
    ingredients: ["rice", "tomato", "onion"],
    steps: [
      "Cook rice and keep it aside.",
      "Sauté chopped onion in a pan.",
      "Add chopped tomatoes and spices.",
      "Cook until the tomatoes become soft.",
      "Mix in the rice and serve warm."
    ]
  }
];

let currentRecipes = [];
let currentIngredients = "";

document.querySelectorAll(".chip").forEach(button => {
  button.addEventListener("click", () => {
    const box = document.getElementById("ingredients");
    const item = button.dataset.ingredient;
    const current = box.value.trim();

    const existing = current.split(",").map(x => x.trim().toLowerCase());

    if (!existing.includes(item.toLowerCase())) {
      box.value = current ? current + ", " + item : item;
    }
  });
});

// Add styles for the AI advice section.
const aiStyles = document.createElement("style");
aiStyles.textContent = `
  .ai-btn {
    width: 100%;
    margin-top: 16px;
    padding: 12px 16px;
    border: none;
    border-radius: 12px;
    background: #526b55;
    color: white;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    transition: background .2s ease;
  }

  .ai-btn:hover {
    background: #3f5843;
  }

  .ai-btn:disabled {
    opacity: .65;
    cursor: wait;
  }

  .ai-advice {
    display: none;
    margin-top: 14px;
    padding: 16px;
    border-radius: 12px;
    background: #f1f4ed;
    color: #344638;
    line-height: 1.7;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    font-size: .94rem;
  }

  .ai-advice.visible {
    display: block;
  }

  .ai-heading {
    font-weight: 700;
    margin-bottom: 8px;
  }
`;
document.head.appendChild(aiStyles);

async function findRecipes() {
  const input = document.getElementById("ingredients").value.trim();
  const diet = document.getElementById("diet").value;
  const grid = document.getElementById("recipeGrid");
  const button = document.getElementById("findBtn");

  if (!input) {
    alert("Please enter at least one ingredient!");
    return;
  }

  currentIngredients = input;
  button.disabled = true;
  button.textContent = "Finding your recipes...";

  grid.innerHTML = `
    <div class="empty-state">
      <span>🥣</span>
      <p>Looking through your ingredients...</p>
    </div>`;

  try {
    const response = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients: input, diet })
    });

    if (!response.ok) throw new Error("Recipe service unavailable");

    const data = await response.json();
    currentRecipes = data.recipes || [];
    displayRecipes(currentRecipes);

  } catch (error) {
    console.error("Recipe search error:", error);

    const ingredients = input.toLowerCase().split(",").map(x => x.trim());

    currentRecipes = sampleRecipes.filter(recipe =>
      recipe.ingredients.some(item =>
        ingredients.some(userItem =>
          userItem.includes(item) || item.includes(userItem)
        )
      )
    );

    displayRecipes(currentRecipes);
  } finally {
    button.disabled = false;
    button.innerHTML = 'Find my recipes <span>→</span>';
  }
}

function displayRecipes(recipes) {
  const grid = document.getElementById("recipeGrid");

  if (!recipes.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <span>🥕</span>
        <p>No close matches yet.</p>
        <small>Try adding more ingredients.</small>
      </div>`;
    return;
  }

  grid.innerHTML = recipes.map((recipe, index) => `
    <article class="recipe-card">
      <div class="recipe-emoji">${escapeHTML(recipe.emoji || "🍽️")}</div>
      <h3>${escapeHTML(recipe.name || "Recipe")}</h3>
      <p>${escapeHTML(recipe.description || "A recipe made with your available ingredients.")}</p>
      <div class="recipe-meta">⏱ ${escapeHTML(recipe.time || "Easy to prepare")}</div>

      <details>
        <summary>View basic cooking instructions</summary>
        <ol>
          ${(recipe.steps || []).map(step => `<li>${escapeHTML(step)}</li>`).join("")}
        </ol>
      </details>

      <button class="ai-btn" data-recipe-index="${index}">
        ✨ Ask PantryPal AI
      </button>

      <div class="ai-advice" id="ai-advice-${index}" aria-live="polite"></div>
    </article>
  `).join("");

  grid.querySelectorAll(".ai-btn").forEach(button => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.recipeIndex);
      getGraniteAdvice(index, button);
    });
  });
}

async function getGraniteAdvice(index, button) {
  const recipe = currentRecipes[index];
  const adviceBox = document.getElementById(`ai-advice-${index}`);

  if (!recipe || !currentIngredients) return;

  button.disabled = true;
  button.textContent = "⏳ PantryPal AI is preparing your advice...";

  adviceBox.classList.add("visible");
  adviceBox.textContent = "Connecting to IBM Granite and generating your personalised cooking advice...";

  try {
    const response = await fetch("/api/ask-granite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ingredients: currentIngredients,
        recipe_title: recipe.name
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Could not generate AI advice.");
    }

    adviceBox.innerHTML = `
      <div class="ai-heading">✨ Your personalised PantryPal AI advice</div>
      <div>${escapeHTML(data.advice || "No advice was returned.")}</div>
    `;

    button.textContent = "✓ AI advice generated";

  } catch (error) {
    console.error("Granite advice error:", error);

    adviceBox.textContent =
      "Sorry! AI advice could not be generated right now. Please try again. Details: " +
      error.message;

    button.textContent = "↻ Try AI advice again";
  } finally {
    button.disabled = false;
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}
