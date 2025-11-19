import React, { useEffect, useState } from 'react';
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
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!info) return null;
  return (
    <div
      className={`absolute transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ left: x, top: y, pointerEvents: visible ? 'auto' : 'none' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="relative group cursor-help inline-flex items-center space-x-1.5 p-2 rounded bg-base-graphite/50">
        <InfoIcon className="w-4 h-4 text-accent-cyan" />
        <span className="text-xs text-gray-300">{info.display_label}</span>
         <div className="chart-tooltip-container">
            <div className="finance-tooltip-content">
              <strong className="font-serif text-accent-cyan font-normal">{info.display_label}</strong>
              <p className="mt-1 font-sans font-normal">{info.tooltip}</p>
            </div>
            <div className="chart-tooltip-arrow" />
        </div>
      </div>
    </div>
  );
};
