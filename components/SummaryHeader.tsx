import React from 'react';
import type { EnhancedTitanSchema } from '../types';

interface SummaryHeaderProps {
    meta: EnhancedTitanSchema['meta'];
    summary: EnhancedTitanSchema['perspectives']['analyst']['summary'];
}

export const SummaryHeader: React.FC<SummaryHeaderProps> = ({ meta, summary }) => {
    
    const score = summary.overall_score * 10;
    const scoreColorValue = score >= 70 ? '#3BA272' : score >= 40 ? '#F4C542' : '#E35A5A';

    return (
        <div className="p-6 card rounded-lg">
            <div className="flex flex-col md:flex-row justify-between md:items-start">
                <div className="flex-grow">
                    <p className="text-gray-400 text-sm tracking-widest">{meta.report_type} / {meta.fiscal_period}</p>
                    <h2 className="font-serif text-5xl text-accent-cyan my-2">{meta.company_name} ({meta.ticker})</h2>
                    <p className="text-xs text-gray-500 mt-1">
                        {meta.file_name || 'Ticker-based Analysis'} &bull; Filed: {meta.filing_date}
                        {meta.filingUrl && (
                             <>
                                {' '}&bull;{' '}
                                <a 
                                    href={meta.filingUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="underline hover:text-accent-cyan transition-colors"
                                >
                                    View Source Filing
                                </a>
                             </>
                        )}
                    </p>
                </div>
                <div className="text-center mt-6 md:mt-0 md:ml-8 flex-shrink-0">
                    <div 
                        className="health-score-circle mx-auto"
                        style={{ '--score': score, '--score-color': scoreColorValue } as React.CSSProperties}
                    >
                        <span className="font-serif text-5xl text-white metric-value">{score.toFixed(0)}</span>
                        <span className="text-xs text-gray-400 tracking-widest mt-1">HEALTH SCORE</span>
                    </div>
                </div>
            </div>
            <div className="border-t border-gray-800/70 mt-6 pt-4">
                <p className="text-lg text-highlight-gold font-serif mb-2">"{summary.headline}"</p>
                <p className="text-gray-300">{summary.executive_takeaway}</p>
            </div>
        </div>
    );
};