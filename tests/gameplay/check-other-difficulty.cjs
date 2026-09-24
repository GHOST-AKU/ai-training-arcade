const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

function makeCtx() {
  return new Proxy({
    createImageData(width, height) { return { data: new Uint8ClampedArray(width * height * 4) }; },
    drawImage() {},
    putImageData() {},
  }, { get: (target, property) => (property in target ? target[property] : () => {}) });
}

function makeElement(selector) {
  return {
    selector,
    style: {},
    dataset: {},
    className: "",
    hidden: false,
    disabled: false,
    classList: { contains() { return false; }, toggle() {}, add() {}, remove() {} },
    textContent: "",
    innerHTML: "",
    value: "",
    checked: false,
    firstElementChild: null,
    listeners: {},
    append() {},
    prepend() {},
    focus() {},
    setAttribute() {},
    setPointerCapture() {},
    addEventListener(type, handler) { this.listeners[type] = handler; },
    removeEventListener() {},
    getBoundingClientRect() { return { width: 900, height: 430, left: 0, top: 0 }; },
    getContext() { return makeCtx(); },
    querySelector() { return makeElement(`${selector} child`); },
    querySelectorAll() { return []; },
  };
}

function evaluate(file, context) {
  vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
}

function loadManifest() {
  const context = { globalThis: null };
  context.globalThis = context;
  vm.createContext(context);
  evaluate("core/lab-manifest.js", context);
  return context.LabManifest;
}

