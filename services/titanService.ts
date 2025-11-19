import { GoogleGenerativeAI } from "@google/generative-ai";
import type { TitanMeta, TitanSchemaBody } from '../types';

interface TitanMultiPerspectiveResponse {
    meta: TitanMeta;
    perspectives: {
        analyst: TitanSchemaBody;
        simple: TitanSchemaBody;
        human: TitanSchemaBody;
    };
}

const MAX_FILING_CHARS = 20000;

export const generateTitanSummary = async ({ ticker, filingText }: { ticker: string; filingText: string; }): Promise<TitanMultiPerspectiveResponse> => {
  const API_KEY = process.env.VITE_GEMINI_API_KEY;

  if (!API_KEY) {
    throw new Error("API Configuration Error: Gemini API Key is not set.");
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const truncatedFilingText = filingText.substring(0, MAX_FILING_CHARS);

  const systemPrompt = `You are an expert financial analyst AI named Titan. Your task is to analyze the provided financial document text and present it clearly, creating three versions of your analysis based on different clarity levels.

Your response MUST be a single, valid JSON object. Do not include any text, notes, markdown formatting, or explanations outside of the JSON object.

The JSON object must have a top-level 'meta' object and a 'perspectives' object.

- The 'meta' object must contain: company_name, ticker, report_type, fiscal_period, currency, and filing_date based on the provided document.
- The 'perspectives' object must contain three keys: 'analyst', 'simple', and 'human'.

For each perspective ('analyst', 'simple', 'human'), you must generate a full analysis object containing:
- summary: { headline, tone, overall_score (0.0-10.0), executive_takeaway }
- key_metrics: { revenue: { value, unit, change_pct }, net_income: { value, unit, change_pct }, eps: { value, unit, change_pct } }. All values must be numbers.
- risk_assessment: { risk_tier ('low'|'moderate'|'high'), primary_risks (array of strings), mitigating_factors (array of strings) }
- insights: An array of objects, each with { type ('positive'|'negative'|'neutral'), text }
- recommendation: { summary_view, confidence_level (0.0-1.0) }

Clarity Level Definitions:
1. **Analyst Mode**: concise, structured, professional for investors.
2. **Simple Mode**: plain English, short sentences, explains what numbers mean.
3. **Human Mode**: friendly, conversational, empathetic, as if explaining to a new learner. Use analogies when helpful.

Adopt the Tactical Calm tone: confident, educational, and neutral. Avoid hype or fear words. Base your analysis STRICTLY on the text provided.`;

  const userContent = `Analyze the following financial document for the company with ticker: ${ticker}\n\nDocument Text:\n"""\n${truncatedFilingText}\n"""`;

  try {
    const result = await model.generateContent(systemPrompt + "\n\n" + userContent);

    const jsonString = result.response.text();
    if (!jsonString) {
        throw new Error("Gemini API returned an empty response.");
    }
    
    const parsedJson = JSON.parse(jsonString);
    return parsedJson as TitanMultiPerspectiveResponse;

  } catch (error) {
    console.error("Error generating summary with Gemini:", error);
    throw new Error("Gemini API Error: Failed to generate financial summary.");
  }
};