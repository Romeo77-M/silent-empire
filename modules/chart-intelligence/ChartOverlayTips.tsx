import React from 'react';
import { useChartDictionary } from './useChartDictionary';
import { InfoIcon } from '../../components/icons/Icons';

interface ChartOverlayTipsProps {
  pattern: string;
  x: number;
  y: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const ChartOverlayTips: React.FC<ChartOverlayTipsProps> = ({ pattern, x, y, onMouseEnter, onMouseLeave }) => {
  const info = useChartDictionary(pattern);
  if (!info) return null;
  return (
    <div
      className="absolute"
      style={{ left: x, top: y }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onMouseEnter}
      onBlur={onMouseLeave}
    >
      <button type="button" className="relative group cursor-help inline-flex items-center space-x-1.5 p-2 rounded bg-base-graphite/50 focus:outline-none focus:ring-2 focus:ring-accent-cyan" aria-label={`${info.display_label}: ${info.tooltip}`}>
        <InfoIcon className="w-4 h-4 text-accent-cyan" />
        <span className="text-xs text-gray-300">{info.display_label}</span>
         <div className="chart-tooltip-container">
            <div className="finance-tooltip-content">
              <strong className="font-serif text-accent-cyan font-normal">{info.display_label}</strong>
              <p className="mt-1 font-sans font-normal">{info.tooltip}</p>
            </div>
            <div className="chart-tooltip-arrow" />
        </div>
      </button>
    </div>
  );
};
