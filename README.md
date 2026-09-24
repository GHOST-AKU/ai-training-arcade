# AI Training Arcade 👾

**Learn AI by playing with it.**

🎮 **[Play AI Training Arcade](https://ghost-aku.github.io/ai-training-arcade/)**

**English** | [简体中文](README.zh-CN.md)

**AI Training Arcade** is an open-source collection of playable AI training grounds.

Instead of simply watching an algorithm animation, you step into the training loop: adjust parameters, make decisions, observe model behavior, manage computation, fail a challenge, change your strategy, and try again.

The goal is simple:

> **Turn AI learning into something you can play.**

---

## 🕹️ What is an AI Training Arcade?

Many interactive AI demos let you move a slider and watch a graph change.

AI Training Arcade tries to go one step further.

Each training ground is designed around a playable loop:

**Challenge → Experiment → Feedback → Success / Failure → Retry**

The player is not just observing the algorithm from the outside.

**The player is part of the training loop.**

---

## 🎮 Training Grounds

### Classical Machine Learning

| Training Ground | What you play with |
| --- | --- |
| 🌲 **Gradient Boosting** | Build weak learners step by step and watch residuals change |
| 📏 **Support Vector Machine** | Explore margins, support vectors, and decision boundaries |
| 🟣 **K-Means** | Watch centroids move as clustering iterates |
| 🌳 **Decision Tree** | Explore how recursive splits partition feature space |
| 📈 **Linear Regression** | Follow gradient descent as the model searches for a better fit |
| 🎯 **Logistic Regression** | Explore probabilistic classification boundaries |
| 🧠 **Neural Network** | Experiment with hidden layers, weights, and backpropagation |
| 🌲🌲🌲 **Random Forest** | Explore ensemble learning, randomness, and voting |

More machines are under construction.

🚧 **Deep Learning — under construction**

🚧 **Reinforcement Learning — under construction**

---

## 🚧 What's Next?

AI Training Arcade currently focuses on classical machine learning, but the arcade is expanding.

### Deep Learning

Planned training grounds include:

- 🖼️ CNN Pixel Recognition
- ⚙️ Optimizer Lab
- 🎲 Dropout & Generalization Challenge
- 🪞 Autoencoder Lab
- 👁️ Attention Playground
- 🤖 Transformer Training Ground

### Reinforcement Learning

Planned training grounds include:

- 🎰 Multi-Armed Bandit
- 🗺️ Grid World
- 🧭 Q-Learning
- 📊 Policy Gradient
- 🤝 Multi-Agent Experiments

The long-term goal is not to collect every AI algorithm ever invented. It is to find the ones that can become good games for understanding how intelligent systems learn and behave.

---

## 🧩 Project Structure

AI Training Arcade is evolving from individual experiments into a shared arcade platform.

```text
ai-training-arcade/
├── assets/          # Shared visual assets
├── core/            # Shared arcade systems
├── docs/            # Project documentation
├── labs/            # Training-ground implementations
├── models/          # Model and algorithm logic
├── scripts/         # Development and testing tools
│
├── index.html       # Arcade entrance
├── styles.css       # Shared styles
│
├── README.md
├── README.zh-CN.md
├── CONTRIBUTING.md
├── VISUAL_LANGUAGE.md
└── LICENSE
```

Some legacy standalone training-ground files remain while the project architecture continues to evolve.

---

## 🛠️ Run Locally

Clone the repository and start a local HTTP server:

开发者先阅读 [文档导航](docs/README.md)、[项目结构](docs/ARCHITECTURE.md)和[开发与验证](docs/DEVELOPMENT.md)。当前工作状态见 [项目快照](docs/project/STATE_SNAPSHOT.md)。

项目无需构建或安装依赖。也可以使用 `npm run serve` 启动本地服务器。

```bash
python -m http.server 4173 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:4173
```

---

## 🧪 Testing

Run the main test suite:

```bash
npm test
```

Current checks include:

- algorithm smoke tests
- challenge reachability
- UI structure
- Chinese / English coverage

Run performance benchmarks with:

```bash
npm run benchmark
```

---

## 🎨 Visual Language

AI Training Arcade has a shared visual language for keeping its training grounds coherent.

See [`docs/design/VISUAL_LANGUAGE.md`](docs/design/VISUAL_LANGUAGE.md) for the project's visual guidelines.

Developers can start with the [documentation index](docs/README.md), [architecture guide](docs/ARCHITECTURE.md), and [development guide](docs/DEVELOPMENT.md). Current project status is recorded in the [project snapshot](docs/project/STATE_SNAPSHOT.md).

---

## 🤝 Contributing

AI Training Arcade is open source, and contributions do not have to introduce a new algorithm.

Useful contributions can include:

- designing a better challenge
- improving an existing model simulation
- finding an unwinnable level
- improving accessibility
- refining the arcade UI
- adding tests
- improving documentation
- turning an existing visualization into an actual game

Before adding a new training ground, ask one question:

> **What does the player actually do?**

If the answer is only “watch the visualization,” it probably isn't an arcade machine yet.

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for more information.

---

## 📜 License

AI Training Arcade is released under the **GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later)**.

You are free to use, study, modify, and redistribute the project under the GNU AGPL, either version 3 of the License or, at your option, any later version.

See [`LICENSE`](LICENSE) for the full license text.

---

<p align="center">

### 👾 INSERT COIN

**Choose a model. Break it. Understand it. Train again.**

[Enter the Arcade →](https://ghost-aku.github.io/ai-training-arcade/)

</p>
