# 项目结构

AI Training Arcade 是无需打包的静态站点，使用 HTML、CSS、普通 JavaScript 和 Canvas。浏览器脚本通过全局对象共享能力；不要把现有文件当成 ES module 或 Node 模块直接改写。

```text
ai-training-arcade/             # 本地目录沿用 gbm-gradient-game
├── index.html                  # 大厅
├── <id>.html                   # 八个训练场的稳定入口
├── styles.css                  # 全站样式与视觉变量
├── assets/                     # 随站点分发的字体等静态资源及许可证
├── core/                       # 共享运行时、加载入口、清单和中英文支持
├── labs/                       # 每个训练场的关卡、交互状态与绘制
├── models/                     # 不依赖 DOM 的算法实现
├── scripts/                    # 静态服务器与 JavaScript 语法扫描
├── tests/
│   ├── contracts/              # 页面结构和翻译约定
│   ├── gameplay/               # 难度、预算、参数采样及可达性
│   ├── smoke/                  # 纯模型和模拟页面流程
│   ├── support/                # VM / DOM stub 测试辅助工具
│   └── browser/                # 可选 JSDOM 与真实浏览器 QA
├── benchmarks/                 # 纯模型性能基准
├── docs/
│   ├── README.md               # 文档索引
│   ├── ARCHITECTURE.md         # 本文件
│   ├── DEVELOPMENT.md          # 命令和验证范围
│   ├── design/                 # 当前设计规范
│   ├── history/                # 历史修复和验收记录
│   ├── reports/                # 受版本管理的机器报告
│   └── project/                # 项目总览、状态、队列及决策
├── .github/workflows/pages.yml # main 分支验证与 GitHub Pages 部署
├── package.json                # npm 命令入口
├── CONTRIBUTING.md
├── README.md
└── LICENSE
```

## 依赖和职责

- `core/lab-manifest.js`：训练场 ID、页面、算法、交互脚本、导航和 smoke 参数的集中清单。部分专项 QA 仍有自己的覆盖列表，新增训练场时要检查。
- `core/bootstrap.js`：按照清单加载模型、共享运行时和训练场脚本，并处理资源版本参数。
- `core/lab-runtime.js`：共享控制器、历史、自动训练、日志、Canvas、主题和通用界面行为。
- `core/i18n.js`、`core/translations.js`：语言处理与翻译文本。
- `models/model-core.js`：共享数学工具；`models/<id>-model.js`：算法计算。算法层不引用页面层。
- `labs/<id>.js`：组合模型与共享运行时，定义关卡、计算预算、反馈和观察视图。
- `<id>.html`：语义内容、控件和脚本入口；`styles.css`：共享样式。

## 改动应该放在哪里

| 需求 | 首先查看 |
| --- | --- |
| 新训练场 | manifest、models、labs、根 HTML、相关测试覆盖列表 |
| 现有关卡、目标或预算 | 对应 labs 文件、manifest 的已知解、gameplay 测试 |
| 算法正确性 | 对应 models 文件、smoke 测试 |
| 全站交互 | lab-runtime 与 contracts 测试 |
| 语言文案 | HTML / labs、translations 与 i18n 检查 |
| 字体、配色或排版 | styles.css、assets、design 规范 |
| 开发工具 | scripts；测试不要再堆进该目录 |

## 路径与发布约束

保留根 HTML、`core/`、`labs/`、`models/`、`assets/` 和 `styles.css` 的路径。它们共同组成现有站点及外部链接的契约。本轮不引入构建系统或 `src/` → `dist/` 转换。

GitHub Pages 当前上传仓库根目录。文档、测试等受版本管理的文件也会进入发布包；这里只记录现状，不把本轮结构整理扩大为部署改造。不要把本地绝对路径、凭据或私有资料写入仓库文档。

本地 `.superpowers/` 是工具工作目录，不是产品源码。本轮检查时该目录及 `test-results/` 没有文件，未删除目录，也不把它们计入功能模块。
