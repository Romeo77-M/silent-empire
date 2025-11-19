import React from 'react';
import type { EnhancedTitanSchema } from '../types';
import { SummaryCard } from './SummaryCard';

interface SummaryListProps {
  summaries: EnhancedTitanSchema[];
  selectedSummaryIds: Set<string>;
  onToggleSelection: (id: string) => void;
  onExportPDF: (element: HTMLDivElement | null, data: EnhancedTitanSchema) => void;
  isExporting: boolean;
  onClearAll: () => void;
}

export const SummaryList: React.FC<SummaryListProps> = ({ 
  summaries, 
  selectedSummaryIds, 
  onToggleSelection, 
  onExportPDF,
  isExporting,
  onClearAll,
}) => {

  return (
    <div className="space-y-8 animate-fade-in">
        <div className="text-center">
            <h2 className="text-3xl font-serif text-white">Your Generated Summaries</h2>
            <p className="text-gray-400 mt-2">Select two or more summaries to compare.</p>
        </div>
        
        {summaries.length > 0 && (
            <div className="flex justify-center items-center gap-4">
                <button
                    onClick={onClearAll}
                    className="px-4 py-2 text-sm text-risk-red bg-risk-red/10 border border-risk-red/50 rounded-md hover:bg-risk-red/20 transition-colors"
                >
                    Clear All Summaries
                </button>
            </div>
        )}

        <div className="space-y-12">
            {summaries.map((summary) => (
                <SummaryCard
                    key={summary.id}
                    data={summary}
                    isSelected={selectedSummaryIds.has(summary.id)}
                    onToggleSelection={onToggleSelection}
                    onExportPDF={onExportPDF}
                    isExporting={isExporting}
                />
            ))}
        </div>
    </div>
  );
};