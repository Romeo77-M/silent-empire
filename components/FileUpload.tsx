import React, { useState } from 'react';
import { RefreshCwIcon } from './icons/Icons';

interface FileUploadProps {
  onAnalyze: (options: { ticker: string; }) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onAnalyze, isLoading }) => {
  const [ticker, setTicker] = useState('');

  const handleAnalyzeClick = () => {
    if (!ticker.trim() || isLoading) return;
    onAnalyze({ ticker });
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleAnalyzeClick();
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 md:mt-16 text-center animate-fade-in">
        <h1 className="font-serif text-3xl md:text-4xl text-gray-200">
            Financial Intelligence, Distilled.
        </h1>
        <p className="mt-4 text-lg text-gray-400 max-w-xl mx-auto">
            Enter a ticker symbol. Titan will handle the rest.
        </p>
        
        <div className="mt-10 space-y-6">
            <input 
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                placeholder="Enter a company ticker (AAPL, TSLA, NVDA)"
                className="w-full px-6 py-4 bg-transparent border-2 border-accent-cyan/50 rounded-lg text-lg text-center text-white placeholder-gray-500 focus:ring-2 focus:ring-accent-cyan focus:outline-none focus:border-accent-cyan transition-all shadow-[0_0_15px_rgba(78,227,227,0.3)] disabled:opacity-50"
                disabled={isLoading}
                aria-label="Company Ticker"
            />

            <button
                onClick={handleAnalyzeClick}
                disabled={isLoading || !ticker.trim()}
                className="w-full px-8 py-4 text-lg font-semibold bg-highlight-gold text-base-graphite rounded-lg transition-all duration-300 hover:brightness-110 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
                 {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <RefreshCwIcon className="w-5 h-5 animate-spin" />
                        Analyzing...
                    </span>
                 ) : <span>Generate Summary</span>}
            </button>
        </div>
    </div>
  );
};