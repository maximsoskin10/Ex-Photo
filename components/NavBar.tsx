import React from 'react';

export const NavBar: React.FC = () => {
  return (
    <nav className="w-full py-6 px-6 flex items-center justify-between max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-tr from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/20">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          Ex-Photo
        </span>
      </div>
      <a 
        href="#" 
        className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
        onClick={(e) => e.preventDefault()}
      >
        Gemini Powered
      </a>
    </nav>
  );
};
