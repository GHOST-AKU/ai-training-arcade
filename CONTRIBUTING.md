# Contributing to AI Training Arcade

感谢参与 AI Training Arcade。

## 新增训练场

一个新的训练场应该包含：

- 明确的 AI 概念
- 可操作的参数
- 清晰的目标
- 可验证的通关条件
- 可解释的失败原因

推荐结构：

```text
models/<id>-model.js   # 纯算法逻辑
labs/<id>.js           # 交互与可视化
<id>.html              # 稳定入口
```

同时必须在：

```text
core/lab-manifest.js
```

注册新训练场。该清单用于生成导航、加载顺序和测试覆盖。

## 设计要求

- 不制作单纯的参数滑块演示。
- 玩家应该能够通过理解算法达到目标。
- 每个关卡必须经过可达性验证。
- 优先展示模型行为，而不是堆叠公式。

## 提交代码

请确保：

```bash
npm test
```

通过后再提交 Pull Request。

额外性能测试：

```bash
npm run benchmark
```

## License

提交代码即表示你同意贡献内容以 AGPL-3.0-or-later 协议发布。