import React from 'react';

// A calm, neutral loading overlay or inline block
export const CalmLoader = ({ fullscreen = false, title = 'Loading', note = 'Preparing your workspace...' }) => {
  return (
    <div className={fullscreen ? 'fixed inset-0 z-50 flex items-center justify-center bg-white/85 backdrop-blur-sm' : 'flex items-center justify-center py-8'}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-full border border-gray-200" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-800 tracking-tight">{title}</p>
          <p className="text-xs text-gray-500 mt-1">{note}</p>
        </div>
        <span className="sr-only">Loading</span>
      </div>
    </div>
  );
};

export default CalmLoader;