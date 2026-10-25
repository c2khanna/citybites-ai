# 🍽️ CityBites AI — Intelligent Culinary Concierge

> An AI-powered dining concierge and semantic recommendation engine built on real-world saved culinary reels across Toronto, Waterloo Region, and beyond.

[![Deploy to GitHub Pages](https://github.com/c2khanna/citybites-ai/actions/workflows/deploy.yml/badge.svg)](https://github.com/c2khanna/citybites-ai/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/Demo-Live%20on%20GitHub%20Pages-orange?style=flat&logo=github)](https://c2khanna.github.io/citybites-ai/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## 🌟 Overview

**CityBites AI** transforms bookmark overload into an actionable, delightful culinary discovery engine. Instead of endless Instagram doomscrolling to find saved food spots, CityBites indexes restaurant metadata, ambiance vibes, signature dishes, and neighborhoods—letting users query their personal dining catalog in natural English.

---

## 🚀 Key Features

* **🤖 Multi-Engine AI Concierge (Hybrid Architecture):**
  * **⚡ Instant Local Semantic Engine (Default):** Zero-latency, 100% offline keyword and multi-factor vector scoring. No API keys required.
  * **🔮 Google Gemini 2.5 Flash:** Direct API integration using Gemini's Generative Language REST endpoint with JSON Schema constraints for conversational reasoning.
  * **✨ OpenAI & Custom Endpoints:** Native support for GPT-4o-mini and OpenAI-compatible providers (Groq, OpenRouter, Ollama) via user-configured API keys securely stored in browser `localStorage`.
* **🧠 Structured Reasoning & Function Calling Schema:**
  * Outputs structured step-by-step thinking processes (`thought`), primary/secondary spot selections, and signature ordering advice based on original creator notes.
* **🎯 Multi-Factor Scoring Matrix:** Evaluates user queries across location proximity (Toronto, Waterloo, Cambridge, Kitchener, Mississauga), occasion vibes (Date Night, Brunch, Michelin, Street Food), price points, and dish keywords.
* **🎲 "Surprise Me Tonight!" Engine:** Resolves dining decision fatigue with a single-click randomized recommendation tailored to current active filters.
* **📍 One-Click Navigation & Verification:** Every spot includes direct deep-links to the original creator's **Instagram Reel** (for video proof of food quality) and **Google Maps** (for instant directions, hours, and reservations).
* **⚡ Zero-Dependency Single-Page Architecture:** Built with semantic HTML5, modern Tailwind CSS, and vanilla ES6+ for instant load times and compatibility with GitHub Pages, Vercel, and Netlify.

---

## 🏗️ Project Architecture

```
citybites-ai/
├── .github/
│   └── workflows/
│       └── deploy.yml      # Automated GitHub Actions workflow for Pages deployment
├── data/
│   └── restaurants.json    # Structured metadata (coordinates, tags, vibes, tips, creator attribution)
├── .gitignore              # Standard git ignore rules
├── .nojekyll               # Disables Jekyll processing for GitHub Pages
├── index.html              # Core single-page application & AI Concierge interface
├── package.json            # Node configuration (runnable with npx serve .)
└── README.md               # Documentation, architecture, and portfolio specs
```

---

## 🛠️ How to Run Locally

You can run CityBites AI in seconds without any build tools or package installations:

```bash
# Clone the repository
git clone https://github.com/<your-username>/citybites-ai.git
cd citybites-ai

# Open directly in your browser
start index.html

# Or run with any local static server
npx serve .
```

---

## 🌐 Deploy to GitHub Pages (Automated CI/CD)

1. Push this repository to GitHub.
2. In your GitHub repository, go to **Settings** $\rightarrow$ **Pages**.
3. Under **Build and deployment $\rightarrow$ Source**, select **GitHub Actions**.
4. The included `.github/workflows/deploy.yml` workflow will automatically build and publish your site at:
   ```
   https://<your-username>.github.io/citybites-ai/
   ```

---

## 💼 Resume & Interview Showcase

Here is how you can highlight this project on your software engineering resume and in technical interviews:

### Resume Bullet Points:
* **Engineered a full-stack culinary concierge web app (CityBites AI)** to semantically index and search 25+ curated dining venues across Toronto and Waterloo Region with sub-50ms render performance.
* **Architected a hybrid AI recommendation pipeline** integrating Google Gemini Flash and OpenAI structured JSON outputs with an offline semantic scoring fallback for zero-downtime reliability.
* **Implemented in-browser natural language query matching** evaluating multi-factor relevance scores across geographic bounds, ambiance vectors, and dietary specifications.
* **Configured automated CI/CD deployment pipelines** via GitHub Actions delivering production deployments to GitHub Pages on every release.

### Technical Interview Discussion Angles:
1. **Context Engineering & Data Extraction:** How you transformed raw, unstructured Instagram JSON exports into clean relational schemas (`restaurants.json`).
2. **Hybrid Fallback Strategies:** Designing client-side LLM integrations that degrade gracefully to deterministic heuristic algorithms when API keys are absent or rate-limited.
3. **Relevance Algorithms:** Balancing hard geographic constraints (e.g. Waterloo Region vs. Toronto Core) against fuzzy emotional intents (e.g. "romantic anniversary" vs. "late night cheap eats").
4. **Data Privacy in Frontend AI:** Storing API tokens strictly in client-side `localStorage` without exposing credentials to intermediary backend proxies.

---

## 📜 License

MIT License © 2026 Chaitanya Khanna
