function onDataChange() {
  renderDashboard();
}

function showTab(name) {
  document.querySelectorAll(".panel").forEach((panel) => {
    panel.classList.toggle("hidden", panel.id !== `tab-${name}`);
  });
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === name);
  });
  if (name === "dashboard") renderDashboard();
}

document.getElementById("tabs").addEventListener("click", (e) => {
  const btn = e.target.closest(".tab");
  if (btn) showTab(btn.dataset.tab);
});

function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem("wh_profile")) || null;
  } catch {
    return null;
  }
}

function enterApp(profile) {
  window.wellnessProfile = profile;
  document.getElementById("setupScreen").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");

  initFood();
  initWorkouts();
  initHabits();
  initPlanner();
  showTab("dashboard");
}

const profileSetup = document.getElementById("profileSetup");
profileSetup.addEventListener("submit", (event) => {
  event.preventDefault();
  const profile = {
    name: document.getElementById("profileName").value.trim(),
    sex: document.getElementById("profileSex").value,
    weight: Number(document.getElementById("profileWeight").value),
    unit: document.getElementById("profileUnit").value,
    goal: document.getElementById("profileGoal").value,
  };
  localStorage.setItem("wh_profile", JSON.stringify(profile));
  enterApp(profile);
});

const savedProfile = loadProfile();
if (savedProfile) {
  document.getElementById("profileName").value = savedProfile.name || "";
  document.getElementById("profileSex").value = savedProfile.sex || "";
  document.getElementById("profileWeight").value = savedProfile.weight || "";
  document.getElementById("profileUnit").value = savedProfile.unit || "kg";
  document.getElementById("profileGoal").value = savedProfile.goal || "";
}

document.getElementById("setupScreen").classList.remove("hidden");
document.getElementById("app").classList.add("hidden");