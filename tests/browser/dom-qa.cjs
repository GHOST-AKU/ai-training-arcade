// DOM and event tests only. No screenshots, raster inspection or visual recognition.
// Run with: NODE_PATH=/path/to/jsdom/node_modules node tests/browser/dom-qa.cjs
const assert = require('assert');
const { JSDOM, VirtualConsole } = require('jsdom');
const base = process.env.QA_URL || 'http://127.0.0.1:4173';
const pause = () => new Promise((resolve) => setTimeout(resolve, 10));
function canvasContext() {
  const textCalls = [];
  return new Proxy({
    localized: false, textCalls,
    fillText: (value) => textCalls.push(String(value)),
    strokeText: (value) => textCalls.push(String(value)),
    measureText: (value) => ({ width: String(value).length * 7 }),
    createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
  }, { get: (obj, key) => key in obj ? obj[key] : () => {} });
}
function untranslated(document) {
  const walker = document.createTreeWalker(document.body, 4), missing = new Set();
  let node;
  while ((node = walker.nextNode())) {
    if (['SCRIPT','STYLE'].includes(node.parentElement?.tagName) || node.parentElement?.closest('.language-toggle')) continue;
    if (/[\u4e00-\u9fff]/.test(node.data)) missing.add(node.data.trim());
  }
  for (const e of document.querySelectorAll('[aria-label], [title]')) {
    if (e.classList.contains('language-toggle')) continue;
    for (const a of ['aria-label','title']) if (/[\u4e00-\u9fff]/.test(e.getAttribute(a) || '')) missing.add(e.getAttribute(a));
  }
  return [...missing];
}
async function main() {
  const failures = [];
  for (const id of ['index','gbm','svm','kmeans','tree','linear','logistic','nn','forest']) {
    const errors = [];
    const console = new VirtualConsole();
    console.on('jsdomError', (e) => errors.push(e.message));
    const dom = await JSDOM.fromURL(`${base}/${id}.html`, {
      resources: 'usable', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: console,
      beforeParse(window) {
        window.scrollTo = () => {};
        window.HTMLCanvasElement.prototype.getContext = function () { return this.testContext ||= canvasContext(); };
        window.HTMLCanvasElement.prototype.getBoundingClientRect = () => ({ width: 900, height: 480, left: 0, top: 0 });
      },
    });
    const { window } = dom, document = window.document;
    for (let i = 0; i < 150 && !window.LabRuntime; i++) await pause();
    await pause();
    assert(window.LabRuntime, `${id}: boot`);
    assert.strictEqual(document.querySelectorAll('.theme-toggle').length, 1);
    assert.strictEqual(document.querySelectorAll('.language-toggle').length, 1);
    assert.strictEqual(document.querySelectorAll('.lab-select option').length, 9);
    for (const detail of document.querySelectorAll('details')) assert.strictEqual(detail.firstElementChild.tagName, 'SUMMARY', `${id}: details summary must be the first child`);
    const click = (s) => { const e = document.querySelector(s); assert(e, s); e.click(); };
    click('.theme-toggle'); assert.strictEqual(document.documentElement.dataset.theme, 'light');
    click('.theme-toggle'); assert.strictEqual(document.documentElement.dataset.theme, 'dark');
    const getState = () => id === 'index' ? '' : window.eval('JSON.stringify(state)');
    const before = getState();
    const chart = document.querySelector("#chart");
    if (chart) chart.getContext("2d").textCalls.length = 0;
    click('.language-toggle'); await pause();
    assert.strictEqual(document.documentElement.lang, 'en');
    assert.strictEqual(window.localStorage.getItem('ml-arcade-language'), 'en');
    assert.strictEqual(getState(), before, 'language switch must preserve model state');
    failures.push(...untranslated(document).map((s) => `${id} initial: ${s}`));
    if (id !== 'index') {
      const definition = window.LabManifest.find((d) => d.id === id);
      const levelCount = window.eval('levels.length');
      for (let level = 0; level < levelCount; level++) {
        if (level) { click('#nextLevelBtn'); await pause(); }
        const values = definition.smoke.levelValues?.[level] || definition.smoke.values || {};
        for (const [s, value] of Object.entries(values)) { const e = document.querySelector(s); e.value = value; e.dispatchEvent(new window.Event('input')); }
        if (id === 'tree') {
          const cuts = [[['x',-.02]],[['x',-.13]],[['x',-.74],['y',.48],['x',.78],['y',-.69]]][level];
          for (const [axis,value] of cuts) {
            click(`[data-axis="${axis}"]`); const e = document.querySelector('#threshold'); e.value = value; e.dispatchEvent(new window.Event('input')); click('#stepBtn');
          }
        } else {
          for (let step = 0; step < 20 && document.querySelector('#outcomeLabel').dataset.cleared !== 'true'; step++) click(definition.smoke.step);
        }
        await pause();
        assert.strictEqual(document.querySelector('#outcomeLabel').dataset.cleared, 'true', `${id} L${level + 1}: real DOM controls can clear`);
        failures.push(...untranslated(document).map((s) => `${id} L${level + 1}: ${s}`));
        click('#expandLogBtn'); await pause();
        assert(!document.querySelector('#logOverlay').hidden);
        failures.push(...untranslated(document).map((s) => `${id} log: ${s}`));
        window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
        assert(document.querySelector('#logOverlay').hidden);
        for (const view of document.querySelectorAll('#viewPicker button')) { view.click(); await pause(); failures.push(...untranslated(document).map((s) => `${id} view: ${s}`)); }
        click('#undoBtn'); await pause();
        failures.push(...untranslated(document).map((s) => `${id} undo: ${s}`));
      }
      // A rejection path and a fresh retry in English.
      click('#resetBtn');
      for (const e of document.querySelectorAll('input[type=range]')) { e.value = e.min; e.dispatchEvent(new window.Event('input')); }
      for (let step = 0; step < 20; step++) click('#stepBtn');
      await pause();
      failures.push(...untranslated(document).map((s) => `${id} failure: ${s}`));
    }
    if (chart) failures.push(...chart.getContext("2d").textCalls.filter((s) => /[\u4e00-\u9fff]/.test(s)).map((s) => `${id} canvas text: ${s}`));
    const stateBeforeSwitch = getState();
    click('.language-toggle'); await pause();
    assert.strictEqual(document.documentElement.lang, 'zh-CN');
    assert.strictEqual(getState(), stateBeforeSwitch);
    assert(/[\u4e00-\u9fff]/.test(document.querySelector('h1').textContent));
    assert.deepStrictEqual(errors, [], `${id}: browser-script errors`);
    dom.window.close();
    process.stdout.write(`${id}: DOM, events, translation and state checks passed\n`);
  }
  assert.deepStrictEqual([...new Set(failures)], [], 'Untranslated text');
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
