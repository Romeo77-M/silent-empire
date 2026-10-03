import { GoogleGenerativeAI } from "@google/generative-ai";

const MAX_REQUEST_CHARS = 5_000_000;
const MAX_ANALYSIS_CHARS = 120_000;
const SECTION_BUDGET = 24_000;
const CACHE_SECONDS = 3600;

function setPrivateCacheHeaders(res) {
  // Titan output is derived from public filings, but keep browser/CDN behavior explicit.
  // Shared server-side analysis caching should use a filing-identity key in a later step.
  res.setHeader('Cache-Control', `private, max-age=0, no-store`);
}

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function buildFilingEvidence(text) {
  const normalized = cleanText(text);
  if (normalized.length <= MAX_ANALYSIS_CHARS) return normalized;

  const markers = [
    /item\s+1a[\s.:\-]+risk factors/i,
    /item\s+2[\s.:\-]+management['’]s discussion and analysis/i,
    /item\s+7[\s.:\-]+management['’]s discussion and analysis/i,
    /item\s+8[\s.:\-]+financial statements/i,
    /consolidated statements? of operations/i,
    /consolidated statements? of income/i,
    /consolidated balance sheets?/i,
    /consolidated statements? of cash flows/i,
  ];

  const excerpts = [];
  const seen = new Set();
  const addExcerpt = (start, length) => {
    const key = Math.max(0, start);
    if (seen.has(key)) return;
    seen.add(key);
    excerpts.push(normalized.slice(key, key + length));
  };

  // Preserve filing identity/context from the beginning.
  addExcerpt(0, 16_000);

  for (const marker of markers) {
    const match = marker.exec(normalized);
    if (match) addExcerpt(Math.max(0, match.index - 500), SECTION_BUDGET);
  }

  // Preserve recent footnotes/exhibits context from the end when budget allows.
  addExcerpt(Math.max(0, normalized.length - 12_000), 12_000);

  return excerpts.join('\n\n--- FILING EXCERPT ---\n\n').slice(0, MAX_ANALYSIS_CHARS);
}

function isMetric(metric) {
  return metric && Number.isFinite(metric.value) && typeof metric.unit === 'string' && Number.isFinite(metric.change_pct);
}

function isBody(body) {
  return body &&
    typeof body.summary?.headline === 'string' &&
    typeof body.summary?.executive_takeaway === 'string' &&
    isMetric(body.key_metrics?.revenue) &&
    isMetric(body.key_metrics?.net_income) &&
    isMetric(body.key_metrics?.eps) &&
    ['low','moderate','high'].includes(body.risk_assessment?.risk_tier) &&
    Array.isArray(body.risk_assessment?.primary_risks) &&
    Array.isArray(body.risk_assessment?.mitigating_factors) &&
    Array.isArray(body.insights) &&
    typeof body.what_this_means?.summary_view === 'string' &&
    body.insights.every(insight => insight && ['positive','negative','neutral'].includes(insight.type) && typeof insight.text === 'string') &&
    body.risk_assessment.primary_risks.every(item => typeof item === 'string') &&
    body.risk_assessment.mitigating_factors.every(item => typeof item === 'string');
}

function isTitanResponse(value) {
  return value &&
    typeof value.meta?.company_name === 'string' &&
    typeof value.meta?.ticker === 'string' &&
    typeof value.meta?.report_type === 'string' &&
    isBody(value.perspectives?.analyst) &&
    isBody(value.perspectives?.simple) &&
    isBody(value.perspectives?.human);
}

export default async function handler(req, res) {
  setPrivateCacheHeaders(res);
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: 'AI service is not configured.' });

  const ticker = String(req.body?.ticker || '').trim().toUpperCase();
  const filingText = String(req.body?.filingText || '');
  if (!/^[A-Z0-9.-]{1,15}$/.test(ticker) || !filingText.trim()) {
    return res.status(400).json({ error: 'A valid ticker and filing text are required.' });
  }
  if (filingText.length > MAX_REQUEST_CHARS) {
    return res.status(413).json({ error: 'Filing is too large to process safely.' });
  }

  const filingEvidence = buildFilingEvidence(filingText);
  if (filingEvidence.length < 500) return res.status(422).json({ error: 'Filing text is too short to analyze reliably.' });
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });

  const prompt = `You are Titan, an educational financial-report analyst. Analyze only the supplied filing excerpts. Do not give personalized investment advice or buy/sell/hold instructions. Return one valid JSON object and nothing else.

Important evidence rules:
- The excerpts come from one SEC filing and may omit sections.
- Never claim you reviewed the entire filing.
- Do not invent missing figures, causes, periods, or risks.
- If a requested metric is not supported by the excerpts, use value 0, change_pct 0, unit "not_available", and explain the limitation in the narrative.
- Distinguish reported facts from interpretation.\n- Never state or imply a cause (for example, "due to", "because of", "driven by", or "benefited from") unless that causal relationship is explicitly stated in the supplied evidence.\n- Do not convert correlation, timing, or general business context into causation.\n- When evidence supports a change but not its cause, state only the change.\n- Keep material figures tied to the period and units supported by the evidence.

Required shape:
{
  "meta":{"company_name":"","ticker":"","report_type":"","fiscal_period":"","currency":"","filing_date":""},
  "perspectives":{"analyst": BODY,"simple": BODY,"human": BODY}
}
Each BODY must contain:
summary { headline:string, tone:string, executive_takeaway:string }
key_metrics { revenue:{value:number,unit:string,change_pct:number}, net_income:{value:number,unit:string,change_pct:number}, eps:{value:number,unit:string,change_pct:number} }
risk_assessment { risk_tier:"low"|"moderate"|"high", primary_risks:string[], mitigating_factors:string[] }
insights [{type:"positive"|"negative"|"neutral",text:string}]
what_this_means { summary_view:string }

"what_this_means.summary_view" explains the filing evidence and its significance for a learner. It must never contain an investment recommendation, rating, target price, or buy/sell/hold instruction.
Analyst is concise/professional. Simple uses plain English and explains numbers. Human is conversational and beginner-friendly without being condescending. Use a calm, neutral tone.

Ticker: ${ticker}
Selected filing evidence:
"""
${filingEvidence}
"""`;

  try {
    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise((_, reject) => setTimeout(() => reject(new Error('AI request timed out')), 55000))
    ]);
    const raw = (await result.response).text();
    if (!raw) return res.status(502).json({ error: 'AI service returned an empty response.' });
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(clean);
    if (!isTitanResponse(parsed)) {
      console.error('Titan response failed schema validation.');
      return res.status(502).json({ error: 'AI service returned an invalid analysis format.' });
    }
    return res.status(200).json(parsed);
  } catch (error) {
    console.error('Titan generation failed:', error);
    return res.status(502).json({ error: 'Failed to generate financial summary.' });
  }
}
