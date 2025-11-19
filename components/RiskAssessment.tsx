
import React from 'react';
import type { TitanSchema } from '../types';
import { AlertTriangleIcon, ShieldCheckIcon } from './icons/Icons';
import { FinanceTooltip } from '../modules/finance-dictionary/FinanceTooltip';

interface RiskAssessmentProps {
  assessment: TitanSchema['risk_assessment'];
}

const RiskGauge: React.FC<{ tier: 'low' | 'moderate' | 'high' }> = ({ tier }) => {
    const tierConfig = {
        low: { label: 'Low', color: 'bg-positive-emerald', width: 'w-1/3' },
        moderate: { label: 'Moderate', color: 'bg-warning-amber', width: 'w-2/3' },
        high: { label: 'High', color: 'bg-risk-red', width: 'w-full' },
    };
    const { label, color, width } = tierConfig[tier];

    return (
        <div>
            <div className="relative h-2 w-full bg-gray-700/50 rounded-full overflow-hidden">
                <div className={`absolute top-0 left-0 h-full ${width} ${color} transition-all duration-500 rounded-full`}></div>
            </div>
            <p className={`text-right mt-1 text-sm font-semibold ${color.replace('bg-', 'text-')}`}>{label} Risk</p>
        </div>
    );
};

export const RiskAssessment: React.FC<RiskAssessmentProps> = ({ assessment }) => {
  return (
    <div className="p-6 card rounded-lg h-full">
      <h3 className="font-serif text-2xl text-white mb-4">Risk Assessment</h3>
      <RiskGauge tier={assessment.risk_tier} />

      <div className="mt-6">
        <h4 className="font-semibold text-gray-300 flex items-center mb-2">
            <AlertTriangleIcon className="w-5 h-5 mr-2 text-warning-amber" />
            <FinanceTooltip term="Primary Risks" />
        </h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
            {assessment.primary_risks.map((risk, i) => <li key={i}>{risk}</li>)}
        </ul>
      </div>

      <div className="mt-6">
        <h4 className="font-semibold text-gray-300 flex items-center mb-2">
            <ShieldCheckIcon className="w-5 h-5 mr-2 text-positive-emerald" />
            <FinanceTooltip term="Mitigating Factors" />
        </h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
            {assessment.mitigating_factors.map((factor, i) => <li key={i}>{factor}</li>)}
        </ul>
      </div>
    </div>
  );
};