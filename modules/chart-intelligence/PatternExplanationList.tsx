import React from 'react';
import { useChartDictionary } from './useChartDictionary';
import { InfoIcon } from '../../components/icons/Icons';

interface Pattern {
  index: number;
  pattern: string;
}

interface PatternExplanationListProps {
  patterns: Pattern[];
  hoveredPattern: string | null;
  setHoveredPattern: (pattern: string | null) => void;
}

interface PatternExplanationItemProps {
    pattern: Pattern;
    isHovered: boolean;
    setHoveredPattern: (pattern: string | null) => void;
}

const PatternExplanationItem: React.FC<PatternExplanationItemProps> = ({ pattern, isHovered, setHoveredPattern }) => {
    const info = useChartDictionary(pattern.pattern);
    if (!info) return null;

    const baseClasses = "p-4 border rounded-lg transition-all duration-300 transform cursor-pointer";
    const hoveredClasses = "bg-accent-cyan/10 border-accent-cyan/50 scale-[1.02]";
    const normalClasses = "bg-base-graphite/50 border-gray-800";

    return (
        <div 
            className={`${baseClasses} ${isHovered ? hoveredClasses : normalClasses}`}
            onMouseEnter={() => setHoveredPattern(pattern.pattern)}
            onMouseLeave={() => setHoveredPattern(null)}
        >
            <div className="flex items-center space-x-3">
                <InfoIcon className="w-5 h-5 text-accent-cyan shrink-0" />
                <h4 className="font-semibold text-highlight-gold">{info.display_label}</h4>
            </div>
            <p className="mt-2 text-sm text-gray-400">{info.tooltip}</p>
        </div>
    )
}

export const PatternExplanationList: React.FC<PatternExplanationListProps> = ({ patterns, hoveredPattern, setHoveredPattern }) => {
  if (patterns.length === 0) {
    return (
        <div className="mt-8 text-center text-gray-500 py-6 bg-base-graphite/30 rounded-lg">
            <p>No significant candlestick patterns were detected in this timeframe.</p>
        </div>
    );
  }

  const uniquePatterns = patterns.reduce((acc, current) => {
    if (!acc.find(item => item.pattern === current.pattern)) {
      acc.push(current);
    }
    return acc;
  }, [] as Pattern[]);

  return (
    <div className="mt-8">
      <h3 className="font-serif text-2xl text-white mb-4">Detected Patterns Explained</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {uniquePatterns.map((p) => (
          <PatternExplanationItem 
            key={p.pattern} 
            pattern={p}
            isHovered={hoveredPattern === p.pattern}
            setHoveredPattern={setHoveredPattern}
          />
        ))}
      </div>
    </div>
  );
};
