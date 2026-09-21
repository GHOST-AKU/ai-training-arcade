const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

function makeCtx() {
  return new Proxy({
    createImageData(width, height) {
      return { data: new Uint8ClampedArray(width * height * 4) };
    },
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
    addEventListener(type, handler) {
      this.listeners[type] = handler;
    },
    removeEventListener() {},
    getBoundingClientRect() {
      return { width: 900, height: 430, left: 0, top: 0 };
    },
    getContext() {
      return makeCtx();
    },
    querySelector() {
      return makeElement(`${selector} child`);
    },
    querySelectorAll() {
      return [];
    },
  };
}

function evaluate(file, context) {
  vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
}

function createGame() {
  const elements = new Map();
  const element = (selector) => {
    if (!elements.has(selector)) elements.set(selector, makeElement(selector));
    return elements.get(selector);
  };
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
    requestAnimationFrame(callback) {
      if (typeof callback === "function") callback();
      return 1;
    },
    cancelAnimationFrame() {},
  };
  vm.createContext(context);
  evaluate("core/lab-manifest.js", context);
  evaluate("models/model-core.js", context);
  evaluate("models/gbm-model.js", context);
  evaluate("core/lab-runtime.js", context);
  evaluate("labs/gbm.js", context);
  return { element };
}

function playLevel(game, rate, depth, maxRounds) {
  game.element("#learningRate").value = String(rate);
  game.element("#treeDepth").value = String(depth);
  const step = game.element("#stepBtn").listeners.click;
  for (let round = 0; round < maxRounds; round += 1) {
    step();
    if (game.element("#toast").textContent.includes("通关")) return true;
  }
  return false;
}

const expectations = [
  { budget: 5, solution: [0.3, 3], defaultClears: true },
  { budget: 4, solution: [0.28, 5], defaultClears: false },
  { budget: 7, solution: [0.2, 4], defaultClears: false },
  { budget: 6, solution: [0.18, 7], defaultClears: false },
];

expectations.forEach((expectation, level) => {
  const defaultGame = createGame();
  for (let index = 0; index < level; index += 1) defaultGame.element("#nextLevelBtn").listeners.click();
  const defaultRate = Number(defaultGame.element("#learningRate").value);
  const defaultDepth = Number(defaultGame.element("#treeDepth").value);
  const defaultClears = playLevel(defaultGame, defaultRate, defaultDepth, expectation.budget);
  assert.strictEqual(
    defaultClears,
    expectation.defaultClears,
    `GBM level ${level + 1}: default parameters should ${expectation.defaultClears ? "clear the tutorial" : "fail the challenge"}`,
  );
  assert(
    defaultGame.element("#targetLabel").textContent.includes(`预算 ${expectation.budget}`),
    `GBM level ${level + 1}: HUD must expose the ${expectation.budget}-tree budget`,
  );
  if (!expectation.defaultClears) {
    const roundAtBudget = defaultGame.element("#roundValue").textContent;
    defaultGame.element("#stepBtn").listeners.click();
    assert.strictEqual(
      defaultGame.element("#roundValue").textContent,
      roundAtBudget,
      `GBM level ${level + 1}: training must stop when the budget is exhausted`,
    );
    assert(
      defaultGame.element("#toast").textContent.match(/预算耗尽|计算预算不足/),
      `GBM level ${level + 1}: budget failure must explain why training stopped`,
    );
  }

  const solutionGame = createGame();
  for (let index = 0; index < level; index += 1) solutionGame.element("#nextLevelBtn").listeners.click();
  assert.strictEqual(
    playLevel(solutionGame, expectation.solution[0], expectation.solution[1], expectation.budget),
    true,
    `GBM level ${level + 1}: intended solution must clear within ${expectation.budget} rounds`,
  );
});

console.log("GBM difficulty contract passed.");
