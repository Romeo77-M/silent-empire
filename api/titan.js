import { GoogleGenerativeAI } from "@google/generative-ai";

const MAX_FILING_CHARS = 20000;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: 'AI service is not configured.' });

  const ticker = String(req.body?.ticker || '').trim().toUpperCase();
  const filingText = String(req.body?.filingText || '');
  if (!/^[A-Z]{1,10}$/.test(ticker) || !filingText.trim()) {
    return res.status(400).json({ error: 'A valid ticker and filing text are required.' });
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "Gemini 2.5 Flash-Lite" });
  const filingExcerpt = filingText.substring(0, MAX_FILING_CHARS);

  const prompt = `You are Titan, an educational financial-report analyst. Analyze only the supplied filing text. Do not give personalized investment advice or buy/sell/hold instructions. Return one valid JSON object and nothing else.

Required shape:
{
  "meta":{"company_name":"","ticker":"","report_type":"","fiscal_period":"","currency":"","filing_date":""},
  "perspectives":{
    "analyst": BODY,
    "simple": BODY,
    "human": BODY
  }
}
Each BODY must contain:
summary { headline:string, tone:string, overall_score:number 0-10, executive_takeaway:string }
key_metrics { revenue:{value:number,unit:string,change_pct:number}, net_income:{...}, eps:{...} }
risk_assessment { risk_tier:"low"|"moderate"|"high", primary_risks:string[], mitigating_factors:string[] }
insights [{type:"positive"|"negative"|"neutral",text:string}]
recommendation { summary_view:string, confidence_level:number 0-1 }

"recommendation.summary_view" is an educational interpretation of the filing, never an investment recommendation. If the filing excerpt does not support a fact, say that it is not available rather than inventing it.
Analyst is concise/professional. Simple uses plain English and explains numbers. Human is conversational and beginner-friendly without being condescending. Use a calm, neutral tone.

Ticker: ${ticker}
Filing text:
"""
${filingExcerpt}
"""`;

  try {
    const result = await model.generateContent(prompt);
    const raw = (await result.response).text();
    if (!raw) return res.status(502).json({ error: 'AI service returned an empty response.' });
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return res.status(200).json(JSON.parse(clean));
  } catch (error) {
    console.error('Titan generation failed:', error);
    return res.status(502).json({ error: 'Failed to generate financial summary.' });
  }
}
