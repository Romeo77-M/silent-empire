export interface Metric {
  value: number;
  unit: string;
  change_pct: number;
}

export interface Insight {
  type: 'positive' | 'negative' | 'neutral';
  text: string;
}

// Represents the core analysis content, repeated for each perspective
export interface TitanSchemaBody {
  summary: {
    headline: string;
    tone: string;
    overall_score: number;
    executive_takeaway: string;
  };
  key_metrics: {
    revenue: Metric;
    net_income: Metric;
    eps: Metric;
  };
  risk_assessment: {
    risk_tier: 'low' | 'moderate' | 'high';
    primary_risks: string[];
    mitigating_factors: string[];
  };
  insights: Insight[];
  recommendation: {
    summary_view: string;
    confidence_level: number;
  };
}

export interface TitanMeta {
    company_name: string;
    ticker: string;
    report_type: string;
    fiscal_period: string;
    currency: string;
    filing_date: string;
    file_name?: string;
    filingUrl?: string;
}

// The new primary data structure for a summary.
export interface EnhancedTitanSchema {
  id: string;
  meta: TitanMeta;
  perspectives: {
    analyst: TitanSchemaBody;
    simple: TitanSchemaBody;
    human: TitanSchemaBody;
  };
}


// The original schema structure, kept for reference.
export interface TitanSchema extends TitanSchemaBody {
  id: string;
  meta: TitanMeta;
}

export interface CandlestickData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}