const ROUTINES = [
  {
    id: "stretch", name: "Morning Stretch", emoji: "🧘", level: "Easy",
    steps: [
      { name: "Neck rolls", sec: 30 },
      { name: "Shoulder rolls", sec: 30 },
      { name: "Arm circles", sec: 30 },
      { name: "Standing side bend", sec: 40 },
      { name: "Forward fold", sec: 40 },
      { name: "Quad stretch", sec: 40 },
    ],
  },
  {
    id: "yoga", name: "Gentle Yoga Flow", emoji: "🌸", level: "Easy",
    steps: [
      { name: "Cat-cow", sec: 45 },
      { name: "Child's pose", sec: 45 },
      { name: "Downward dog", sec: 30 },
      { name: "Low lunge (left)", sec: 30 },
      { name: "Low lunge (right)", sec: 30 },
      { name: "Seated twist", sec: 40 },
      { name: "Final rest", sec: 60 },
    ],
  },
  {
    id: "bodyweight", name: "Bodyweight Basics", emoji: "💪", level: "Medium",
    steps: [
      { name: "Jumping jacks", sec: 40 },
      { name: "Squats", sec: 40 },
      { name: "Rest", sec: 20 },
      { name: "Push-ups (knees are fine)", sec: 30 },
      { name: "Rest", sec: 20 },
      { name: "Plank", sec: 30 },
      { name: "Rest", sec: 20 },
      { name: "Glute bridges", sec: 40 },
    ],
  },
  {
    id: "cardio", name: "Indoor Cardio Boost", emoji: "🔥", level: "Medium",
    steps: [
      { name: "March in place", sec: 45 },
      { name: "High knees", sec: 30 },
      { name: "Rest", sec: 15 },
      { name: "Butt kicks", sec: 30 },
      { name: "Rest", sec: 15 },
      { name: "Jumping jacks", sec: 30 },
      { name: "Cool-down breathing", sec: 45 },
    ],
  },
  {
    id: "desk", name: "Desk Break Reset", emoji: "🪑", level: "Easy",
    steps: [
      { name: "Wrist and finger stretch", sec: 30 },
      { name: "Seated neck stretch", sec: 30 },
      { name: "Chair twist", sec: 30 },
      { name: "Stand and reach up", sec: 30 },
      { name: "Calf raises", sec: 40 },
    ],
  },
];

let runner = null;

function routineSeconds(routine) {
  return routine.steps.reduce((sum, step) => sum + step.sec, 0);
}

function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    osc.frequency.value = 660;
    osc.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
    osc.onended = () => ctx.close();
  } catch {}
}

function renderRoutines() {
  document.getElementById("routineList").innerHTML = ROUTINES.map(
    (r) => `
    <button class="routine" data-id="${r.id}">
      <span class="routine-emoji">${r.emoji}</span>
      <span class="routine-name">${r.name}</span>
      <span class="routine-meta">${r.level} \u00B7 ${Math.ceil(routineSeconds(r) / 60)} min</span>
    </button>`
  ).join("");
}

function renderRunner() {
  const box = document.getElementById("runner");
  if (!runner) {
    box.classList.add("hidden");
    return;
  }
  box.classList.remove("hidden");

  const { routine, index, remaining, done } = runner;
  const startBtn = document.getElementById("runnerStart");
  const skipBtn = document.getElementById("runnerSkip");
  const stopBtn = document.getElementById("runnerStop");

  document.getElementById("runnerRoutine").textContent = `${routine.emoji} ${routine.name}`;

  if (done) {
    document.getElementById("runnerStep").textContent = "Great job! Routine complete 🎉";
    document.getElementById("runnerTime").textContent = "00:00";
    document.getElementById("runnerCount").textContent =
      `${runner.minutes} min added to your Movement habit.`;
  } else {
    document.getElementById("runnerStep").textContent = routine.steps[index].name;
    document.getElementById("runnerTime").textContent = formatTime(remaining);
    document.getElementById("runnerCount").textContent =
      `Step ${index + 1} of ${routine.steps.length}`;
  }

  startBtn.hidden = done;
  skipBtn.hidden = done;
  startBtn.textContent = runner.timerId ? "Pause" : "Start";
  stopBtn.textContent = done ? "Close" : "Stop";
}

function stopRunner() {
  if (runner && runner.timerId) clearInterval(runner.timerId);
  runner = null;
  renderRunner();
}

function openRunner(id) {
  stopRunner();
  const routine = ROUTINES.find((r) => r.id === id);
  if (!routine) return;
  runner = {
    routine,
    index: 0,
    remaining: routine.steps[0].sec,
    timerId: null,
    done: false,
    minutes: 0,
  };
  renderRunner();
}

function toggleRunner() {
  if (!runner || runner.done) return;
  if (runner.timerId) {
    clearInterval(runner.timerId);
    runner.timerId = null;
  } else {
    runner.timerId = setInterval(tick, 1000);
  }
  renderRunner();
}

function tick() {
  runner.remaining--;
  if (runner.remaining <= 0) nextStep();
  renderRunner();
}

function nextStep() {
  beep();
  runner.index++;
  if (runner.index >= runner.routine.steps.length) {
    finishRoutine();
    return;
  }
  runner.remaining = runner.routine.steps[runner.index].sec;
}

function finishRoutine() {
  clearInterval(runner.timerId);
  runner.timerId = null;
  runner.done = true;
  runner.minutes = Math.ceil(routineSeconds(runner.routine) / 60);

  const all = loadData(KEYS.workouts, {});
  const key = dateKey();
  if (!all[key]) all[key] = [];
  all[key].push({ name: runner.routine.name, minutes: runner.minutes });
  saveData(KEYS.workouts, all);

  addToHabit("move", runner.minutes);
  renderWorkoutLog();
  onDataChange();
}

function workoutsFor(key = dateKey()) {
  return loadData(KEYS.workouts, {})[key] || [];
}

function renderWorkoutLog() {
  const items = workoutsFor();
  document.getElementById("workoutLog").innerHTML = items.length
    ? items.map((w) => `<div class="log-item">✅ ${escapeHtml(w.name)} \u2014 ${w.minutes} min</div>`).join("")
    : '<p class="empty">No workouts finished yet today.</p>';
}

function initWorkouts() {
  renderRoutines();
  renderWorkoutLog();

  document.getElementById("routineList").addEventListener("click", (e) => {
    const btn = e.target.closest(".routine");
    if (btn) openRunner(btn.dataset.id);
  });
  document.getElementById("runnerStart").addEventListener("click", toggleRunner);
  document.getElementById("runnerSkip").addEventListener("click", () => {
    if (!runner || runner.done) return;
    nextStep();
    renderRunner();
  });
  document.getElementById("runnerStop").addEventListener("click", stopRunner);
}