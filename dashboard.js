function greetingText() {
  const name = window.wellnessProfile && window.wellnessProfile.name
    ? window.wellnessProfile.name
    : "there";
  return `Hi, ${name}!`;
}

function renderBars(elementId, values, labels) {
  const max = Math.max(...values, 1);
  document.getElementById(elementId).innerHTML = values
    .map(
      (v, i) => `
      <div class="bar-col">
        <span class="bar-val">${v}</span>
        <div class="bar-track"><div class="bar" style="height:${Math.round((v / max) * 100)}%"></div></div>
        <span class="bar-label">${labels[i]}</span>
      </div>`
    )
    .join("");
}

function renderDashboard() {
  const habits = habitValues();
  const goals = loadData(KEYS.goals, []);
  const doneGoals = goals.filter((g) => g.done).length;
  const entry = loadData(KEYS.journal, {})[dateKey()];
  const mood = entry ? MOODS.find((m) => m.id === entry.mood) : null;
  const water = HABITS.find((h) => h.id === "water");
  const sleep = HABITS.find((h) => h.id === "sleep");

  document.getElementById("greeting").textContent = greetingText();

  const stats = [
    { emoji: "🍎", value: foodTotalFor(), label: "kcal logged", color: "#ffe6d0" },
    { emoji: "💧", value: `${habits.water || 0}/${water.goal}`, label: "glasses of water", color: "#d7f0ff" },
    { emoji: "😴", value: `${habits.sleep || 0}/${sleep.goal}`, label: "hours of sleep", color: "#e8e1ff" },
    { emoji: "🏃", value: habits.move || 0, label: "minutes moved", color: "#dcf6d4" },
    { emoji: "💪", value: workoutsFor().length, label: "workouts done", color: "#ffe0ec" },
    { emoji: "🎯", value: `${doneGoals}/${goals.length}`, label: "goals done", color: "#fff4c9" },
    { emoji: mood ? mood.emoji : "🙂", value: mood ? mood.label : "\u2014", label: "today's mood", color: "#e4f0ff" },
  ];

  document.getElementById("stats").innerHTML = stats
    .map(
      (s) => `
      <div class="stat" style="--chip:${s.color}">
        <span class="stat-emoji">${s.emoji}</span>
        <strong>${s.value}</strong>
        <span>${s.label}</span>
      </div>`
    )
    .join("");

  const days = lastDays(7);
  const labels = days.map((d) => d.toLocaleDateString([], { weekday: "short" }));
  renderBars("moveChart", days.map((d) => habitValues(dateKey(d)).move || 0), labels);
  renderBars("foodChart", days.map((d) => foodTotalFor(dateKey(d))), labels);
}