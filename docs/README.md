# 开发文档导航

首次接手按以下顺序阅读：

1. [项目总览](project/PROJECT.md)：目标、已实现范围与本轮整理。
2. [当前状态](project/STATE_SNAPSHOT.md)：基线、工作分支与验证边界。
3. [项目结构](ARCHITECTURE.md)：文件职责和依赖方向。
4. [开发与验证](DEVELOPMENT.md)：运行、测试与报告生成。
5. [任务队列](project/TASK_QUEUE.md)与[结构决策](project/DECISIONS.md)。

## 按用途查找

| 用途 | 位置 | 性质 |
| --- | --- | --- |
| 产品介绍和方向 | [根 README](../README.md) | 产品入口；路线图不是已实现能力 |
| 贡献要求 | [CONTRIBUTING](../CONTRIBUTING.md) | 开发规则 |
| 视觉语义 | [VISUAL_LANGUAGE](design/VISUAL_LANGUAGE.md) | 当前设计规范 |
| 玩法与界面修复 | [修复记录](history/repair-notes.md) | 历史实现和验证记录 |
| 早期神经网络视觉验收 | [设计 QA](history/design-qa.md) | 历史证据，部分行为已被替代 |
| 参数采样 | [可玩性报告](reports/playability-report.json) | 可再生成的机器报告，不是真人试玩结论 |

新的规范放在 `design/`，历史记录放在 `history/`，需要版本管理的机器报告放在 `reports/`。截图、临时日志等本地产物放在根目录 `output/` 或 `test-results/`，不提交到 Git。
