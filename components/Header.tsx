import React from 'react';
import { trackEvent } from '../services/analyticsService';

type View = 'landing' | 'list' | 'comparison' | 'chart';

interface HeaderProps {
    onNavigate: (view: View) => void;
    currentView: View;
    onReset: () => void;
    selectedCount: number;
    hasSummaries: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentView, onReset, selectedCount, hasSummaries }) => {

  const getLinkClass = (view: View) => {
    return currentView === view ? 'text-accent-cyan font-semibold' : 'text-gray-400 hover:text-gray-200 transition-colors';
  }

  const handleCompareClick = () => {
    trackEvent('view_comparison', { count: selectedCount });
    onNavigate('comparison');
  }

  return (
    <header className="p-4 border-b border-gray-800/50 sticky top-0 bg-base-graphite/80 backdrop-blur-sm z-40">
      <div className="container mx-auto flex items-center justify-between relative">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => hasSummaries ? onNavigate('list') : onReset()} role="button" aria-label="Home">
            <div className="w-8 h-8 bg-accent-cyan/10 border border-accent-cyan/50 flex items-center justify-center rounded-md">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <h1 className="font-serif text-2xl tracking-wide text-gray-200">
                Silent Empire <span className="text-gray-500">Financials</span>
            </h1>
        </div>

        <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex space-x-8 text-sm">
            <button 
                onClick={() => onNavigate('list')} 
                className={hasSummaries ? getLinkClass('list') : 'text-gray-600 cursor-not-allowed'}
                disabled={!hasSummaries}
            >Summary</button>
            <button onClick={() => onNavigate('chart')} className={getLinkClass('chart')}>Chart Intelligence</button>
            <span className="text-gray-700 cursor-not-allowed">Glossary</span>
        </nav>

        <div>
            {currentView === 'list' && selectedCount > 1 ? (
                <button 
                    onClick={handleCompareClick}
                    className="px-4 py-2 text-sm font-semibold text-highlight-gold bg-highlight-gold/10 border border-highlight-gold/50 rounded-md hover:bg-highlight-gold/20 transition-colors"
                >
                    Compare ({selectedCount})
                </button>
            ) : currentView === 'comparison' ? (
                <button 
                    onClick={() => onNavigate('list')}
                    className="px-4 py-2 text-sm font-semibold text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/50 rounded-md hover:bg-accent-cyan/20 transition-colors"
                >
                    Back to Summaries
                </button>
            ) : (
                <div className="flex items-center space-x-4">
                    {hasSummaries && (
                         <button 
                            onClick={onReset}
                            className="px-4 py-2 text-sm font-semibold text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/50 rounded-md hover:bg-accent-cyan/20 transition-colors"
                        >
                            Add New Ticker
                        </button>
                    )}
                </div>
            )}
        </div>
      </div>
    </header>
  );
};