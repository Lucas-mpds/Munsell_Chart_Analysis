import React from 'react';
import { Palette } from 'lucide-react';

interface StartMenuProps {
  onStart: () => void;
}

const StartMenu: React.FC<StartMenuProps> = ({ onStart }) => {
  return (
    <div className="h-screen w-screen bg-gray-950 text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" style={{ animationDuration: '5s' }} />
      </div>

      <div className="z-10 flex flex-col items-center animate-in fade-in zoom-in duration-700 space-y-12 p-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full blur-xl opacity-50" />
          <div className="relative bg-gray-900 p-8 rounded-3xl border border-gray-800 shadow-2xl">
            <Palette size={64} className="text-white" />
          </div>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tighter bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            ChromaLens
          </h1>
          <p className="text-gray-400 text-lg font-light tracking-wide">
            Precision Color Analysis
          </p>
        </div>

        <button
          onClick={onStart}
          className="group relative px-12 py-4 bg-white text-black font-bold text-xl rounded-full overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all transform hover:scale-105 active:scale-95"
        >
          <span className="relative z-10">Iniciar</span>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-white to-gray-100 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
      
      <div className="absolute bottom-8 text-gray-600 text-xs font-mono uppercase tracking-widest z-10">
        Munsell System Enabled
      </div>
    </div>
  );
};

export default StartMenu;