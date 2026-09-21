(function bootstrapLab(global) {
  "use strict";

  const document = global.document;
  const manifest = global.LabManifest;
  const ASSET_VERSION = "20260921-1";
  if (!document || !manifest) throw new Error("bootstrap.js requires lab-manifest.js");

  function versionAsset(source) {
    const separator = source.includes("?") ? "&" : "?";
    return `${source}${separator}v=${ASSET_VERSION}`;
  }

  function loadScripts(sources) {
    return Promise.all(sources.map((source) => new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = versionAsset(source);
      script.async = false;
      script.addEventListener("load", resolve, { once: true });
      script.addEventListener("error", () => reject(new Error(`Unable to load ${source}`)), { once: true });
      document.head.append(script);
    })));
  }

  async function start() {
    const id = document.body?.dataset.lab || "home";
    const definition = manifest.find((lab) => lab.id === id);
    if (!definition) throw new Error(`Unknown lab id: ${id}`);

    await loadScripts(["./core/translations.js", "./core/i18n.js"]);
    const sources = definition.model
      ? ["./models/model-core.js", definition.model, "./core/lab-runtime.js", definition.lab]
      : ["./core/lab-runtime.js"];
    await loadScripts(sources);
    global.LabI18n.start();
  }

  start().catch((error) => {
    console.error(error);
    const status = document.querySelector("#toast") || document.querySelector("main");
    if (status) {
      const message = `训练场加载失败：${error.message}`;
      status.textContent = global.LabI18n ? global.LabI18n.t(message) : message;
    }
  });
})(window);
