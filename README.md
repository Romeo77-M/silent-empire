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


## Product and UX direction

Silent Empire should evolve from an AI report generator into a persistent financial-understanding workspace. Keep the current Tactical Calm visual system; prioritize interaction design and comprehension over decorative polish.

Core experience loop:

Search → Understand → Explore → Compare → Return when something changes.

Company pages should become the center of the experience. A future company workspace can organize information as Overview, What Changed, Financials, Risks, and Chart rather than exposing implementation-oriented screens as the primary mental model.

Retention should come from useful continuity and curiosity, not pressure mechanics. High-value directions include:
- **What Changed?** Compare the latest filing with the previous comparable filing and explain material changes in plain language.
- Recent analyses and easy continuation from prior companies.
- Comparison flows that connect naturally from a company summary.
- Persistent Analyst / Simple / Human explanation preference.
- Optional alerts when a followed company files a new 10-K or 10-Q.
- Progressive financial learning that remembers concepts a user has explored.

Avoid building real-time trading infrastructure or portfolio tracking into the MVP. Silent Empire's differentiation is the understanding layer around filings, financial concepts, company changes, risks, comparisons, and educational chart context.

## Commercial design constraints

Build for usefulness first while preserving a path to modest sustainable revenue:
- keep market-data providers abstracted behind server APIs;
- cache reusable filing analyses and daily market data aggressively;
- avoid unnecessary repeated AI generations;
- design premium value around history, comparisons, monitoring, deeper explanations, and What Changed rather than expensive real-time quotes;
- add cost/usage telemetry and abuse controls before public beta;
- do not rely on a market-data plan for commercial use unless its display and redistribution rights explicitly support the product.

A small private beta should precede monetization. The primary validation question is whether non-expert users understand a company materially faster and more confidently after using Silent Empire.


## Beta readiness checklist

Before a public or paid launch:
- replace the in-memory Titan rate limiter with a durable/shared limiter appropriate to the deployment platform;
- add server-side reusable Titan caching keyed by exact SEC filing identity;
- verify automated tests run in CI, not only that Vercel builds successfully;
- validate source provenance and material figures against representative 10-K and 10-Q filings;
- test keyboard, mobile, reduced-motion, loading, error, and no-data states;
- confirm market-data commercial display/redistribution rights for the intended launch;
- add privacy-conscious usage/cost telemetry before broad access.

The current in-memory Titan limiter is intentionally a lightweight MVP abuse guard. Serverless instances do not share its state, so it must not be treated as production-grade global rate limiting.


## Pause-point handoff

Safe pause point: MVP hardening remains isolated on `codex/silent-empire-mvp-hardening` in draft PR #1. Do not merge to `main` without explicit owner approval.

Resume in this order: confirm CI and deployment are green; validate representative 10-K and 10-Q summaries against source filings; design durable shared Titan caching keyed by SEC accession; replace the in-memory limiter before broad public access; complete mobile/accessibility/error-state QA; then begin `What Changed` using latest versus prior comparable filings.

Secrets, paid-provider decisions, commercial data licensing, and any merge to `main` remain human approval boundaries.


## Knowledge Center and learning architecture

The Knowledge Center should become Silent Empire's connected education layer, not a disconnected blog. Build the architecture before producing a large content library.

Learning progression: concepts and glossary → financial-report literacy → chart/candle recognition → pattern context and setup evaluation → decision scenarios. Articles and carefully curated external videos can deepen individual topics, while contextual links from summaries and Chart Intelligence should bring learners directly to the concept they need.

Advanced decision scenarios should evaluate decision quality from the information available at that moment rather than reward hindsight or whichever choice later made money. Scenario feedback should emphasize evidence, confirmation, uncertainty, invalidation, and risk awareness. The scenario system can grow over time; do not block the trustworthy MVP on a large scenario library.

Future learning content should be reusable across the product so a definition, lesson, chart concept, scenario, or video resource can be linked contextually rather than duplicated.
