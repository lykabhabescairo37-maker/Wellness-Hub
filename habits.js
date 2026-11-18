const HABITS = [
  { id: "water", name: "Water", emoji: "💧", unit: "glasses", goal: 8, step: 1, max: 20, color: "#d7f0ff" },
  { id: "sleep", name: "Sleep", emoji: "😴", unit: "hours", goal: 8, step: 1, max: 14, color: "#e8e1ff" },
  { id: "move", name: "Movement", emoji: "🏃", unit: "minutes", goal: 30, step: 10, max: 300, color: "#ffe6d0" },
];

function habitValues(key = dateKey()) {
  return loadData(KEYS.habits, {})[key] || {};
}

function addToHabit(id, amount) {
  const habit = HABITS.find((h) => h.id === id);
  if (!habit) return;
  const all = loadData(KEYS.habits, {});
  const key = dateKey();
  if (!all[key]) all[key] = {};
  const next = (all[key][id] || 0) + amount;
  all[key][id] = Math.max(0, Math.min(next, habit.max));
  saveData(KEYS.habits, all);
  renderHabits();
}

function renderHabits() {
  const values = habitValues();
  document.getElementById("habitList").innerHTML = HABITS.map((h) => {
    const value = values[h.id] || 0;
    const pct = Math.round(Math.min(value / h.goal, 1) * 100);
    return `
      <div class="habit" style="--chip:${h.color}">
        <div class="habit-top">
          <span>${h.emoji} ${h.name}</span>
          <span class="habit-count">${value} / ${h.goal} ${h.unit}</span>
        </div>
        <div class="mini-bar"><div class="mini-fill" style="width:${pct}%"></div></div>
        <div class="habit-buttons">
          <button data-id="${h.id}" data-dir="-1" aria-label="Remove ${h.name}">\u2212${h.step}</button>
          <button data-id="${h.id}" data-dir="1" aria-label="Add ${h.name}">+${h.step}</button>
        </div>
      </div>`;
  }).join("");
}

function initHabits() {
  document.getElementById("habitList").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const habit = HABITS.find((h) => h.id === btn.dataset.id);
    addToHabit(habit.id, Number(btn.dataset.dir) * habit.step);
    onDataChange();
  });

  document.getElementById("habitReset").addEventListener("click", () => {
    if (!confirm("Reset today's habits?")) return;
    const all = loadData(KEYS.habits, {});
    delete all[dateKey()];
    saveData(KEYS.habits, all);
    renderHabits();
    onDataChange();
  });

  renderHabits();
}