import React from 'react';

interface ExampleCardProps {
    ticker: string;
    label: string;
    onSelect: (ticker: string) => void;
    disabled: boolean;
}

export const ExampleCard: React.FC<ExampleCardProps> = ({ ticker, label, onSelect, disabled }) => {
    return (
        <button
            onClick={() => onSelect(ticker)}
            disabled={disabled}
            className="p-4 bg-gray-900/30 border border-gray-800/80 rounded-lg text-center transition-all duration-200 hover:bg-gray-800/50 hover:border-accent-cyan/30 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
            <p className="font-bold text-lg text-gray-300">{ticker}</p>
            <p className="text-xs text-gray-500">{label}</p>
        </button>
    );
};