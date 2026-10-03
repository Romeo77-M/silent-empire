# Silent Empire Financial Summarizer

Silent Empire is an education-first React + TypeScript application that turns public-company SEC filings into beginner-friendly financial summaries. It also includes an educational candlestick-pattern view.

## Architecture

- Vite + React + TypeScript frontend
- Vercel serverless functions under `/api`
- SEC EDGAR for public filing data
- Gemini for Titan financial-report summarization
- Twelve Data for daily chart data

API credentials are server-side only. Do not expose them with `VITE_` environment variables.

## Environment variables

Configure these in the server/Vercel environment:

- `GEMINI_API_KEY` — required for Titan summaries
- `TWELVE_DATA_API_KEY` — required for Chart Intelligence
- `SEC_USER_AGENT` — recommended; use a real application name and contact email that you control

Never commit secret values.

## Local development

Install dependencies with `npm install`.

The frontend can be run with `npm run dev`, but the application also depends on Vercel-style `/api` functions. For full-stack local testing, use a local environment that serves those functions (for example Vercel's development workflow) and configure the required environment variables locally.

Build the frontend with `npm run build`.

## Product boundaries

Silent Empire is educational software, not financial advice. Titan should explain what a filing reports, distinguish reported facts from interpretation, surface uncertainty, and avoid buy/sell/hold instructions, price targets, or opaque investment scores.

Chart patterns are educational observations, not predictions. Pattern explanations should describe what was detected and what traders commonly watch for confirmation.

## Data flow

Ticker → SEC ticker/CIK lookup → latest 10-K or 10-Q → filing text → selected filing evidence → Titan summary → Analyst / Simple / Human explanations.

Chart Intelligence uses a provider-independent server-side `/api/market-data` endpoint. The current development provider is Twelve Data, so the frontend is not coupled directly to a market-data vendor.

## Development

Production changes should be reviewed on an isolated branch before merging to `main`.
