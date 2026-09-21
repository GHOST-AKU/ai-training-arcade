const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync('core/translations.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('core/i18n.js', 'utf8'), context);
const { english, t } = context.window.LabI18n;
assert.strictEqual(t('下一关'), '下一关', 'Chinese is the default');
assert.strictEqual(english('下一关'), 'Next level');
assert.strictEqual(english('计算预算 9/12 · 下一步 3'), 'Work 9/12 · next step 3');
assert.strictEqual(english('预算耗尽：正则过强，权重被压得过平。调整参数后重置再试。'), 'Round limit reached: Regularization is too strong. Adjust settings and retry.');
const texts = new Set();
const files = [...fs.readdirSync('labs').map((f) => `labs/${f}`), 'core/lab-runtime.js', 'core/lab-manifest.js', ...fs.readdirSync('.').filter((f) => f.endsWith('.html'))];
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.html')) {
    for (const match of source.matchAll(/>([^<>]+)</g)) texts.add(match[1].trim());
    for (const match of source.matchAll(/(?:aria-label|title|data-empty-message|data-initial-status)="([^"]*)"/g)) texts.add(match[1]);
  } else {
    for (const match of source.matchAll(/"((?:\\.|[^"\\])*)"|`((?:\\.|[^`\\])*)`/g)) {
      let value = match[1] || match[2];
      if (!value) continue;
      if (value.includes('<')) {
        for (const node of value.matchAll(/>([^<>]+)</g)) texts.add(node[1]);
      } else {
        let index = 0;
        texts.add(value.replace(/\$\{[^}]*\}/g, () => String(++index)));
      }
    }
  }
}
const languageNames = new Set(['中文', 'Switch language / 切换语言']);
const missing = [...texts].filter((text) => /[\u4e00-\u9fff]/.test(text) && !languageNames.has(text) && /[\u4e00-\u9fff]/.test(english(text)));
assert.deepStrictEqual(missing, [], 'All source UI copy needs an English translation');
console.log('Static UI, dynamic templates, accessibility labels and nested translations covered.');
