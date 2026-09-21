const runtime = window.LabRuntime;
const $ = runtime.query;
const canvas = $("#chart");
const ctx = canvas.getContext("2d");
const modelMath = window.SvmModel;
const mseValue = $("#mseValue");
const roundValue = $("#roundValue");
const progressFill = $("#progressFill");
const toast = $("#toast");
const bestLabel = $("#bestLabel");
const targetLabel = $("#targetLabel");
const missionText = $("#missionText");
const levelSubtitle = $("#levelSubtitle");
const levelPicker = $("#levelPicker");
const viewPicker = $("#viewPicker");
const penaltyC = $("#learningRate");
const kernelPower = $("#treeDepth");
const rateLabel = $("#rateLabel");
const depthLabel = $("#depthLabel");
const stepBtn = $("#stepBtn");
const autoBtn = $("#autoBtn");
const undoBtn = $("#undoBtn");
const resetBtn = $("#resetBtn");
const nextLevelBtn = $("#nextLevelBtn");
const boundaryFormula = $("#boundaryFormula");
const supportCountLabel = $("#supportCountLabel");
const accuracyLabel = $("#accuracyLabel");
const violationLabel = $("#violationLabel");
const hingeLabel = $("#hingeLabel");
const biasLabel = $("#biasLabel");
const gammaLabel = $("#gammaLabel");
const plane = runtime.createCartesianPlane(canvas);
const history = runtime.createHistory();
const fieldRenderer = runtime.createFieldRenderer(ctx);
const scorerMemo = runtime.createMemo(() => modelMath.createScorer(
  targetPoints,
  state.alpha,
  state.bias,
  gamma(),
));
const kernelMatrixMemo = runtime.createMemo(() => modelMath.createKernelMatrix(targetPoints, gamma()));

const validationTargets = [0.83, 0.88, 0.95, 0.77];
let validationPoints = [];

const levels = [
  {
    name: "入门：清晰直线",
    shortName: "直线",
    target: 0.88,
    maxRounds: 8,
    startC: 3,
    startKernel: 1,
    description: "两类样本几乎线性可分。先把边界推到中间，再观察哪些点成了支持向量。",
    points: [
      [-0.86, -0.62, -1], [-0.72, -0.46, -1], [-0.52, -0.58, -1], [-0.36, -0.31, -1],
      [-0.12, -0.44, -1], [0.16, -0.18, -1], [-0.62, -0.12, -1], [-0.2, 0.02, -1],
      [0.2, 0.22, 1], [0.34, 0.48, 1], [0.52, 0.32, 1], [0.7, 0.55, 1],
      [0.82, 0.72, 1], [0.08, 0.56, 1], [0.46, 0.78, 1], [0.72, 0.18, 1],
    ],
  },
  {
    name: "进阶：软间隔",
    shortName: "软间隔",
    target: 0.72,
    maxRounds: 16,
    startC: 0.2,
    startKernel: 1,
    description: "样本有少量重叠。比较训练点与验证点，选择能保留整体趋势的边界。",
    points: [
      [-0.86, -0.55, -1], [-0.66, -0.38, -1], [-0.48, -0.28, -1], [-0.26, -0.52, -1],
      [-0.08, -0.18, -1], [0.18, -0.06, -1], [0.34, -0.32, -1], [-0.1, 0.24, -1],
      [0.2, 0.38, 1], [0.42, 0.2, 1], [0.56, 0.54, 1], [0.76, 0.36, 1],
      [0.86, 0.7, 1], [-0.22, 0.42, 1], [0.08, -0.34, 1], [0.62, -0.08, 1],
    ],
  },
  {
    name: "挑战：圆形核边界",
    shortName: "圆核",
    target: 0.84,
    maxRounds: 12,
    startC: 0.2,
    startKernel: 1,
    description: "当前 RBF 核的边界太平缓。提高核复杂度并控制 C，在预算内把边界弯起来。",
    points: [
      [-0.18, -0.2, 1], [0.12, -0.24, 1], [-0.28, 0.08, 1], [0.18, 0.16, 1],
      [0.0, 0.26, 1], [0.3, -0.02, 1], [-0.08, 0.02, 1],
      [-0.86, -0.2, -1], [-0.72, 0.48, -1], [-0.42, -0.78, -1], [0.02, -0.86, -1],
      [0.48, -0.68, -1], [0.82, -0.18, -1], [0.76, 0.46, -1], [0.28, 0.82, -1],
      [-0.36, 0.78, -1], [-0.82, 0.08, -1],
    ],
  },
  {
    name: "专家：噪声陷阱",
    shortName: "噪声",
    target: 0.68,
    maxRounds: 16,
    startC: 0.2,
    startKernel: 8,
    description: "有些样本相互冲突。观察间隔内的点，调整 C 与核宽度，允许少量错分。",
    points: [
      [-0.82, -0.62, -1], [-0.64, -0.22, -1], [-0.48, -0.5, -1], [-0.22, -0.18, -1],
      [0.02, -0.48, -1], [0.22, -0.06, -1], [0.42, -0.36, -1], [-0.7, 0.28, -1],
      [0.16, 0.34, 1], [0.34, 0.12, 1], [0.52, 0.44, 1], [0.74, 0.24, 1],
      [0.86, 0.68, 1], [-0.18, 0.58, 1], [0.12, 0.76, 1], [0.56, -0.12, 1],
      [-0.38, 0.38, 1], [0.08, -0.08, 1], [0.66, 0.02, -1],
    ],
  },
];

