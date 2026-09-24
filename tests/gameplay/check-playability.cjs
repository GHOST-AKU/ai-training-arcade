const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const { createGame, loadManifest, moveToLevel, play, playTree } = require('../support/game-harness.cjs');

function ranges(id) {
  return [...fs.readFileSync(`${id}.html`, 'utf8').matchAll(/<input id="([^"]+)" type="range" min="([^"]+)" max="([^"]+)" value="[^"]+" step="([^"]+)"/g)]
    .map((m) => ({ selector: `#${m[1]}`, min: Number(m[2]), max: Number(m[3]), step: Number(m[4]) }));
}
function read(game, source) { return vm.runInContext(source, game.context); }
function clear(game) { return game.element('#outcomeLabel').dataset.cleared === 'true'; }
function setValues(game, values) {
  for (const [selector, value] of Object.entries(values)) {
    const input = game.element(selector);
    input.value = String(value);
    input.listeners.input?.({ target: input });
  }
}
function budget(game, level) { return read(game, `levels[${level}].maxRounds || levels[${level}].maxTrees || levels[${level}].maxActions`); }
function run(game, definition, level, values) {
  // Fresh same-level run. No accidental reuse of prior round/work state.
  read(game, 'resetGame()');
  setValues(game, values);
  for (let turn = 0; turn < budget(game, level); turn += 1) {
    game.element(definition.smoke.step).listeners.click();
    if (clear(game)) return true;
  }
  return false;
}
const report = [];
for (const definition of loadManifest().filter((d) => d.model)) {
  const inputs = ranges(definition.id);
  const game = createGame(definition);
  // Model-only tests do not need to rasterize fields; all event handlers still run.
  read(game, 'controller.render = () => {}');
  const levelCount = read(game, 'levels.length');
  let allMaxClearsEveryChallenge = true;
  for (let level = 0; level < levelCount; level += 1) {
    if (level) game.element('#nextLevelBtn').listeners.click();
    const values = definition.smoke.levelValues?.[level] || definition.smoke.values || {};
    for (const input of inputs) {
      if (!(input.selector in values)) continue;
      const value = Number(values[input.selector]);
      assert(value >= input.min && value <= input.max, `${definition.id}: solution is inside slider range`);
      assert(Math.abs((value - input.min) / input.step - Math.round((value - input.min) / input.step)) < 1e-7,
        `${definition.id}: solution is reachable with slider step`);
    }
    if (definition.id === 'tree') {
      read(game, 'resetGame()');
      assert(playTree(game, level).cleared, `tree L${level + 1}: manual sequence must clear`);
      assert(clear(game), 'tree: persistent success indicator');
      report.push({ lab: 'tree', level: level + 1, witness: true, sampling: 'manual four-cut sequence tested separately' });
      continue;
    }
    assert(run(game, definition, level, values), `${definition.id} L${level + 1}: reachable witness`);
    const solved = read(game, 'JSON.stringify(state)');
    read(game, 'setView(' + JSON.stringify(definition.id === 'linear' ? 'loss' : definition.id === 'gbm' ? 'model' : definition.id === 'svm' ? 'boundary' : definition.id === 'kmeans' ? 'territory' : definition.id === 'forest' ? 'vote' : definition.id === 'nn' ? 'boundary' : 'prob') + ')');
    assert.strictEqual(read(game, 'JSON.stringify(state)'), solved, 'views must not modify the model');
    assert(clear(game), 'changing view must preserve success indicator');

    // Retry keeps the chosen controls, while clearing training and work.
    game.element('#resetBtn').listeners.click();
    for (const [selector, value] of Object.entries(values)) assert.strictEqual(Number(game.element(selector).value), Number(value));
    assert.strictEqual(read(game, 'state.round'), 0);
    assert.strictEqual(read(game, 'state.work || 0'), 0);
    assert(!clear(game));
    const initialModel = read(game, 'JSON.stringify(state.net || state.predictions || state.centroids || state.alpha || [state.w,state.b])');
    game.element(definition.smoke.step).listeners.click();
    game.element('#undoBtn').listeners.click();
    assert.strictEqual(read(game, 'state.round'), 0, 'undo refunds round');
    assert.strictEqual(read(game, 'state.work || 0'), 0, 'undo refunds work');
    assert.strictEqual(read(game, 'JSON.stringify(state.net || state.predictions || state.centroids || state.alpha || [state.w,state.b])'), initialModel, 'undo restores model');

    const maxima = Object.fromEntries(inputs.map((input) => [input.selector, input.max]));
    const maxClears = run(game, definition, level, maxima);
    if (level > 0 && !maxClears) allMaxClearsEveryChallenge = false;
    // Deterministic, equally spaced samples on the actual input grid. This is
    // parameter-space coverage, not an estimate of human player success rates.
    const grid = inputs.map((input) => {
      const count = Math.round((input.max - input.min) / input.step) + 1;
      const stride = Math.ceil(count / 18);
      return Array.from({ length: count }, (_, i) => +(input.min + i * input.step).toFixed(8))
        .filter((_, i) => i % stride === 0 || i === count - 1);
    });
    let wins = 0, trials = 0;
    for (const a of grid[0]) for (const b of grid[1]) {
      trials += 1;
      if (run(game, definition, level, { [inputs[0].selector]: a, [inputs[1].selector]: b })) wins += 1;
    }
    if (level > 0) {
      assert(wins > 0, `${definition.id} L${level + 1}: grid contains a solution`);
      assert(wins / trials < 0.75, `${definition.id} L${level + 1}: too many arbitrary settings clear`);
    }
    report.push({ lab: definition.id, level: level + 1, witness: true, wins, trials, fraction: +(wins / trials).toFixed(3), maxClears });
  }
  if (definition.id !== 'tree') assert(!allMaxClearsEveryChallenge, `${definition.id}: max sliders must not solve all challenges`);
}
// Resource rejection must leave the model and remaining work untouched.
for (const id of ['gbm', 'linear', 'nn', 'forest']) {
  const definition = loadManifest().find((d) => d.id === id);
  const game = createGame(definition);
  read(game, 'controller.render = () => {}; state.work = workLimits[0]');
  const before = read(game, 'JSON.stringify(state)');
  game.element('#stepBtn').listeners.click();
  assert.strictEqual(read(game, 'JSON.stringify(state)'), before, `${id}: rejected step is atomic`);
  assert(game.element('#toast').textContent.includes('计算预算不足'));
  read(game, 'controller.autoTrainer.start()');
  assert.strictEqual(read(game, 'JSON.stringify(state)'), before, `${id}: automatic training uses the same budget`);
  assert.strictEqual(read(game, 'controller.isAutoRunning()'), false);
}
for (const row of report) console.log(`${row.lab} L${row.level}: ${row.wins ?? 'manual'}/${row.trials ?? 'witness'}; maximum settings ${row.maxClears ?? 'n/a'}`);
if (process.argv.includes('--report')) {
  fs.mkdirSync('docs/reports', { recursive: true });
  fs.writeFileSync('docs/reports/playability-report.json', JSON.stringify({ methodology: 'Deterministic on-grid parameter sampling, plus witnessed solutions for all 26 levels. Not human playtest statistics.', results: report }, null, 2) + '\n');
}
console.log('26 levels reachable; retry, undo, budgets and parameter-space checks passed.');
// Geometry-only checks for the two split canvases. No image rendering.
for (const id of ['nn', 'forest']) {
  const game = createGame(loadManifest().find((d) => d.id === id));
  for (const [width, height] of [[320,600], [500,600], [900,480]]) {
    game.element('#chart').getBoundingClientRect = () => ({ width, height, left: 0, top: 0 });
    const b = read(game, id === 'nn' ? 'layout()' : 'bounds()');
    const panel = b.panel;
    const x = panel.x ?? panel.left, y = panel.y ?? panel.top;
    const w = panel.w ?? panel.width, h = panel.h ?? panel.height;
    assert(b.width > 0 && b.height > 0 && w > 0 && h > 0);
    assert(x >= b.right || y >= b.bottom, `${id}: chart and detail panel must not overlap`);
    assert(x + w <= width && y + h <= height, `${id}: panel must fit canvas bounds`);
  }
}
