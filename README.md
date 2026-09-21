# AI Training Arcade 👾

**AI Training Arcade** 是一个开源的交互式人工智能学习街机厅。

它不是一个算法展示页面，而是一系列可玩的训练场：玩家通过调整参数、观察模型行为、管理计算预算，在关卡中理解人工智能算法为什么成功、为什么失败。

项目目前从经典机器学习开始，未来将扩展到深度学习、强化学习和更多 AI 方法。

> Learn AI by playing with it.

## 🎮 当前训练场

### Classical Machine Learning

- **GBM 梯度提升机**
  - 观察弱学习器如何逐轮修正残差
  - 理解学习率、模型复杂度和过拟合

- **SVM 最大间隔**
  - 调整决策边界与间隔
  - 理解支持向量和核方法

- **K-Means 聚类**
  - 移动质心，观察聚类迭代
  - 理解无监督学习过程

- **决策树**
  - 选择切分规则
  - 理解决策边界如何生成

- **线性回归**
  - 使用梯度下降拟合数据
  - 观察损失如何下降

- **逻辑回归**
  - 探索概率边界和分类
  - 理解 sigmoid 与交叉熵

- **神经网络**
  - 观察隐藏层、权重和非线性边界
  - 理解反向传播的基本思想

- **随机森林**
  - 比较多棵树的投票结果
  - 理解集成学习如何降低噪声影响

## 🚀 Roadmap

### Deep Learning

计划加入：

- CNN 像素识别训练场
- 优化器实验室（SGD / Momentum / Adam）
- Dropout 与泛化挑战
- 自编码器压缩实验
- Attention / Transformer 可视化训练场

### Reinforcement Learning

计划加入：

- Multi-Armed Bandit
- Grid World
- Q-Learning
- Policy Gradient
- 多智能体实验

### More AI

未来探索：

- 生成模型
- 表示学习
- 进化算法
- AI Agent 系统

## ✨ 设计理念

AI Training Arcade 遵循几个原则：

- **可玩，而不是只可看**
  - 每个训练场都应该有目标、限制和反馈。

- **理解，而不是背公式**
  - 动画和交互用于解释算法行为。

- **公平的挑战**
  - 关卡必须存在可行解，同时避免“万能参数”。

- **透明的 AI**
  - 展示模型如何学习、犯错和改变。

## 🛠️ 本地运行

项目无需构建，直接启动静态服务器：

```bash
python -m http.server 4173
```

打开：

```
http://127.0.0.1:4173
```

也可以部署到 GitHub Pages。

## 🧪 开发测试

```bash
npm test
```

包括：

- 算法 smoke test
- 关卡可达性检查
- UI 结构检查
- 中英文覆盖检查
- 性能基准

## 📁 项目结构

```
.
├── index.html              # Arcade 大厅
├── core/                   # 公共运行时
├── models/                 # 纯算法实现
├── labs/                   # 交互训练场
├── scripts/                # 测试与工具
└── styles.css              # UI 系统
```

## 🤝 开源协议

本项目采用 **GNU General Public License v3.0 (GPL-3.0)** 发布。

你可以自由使用、修改和分发本项目，但修改后的版本也必须以 GPL-3.0 或兼容协议公开源代码。

## 📜 License

GPL-3.0 © 2026 GHOST-AKU