let currentLevel = 0;
let targetPoints = [];
let state;
let controller;
let activeView = "boundary";
let activeViewNote = "边界视图：蓝色区域判为负类，绿色区域判为正类；亮线是当前决策边界。";

const viewNotes = {
  boundary: "边界视图：蓝色区域判为负类，绿色区域判为正类；亮线是当前决策边界。",
  margin: "间隔视图：两条虚线之间是 SVM 努力撑开的安全通道，落在里面的点会被继续惩罚。",
  support: "支持向量视图：被方框套住的点决定边界位置，远离边界的点影响会变小。",
  loss: "损失视图：观察 hinge loss 和正则项的总目标是否还在下降。",
};

function makePoints(level) {
  return level.points.map(([x, y, label], index) => ({ x, y, label, index }));
}

function setActiveViewNote(message, reset = false) {
  if (!reset && activeViewNote === message) return;
  activeViewNote = message;
  runtime.setShapeContext(message);
}

function resetGame(keepParameters = false) {
  const level = levels[currentLevel];
  targetPoints = makePoints(level);
  validationPoints = modelMath.makeValidationPoints(currentLevel);
  if (!keepParameters) penaltyC.value = level.startC;
  if (!keepParameters) kernelPower.value = level.startKernel;
  history.clear();
  state = {
    alpha: targetPoints.map(() => 0),
    bias: 0,
    round: 0,
    bestScore: 0,
    lossHistory: [],
    completedRound: null,
    version: 0,
  };
  missionText.textContent = `${level.description} 本关训练预算：${level.maxRounds} 轮。空心点只用于验证，不参与训练。`;
  levelSubtitle.textContent = level.name;
  toast.textContent = "先观察样本，再训练第一轮。SVM 会寻找能最大化分类间隔的边界。";
  setActiveViewNote(viewNotes[activeView], true);
  controller.trainingLog.reset();
  scorerMemo.invalidate();
  kernelMatrixMemo.invalidate();
  fieldRenderer.invalidate();
  controller.render();
  updateHud();
}

function gamma() {
  return modelMath.gamma(kernelPower.value);
}


function scorePoint(point, alpha = state.alpha, bias = state.bias) {
  if (alpha === state.alpha && bias === state.bias) {
    return scorerMemo.get(`${currentLevel}:${state.version}:${kernelPower.value}`)(point);
  }
  return modelMath.createScorer(targetPoints, alpha, bias, gamma())(point);
}

function classify(point) {
  return scorePoint(point) >= 0 ? 1 : -1;
}

function metrics(alpha = state.alpha, bias = state.bias) {
  const scorer = alpha === state.alpha && bias === state.bias
    ? scorerMemo.get(`${currentLevel}:${state.version}:${kernelPower.value}`)
    : undefined;
  return modelMath.metrics(targetPoints, alpha, bias, gamma(), 0, scorer);
}

