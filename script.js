let round = 0;
let selectedModel = null;

const NEXT_DELAY_MS = 600;

const promptEl = document.getElementById("prompt");
const generateBtn = document.getElementById("generateBtn");
const loadingEl = document.getElementById("loading");
const answersEl = document.getElementById("answers");
const nextBtn = document.getElementById("nextBtn");
const instructionEl = document.getElementById("selectionInstruction");

function timestamp() {
  return Date.now();
}

function loadRound() {
  const q = window.LLM_DATA[round];
  promptEl.textContent = q.prompt;

  // Reset UI
  answersEl.classList.add("hidden");
  loadingEl.classList.add("hidden");
  nextBtn.classList.add("hidden");
  instructionEl.classList.add("hidden");

  selectedModel = null;

  // Re-enable Generate button
  generateBtn.disabled = false;

  // Load answer text
  document.querySelectorAll(".answer-wrapper").forEach(wrapper => {
    const model = wrapper.dataset.model;
    const card = wrapper.querySelector(".answer-card");

    card.textContent = q.answers[model];
    card.classList.remove("selected");
  });

  window.parent.postMessage(
    {
      type: "round_loaded",
      round: round + 1,
      timestamp: timestamp()
    },
    "*"
  );
}

function sendChoiceToQualtrics(model) {
  window.parent.postMessage(
    {
      type: "choiceMade",
      fieldName: `choice_round_${round + 1}`,
      value: model,
      timestamp: timestamp()
    },
    "*"
  );
}

generateBtn.addEventListener("click", () => {
  // Disable Generate immediately
  generateBtn.disabled = true;

  window.parent.postMessage(
    {
      type: "generate_clicked",
      round: round + 1,
      timestamp: timestamp()
    },
    "*"
  );

  loadingEl.classList.remove("hidden");

  setTimeout(() => {
    loadingEl.classList.add("hidden");
    answersEl.classList.remove("hidden");
    instructionEl.classList.remove("hidden");

    window.parent.postMessage(
      {
        type: "responses_shown",
        round: round + 1,
        timestamp: timestamp()
      },
      "*"
    );
  }, 700);
});

document.querySelectorAll(".answer-wrapper").forEach(wrapper => {
  wrapper.addEventListener("click", () => {
    const model = wrapper.dataset.model;

    document.querySelectorAll(".answer-card")
      .forEach(c => c.classList.remove("selected"));

    wrapper.querySelector(".answer-card")
      .classList.add("selected");

    selectedModel = model;

    sendChoiceToQualtrics(selectedModel);

    // Delay before showing Next button
    setTimeout(() => {
      nextBtn.classList.remove("hidden");
    }, NEXT_DELAY_MS);
  });
});

nextBtn.addEventListener("click", () => {
  window.parent.postMessage(
    {
      type: "next_clicked",
      round: round + 1,
      selectedModel,
      timestamp: timestamp()
    },
    "*"
  );

  round++;

  if (round >= window.LLM_DATA.length) {
    window.parent.postMessage(
      {
        type: "finishedAllRounds",
        timestamp: timestamp()
      },
      "*"
    );

    document.getElementById("app").innerHTML =
      "<h2>Thank you! You've completed the task.</h2>";
    return;
  }

  loadRound();
});

// Initialize
loadRound();
