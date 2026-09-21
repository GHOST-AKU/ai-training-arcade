(function registerI18n(global) {
  "use strict";
  const catalog = global.LabTranslations || {};
  const key = "ml-arcade-language";
  let language = "zh";
  try { language = global.localStorage?.getItem(key) === "en" ? "en" : "zh"; } catch { /* Optional storage. */ }
  const normalize = (value) => String(value).replace(/\s+/g, " ").trim();
  const exact = new Map(Object.entries(catalog).map(([zh, en]) => [normalize(zh), en]));
  const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = Object.entries(catalog).filter(([zh]) => /\{\d+\}/.test(zh)).map(([zh, en]) => ({
    re: new RegExp("^" + normalize(zh).split(/\{\d+\}/).map(escape).join("([\\s\\S]*?)") + "$"), en,
  }));
  function english(value, depth = 0) {
    const source = normalize(value);
    if (exact.has(source)) return exact.get(source);
    if (depth < 4) {
      for (const { re, en } of patterns) {
        const match = source.match(re);
        if (match) return en.replace(/\{(\d+)\}/g, (_, i) => english(match[Number(i) + 1], depth + 1));
      }
    }
    return String(value);
  }
  function t(value) { return language === "en" ? english(value) : String(value); }
  const textRecords = new WeakMap();
  const attributeRecords = new WeakMap();
  const attrs = ["aria-label", "title", "data-empty-message", "data-initial-status"];
  let observer;
  function translateDom(root = global.document) {
    const document = global.document;
    if (!document?.createTreeWalker || !root) return;
    observer?.disconnect();
    const walker = document.createTreeWalker(root, 4);
    let node;
    while ((node = walker.nextNode())) {
      if (["SCRIPT", "STYLE"].includes(node.parentElement?.tagName)) continue;
      let record = textRecords.get(node);
      if (!record || node.data !== record.rendered) record = { source: node.data };
      // Preserve spacing around inline elements.
      const source = record.source;
      const translated = t(source.trim());
      record.rendered = source.replace(source.trim(), translated);
      if (node.data !== record.rendered) node.data = record.rendered;
      textRecords.set(node, record);
    }
    root.querySelectorAll?.("[aria-label], [title], [data-empty-message], [data-initial-status]").forEach((element) => {
      const records = attributeRecords.get(element) || {};
      for (const attr of attrs) {
        if (!element.hasAttribute(attr)) continue;
        const value = element.getAttribute(attr);
        let record = records[attr];
        if (!record || record.rendered !== value) record = { source: value };
        record.rendered = t(record.source);
        if (value !== record.rendered) element.setAttribute(attr, record.rendered);
        records[attr] = record;
      }
      attributeRecords.set(element, records);
    });
    document.documentElement.lang = language === "en" ? "en" : "zh-CN";
    observer?.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: attrs });
  }
  function setLanguage(next) {
    language = next === "en" ? "en" : "zh";
    try { global.localStorage?.setItem(key, language); } catch { /* Optional storage. */ }
    translateDom();
    global.dispatchEvent?.(new Event("languagechange"));
  }
  function start() {
    if (global.MutationObserver) observer = new global.MutationObserver(() => translateDom());
    translateDom();
  }
  global.LabI18n = { t, english, translateDom, setLanguage, getLanguage: () => language, start };
})(window);
