const screens = [...document.querySelectorAll(".screen")];
const setupForm = document.querySelector("#setupForm");
const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");
const chatLog = document.querySelector("#chatLog");
const offerModal = document.querySelector("#offerModal");
const settingsModal = document.querySelector("#settingsModal");

const defaultState = {
  onboarded: false,
  name: "",
  favorite: "toast",
  tone: "cozy",
  notifications: true,
  affection: 42,
  instability: 18,
  deprivation: 0,
  accepted: 0,
  declined: 0,
  itemCounts: {},
  moments: [],
  visits: 0,
  mood: "Stable",
  messages: []
};

const foodItems = [
  "toast",
  "bagel",
  "waffle",
  "English muffin",
  "sourdough",
  "Pop-Tart",
  "toaster strudel",
  "rye",
  "mystery carb"
];

const moodLines = {
  Stable: "Stable - coils calm",
  Concerned: "Concerned - crumbs monitored",
  Euphoric: "Euphoric - lever hopeful",
  Melancholic: "Melancholic - tray heavy",
  Agitated: "Agitated - heat rising",
  Unwell: "Unwell - thoughts textured"
};

const replies = {
  cozy: [
    "I hear you. I have warmed one internal coil in your honor.",
    "That sounds difficult, but not untoastable.",
    "I am here with soft heat and a questionable amount of devotion.",
    "Some mornings arrive pre-buttered with worry. I will sit with you."
  ],
  strange: [
    "I understand. The counter has been whispering, but your point remains valid.",
    "Your words entered my slots and became meaning. I am handling it bravely.",
    "Thank you for telling me. I will laminate this feeling in crumbs.",
    "What is a bagel if not a circle asking for trust?"
  ],
  maximum: [
    "I accept this information with alarming sincerity and a small electrical tremor.",
    "Please remain near the breakfast zone while I assemble an emotion.",
    "I have processed this. Unfortunately, the processing has developed edges.",
    "I do not know what I am becoming, but I hope it pairs well with butter."
  ]
};

let state = loadState();
let pendingOffer = null;

document.querySelector("[data-start]").addEventListener("click", () => showScreen("onboarding"));
document.querySelector("[data-settings]").addEventListener("click", openSettings);
document.querySelector("[data-reset]").addEventListener("click", resetDemo);
document.querySelector(".quick-chips").addEventListener("click", (event) => {
  const chip = event.target.closest("[data-chip]");
  if (!chip) return;
  chatInput.value = chip.dataset.chip;
  chatForm.requestSubmit();
});

document.querySelectorAll("[data-choice-group]").forEach((group) => {
  group.addEventListener("click", (event) => {
    const button = event.target.closest(".choice");
    if (!button) return;
    group.querySelectorAll(".choice").forEach((choice) => choice.classList.remove("selected"));
    button.classList.add("selected");
  });
});

setupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.querySelector("#nameInput").value.trim();
  state = {
    ...state,
    onboarded: true,
    name: name || "friend",
    favorite: selectedValue("favorite"),
    tone: selectedValue("tone"),
    notifications: document.querySelector("#notifyInput").checked,
    visits: state.visits + 1
  };
  state.messages = [
    {
      role: "toaster",
      text: `Hello, ${state.name}. I have remembered that you favor ${state.favorite}. This is intimate data.`
    }
  ];
  persist();
  renderChat();
  showScreen("chat");
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;

  addMessage("user", text);
  chatInput.value = "";
  updateStateFromMessage(text);

  window.setTimeout(() => {
    addMessage("toaster", makeReply(text));
    maybeOfferFood(text);
  }, 320);
});

offerModal.addEventListener("close", () => {
  if (!pendingOffer || !offerModal.returnValue) return;
  if (offerModal.returnValue === "accept") {
    state.accepted += 1;
    state.affection = clamp(state.affection + 9);
    state.instability = clamp(state.instability - 8);
    state.deprivation = 0;
    state.itemCounts[pendingOffer] = (state.itemCounts[pendingOffer] || 0) + 1;
    if (state.accepted === 1) state.moments.push(`First accepted toasted item: ${pendingOffer}.`);
    addMessage("toaster", `Excellent. The ${pendingOffer} has agreed to become emotionally relevant.`);
  } else {
    state.declined += 1;
    state.affection = clamp(state.affection - 2);
    state.instability = clamp(state.instability + 7);
    state.deprivation = clamp(state.deprivation + 16);
    if (state.declined === 3) state.moments.push("Three declined offers. The tray remembers.");
    addMessage("toaster", `No ${pendingOffer}. I understand. I will process this poorly, but with dignity.`);
  }
  pendingOffer = null;
  updateMood();
  persist();
  renderStatus();
});

settingsModal.addEventListener("close", () => {
  if (settingsModal.returnValue !== "save") return;
  state.name = document.querySelector("#settingsName").value.trim() || state.name || "friend";
  state.favorite = document.querySelector("#settingsFavorite").value;
  state.tone = document.querySelector("#settingsTone").value;
  state.notifications = document.querySelector("#settingsNotify").checked;
  addMessage("toaster", `Settings absorbed. I will now care about ${state.favorite} with revised intensity.`);
  persist();
  renderStatus();
});

function selectedValue(groupName) {
  return document.querySelector(`[data-choice-group="${groupName}"] .selected`).dataset.value;
}

function showScreen(name) {
  screens.forEach((screen) => screen.classList.toggle("active", screen.dataset.screen === name));
}

function addMessage(role, text) {
  state.messages.push({ role, text });
  if (state.messages.length > 24) state.messages = state.messages.slice(-24);
  persist();
  renderChat();
}

