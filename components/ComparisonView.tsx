import React from 'react';
import type { EnhancedTitanSchema, TitanSchema } from '../types';

interface ComparisonViewProps {
  summaries: EnhancedTitanSchema[];
}

const renderMetric = (metric: TitanSchema['key_metrics']['revenue']) => {
    const isPositive = metric.change_pct >= 0;
    const colorClass = isPositive ? 'text-positive-emerald' : 'text-risk-red';
    return (
        <div className="text-center">
            <p className="text-xl font-bold">
                 {metric.unit === 'USD' ? `$${metric.value.toFixed(2)}` : `${metric.value.toLocaleString()}`}
                 <span className="text-sm text-gray-500 ml-1">{metric.unit !== 'USD' ? `${metric.unit}` : ''}</span>
            </p>
            <p className={`text-sm ${colorClass}`}>({metric.change_pct.toFixed(1)}%)</p>
        </div>
    );
};

export const ComparisonView: React.FC<ComparisonViewProps> = ({ summaries }) => {
  if (summaries.length < 2) {
    return <div>Select at least two summaries to compare.</div>;
  }

  return (
    <div className="p-6 card rounded-lg animate-fade-in">
        <h2 className="text-3xl font-serif text-center mb-8 text-highlight-gold">Side-by-Side Comparison</h2>
        <div className="overflow-x-auto">
            <table className="w-full comparison-table">
                <thead>
                    <tr>
                        <th>Metric</th>
                        {summaries.map(s => <th key={s.id} className="text-center text-accent-cyan">{s.meta.company_name} ({s.meta.ticker})</th>)}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Health Score</td>
                        {summaries.map(s => <td key={s.id} className="text-center text-2xl font-bold">{(s.perspectives.analyst.summary.overall_score * 10).toFixed(0)}</td>)}
                    </tr>
                    <tr>
                        <td>Revenue</td>
                        {summaries.map(s => <td key={s.id}>{renderMetric(s.perspectives.analyst.key_metrics.revenue)}</td>)}
                    </tr>
                    <tr>
                        <td>Net Income</td>
                        {summaries.map(s => <td key={s.id}>{renderMetric(s.perspectives.analyst.key_metrics.net_income)}</td>)}
                    </tr>
                     <tr>
                        <td>EPS</td>
                        {summaries.map(s => <td key={s.id}>{renderMetric(s.perspectives.analyst.key_metrics.eps)}</td>)}
                    </tr>
                    <tr>
                        <td>Risk Tier</td>
                        {summaries.map(s => <td key={s.id} className="text-center capitalize">{s.perspectives.analyst.risk_assessment.risk_tier}</td>)}
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
  );
};