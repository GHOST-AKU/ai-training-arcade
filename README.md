# AI Training Arcade 👾

> 🎮 **[立即在线游玩 AI Training Arcade](https://ghost-aku.github.io/ai-training-arcade/)**

**AI Training Arcade** 是一个开源的交互式人工智能学习街机厅。

它不是一个算法展示页面，而是一系列可玩的训练场：玩家通过调整参数、观察模型行为、管理计算预算，在关卡中理解人工智能算法为什么成功、为什么失败。

项目目前从经典机器学习开始，未来将扩展到深度学习、强化学习和更多 AI 方法。

> Learn AI by playing with it.

## 当前训练场

### Classical Machine Learning

- **GBM 梯度提升机**：观察弱学习器如何逐轮修正残差。
- **SVM 最大间隔**：理解支持向量、间隔和决策边界。
- **K-Means 聚类**：观察质心移动和聚类迭代。
- **决策树**：探索切分规则如何形成边界。
- **线性回归**：观察梯度下降和损失优化。
- **逻辑回归**：理解概率边界和分类。
- **神经网络**：观察隐藏层、权重和反向传播。
- **随机森林**：理解集成学习和投票机制。

## Roadmap

### Deep Learning

计划加入：

- CNN 像素识别训练场
- 优化器实验室
- Dropout 与泛化挑战
- 自编码器实验
- Attention / Transformer 可视化

### Reinforcement Learning

计划加入：

- Multi-Armed Bandit
- Grid World
- Q-Learning
- Policy Gradient
- 多智能体实验

## 设计理念

- 可玩，而不是只可看
- 理解，而不是背公式
- 每个挑战必须存在可行解
- 展示模型如何学习、犯错和改变

## 本地运行

```bash
python -m http.server 4173 --bind 127.0.0.1
```

打开：

```text
http://127.0.0.1:4173
```

## 测试

```bash
npm test
```

包括：

- 算法 smoke test
- 关卡可达性检查
- UI 结构检查
- 中英文覆盖检查

额外性能测试：

```bash
npm run benchmark
```

## 开源协议

本项目采用 **GNU General Public License v3.0 (GPL-3.0)** 发布。

修改后的分发版本必须继续遵循 GPL-3.0。

GPL-3.0 © 2026 GHOST-AKU
