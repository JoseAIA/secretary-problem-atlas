const nSlider = document.getElementById("n-slider");
const rSlider = document.getElementById("r-slider");
const nValue = document.getElementById("n-value");
const rValue = document.getElementById("r-value");
const probabilityValue = document.getElementById("probability-value");
const optimalValue = document.getElementById("optimal-value");
const resultMessage = document.getElementById("result-message");
const candidatePlot = document.getElementById("candidate-plot");
const runButton = document.getElementById("run-simulation");

function successProbability(n, r) {
  if (r === 0) return 1 / n;

  let harmonicSum = 0;

  for (let k = r + 1; k <= n; k++) {
    harmonicSum += 1 / (k - 1);
  }

  return (r / n) * harmonicSum;
}

function optimalThreshold(n) {
  let bestR = 0;
  let bestProbability = successProbability(n, 0);

  for (let r = 1; r < n; r++) {
    const probability = successProbability(n, r);

    if (probability > bestProbability) {
      bestProbability = probability;
      bestR = r;
    }
  }

  return {
    r: bestR,
    probability: bestProbability
  };
}

function randomPermutation(n) {
  const candidates = Array.from(
    { length: n },
    (_, index) => index + 1
  );

  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  return candidates;
}

function updateStatistics() {
  const n = Number(nSlider.value);

  rSlider.max = n - 1;

  if (Number(rSlider.value) >= n) {
    rSlider.value = n - 1;
  }

  const r = Number(rSlider.value);
  const probability = successProbability(n, r);
  const optimal = optimalThreshold(n);

  nValue.textContent = n;
  rValue.textContent = r;
  probabilityValue.textContent =
    `${(100 * probability).toFixed(2)}%`;

  optimalValue.textContent =
    `r = ${optimal.r} (${(100 * optimal.probability).toFixed(2)}%)`;
}

function runSimulation() {
  const n = Number(nSlider.value);
  const r = Number(rSlider.value);
  const candidates = randomPermutation(n);

  let selectedIndex = null;
  let bestObservedRank = Infinity;

  for (let i = 0; i < r; i++) {
    bestObservedRank = Math.min(bestObservedRank, candidates[i]);
  }

  if (r === 0) {
    selectedIndex = 0;
  } else {
    for (let i = r; i < n; i++) {
      if (candidates[i] < bestObservedRank) {
        selectedIndex = i;
        break;
      }
    }
  }

  candidatePlot.innerHTML = "";

  candidates.forEach((rank, index) => {
    const candidate = document.createElement("div");
    const quality = n - rank + 1;

    candidate.classList.add("candidate-bar");
    candidate.style.height = `${35 + (quality / n) * 180}px`;

    if (index < r) {
      candidate.classList.add("candidate-rejected");
    } else {
      candidate.classList.add("candidate-search");
    }

    if (rank === 1) {
      candidate.classList.add("candidate-best");
    }

    if (index === selectedIndex) {
      candidate.classList.add("candidate-selected");
    }

    candidate.innerHTML = `
      <span class="candidate-rank">${rank}</span>
      <span class="candidate-position">${index + 1}</span>
    `;

    candidatePlot.appendChild(candidate);
  });

  if (selectedIndex === null) {
    resultMessage.textContent =
      "No candidate exceeded the observation-period record.";
    resultMessage.className = "simulation-result result-neutral";
  } else if (candidates[selectedIndex] === 1) {
    resultMessage.textContent =
      `Success! Candidate ${selectedIndex + 1} was the overall best.`;
    resultMessage.className = "simulation-result result-success";
  } else {
    resultMessage.textContent =
      `Candidate ${selectedIndex + 1} was selected, but was not the overall best.`;
    resultMessage.className = "simulation-result result-failure";
  }
}

nSlider.addEventListener("input", updateStatistics);
rSlider.addEventListener("input", updateStatistics);
runButton.addEventListener("click", runSimulation);

updateStatistics();
runSimulation();