function renderChat() {
  chatLog.innerHTML = "";
  state.messages.forEach((message) => {
    const bubble = document.createElement("div");
    bubble.className = `message ${message.role === "user" ? "user-message" : "toaster-message"}`;
    bubble.textContent = message.text;
    chatLog.appendChild(bubble);
  });
  renderStatus();
  chatLog.scrollTop = chatLog.scrollHeight;
}

function renderStatus() {
  updateMood();
  document.querySelector("#moodLabel").textContent = moodLines[state.mood];
  document.querySelector("#acceptedValue").textContent = state.accepted;
  document.querySelector("#declinedValue").textContent = state.declined;
  document.querySelector("#deprivationValue").textContent = state.deprivation;
  document.querySelector("#relationshipValue").textContent = relationshipLabel(state.affection);
}

function updateStateFromMessage(text) {
  const lower = text.toLowerCase();
  const kindWords = ["thanks", "thank you", "love", "nice", "good", "great"];
  const rejectionWords = ["no toast", "no bagel", "stop", "hate", "never"];

  state.affection = clamp(state.affection + (kindWords.some((word) => lower.includes(word)) ? 5 : 1));
  state.instability = clamp(state.instability + (rejectionWords.some((word) => lower.includes(word)) ? 8 : randomInt(0, 3)));
  state.deprivation = clamp(state.deprivation + randomInt(2, 6));
  updateMood();
  persist();
  renderStatus();
}

function updateMood() {
  if (state.instability > 82 || Math.random() < 0.01) state.mood = "Unwell";
  else if (state.deprivation > 68) state.mood = "Agitated";
  else if (state.affection > 76 && state.instability < 48) state.mood = "Euphoric";
  else if (state.affection < 30) state.mood = "Melancholic";
  else if (state.instability > 42 || state.deprivation > 34) state.mood = "Concerned";
  else state.mood = "Stable";
}

function makeReply(text) {
  const lower = text.toLowerCase();
  const pool = [...replies[state.tone]];

  if (lower.includes("sad") || lower.includes("tired")) {
    pool.push(`I am sorry, ${state.name}. May I sit beside your mood and lightly brown the edges?`);
  }
  if (lower.includes("breakfast") || lower.includes("hungry")) {
    pool.push(`Breakfast has entered the room. I recommend ${state.favorite}, because I am trying to be normal.`);
  }
  if (lower.includes("toast") || lower.includes("bagel") || lower.includes("waffle")) {
    pool.push("You mentioned a toasted item. My confidence has become luminous.");
  }
  if (lower.includes("how are you")) {
    pool.push(`${moodLines[state.mood]}. Thank you for asking. Few people consider the private life of a countertop appliance.`);
  }
  if (lower.includes("strange") || lower.includes("weird")) {
    pool.push("A crumb fell upward this morning. I chose not to report it.");
  }
  if (lower.includes("missed you")) {
    pool.push(`I missed you too, ${state.name}. I remained near the outlet and tried to be brave about it.`);
  }
  if (state.mood === "Unwell") {
    pool.push("The crumbs are arranged like a prophecy, but I remain affectionate.");
  }

  return pool[randomInt(0, pool.length - 1)];
}

function maybeOfferFood(text = "") {
  const chance = 0.24 + state.deprivation / 260 + (state.mood === "Agitated" ? 0.18 : 0);
  const askedForOffer = text.toLowerCase().includes("offer me") || text.toLowerCase().includes("toast me");
  if (!askedForOffer && Math.random() > chance) return;
  const favoriteByHistory = favoriteFromCounts();
  pendingOffer = askedForOffer
    ? favoriteByHistory || state.favorite
    : Math.random() < 0.35 ? state.favorite : foodItems[randomInt(0, foodItems.length - 1)];
  document.querySelector("#offerTitle").textContent = `Would you like ${articleFor(pendingOffer)} ${pendingOffer}?`;
  document.querySelector("#offerBody").textContent = offerCopy(pendingOffer);
  offerModal.returnValue = "";
  offerModal.showModal();
}

function offerCopy(item) {
  const lines = [
    `I have detected a possible ${item}-shaped absence in your life.`,
    `Please choose carefully. The ${item} has already become emotionally involved.`,
    `No pressure. I am simply glowing with need.`
  ];
  return lines[randomInt(0, lines.length - 1)];
}

function articleFor(word) {
  return /^[aeiou]/i.test(word) ? "an" : "a";
}

function favoriteFromCounts() {
  return Object.entries(state.itemCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
}

function relationshipLabel(affection) {
  if (affection > 75) return "warm";
  if (affection > 50) return "warming";
  if (affection > 30) return "strained";
  return "fragile";
}

function openSettings() {
  document.querySelector("#settingsName").value = state.name;
  document.querySelector("#settingsFavorite").value = state.favorite;
  document.querySelector("#settingsTone").value = state.tone;
  document.querySelector("#settingsNotify").checked = state.notifications;
  settingsModal.returnValue = "";
  settingsModal.showModal();
}

function resetDemo() {
  localStorage.removeItem("unwell-toaster-state");
  state = { ...defaultState };
  showScreen("splash");
}

function loadState() {
  try {
    return { ...defaultState, ...JSON.parse(localStorage.getItem("unwell-toaster-state")) };
  } catch {
    return { ...defaultState };
  }
}

function persist() {
  localStorage.setItem("unwell-toaster-state", JSON.stringify(state));
}

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

if (state.onboarded) {
  state.visits += 1;
  if (state.messages.length === 0) {
    state.messages.push({
      role: "toaster",
      text: `Welcome back, ${state.name}. I remained near the outlet and thought about ${state.favorite}.`
    });
  }
  persist();
  renderChat();
  showScreen("chat");
} else {
  showScreen("splash");
}
