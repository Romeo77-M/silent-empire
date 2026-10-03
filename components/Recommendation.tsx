
import React from 'react';
import type { TitanSchema } from '../types';
import { TargetIcon } from './icons/Icons';

interface RecommendationProps {
    whatThisMeans: TitanSchema['what_this_means'];
}

export const Recommendation: React.FC<RecommendationProps> = ({ whatThisMeans }) => {
    return (
        <div className="p-6 card rounded-lg bg-gradient-to-br from-accent-cyan/10 to-transparent !border-accent-cyan/20">
            <h3 className="font-serif text-2xl text-white mb-4 flex items-center">
                <TargetIcon className="w-6 h-6 mr-3 text-accent-cyan" />
                What This Means
            </h3>
            <p className="text-lg text-accent-cyan font-semibold mb-4">
                "{whatThisMeans.summary_view}"
            </p>
        </div>
    );
}