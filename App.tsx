import React from 'react';
import { ImageEditor } from './components/ImageEditor';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#020617] relative overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]" />
      </div>

      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#020617]/70 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M12 4L12 20M4 12L20 12M17 7L7 17M7 7L17 17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
               </svg>
             </div>
             <h1 className="text-lg font-semibold text-white tracking-wide">
               Nano<span className="text-indigo-400">Banana</span>
             </h1>
             <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-medium text-gray-400 uppercase tracking-wider ml-2">
               Beta
             </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors">
              Built with Gemini
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-24 pb-12 px-4 sm:px-6">
        <ImageEditor />
      </main>
    </div>
  );
};

export default App;