function validationAccuracy() {
  return validationPoints.filter((point) => classify(point) === point.label).length / validationPoints.length;
}

function meetsTarget(result = metrics()) {
  return result.score >= levels[currentLevel].target && validationAccuracy() >= validationTargets[currentLevel];
}

function trainStep() {
  const level = levels[currentLevel];
  if (state.round >= level.maxRounds) {
    toast.textContent = `预算耗尽：本关最多训练 ${level.maxRounds} 轮。调整 C 和核复杂度后重置再试。`;
    controller.stopAuto();
    updateHud();
    return;
  }
  const before = metrics();
  const c = Number(penaltyC.value);
  const complexity = Number(kernelPower.value);
  history.push({
    alpha: [...state.alpha],
    bias: state.bias,
    round: state.round,
    bestScore: state.bestScore,
    lossHistoryLength: state.lossHistory.length,
    completedRound: state.completedRound,
  });

  const trained = modelMath.train(
    targetPoints,
    state.alpha,
    state.bias,
    c,
    complexity,
    state.round,
    0,
    kernelMatrixMemo.get(`${currentLevel}:${kernelPower.value}`),
  );
  state.alpha = trained.alpha;
  state.bias = trained.bias;
  state.round = trained.round;
  state.version += 1;
  const after = metrics();
  state.bestScore = Math.max(state.bestScore, after.score);
  state.lossHistory.push(after.objective);

  const supportText = `${after.supportCount} 个支持向量`;
  controller.trainingLog.add(`第 ${state.round} 轮  SV ${after.supportCount}  hinge ${after.hinge.toFixed(2)}  得分 ${after.score.toFixed(2)}`);

  toast.textContent = `第 ${state.round} 轮：违反间隔的样本被加权，边界向最大间隔移动；当前 ${supportText}。`;

  if (meetsTarget(after) && state.completedRound === null) {
    state.completedRound = state.round;
  }

  fieldRenderer.invalidate();
  controller.render();
  updateHud();

  if (meetsTarget(after)) {
    toast.textContent = `通关！目标间隔得分 ${level.target.toFixed(2)}，你在第 ${state.completedRound}/${level.maxRounds} 轮达成。`;
    controller.stopAuto();
  } else if (state.round >= level.maxRounds) {
    const reason = validationAccuracy() < validationTargets[currentLevel]
      ? "验证点正确率不足：边界可能过度贴合训练样本，试着调整核宽度"
      : complexity <= 2
        ? "核复杂度不足，边界形状仍然欠拟合"
        : "当前 C 与核复杂度组合没有及时稳定";
    toast.textContent = `预算耗尽：${reason}。调整参数后重置再试。`;
    controller.stopAuto();
  } else if (controller.isAutoRunning() && state.round > 10 && Math.abs(before.objective - after.objective) < 0.002) {
    toast.textContent = "训练进入平台期：切到“间隔”或“向量”视图，看看是不是 C 太低或核复杂度不够。";
    controller.stopAuto();
  }
}

function undoStep() {
  const previous = history.pop();
  if (!previous) {
    toast.textContent = "还没有可以撤回的训练轮次。";
    return;
  }
  state.alpha = previous.alpha;
  state.bias = previous.bias;
  state.round = previous.round;
  state.bestScore = previous.bestScore;
  state.lossHistory.length = previous.lossHistoryLength;
  state.completedRound = previous.completedRound;
  state.version += 1;
  controller.trainingLog.removeLatest();
  toast.textContent = "撤回上一轮训练，边界回到上一轮状态。";
  fieldRenderer.invalidate();
  controller.render();
  updateHud();
}

function updateHud() {
  runtime.setOutcome(state.round > 0 && meetsTarget());
  const level = levels[currentLevel];
  const result = metrics();
  state.bestScore = Math.max(state.bestScore, result.score);
  runtime.setText(mseValue, runtime.formatGoalMetric(result.score));
  runtime.setText(roundValue, state.round);
  runtime.setText(bestLabel, state.round ? `最佳 ${state.bestScore.toFixed(2)}` : "等待开始");
  runtime.setText(targetLabel, `目标 ${level.target.toFixed(2)} · 预算 ${level.maxRounds} 轮`);
  runtime.setProgress(progressFill, Math.min(result.score / level.target, validationAccuracy() / validationTargets[currentLevel]));
  runtime.setText($("#validationLabel"), `验证正确率 ${Math.round(validationAccuracy() * 100)}% / 目标 ${Math.round(validationTargets[currentLevel] * 100)}%`);
  rateLabel.textContent = Number(penaltyC.value).toFixed(1);
  depthLabel.textContent = `${kernelPower.value} 级`;
  stepBtn.disabled = state.round >= level.maxRounds;
  updateBoundaryData(result);
}

