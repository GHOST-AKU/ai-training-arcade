// Real-browser DOM/layout checks only. No screenshots or pixel inspection.
async (page) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const results = [];
  for (const id of ['index', 'gbm', 'svm', 'kmeans', 'tree', 'linear', 'logistic', 'nn', 'forest']) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`http://127.0.0.1:4173/${id}.html`);
    await page.waitForFunction(() => window.LabRuntime && window.LabI18n);
    await page.evaluate(() => document.fonts.ready);
    if (await page.locator('.theme-toggle').count() !== 1 || await page.locator('.language-toggle').count() !== 1) throw new Error(`${id}: duplicate or missing preferences`);
    if (await page.locator('.lab-select option').count() !== 9) throw new Error(`${id}: navigation`);
    await page.evaluate(() => window.LabI18n.setLanguage('en'));
    if (id !== 'index') {
      const before = await page.locator('#roundValue').textContent();
      await page.locator(id === 'tree' ? '#bestBtn' : '#stepBtn').click();
      await page.locator('#expandLogBtn').click();
      if (await page.locator('#logOverlay').isHidden()) throw new Error(`${id}: log failed to open`);
      await page.keyboard.press('Escape');
      await page.locator('#undoBtn').click();
      if (await page.locator('#roundValue').textContent() !== before) throw new Error(`${id}: undo`);
    }
    for (const [width, height] of [[1440,900], [844,390], [390,844]]) {
      await page.setViewportSize({ width, height });
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const layout = await page.evaluate(() => ({
        width: innerWidth,
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        hidden: getComputedStyle(document.querySelector('main')).visibility === 'hidden',
        summariesValid: [...document.querySelectorAll('details')].every((e) => e.firstElementChild?.tagName === 'SUMMARY'),
        fontLoaded: [...document.fonts].some((font) => font.family === 'Arcade Pixel' && font.status === 'loaded'),
      }));
      if (layout.overflow || layout.hidden || !layout.summariesValid || !layout.fontLoaded) throw new Error(`${id}: ${JSON.stringify(layout)}`);
      results.push({ id, width, height, ...layout });
    }
  }
  if (errors.length) throw new Error(errors.join('\n'));
  return results;
};
