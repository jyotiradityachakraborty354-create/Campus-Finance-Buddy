# Campus Finance Buddy

> **Your Money. Your Decisions. Your Future.**

Campus Finance Buddy is a college student expense tracker, quantitative spending analytics suite, contextual Gemini AI financial assistant, and deterministic budget planner. It follows a strict monochromatic design language ("clinical blueprint on frosted paper") inspired by shadcn/ui, Vercel, and Linear.

---

## Core Features

1. **Overview Dashboard**: Live telemetry for Monthly Allowance (`₹8,000`), Total Expenses (`₹6,800`), Remaining Balance (`₹1,200`), Allowance Utilisation (`85%`), Highest-Spending Category (`Food · ₹2,400`), Category-Wise Expenditure, Monthly Spending Overview chart, and Recent Transactions.
2. **Expense Tracker**: Full CRUD operations across the 6 mandatory student categories (`Food`, `Travel`, `Education`, `Shopping`, `Entertainment`, `Other`) with real-time search, category filtering, date range filtering, sorting, and strict input validation.
3. **Spending Analytics**: Interactive Recharts visualizations including a category breakdown Donut Chart, Actual vs Target Budget bar chart, Daily Expenditure bar chart, and Monthly Cumulative Spending Trend area chart.
4. **Gemini AI Finance Assistant**: Context-aware conversational assistant powered by Google Gemini Flash via a server-side endpoint (`POST /api/ai/chat`) with automatic deterministic rule-based fallback when offline or unconfigured.
5. **Intelligent AI Budget Planner & Mandatory `₹500` Savings Test**: Combines a TypeScript deterministic budget optimization engine (`src/services/financeEngine.ts`) with Gemini-generated trade-off explanations. Includes a prominent **RUN ₹500 SAVINGS TEST** button that verifies all 6 mandatory hackathon constraints (`Education` locked at `₹1,200`, revised total `₹6,300`, remaining balance `₹1,700`, additional savings `₹500`).
6. **Savings Goals Manager**: Create, edit, delete, and increment student savings milestones with live completion percentages.
7. **Settings & Portability**: Edit monthly allowance, reset to the official `₹8,000` hackathon dataset, and inspect local storage persistence and AI backend status.

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and add your server-side Gemini API key:

```bash
GEMINI_API_KEY="your_gemini_api_key_here"
```

*Note: `GEMINI_API_KEY` is read exclusively by the server (`server.ts`) and is never exposed in client-side bundles. If omitted, the application automatically runs in deterministic fallback mode.*

### 3. Run Locally

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

### 4. Run Unit Tests

```bash
npx --yes tsx --test src/services/financeEngine.test.ts
```

### 5. Build for Production

```bash
npm run build
npm start
```

---

## Deploying to Cloudflare Workers / Portable Serverless Environments

- **Frontend (`dist/`)**: Run `npm run build` to produce a static Vite SPA bundle in `dist/`, deployable to Cloudflare Pages, Vercel, or Netlify.
- **Server-Side AI Endpoint (`/api/ai/*`)**: The Express routes in `server.ts` (`/api/ai/status`, `/api/ai/chat`, `/api/ai/budget-rationale`) are stateless JSON handlers that can be deployed directly as a Cloudflare Worker or Pages Function with `GEMINI_API_KEY` bound as an encrypted Worker secret (`wrangler secret put GEMINI_API_KEY`).
