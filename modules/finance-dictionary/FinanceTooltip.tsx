import React from 'react';
import { useFinanceDictionary } from './useFinanceDictionary';
import { InfoIcon } from '../../components/icons/Icons';

interface FinanceTooltipProps {
  term: string;
}

export const FinanceTooltip: React.FC<FinanceTooltipProps> = ({ term }) => {
  const info = useFinanceDictionary(term);

  if (!info) {
    return <>{term}</>;
  }

  return (
    <span className="relative group cursor-help inline-flex items-center space-x-1.5">
      <span>{info.display_label}</span>
      <InfoIcon className="w-4 h-4 text-gray-500 group-hover:text-accent-cyan transition-colors" />
      <div className="finance-tooltip-container">
        <div className="finance-tooltip-content">
          <strong className="font-serif text-accent-cyan font-normal">{info.term}</strong>
          <p className="mt-1 font-sans font-normal">{info.tooltip}</p>
        </div>
        <div className="finance-tooltip-arrow" />
      </div>
    </span>
  );
};