function updateBoundaryData(result = metrics()) {
  const vectors = result.activeVectors;
  boundaryFormula.textContent = vectors ? `f(x)=Σ${vectors}K+b` : "等待训练";
  supportCountLabel.textContent = vectors;
  accuracyLabel.textContent = `${Math.round(result.accuracy * 100)}%`;
  violationLabel.textContent = result.violations;
  hingeLabel.textContent = result.hinge.toFixed(2);
  biasLabel.textContent = state.bias.toFixed(2);
  gammaLabel.textContent = gamma().toFixed(2);
}

function setView(view) {
  activeView = view;
  toast.textContent = viewNotes[view];
  setActiveViewNote(viewNotes[view], true);
  controller.render();
}

function chartBounds() {
  const rect = canvas.getBoundingClientRect();
  const isSmall = rect.width < 560;
  const left = isSmall ? 2 : 4;
  const right = isSmall ? rect.width - 4 : rect.width - 6;
  const top = isSmall ? 2 : 4;
  const bottom = isSmall ? rect.height - 8 : rect.height - 10;
  return { left, right, top, bottom, width: right - left, height: bottom - top };
}

function px(point, bounds) {
  return plane.toX(point.x, bounds);
}

function py(point, bounds) {
  return plane.toY(point.y, bounds);
}

function pointFromCanvas(x, y, bounds) {
  return plane.fromCanvas(x, y, bounds);
}

function draw() {
  if (!state) return;
  const rect = canvas.getBoundingClientRect();
  const bounds = chartBounds();
  ctx.clearRect(0, 0, rect.width, rect.height);
  drawBackdrop(rect, bounds);
  drawGrid(bounds);
  if (activeView === "loss") drawLoss(bounds);
  else {
    drawDecisionField(bounds, activeView);
    if (activeView === "margin") drawMarginBand(bounds);
    if (activeView === "support") drawSupportInfluence(bounds);
    drawPoints(bounds, activeView);
  }
  drawAxes(bounds, activeView);
}

function drawBackdrop(rect, bounds) {
  ctx.fillStyle = "rgba(7, 16, 28, 0.34)";
  ctx.fillRect(bounds.left, bounds.top, bounds.width, bounds.height);
}

function drawGrid(bounds) {
  runtime.drawGrid(ctx, bounds);
}

function drawAxes(bounds, view) {
  runtime.drawAxes(ctx, bounds, {
    xLabel: view === "loss" ? "训练轮次" : "特征 x1",
    yLabel: view === "loss" ? "目标函数" : "特征 x2",
    xOffset: 7,
    yOffset: 10,
    xBaseline: "bottom",
    yBaseline: "top",
  });
}

function drawDecisionField(bounds, view) {
  if (state.round === 0 && state.alpha.every((value) => value < 0.0001)) {
    return;
  }
  const alpha = view === "boundary" ? 0.24 : 0.15;
  fieldRenderer.draw({
    key: `svm:${currentLevel}:${state.version}:${kernelPower.value}`,
    colorKey: `decision:${view}`,
    bounds,
    columns: 50,
    rows: 32,
    sample: (x, y) => scorePoint(plane.fromUnit(x, y)),
    color: (score) => {
      if (Math.abs(score) < 0.07) return [255, 243, 214, 255];
      return score >= 0 ? [34, 240, 164, Math.round(alpha * 255)] : [59, 215, 255, Math.round(alpha * 255)];
    },
  });
}

