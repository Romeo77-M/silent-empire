
import React from 'react';
import type { TitanSchema } from '../types';
import { TargetIcon } from './icons/Icons';
import { FinanceTooltip } from '../modules/finance-dictionary/FinanceTooltip';

interface RecommendationProps {
    recommendation: TitanSchema['recommendation'];
}

export const Recommendation: React.FC<RecommendationProps> = ({ recommendation }) => {
    const confidencePercentage = (recommendation.confidence_level * 100).toFixed(0);

    return (
        <div className="p-6 card rounded-lg bg-gradient-to-br from-accent-cyan/10 to-transparent !border-accent-cyan/20">
            <h3 className="font-serif text-2xl text-white mb-4 flex items-center">
                <TargetIcon className="w-6 h-6 mr-3 text-accent-cyan" />
                Recommendation
            </h3>
            <p className="text-lg text-accent-cyan font-semibold mb-4">
                "{recommendation.summary_view}"
            </p>
            <div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-300">
                        <FinanceTooltip term="Confidence Level" />
                    </span>
                    <span className="text-sm font-medium text-accent-cyan">{confidencePercentage}%</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2.5 overflow-hidden">
                    <div 
                        className="bg-accent-cyan h-2.5 rounded-full" 
                        style={{ width: `${confidencePercentage}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
}