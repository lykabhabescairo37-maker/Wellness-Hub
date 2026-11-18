const MOODS = [
  { id: "great", emoji: "😄", label: "Great" },
  { id: "good", emoji: "🙂", label: "Good" },
  { id: "okay", emoji: "😐", label: "Okay" },
  { id: "low", emoji: "😔", label: "Low" },
  { id: "tired", emoji: "😴", label: "Tired" },
];

let selectedMood = null;

/* ---------- Goals ---------- */
function renderGoals() {
  const goals = loadData(KEYS.goals, []);
  document.getElementById("goalList").innerHTML = goals.length
    ? goals
        .map(
          (g) => `
        <div class="goal ${g.done ? "done" : ""}">
          <input type="checkbox" id="goal-${g.id}" data-id="${g.id}" ${g.done ? "checked" : ""} />
          <label for="goal-${g.id}">${escapeHtml(g.text)}</label>
          <button class="del" data-del="${g.id}" aria-label="Delete goal">\u2715</button>
        </div>`
        )
        .join("")
    : '<p class="empty">No goals yet. Add one above!</p>';
}

function addGoal() {
  const input = document.getElementById("goalInput");
  const text = input.value.trim();
  if (!text) return;
  const goals = loadData(KEYS.goals, []);
  goals.push({ id: makeId(), text, done: false });
  saveData(KEYS.goals, goals);
  input.value = "";
  renderGoals();
  onDataChange();
}

function toggleGoal(id) {
  const goals = loadData(KEYS.goals, []);
  const goal = goals.find((g) => g.id === id);
  if (goal) goal.done = !goal.done;
  saveData(KEYS.goals, goals);
  renderGoals();
  onDataChange();
}

function deleteGoal(id) {
  saveData(KEYS.goals, loadData(KEYS.goals, []).filter((g) => g.id !== id));
  renderGoals();
  onDataChange();
}

function clearCompletedGoals() {
  saveData(KEYS.goals, loadData(KEYS.goals, []).filter((g) => !g.done));
  renderGoals();
  onDataChange();
}

/* ---------- Journal ---------- */
function renderMoodPicker() {
  document.getElementById("moodPicker").innerHTML = MOODS.map(
    (m) => `
    <button class="mood ${selectedMood === m.id ? "active" : ""}" data-id="${m.id}">
      <span>${m.emoji}</span>${m.label}
    </button>`
  ).join("");
}

function renderJournalList() {
  const journal = loadData(KEYS.journal, {});
  const keys = Object.keys(journal).sort().reverse().slice(0, 5);
  document.getElementById("journalList").innerHTML = keys.length
    ? keys
        .map((key) => {
          const entry = journal[key];
          const mood = MOODS.find((m) => m.id === entry.mood);
          const label = new Date(key + "T00:00:00").toLocaleDateString([], {
            month: "short",
            day: "numeric",
          });
          const note = entry.note ? ` \u2014 ${escapeHtml(entry.note)}` : "";
          return `<div class="entry">${mood ? mood.emoji : ""} <strong>${label}</strong>${note}</div>`;
        })
        .join("")
    : '<p class="empty">No entries yet.</p>';
}

function saveJournal() {
  const msgEl = document.getElementById("journalMsg");
  if (!selectedMood) {
    msgEl.textContent = "Pick a mood first.";
    return;
  }
  const journal = loadData(KEYS.journal, {});
  journal[dateKey()] = {
    mood: selectedMood,
    note: document.getElementById("journalNote").value.trim(),
  };
  saveData(KEYS.journal, journal);
  msgEl.textContent = "Saved!";
  renderJournalList();
  onDataChange();
}

function initPlanner() {
  document.getElementById("goalAdd").addEventListener("click", addGoal);
  document.getElementById("goalInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") addGoal();
  });
  document.getElementById("goalClear").addEventListener("click", clearCompletedGoals);

  const goalList = document.getElementById("goalList");
  goalList.addEventListener("change", (e) => {
    if (e.target.matches("input[type='checkbox']")) toggleGoal(e.target.dataset.id);
  });
  goalList.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-del]");
    if (btn) deleteGoal(btn.dataset.del);
  });

  document.getElementById("moodPicker").addEventListener("click", (e) => {
    const btn = e.target.closest(".mood");
    if (!btn) return;
    selectedMood = btn.dataset.id;
    renderMoodPicker();
  });
  document.getElementById("journalSave").addEventListener("click", saveJournal);

  const today = loadData(KEYS.journal, {})[dateKey()];
  if (today) {
    selectedMood = today.mood;
    document.getElementById("journalNote").value = today.note || "";
  }

  renderGoals();
  renderMoodPicker();
  renderJournalList();
}