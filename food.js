function foodFor(key = dateKey()) {
  return loadData(KEYS.food, {})[key] || [];
}

function foodTotalFor(key = dateKey()) {
  return foodFor(key).reduce((total, item) => total + Number(item.calories || 0), 0);
}

function renderFood() {
  const meals = ["Breakfast", "Lunch", "Dinner", "Snack"];
  const items = foodFor();

  document.getElementById("foodList").innerHTML = meals
    .map((meal) => {
      const mealItems = items.filter((item) => item.meal === meal);
      const mealTotal = mealItems.reduce((total, item) => total + Number(item.calories || 0), 0);
      const rows = mealItems.length
        ? mealItems
            .map(
              (item) => `
                <div class="item">
                  <span>${escapeHtml(item.name)}</span>
                  <strong>${item.calories} kcal</strong>
                  <button class="del" data-id="${item.id}" aria-label="Delete ${escapeHtml(item.name)}">x</button>
                </div>`
            )
            .join("")
        : '<p class="empty">Nothing logged yet.</p>';

      return `
        <div class="meal">
          <div class="meal-head"><span>${meal}</span><span>${mealTotal} kcal</span></div>
          ${rows}
        </div>`;
    })
    .join("");

  document.getElementById("foodTotal").textContent = foodTotalFor();
}

function addFood() {
  const nameInput = document.getElementById("foodName");
  const caloriesInput = document.getElementById("foodCal");
  const msg = document.getElementById("foodMsg");
  const name = nameInput.value.trim();
  const calories = Number(caloriesInput.value);

  if (!name) {
    msg.textContent = "Enter a food name.";
    return;
  }
  if (!Number.isFinite(calories) || calories < 0) {
    msg.textContent = "Enter a valid calorie amount.";
    return;
  }

  const all = loadData(KEYS.food, {});
  const key = dateKey();
  if (!all[key]) all[key] = [];
  all[key].push({
    id: makeId(),
    meal: document.getElementById("foodMeal").value,
    name,
    calories: Math.round(calories),
  });
  saveData(KEYS.food, all);

  nameInput.value = "";
  caloriesInput.value = "";
  msg.textContent = "Added!";
  renderFood();
  onDataChange();
}

function deleteFood(id) {
  const all = loadData(KEYS.food, {});
  const key = dateKey();
  all[key] = (all[key] || []).filter((item) => item.id !== id);
  saveData(KEYS.food, all);
  renderFood();
  onDataChange();
}

function initFood() {
  document.getElementById("foodAdd").addEventListener("click", addFood);
  document.getElementById("foodCal").addEventListener("keydown", (event) => {
    if (event.key === "Enter") addFood();
  });
  document.getElementById("foodList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-id]");
    if (button) deleteFood(button.dataset.id);
  });
  renderFood();
}