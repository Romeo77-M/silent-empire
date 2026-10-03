import React from 'react';
import { useChartDictionary } from './useChartDictionary';
import { InfoIcon } from '../../components/icons/Icons';

interface ChartOverlayTipsProps {
  pattern: string;
  x: number;
  y: number;
  isActive: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
}

export const ChartOverlayTips: React.FC<ChartOverlayTipsProps> = ({
  pattern,
  x,
  y,
  isActive,
  onActivate,
  onDeactivate,
}) => {
  const info = useChartDictionary(pattern);
  if (!info) return null;

  return (
    <div className="absolute z-20" style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}>
      <button
        type="button"
        className={`relative inline-flex h-7 w-7 items-center justify-center rounded-full border transition-all focus:outline-none focus:ring-2 focus:ring-accent-cyan ${isActive ? 'bg-accent-cyan text-base-graphite border-accent-cyan scale-110' : 'bg-base-graphite/90 text-accent-cyan border-accent-cyan/50 hover:bg-accent-cyan/15'}`}
        aria-label={`${info.display_label}: ${info.tooltip}`}
        aria-expanded={isActive}
        onMouseEnter={onActivate}
        onMouseLeave={onDeactivate}
        onFocus={onActivate}
        onBlur={onDeactivate}
        onClick={(event) => {
          event.stopPropagation();
          isActive ? onDeactivate() : onActivate();
        }}
      >
        <InfoIcon className="w-4 h-4" />
        {isActive && (
          <span className="absolute left-1/2 bottom-full mb-2 w-64 -translate-x-1/2 rounded-lg border border-accent-cyan/30 bg-base-graphite/95 p-3 text-left text-xs text-gray-300 shadow-xl pointer-events-none">
            <strong className="block font-serif text-sm font-normal text-accent-cyan">{info.display_label}</strong>
            <span className="mt-1 block font-sans">{info.tooltip}</span>
          </span>
        )}
      </button>
    </div>
  );
};
