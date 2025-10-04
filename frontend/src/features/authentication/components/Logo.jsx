import React from 'react';

const Logo = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
        FHC
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
        Family Health Care
      </span>
    </div>
  );
};

export default Logo;