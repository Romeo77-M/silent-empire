import React from 'react';
import { FileUpload } from './FileUpload';
import { ExampleCard } from './ExampleCard';

interface LandingPageProps {
  onAnalyze: (options: { ticker: string; }) => void;
  isLoading: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onAnalyze, isLoading }) => {
  const handleExampleSelect = (ticker: string) => {
    onAnalyze({ ticker });
  };

  return (
    <div className="max-w-3xl mx-auto text-center py-4 md:py-12 animate-fade-in">
        <h1 className="text-5xl font-serif text-accent-cyan mb-6">
            Financial Reports.<br/>
            <span className="text-highlight-gold">Finally Understandable.</span>
        </h1>
        
        <p className="text-xl text-gray-400 mb-8">
            Built for new investors who want clarity, not jargon.
            <br/>
            <span className="text-sm text-gray-500">Try an example or enter your own ticker below.</span>
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <ExampleCard ticker="AAPL" label="Tech Giant" onSelect={handleExampleSelect} disabled={isLoading} />
            <ExampleCard ticker="TSLA" label="EV Leader" onSelect={handleExampleSelect} disabled={isLoading} />
            <ExampleCard ticker="NVDA" label="Semiconductor" onSelect={handleExampleSelect} disabled={isLoading} />
            <ExampleCard ticker="DIS" label="Entertainment" onSelect={handleExampleSelect} disabled={isLoading} />
        </div>
        
        <FileUpload onAnalyze={onAnalyze} isLoading={isLoading} />
    </div>
  );
};