# AI Training Arcade 👾

**玩着玩着，就把 AI 学会了。**

🎮 **[立即进入 AI Training Arcade](https://ghost-aku.github.io/ai-training-arcade/)**

[English](README.md) | **简体中文**

**AI Training Arcade** 是一个开源的、真正可以玩的 AI 学习街机厅。

这里不是一排只能观看的算法动画。你会直接进入模型的训练过程：调整参数、作出选择、观察模型行为、管理计算资源；你可能完成挑战，也可能把模型训练得一团糟，然后改变策略，再来一局。

我们的目标很简单：

> **把理解 AI 变成一件可以玩的事。**

---

## 🕹️ 什么是「AI 训练街机厅」？

很多交互式 AI 演示的玩法是：拖动一个滑块，然后看图表发生变化。

AI Training Arcade 想再往前走一步。

我们希望每个训练场都围绕一个可以玩的循环展开：

**挑战 → 尝试 → 反馈 → 成功 / 失败 → 再来一局**

在这里，玩家不只是站在外面观察算法。

**玩家本身就是训练循环的一部分。**

---

## 🎮 当前训练场

### 经典机器学习

| 训练场 | 你会玩到什么？ |
| --- | --- |
| 🌲 **梯度提升机 GBM** | 逐轮构建弱学习器，观察残差如何变化 |
| 📏 **支持向量机 SVM** | 探索间隔、支持向量与决策边界 |
| 🟣 **K-Means 聚类** | 观察质心如何在迭代中移动并逐渐收敛 |
| 🌳 **决策树** | 探索递归切分如何划分特征空间 |
| 📈 **线性回归** | 观察梯度下降如何寻找更好的拟合结果 |
| 🎯 **逻辑回归** | 探索概率分类与决策边界 |
| 🧠 **神经网络** | 实验隐藏层、权重与反向传播 |
| 🌲🌲🌲 **随机森林** | 理解集成学习、随机性与投票机制 |

更多街机正在搬进来。

🚧 **深度学习区——施工中**

🚧 **强化学习区——施工中**

---

## 🚧 接下来呢？

目前 AI Training Arcade 主要从经典机器学习开始，但街机厅还在继续扩建。

### 深度学习

计划中的训练场包括：

- 🖼️ CNN 像素识别
- ⚙️ 优化器实验室
- 🎲 Dropout 与泛化挑战
- 🪞 自编码器实验
- 👁️ Attention 注意力实验
- 🤖 Transformer 训练场

### 强化学习

计划中的训练场包括：

- 🎰 Multi-Armed Bandit 多臂老虎机
- 🗺️ Grid World 网格世界
- 🧭 Q-Learning
- 📊 Policy Gradient 策略梯度
- 🤝 多智能体实验

长期目标并不是把世界上所有 AI 算法都塞进来，而是寻找那些真正适合被做成游戏、能够帮助玩家理解智能系统如何学习与行动的东西。

---

## 🧩 项目结构

AI Training Arcade 正在从一系列独立实验，逐渐发展成拥有共享基础设施的街机平台。

```text
ai-training-arcade/
├── assets/          # 公共视觉资源
├── core/            # 街机厅共享系统
├── docs/            # 项目文档
├── labs/            # 各个训练场
├── models/          # 模型与算法逻辑
├── scripts/         # 开发、测试与辅助脚本
│
├── index.html       # 街机厅入口
├── styles.css       # 公共样式
│
├── README.md
├── README.zh-CN.md
├── CONTRIBUTING.md
├── VISUAL_LANGUAGE.md
└── LICENSE
```

随着架构继续迁移，目前仓库中仍保留了一部分早期的独立训练场文件。

---

## 🛠️ 本地运行

克隆仓库后，在项目目录启动本地 HTTP 服务器：

```bash
python -m http.server 4173 --bind 127.0.0.1
```

然后打开：

```text
http://127.0.0.1:4173
```

即可进入街机厅。

---

## 🧪 测试

运行主要测试：

```bash
npm test
```

目前包括：

- 算法 Smoke Test
- 关卡可达性检查
- UI 结构检查
- 中英文覆盖检查

运行额外的性能测试：

```bash
npm run benchmark
```

---

## 🎨 视觉语言

AI Training Arcade 使用统一的视觉语言，让不同训练场保持整体一致。

具体规范请参阅 [`VISUAL_LANGUAGE.md`](VISUAL_LANGUAGE.md)。

---

## 🤝 参与项目

AI Training Arcade 是一个开源项目，贡献并不意味着一定要加入一种新算法。

你可以：

- 设计一个更有意思的挑战
- 改进现有模型模拟
- 找出一个实际上无法通关的关卡
- 改进无障碍体验
- 优化街机厅界面
- 添加测试
- 完善文档
- 把一个「只能看」的可视化真正变成游戏

如果你想增加一个新的训练场，请先问自己一个问题：

> **玩家到底在玩什么？**

如果答案只是「看这个动画」，那它大概还不能算是一台真正的街机。

更多信息请参阅 [`CONTRIBUTING.md`](CONTRIBUTING.md)。

---

## 📜 开源协议

AI Training Arcade 使用 **GNU Affero General Public License v3.0 or later（AGPL-3.0-or-later）** 开源。

你可以按照 GNU AGPL 第 3 版，或（由你选择）自由软件基金会此后发布的任何更新版本，使用、研究、修改和重新分发本项目。

完整协议请参阅 [`LICENSE`](LICENSE)。

---

<p align="center">

### 👾 INSERT COIN

**选择一个模型。把它玩坏。理解它。再训练一次。**

[进入 AI Training Arcade →](https://ghost-aku.github.io/ai-training-arcade/)

</p>