function createGame(definition) {
  const elements = new Map();
  const element = (selector) => {
    if (!elements.has(selector)) elements.set(selector, makeElement(selector));
    return elements.get(selector);
  };
  Object.entries(definition.smoke?.values || {}).forEach(([selector, value]) => {
    element(selector).value = value;
  });
  const context = {
    console,
    setInterval() { return 1; },
    clearInterval() {},
    window: { addEventListener() {}, removeEventListener() {}, devicePixelRatio: 1 },
    document: {
      body: { classList: { add() {}, remove() {}, toggle() {} } },
      querySelector: element,
      querySelectorAll() { return []; },
      createElement(tagName) { return makeElement(tagName); },
    },
    Math,
    Date,
    requestAnimationFrame(callback) { if (typeof callback === "function") callback(); return 1; },
    cancelAnimationFrame() {},
  };
  vm.createContext(context);
  evaluate("core/lab-manifest.js", context);
  evaluate("models/model-core.js", context);
  evaluate(definition.model.replace(/^\.\//, ""), context);
  evaluate("core/lab-runtime.js", context);
  evaluate(definition.lab.replace(/^\.\//, ""), context);
  return { element };
}

function moveToLevel(game, level) {
  for (let index = 0; index < level; index += 1) game.element("#nextLevelBtn").listeners.click();
}

function play(game, action, values, budget) {
  Object.entries(values || {}).forEach(([selector, value]) => {
    const input = game.element(selector);
    input.value = String(value);
    input.listeners.input?.({ target: input });
  });
  const handler = game.element(action).listeners.click;
  for (let turn = 1; turn <= budget; turn += 1) {
    handler();
    if (game.element("#toast").textContent.includes("通关")) return { cleared: true, turns: turn };
  }
  return { cleared: false, turns: budget };
}

function playTree(game, level) {
  const sequences = [
    [["x", -0.02]],
    [["x", -0.13]],
    [["x", -0.74], ["y", 0.48], ["x", 0.78], ["y", -0.69]],
  ];
  game.element("#maxDepth").value = "4";
  for (let turn = 0; turn < sequences[level].length; turn += 1) {
    const [axis, value] = sequences[level][turn];
    const axisButton = { dataset: { axis } };
    game.element("#axisPicker").listeners.click({ target: { closest: () => axisButton } });
    const threshold = game.element("#threshold");
    threshold.value = String(value);
    threshold.listeners.input?.({ target: threshold });
    game.element("#stepBtn").listeners.click();
    if (game.element("#toast").textContent.includes("通关")) return { cleared: true, turns: turn + 1 };
  }
  return { cleared: false, turns: sequences[level].length };
}

const contracts = {
  svm: {
    action: "#stepBtn",
    budgets: [8, 16, 12, 16],
    solutions: [
      { "#learningRate": 3, "#treeDepth": 1 },
      { "#learningRate": 3, "#treeDepth": 1 },
      { "#learningRate": 3, "#treeDepth": 8 },
      { "#learningRate": 3, "#treeDepth": 6 },
    ],
  },
  kmeans: {
    action: "#stepBtn",
    budgets: [3, 3, 3],
    solutions: [
      { "#clusterCount": 3, "#moveRate": 1 },
      { "#clusterCount": 3, "#moveRate": 1 },
      { "#clusterCount": 4, "#moveRate": 1 },
    ],
  },
  tree: {
    action: "#stepBtn",
    defaultAction: "#stepBtn",
    budgets: [1, 1, 4],
    solutions: [{}, {}, {}],
    playSolution: playTree,
  },
  linear: {
    action: "#stepBtn",
    budgets: [4, 3, 3],
    solutions: [
      { "#learningRate": 0.25, "#batchSize": 3 },
      { "#learningRate": 0.25, "#batchSize": 3 },
      { "#learningRate": 0.25, "#batchSize": 3 },
    ],
  },
  logistic: {
    action: "#stepBtn",
    budgets: [5, 10, 13],
    solutions: [
      { "#learningRate": 0.8, "#regularization": 0.01 },
      { "#learningRate": 0.8, "#regularization": 0.01 },
      { "#learningRate": 0.8, "#regularization": 0.01 },
    ],
  },
  nn: {
    action: "#stepBtn",
    budgets: [6, 14, 3],
    solutions: [
      { "#learningRate": 0.35, "#epochsPerStep": 10 },
      { "#learningRate": 1.5, "#epochsPerStep": 10 },
      { "#learningRate": 2, "#epochsPerStep": 10 },
    ],
  },
  forest: {
    action: "#stepBtn",
    budgets: [4, 4, 10],
    solutions: [
      { "#maxDepth": 3, "#featureRate": 1 },
      { "#maxDepth": 3, "#featureRate": 1 },
      { "#maxDepth": 3, "#featureRate": 1 },
    ],
  },
};

const definitions = new Map(loadManifest().filter((item) => item.model).map((item) => [item.id, item]));
const failures = [];

Object.entries(contracts).forEach(([id, contract]) => {
  const definition = definitions.get(id);
  contract.budgets.forEach((budget, level) => {
    const defaultGame = createGame(definition);
    moveToLevel(defaultGame, level);
    const defaultResult = play(defaultGame, contract.defaultAction || contract.action, null, budget);
    const defaultShouldClear = level === 0;
    if (defaultResult.cleared !== defaultShouldClear) {
      failures.push(`${id} level ${level + 1}: default ${defaultResult.cleared ? "cleared" : "failed"}, expected ${defaultShouldClear ? "tutorial clear" : "challenge failure"}`);
    }

    const solutionGame = createGame(definition);
    moveToLevel(solutionGame, level);
    const solutionResult = contract.playSolution
      ? contract.playSolution(solutionGame, level)
      : play(solutionGame, contract.action, contract.solutions[level], budget);
    if (!solutionResult.cleared) failures.push(`${id} level ${level + 1}: solution missed ${budget}-turn budget`);

    if (!defaultGame.element("#targetLabel").textContent.includes(`预算 ${budget}`)) {
      failures.push(`${id} level ${level + 1}: HUD does not show budget ${budget}`);
    }
    if (!defaultShouldClear) {
      defaultGame.element(contract.defaultAction || contract.action).listeners.click();
      if (!defaultGame.element("#toast").textContent.match(/预算耗尽|计算预算不足/)) {
        failures.push(`${id} level ${level + 1}: exhausted action does not explain budget failure`);
      }
    }
    console.log(`${id} L${level + 1}: default=${defaultResult.cleared ? `clear/${defaultResult.turns}` : "fail"} solution=${solutionResult.cleared ? `clear/${solutionResult.turns}` : "fail"}`);
  });
});

assert.deepStrictEqual(failures, [], failures.join("\n"));
console.log("Remaining lab difficulty contracts passed.");
