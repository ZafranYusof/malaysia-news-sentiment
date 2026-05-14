<div align="center">

# Malaysia News Sentiment Analysis

**Real-Time Sentiment Analysis for Malaysian News using API Integration**

A final year project dashboard that aggregates Malaysian news articles, classifies sentiment using large language models, and visualizes public discourse across topics, entities, and sources.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)

[Live Demo](https://malaysia-news-sentiment.vercel.app) · [API](https://mynewsa-api.onrender.com) · [Report Issue](https://github.com/Vexccz/malaysia-news-sentiment/issues)

</div>

---

## Overview

Malaysian public discourse moves fast across dozens of news outlets and multiple languages. This project builds an end-to-end sentiment intelligence platform that retrieves articles, classifies them through an LLM pipeline, extracts named entities, and surfaces trends through an interactive dashboard.

The goal is to give researchers, journalists, and analysts a single view of how topics and entities are framed across the Malaysian news landscape.

## Core Features

- Sentiment classification (positive, negative, neutral) with confidence scores
- Named entity extraction and relationship graph view
- Source credibility scoring across 20+ Malaysian outlets
- State-level sentiment heatmap covering all 16 states
- Trending topics and forecasting via LLM-based AI insights
- Entity comparison, source comparison, and topic comparison
- PDF, PowerPoint, and CSV export
- Guest mode, email and password auth, admin dashboard
- Progressive Web App with responsive mobile layout
- Rate limiting, CORS for Capacitor, full error handling

## Tech Stack

| Layer        | Technologies                                                        |
| ------------ | ------------------------------------------------------------------- |
| Frontend     | React 19, Vite, TailwindCSS, Recharts, Framer Motion                |
| Backend      | Node.js, Express 5, MongoDB Atlas, JWT                              |
| AI Pipeline  | Ollama (gpt-oss:120b) with NLP fallback                             |
| Mobile       | Capacitor 6 (Android APK)                                           |
| Deployment   | Vercel (frontend), Render (backend)                                 |
| Testing      | Playwright (40 end-to-end tests)                                    |

## Dashboard Modules

- Overview KPIs and recent sentiment breakdown
- Search with recent history and suggested topics
- Trending topics and live feed via server-sent events
- Entity graph (card and graph dual view)
- Source credibility and bias indicators
- State heatmap with per-state summary table
- Admin panel with API metrics, user management, and system health
- AI insights, forecasting, and report generation

## Project Structure

`	ext
malaysia-news-sentiment/
+-- frontend/               React SPA (Vite + Tailwind)
|   +-- src/
|   |   +-- pages/          Dashboard, Search, Trending, Entities, Admin
|   |   +-- components/     Charts, Cards, Heatmap, Entity graph
|   |   +-- services/       API client, auth helpers
|   |   +-- context/        React context providers (Auth, Theme)
|   |   +-- hooks/          Custom React hooks
|   |   +-- utils/          Helper functions
|   |   +-- scss/           SCSS stylesheets
|   |   +-- styles/         Additional style modules
|   |   +-- config/         App configuration
|   |   +-- assets/         Static assets (images, icons)
|   |   +-- bones/          Layout and skeleton components
|   +-- public/             Static files (manifest, icons)
|   +-- dist/               Production build output
+-- backend/                Express REST API
|   +-- controllers/        Auth, News, Entities, Admin, Sources, Alerts
|   +-- services/           LLM pipeline, scraper, entity extractor
|   +-- middleware/         Auth (JWT, role-based access)
|   +-- models/             Mongoose schemas (Article, User, Entity, Source)
|   +-- routes/             API route definitions (14 route files)
|   +-- config/             Database and app configuration
|   +-- scripts/            Dev utilities and migration scripts
|   +-- __tests__/          Unit tests
+-- nlp-service/            Python NLP service (fallback classifier)
+-- e2e/                    Playwright end-to-end tests (40 tests)
+-- docs/                   API documentation (70+ endpoints, 14 categories)
`

## Getting Started

### Prerequisites

- Node.js 18 or newer
- MongoDB (local or Atlas)
- Ollama with access to `gpt-oss:120b` (or compatible endpoint)

### Backend

```bash
cd backend
npm install
cp .env.example .env      # set MONGODB_URI, JWT_SECRET, OPENAI_API_KEY, OPENAI_BASE_URL, QWEN_MODEL
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` to view the dashboard.


## Architecture Highlights

- LLM requests route through Ollama (`OPENAI_BASE_URL=https://ollama.com/api`) with an NLP fallback for reliability
- Articles deduplicated in MongoDB to minimize re-analysis cost
- Rate limits: 100 requests per 15 minutes (general), 10 per 15 minutes (auth), 30 per minute (analysis)
- Code-splitting across 20 lazy-loaded pages and React.memo on heavy components
- Main bundle reduced from 446KB to 207KB after performance pass

## Roadmap

- Real-time ingestion pipeline for live feed
- Multi-language expansion (Chinese, Tamil)
- Custom fine-tuning on Malaysian corpus
- Academic report export with citation formatting

## License

Distributed under the MIT License. See `LICENSE` for details.
