document.addEventListener("DOMContentLoaded", () => {
  const gameNSlider = document.getElementById("game-n-slider");
  const gameNValue = document.getElementById("game-n-value");
  const newGameButton = document.getElementById("new-game-button");
  const rejectButton = document.getElementById("reject-button");
  const hireButton = document.getElementById("hire-button");
  const gamePosition = document.getElementById("game-position");
  const gameTotal = document.getElementById("game-total");
  const currentRelativeRank = document.getElementById(
    "current-relative-rank"
  );
  const candidateDescription = document.getElementById(
    "candidate-description"
  );
  const observedRanks = document.getElementById("observed-ranks");
  const gameResult = document.getElementById("game-result");
  const gameReveal = document.getElementById("game-reveal");
  const gameSequence = document.getElementById("game-sequence");
  const currentCandidate = document.getElementById("current-candidate");

  const experimentNSlider = document.getElementById(
    "experiment-n-slider"
  );
  const experimentRSlider = document.getElementById(
    "experiment-r-slider"
  );
  const trialsSlider = document.getElementById("trials-slider");
  const experimentNValue = document.getElementById(
    "experiment-n-value"
  );
  const experimentRValue = document.getElementById(
    "experiment-r-value"
  );
  const trialsValue = document.getElementById("trials-value");
  const runExperimentButton = document.getElementById(
    "run-experiment-button"
  );

  const empiricalProbability = document.getElementById(
    "empirical-probability"
  );
  const exactProbabilityValue = document.getElementById(
    "exact-probability"
  );
  const optimalThresholdValue = document.getElementById(
    "optimal-threshold"
  );
  const optimalProbabilityValue = document.getElementById(
    "optimal-probability"
  );
  const experimentMessage = document.getElementById(
    "experiment-message"
  );

  const probabilityChart = document.getElementById(
    "probability-chart"
  );
  const graphSelectedThreshold = document.getElementById(
    "graph-selected-threshold"
  );
  const graphOptimalThreshold = document.getElementById(
    "graph-optimal-threshold"
  );
  const graphAsymptoticThreshold = document.getElementById(
    "graph-asymptotic-threshold"
  );

  let gameRanks = [];
  let relativeRanks = [];
  let currentIndex = 0;
  let gameFinished = false;

  function randomPermutation(n) {
    const permutation = Array.from(
      { length: n },
      (_, index) => index + 1
    );

    for (let i = permutation.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));

      [permutation[i], permutation[j]] = [
        permutation[j],
        permutation[i]
      ];
    }

    return permutation;
  }

  function calculateRelativeRanks(ranks) {
    return ranks.map((rank, index) => {
      let numberBetter = 0;

      for (let j = 0; j < index; j += 1) {
        if (ranks[j] < rank) {
          numberBetter += 1;
        }
      }

      return numberBetter + 1;
    });
  }

  function exactProbability(n, r) {
    if (r === 0) {
      return 1 / n;
    }

    let harmonicSum = 0;

    for (let j = r + 1; j <= n; j += 1) {
      harmonicSum += 1 / (j - 1);
    }

    return (r / n) * harmonicSum;
  }

  function findOptimalThreshold(n) {
    let bestR = 0;
    let bestProbability = exactProbability(n, 0);

    for (let r = 1; r < n; r += 1) {
      const probability = exactProbability(n, r);

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

  function formatPercent(probability) {
    return `${(100 * probability).toFixed(2)}%`;
  }

  function startNewGame() {
    const n = Number(gameNSlider.value);

    gameRanks = randomPermutation(n);
    relativeRanks = calculateRelativeRanks(gameRanks);
    currentIndex = 0;
    gameFinished = false;

    gameNValue.textContent = n;
    gameTotal.textContent = n;
    observedRanks.innerHTML = "";
    gameResult.hidden = true;
    gameReveal.hidden = true;
    gameSequence.innerHTML = "";

    rejectButton.disabled = false;
    hireButton.disabled = false;
    currentCandidate.classList.remove(
      "candidate-record",
      "candidate-nonrecord"
    );

    showCurrentCandidate();
  }

  function showCurrentCandidate() {
    const position = currentIndex + 1;
    const relativeRank = relativeRanks[currentIndex];
    const isRecord = relativeRank === 1;

    gamePosition.textContent = position;
    currentRelativeRank.textContent = relativeRank;

    currentCandidate.classList.toggle(
      "candidate-record",
      isRecord
    );
    currentCandidate.classList.toggle(
      "candidate-nonrecord",
      !isRecord
    );

    if (isRecord) {
      candidateDescription.textContent =
        "This candidate is the best observed so far.";
    } else {
      candidateDescription.textContent =
        `At least ${relativeRank - 1} observed candidate(s) were better.`;
    }

    addObservedRank(position, relativeRank, isRecord);

    if (position === gameRanks.length) {
      rejectButton.textContent = "Reject and finish";
    } else {
      rejectButton.textContent = "Reject";
    }
  }

  function addObservedRank(position, rank, isRecord) {
    const existing = document.querySelector(
      `[data-observed-position="${position}"]`
    );

    if (existing) {
      return;
    }

    const item = document.createElement("div");

    item.className = isRecord
      ? "observed-rank observed-record"
      : "observed-rank";

    item.dataset.observedPosition = position;
    item.innerHTML = `
      <span>${position}</span>
      <strong>${rank}</strong>
    `;

    observedRanks.appendChild(item);
  }

  function rejectCurrentCandidate() {
    if (gameFinished) {
      return;
    }

    if (currentIndex === gameRanks.length - 1) {
      finishGame(null, "No candidate was hired.");
      return;
    }

    currentIndex += 1;
    showCurrentCandidate();
  }

  function hireCurrentCandidate() {
    if (gameFinished) {
      return;
    }

    finishGame(currentIndex, null);
  }

  function finishGame(selectedIndex, neutralMessage) {
    gameFinished = true;
    rejectButton.disabled = true;
    hireButton.disabled = true;
    gameResult.hidden = false;
    gameReveal.hidden = false;

    if (selectedIndex === null) {
      gameResult.className = "game-result result-neutral";
      gameResult.textContent = neutralMessage;
    } else if (gameRanks[selectedIndex] === 1) {
      gameResult.className = "game-result result-success";
      gameResult.textContent =
        `Success! Candidate ${selectedIndex + 1} was the overall best.`;
    } else {
      gameResult.className = "game-result result-failure";
      gameResult.textContent =
        `Candidate ${selectedIndex + 1} had absolute rank ` +
        `${gameRanks[selectedIndex]}. The overall best was at position ` +
        `${gameRanks.indexOf(1) + 1}.`;
    }

    revealGameSequence(selectedIndex);
  }

  function revealGameSequence(selectedIndex) {
    gameSequence.innerHTML = "";

    gameRanks.forEach((rank, index) => {
      const candidate = document.createElement("div");
      const quality = gameRanks.length - rank + 1;
      const height = 45 + (quality / gameRanks.length) * 145;

      candidate.className = "game-sequence-item";
      candidate.style.height = `${height}px`;

      if (rank === 1) {
        candidate.classList.add("sequence-best");
      }

      if (index === selectedIndex) {
        candidate.classList.add("sequence-selected");
      }

      candidate.innerHTML = `
        <strong>${rank}</strong>
        <span>${index + 1}</span>
      `;

      gameSequence.appendChild(candidate);
    });
  }

  function simulateThresholdStrategy(n, r) {
    const ranks = randomPermutation(n);
    let selectedRank = null;

    if (r === 0) {
      selectedRank = ranks[0];
    } else {
      let benchmark = ranks[0];

      for (let i = 1; i < r; i += 1) {
        benchmark = Math.min(benchmark, ranks[i]);
      }

      for (let i = r; i < n; i += 1) {
        if (ranks[i] < benchmark) {
          selectedRank = ranks[i];
          break;
        }
      }
    }

    return selectedRank === 1;
  }

  function runExperiment() {
    const n = Number(experimentNSlider.value);
    const r = Number(experimentRSlider.value);
    const trials = Number(trialsSlider.value);

    runExperimentButton.disabled = true;
    runExperimentButton.textContent = "Running…";

    window.setTimeout(() => {
      let successes = 0;

      for (let trial = 0; trial < trials; trial += 1) {
        if (simulateThresholdStrategy(n, r)) {
          successes += 1;
        }
      }

      const empirical = successes / trials;
      const exact = exactProbability(n, r);
      const optimum = findOptimalThreshold(n);
      const difference = Math.abs(empirical - exact);

      empiricalProbability.textContent = formatPercent(empirical);
      exactProbabilityValue.textContent = formatPercent(exact);
      optimalThresholdValue.textContent = `r = ${optimum.r}`;
      optimalProbabilityValue.textContent = formatPercent(
        optimum.probability
      );

      if (r === optimum.r) {
        experimentMessage.className =
          "experiment-message message-optimal";
        experimentMessage.textContent =
          `You selected the optimal threshold. ` +
          `${successes} of ${trials} simulations succeeded.`;
      } else {
        const loss = optimum.probability - exact;

        experimentMessage.className =
          "experiment-message message-standard";
        experimentMessage.textContent =
          `${successes} of ${trials} simulations succeeded. ` +
          `The exact probability is ${formatPercent(difference)} ` +
          `away from the empirical estimate, and your threshold loses ` +
          `${formatPercent(loss)} relative to the finite-n optimum.`;
      }

      runExperimentButton.disabled = false;
      runExperimentButton.textContent = "Run experiment";

      drawProbabilityChart();
    }, 30);
  }

  function updateExperimentControls() {
    const n = Number(experimentNSlider.value);

    experimentRSlider.max = n - 1;

    if (Number(experimentRSlider.value) >= n) {
      experimentRSlider.value = n - 1;
    }

    experimentNValue.textContent = n;
    experimentRValue.textContent = experimentRSlider.value;
    trialsValue.textContent = Number(
      trialsSlider.value
    ).toLocaleString();

    const r = Number(experimentRSlider.value);
    const exact = exactProbability(n, r);
    const optimum = findOptimalThreshold(n);

    exactProbabilityValue.textContent = formatPercent(exact);
    optimalThresholdValue.textContent = `r = ${optimum.r}`;
    optimalProbabilityValue.textContent = formatPercent(
      optimum.probability
    );

    drawProbabilityChart();
  }

  function createSvgElement(name, attributes = {}) {
    const element = document.createElementNS(
      "http://www.w3.org/2000/svg",
      name
    );

    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });

    return element;
  }

  function drawProbabilityChart() {
    const n = Number(experimentNSlider.value);
    const selectedR = Number(experimentRSlider.value);
    const optimum = findOptimalThreshold(n);
    const asymptoticR = n / Math.E;

    const width = 900;
    const height = 480;
    const margin = {
      top: 35,
      right: 35,
      bottom: 70,
      left: 80
    };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const maximumY = 0.45;

    const xScale = (r) =>
      margin.left + (r / (n - 1)) * innerWidth;

    const yScale = (probability) =>
      margin.top +
      innerHeight -
      (probability / maximumY) * innerHeight;

    probabilityChart.innerHTML = "";

    const background = createSvgElement("rect", {
      x: 0,
      y: 0,
      width,
      height,
      rx: 18,
      fill: "#f7f9fc"
    });

    probabilityChart.appendChild(background);

    for (let tick = 0; tick <= 4; tick += 1) {
      const probability = tick / 10;
      const y = yScale(probability);

      const gridLine = createSvgElement("line", {
        x1: margin.left,
        y1: y,
        x2: width - margin.right,
        y2: y,
        stroke: "#dce4ee",
        "stroke-width": 1
      });

      probabilityChart.appendChild(gridLine);

      const label = createSvgElement("text", {
        x: margin.left - 14,
        y: y + 5,
        "text-anchor": "end",
        fill: "#52657c",
        "font-size": 14
      });

      label.textContent = `${Math.round(100 * probability)}%`;
      probabilityChart.appendChild(label);
    }

    const xTicks = 5;

    for (let tick = 0; tick <= xTicks; tick += 1) {
      const r = Math.round(((n - 1) * tick) / xTicks);
      const x = xScale(r);

      const tickLine = createSvgElement("line", {
        x1: x,
        y1: margin.top + innerHeight,
        x2: x,
        y2: margin.top + innerHeight + 7,
        stroke: "#52657c",
        "stroke-width": 1
      });

      probabilityChart.appendChild(tickLine);

      const label = createSvgElement("text", {
        x,
        y: margin.top + innerHeight + 28,
        "text-anchor": "middle",
        fill: "#52657c",
        "font-size": 14
      });

      label.textContent = r;
      probabilityChart.appendChild(label);
    }

    const axisX = createSvgElement("line", {
      x1: margin.left,
      y1: margin.top + innerHeight,
      x2: width - margin.right,
      y2: margin.top + innerHeight,
      stroke: "#14213d",
      "stroke-width": 2
    });

    const axisY = createSvgElement("line", {
      x1: margin.left,
      y1: margin.top,
      x2: margin.left,
      y2: margin.top + innerHeight,
      stroke: "#14213d",
      "stroke-width": 2
    });

    probabilityChart.appendChild(axisX);
    probabilityChart.appendChild(axisY);

    const probabilities = Array.from(
      { length: n },
      (_, r) => exactProbability(n, r)
    );

    const points = probabilities
      .map(
        (probability, r) =>
          `${xScale(r)},${yScale(probability)}`
      )
      .join(" ");

    const curve = createSvgElement("polyline", {
      points,
      fill: "none",
      stroke: "#4f86c6",
      "stroke-width": 5,
      "stroke-linejoin": "round",
      "stroke-linecap": "round"
    });

    probabilityChart.appendChild(curve);

    const asymptoticLine = createSvgElement("line", {
      x1: xScale(asymptoticR),
      y1: margin.top,
      x2: xScale(asymptoticR),
      y2: margin.top + innerHeight,
      stroke: "#7a8798",
      "stroke-width": 2,
      "stroke-dasharray": "8 8"
    });

    probabilityChart.appendChild(asymptoticLine);

    const selectedPoint = createSvgElement("circle", {
      cx: xScale(selectedR),
      cy: yScale(probabilities[selectedR]),
      r: 10,
      fill: "#ee6c4d",
      stroke: "#ffffff",
      "stroke-width": 4
    });

    probabilityChart.appendChild(selectedPoint);

    const optimalPoint = createSvgElement("circle", {
      cx: xScale(optimum.r),
      cy: yScale(optimum.probability),
      r: 10,
      fill: "#f6c85f",
      stroke: "#14213d",
      "stroke-width": 4
    });

    probabilityChart.appendChild(optimalPoint);

    const xAxisTitle = createSvgElement("text", {
      x: margin.left + innerWidth / 2,
      y: height - 18,
      "text-anchor": "middle",
      fill: "#14213d",
      "font-size": 16,
      "font-weight": 700
    });

    xAxisTitle.textContent = "Rejection threshold r";
    probabilityChart.appendChild(xAxisTitle);

    const yAxisTitle = createSvgElement("text", {
      x: 20,
      y: margin.top + innerHeight / 2,
      transform:
        `rotate(-90 20 ${margin.top + innerHeight / 2})`,
      "text-anchor": "middle",
      fill: "#14213d",
      "font-size": 16,
      "font-weight": 700
    });

    yAxisTitle.textContent = "Success probability";
    probabilityChart.appendChild(yAxisTitle);

    graphSelectedThreshold.textContent =
      `r = ${selectedR} (${formatPercent(probabilities[selectedR])})`;

    graphOptimalThreshold.textContent =
      `r = ${optimum.r} (${formatPercent(optimum.probability)})`;

    graphAsymptoticThreshold.textContent =
      `${asymptoticR.toFixed(2)}`;
  }

  gameNSlider.addEventListener("input", () => {
    gameNValue.textContent = gameNSlider.value;
  });

  newGameButton.addEventListener("click", startNewGame);
  rejectButton.addEventListener("click", rejectCurrentCandidate);
  hireButton.addEventListener("click", hireCurrentCandidate);

  experimentNSlider.addEventListener(
    "input",
    updateExperimentControls
  );

  experimentRSlider.addEventListener(
    "input",
    updateExperimentControls
  );

  trialsSlider.addEventListener(
    "input",
    updateExperimentControls
  );

  runExperimentButton.addEventListener(
    "click",
    runExperiment
  );

  startNewGame();
  updateExperimentControls();
});