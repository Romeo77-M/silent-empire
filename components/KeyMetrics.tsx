
import React from 'react';
import type { TitanSchema, Metric } from '../types';
import { ArrowUpRightIcon, ArrowDownRightIcon } from './icons/Icons';
import { FinanceTooltip } from '../modules/finance-dictionary/FinanceTooltip';

interface KeyMetricsProps {
  metrics: TitanSchema['key_metrics'];
  currency: string;
}

const MetricCircle: React.FC<{ title: string; metric: Metric; currency: string; }> = ({ title, metric, currency }) => {
    const isPositive = metric.change_pct >= 0;
    const colorClass = isPositive ? 'text-positive-emerald' : 'text-risk-red';
    const bgColorClass = isPositive ? 'bg-positive-emerald/10' : 'bg-risk-red/10';
    const Icon = isPositive ? ArrowUpRightIcon : ArrowDownRightIcon;

    return (
        <div className="metric-circle">
            <p className="text-sm text-gray-400 uppercase tracking-wider">
                <FinanceTooltip term={title} />
            </p>
            <p className="text-4xl font-serif text-white my-1 metric-value">
                {metric.unit === 'USD' ? `$${metric.value.toFixed(2)}` : `${metric.value.toLocaleString()}`}
                <span className="text-lg text-gray-500 ml-1">{metric.unit !== 'USD' ? `${metric.unit}` : ''}</span>
            </p>
            <div className={`inline-flex items-center space-x-1 text-sm ${bgColorClass} ${colorClass} px-2 py-1 rounded`}>
                <Icon className="w-4 h-4" />
                <span>{metric.change_pct.toFixed(1)}%</span>
            </div>
        </div>
    );
};


export const KeyMetrics: React.FC<KeyMetricsProps> = ({ metrics, currency }) => {
  return (
    <div className="p-6 card rounded-lg">
        <h3 className="font-serif text-2xl text-white mb-6 text-center tracking-wider">Key Numbers</h3>
        <div className="flex flex-col md:flex-row items-center justify-around gap-8 py-4">
            <MetricCircle title="Revenue" metric={metrics.revenue} currency={currency} />
            <MetricCircle title="Net Income" metric={metrics.net_income} currency={currency} />
            <MetricCircle title="EPS" metric={metrics.eps} currency={currency} />
        </div>
    </div>
  );
};