import React from 'react';
import type { TitanSchema, Insight } from '../types';
import { PlusCircleIcon, MinusCircleIcon } from './icons/Icons';

interface InsightsProps {
  insights: TitanSchema['insights'];
}

const InsightItem: React.FC<{ insight: Insight }> = ({ insight }) => {
    const isPositive = insight.type === 'positive';
    const Icon = isPositive ? PlusCircleIcon : MinusCircleIcon;
    const color = isPositive ? 'text-positive-emerald' : 'text-risk-red';
    const borderColor = isPositive ? 'border-positive-emerald' : 'border-risk-red';


    return (
        <div className={`flex items-start space-x-3 p-3 border-l-4 ${borderColor} insight-item`}>
            <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${color}`} />
            <p className="text-gray-300">{insight.text}</p>
        </div>
    );
};

export const Insights: React.FC<InsightsProps> = ({ insights }) => {
  return (
    <div className="p-6 card rounded-lg">
      <h3 className="font-serif text-2xl text-white mb-4">AI Insights</h3>
      <div className="space-y-3">
        {insights.map((insight, i) => <InsightItem key={i} insight={insight} />)}
      </div>
    </div>
  );
};