function drawMarginBand(bounds) {
  fieldRenderer.draw({
    key: `svm:${currentLevel}:${state.version}:${kernelPower.value}`,
    colorKey: "margin",
    bounds,
    columns: 50,
    rows: 32,
    sample: (x, y) => scorePoint(plane.fromUnit(x, y)),
    color: (score) => {
      if (Math.abs(Math.abs(score) - 1) < 0.08) return [34, 240, 164, 255];
      if (Math.abs(score) < 1) return [255, 212, 71, 28];
      return [0, 0, 0, 0];
    },
  });
  setActiveViewNote("间隔带越宽越稳；落在带内的样本会继续影响边界。");
}

function drawSupportInfluence(bounds) {
  ctx.save();
  targetPoints.forEach((point) => {
    const signed = point.label * scorePoint(point);
    if (signed < 1.18) {
      const radius = 22 + Math.max(0, 1.2 - signed) * 14;
      ctx.strokeStyle = point.label > 0 ? "rgba(34,240,164,0.32)" : "rgba(59,215,255,0.32)";
      ctx.lineWidth = 3;
      ctx.strokeRect(px(point, bounds) - radius / 2, py(point, bounds) - radius / 2, radius, radius);
    }
  });
  ctx.restore();
  setActiveViewNote("这些方框点就是支持向量：边界主要听它们的。");
}


function drawPoints(bounds, view) {
  ctx.save();
  ctx.lineWidth = 2;
  validationPoints.forEach((point) => {
    const x = px(point, bounds), y = py(point, bounds);
    ctx.strokeStyle = point.label > 0 ? "#22f0a4" : "#3bd7ff";
    ctx.strokeRect(x - 4, y - 4, 8, 8);
  });
  ctx.restore();
  ctx.save();
  targetPoints.forEach((point) => {
    const x = px(point, bounds);
    const y = py(point, bounds);
    const signed = point.label * scorePoint(point);
    const isSupport = signed < 1.12;
    const isWrong = signed < 0;
    if (isSupport) {
      ctx.fillStyle = isWrong ? "rgba(255,95,87,0.36)" : "rgba(255,212,71,0.26)";
      ctx.fillRect(x - 13, y - 13, 26, 26);
    }
    ctx.fillStyle = "#05060c";
    ctx.fillRect(x - 8, y - 8, 16, 16);
    ctx.fillStyle = point.label > 0 ? "#22f0a4" : "#3bd7ff";
    if (point.label > 0) {
      ctx.fillRect(x - 5, y - 5, 10, 10);
    } else {
      ctx.beginPath();
      ctx.moveTo(x, y - 7);
      ctx.lineTo(x + 7, y);
      ctx.lineTo(x, y + 7);
      ctx.lineTo(x - 7, y);
      ctx.closePath();
      ctx.fill();
    }
    if (view === "boundary" && isWrong) {
      ctx.strokeStyle = "#ff5f57";
      ctx.lineWidth = 3;
      ctx.strokeRect(x - 12, y - 12, 24, 24);
    }
  });
  ctx.restore();
}

function drawLoss(bounds) {
  const values = state.lossHistory.length ? state.lossHistory : [metrics().objective];
  const max = Math.max(...values, 1.2);
  const min = Math.min(...values, 0);
  ctx.save();
  runtime.drawSeries(ctx, values, bounds, {
    min,
    max,
    color: "#3bd7ff",
    lineWidth: 5,
    lineJoin: "miter",
    pointColor: "#ffd447",
    pointSize: 8,
  });
  setActiveViewNote("hinge loss + 正则项：下降说明边界还在变好。");
  ctx.restore();
}

controller = runtime.createLabController({
  levels,
  getLevelIndex: () => currentLevel,
  setLevelIndex: (index) => { currentLevel = index; },
  reset: resetGame,
  draw,
  canvas,
  context: ctx,
  levelPicker,
  viewPicker,
  setView,
  auto: { button: autoBtn, idleLabel: "自动训练", activeLabel: "暂停自动", intervalMs: 760, step: trainStep },
  actions: {
    step: trainStep,
    stepButton: stepBtn,
    undo: undoStep,
    undoButton: undoBtn,
    resetButton: resetBtn,
    nextButton: nextLevelBtn,
  },
  inputs: [
    { element: penaltyC, handler: () => { fieldRenderer.invalidate(); updateHud(); controller.render(); } },
    { element: kernelPower, handler: () => { fieldRenderer.invalidate(); updateHud(); controller.render(); } },
  ],
});
controller.start();
