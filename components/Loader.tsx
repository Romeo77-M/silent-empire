
import React from 'react';

export const Loader: React.FC = () => (
  <div className="mt-12 flex flex-col items-center justify-center space-y-4 animate-fade-in">
    <div className="relative flex items-center justify-center">
      <div className="absolute w-24 h-24 rounded-full border-2 border-accent-cyan/20"></div>
      <div className="absolute w-24 h-24 rounded-full border-t-2 border-accent-cyan animate-spin"></div>
    </div>
    <p className="font-serif text-xl text-accent-cyan tracking-wider">Engaging Titan AI...</p>
    <p className="text-sm text-gray-500">Parsing financial data stream.</p>
  </div>
);
