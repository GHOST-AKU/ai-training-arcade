# 开发与验证

从仓库根目录执行命令。核心测试只使用 Node 内置模块，无需 `npm install`。CI 使用 Node 22；本轮本地环境为 Node 24.14.1 / npm 11.11.0。

```sh
npm run serve
```

打开 `http://127.0.0.1:4173/`。也可使用 README 中的 Python 静态服务器。无需构建步骤。

## 稳定命令

| 命令 | 验证范围 |
| --- | --- |
| `npm run check` | JavaScript / CommonJS 语法 |
| `npm run visual:check` | 静态结构和代码约定；不是视觉验收 |
| `npm run difficulty` | 难度、默认配置和已知解 |
| `npm run playability` | 26 关可达性、预算和固定参数采样 |
| `npm run i18n:check` | 中英文覆盖和语言函数 |
| `npm run smoke` | 纯模型与模拟页面流程 |
| `npm test` | 以上常规检查的组合 |
| `npm run benchmark` | 算法热点基准，结果受环境影响 |
| `npm run qa:dom` | 可选 JSDOM 事件回归，需要服务器和 jsdom |

日常协作只做与本次改动直接相关的必要检查，不默认运行全量测试、性能基准或重复验证。已有验证在代码和环境未变化时复用；全量命令保留给 CI 或明确需要覆盖的改动。

视觉测试和视觉验收由项目负责人进行。AI 不主动启动浏览器视觉检查、生成截图或执行视觉 QA；只有负责人另行明确要求时才执行。

## 报告和临时产物

```sh
npm run playability -- --report
```

此命令覆盖 `docs/reports/playability-report.json`。报告是固定参数组合的确定性采样，不是人类玩家成功率。普通 `npm test` 不重写该文件。

截图和临时诊断使用 `output/`；测试运行器输出使用 `test-results/` 或 `playwright-report/`。这些目录已被 Git 忽略。历史证据放在 `docs/history/`，不得把旧的 passed 记录当成本轮验收。

## 可选 DOM 和浏览器验证

DOM 回归沿用项目已有方式：

```sh
npm install --no-save --package-lock=false jsdom@30.1.0
# 另一个终端保持 npm run serve
npm run qa:dom
```

JSDOM 使用 Canvas stub，不验证真实像素或屏幕布局。真实浏览器脚本是 Playwright CLI 的 `run-code` 回调，不是 Node 直接可执行脚本，也不是 Playwright Test 测试文件：

```sh
npx --yes --package @playwright/cli playwright-cli -s=ml-arcade-qa open http://127.0.0.1:4173/gbm.html
npx --yes --package @playwright/cli playwright-cli -s=ml-arcade-qa run-code --filename tests/browser/browser-qa.js
npx --yes --package @playwright/cli playwright-cli -s=ml-arcade-qa run-code --filename tests/browser/performance-qa.js
```

`browser-qa.js` 会生成截图，保留供负责人使用。AI 默认不执行此脚本或其他视觉测试。
