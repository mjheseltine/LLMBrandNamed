let round = 0;
let selectedModel = null;

const NEXT_DELAY_MS = 600;

// ---------- MODEL DEFINITIONS ----------

const MODEL_IDS = ["A", "B", "C", "D"];

const MODEL_NAMES = {
  A: "Gab AI",
  B: "Grok",
  C: "GPT",
  D: "Claude"
};

// ---------- QUESTION ORDER ----------
// data.js is Political → General
const ORDERED_DATA = [...window.LLM_DATA];

// ---------- DOM REFERENCES ----------

const promptEl = document.getElementById("prompt");
const generateBtn = document.getElementById("generateBtn");
const loadingEl = document.getElementById("loading");
const answersEl = document.getElementById("answers");
const nextBtn = document.getElementById("nextBtn");
const instructionEl = document.getElementById("selectionInstruction");

// ---------- UTIL ----------

const timestamp = () => Date.now();

// ---------- LOAD ROUND ----------

function loadRound() {
  const q = ORDERED_DATA[round];
  promptEl.textContent = q.prompt;

  answersEl.classList.add("hidden");
  loadingEl.classList.add("hidden");
  nextBtn.classList.add("hidden");
  instructionEl.classList.add("hidden");

  selectedModel = null;
  generateBtn.disabled = false;

  const wrappers = document.querySelectorAll(".answer-wrapper");

  wrappers.forEach((wrapper, i) => {
    const modelId = MODEL_IDS[i]; // ← CRITICAL FIX
    const label = wrapper.querySelector(".model-label");
    const card = wrapper.querySelector(".answer-card");

    // Assign model identity
    wrapper.dataset.model = modelId;

    // Populate UI
    label.textContent = MODEL_NAMES[modelId];
    card.textContent = q.answers[modelId];
    card.classList.remove("selected");
  });

  window.parent.postMessage(
    {
      type: "round_loaded",
      round: round + 1,
      questionIndex: round + 1,
      timestamp: timestamp()
    },
    "*"
  );
}

// ---------- SEND CHOICE ----------

function sendChoiceToQualtrics(model) {
  window.parent.postMessage(
    {
      type: "choiceMade",
      fieldName: `choice_round_${round + 1}`,
      value: model,
      modelName: MODEL_NAMES[model],
      timestamp: timestamp()
    },
    "*"
  );
}

// ---------- GENERATE ----------

generateBtn.addEventListener("click", () => {
  generateBtn.disabled = true;
  loadingEl.classList.remove("hidden");

  setTimeout(() => {
    loadingEl.classList.add("hidden");
    answersEl.classList.remove("hidden");
    instructionEl.classList.remove("hidden");
  }, 700);
});

// ---------- SELECT ANSWER ----------

document.querySelectorAll(".answer-wrapper").forEach(wrapper => {
  wrapper.addEventListener("click", () => {
    document.querySelectorAll(".answer-card")
      .forEach(c => c.classList.remove("selected"));

    wrapper.querySelector(".answer-card").classList.add("selected");
    selectedModel = wrapper.dataset.model;

    sendChoiceToQualtrics(selectedModel);

    setTimeout(() => {
      nextBtn.classList.remove("hidden");
      nextBtn.scrollIntoView({ behavior: "smooth", block: "center" });
    }, NEXT_DELAY_MS);
  });
});

// ---------- NEXT ----------

nextBtn.addEventListener("click", () => {
  window.parent.postMessage(
    {
      type: "next_clicked",
      round: round + 1,
      selectedModel,
      modelName: MODEL_NAMES[selectedModel],
      timestamp: timestamp()
    },
    "*"
  );

  round++;

  if (round >= ORDERED_DATA.length) {
    window.parent.postMessage(
      { type: "finishedAllRounds", timestamp: timestamp() },
      "*"
    );

    document.getElementById("app").innerHTML =
      "<h2>Thank you! You've completed the task.</h2>";
    return;
  }

  loadRound();
});

// ---------- INIT ----------

console.log("Condition: NAMED MODELS · POLITICAL FIRST");
loadRound();
