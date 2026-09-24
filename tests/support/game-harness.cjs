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
  return { element, context };
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


module.exports = { createGame, loadManifest, play, playTree, moveToLevel };
