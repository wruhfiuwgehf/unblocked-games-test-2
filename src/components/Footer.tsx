import React from 'react';
import { Gamepad2, ShieldCheck, Heart, Terminal, Sparkles } from 'lucide-react';

interface FooterProps {
  totalGames: number;
  onOpenAddModal: () => void;
  onOpenCloakModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  totalGames,
  onOpenAddModal,
  onOpenCloakModal,
}) => {
  return (
    <footer className="w-full border-t border-white/5 bg-[#06070a] mt-16 py-8 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-fuchsia-600 flex items-center justify-center text-white shadow-[0_0_12px_rgba(34,211,238,0.35)]">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-black text-gray-200 text-xs italic tracking-tighter uppercase">
                Vortex Arcade Network
              </div>
              <p className="text-[10px] text-gray-600 font-mono">
                {totalGames} Sandboxed Games Online • Zero Tracking
              </p>
            </div>
          </div>

          {/* Quick links */}
          <div className="flex items-center gap-5 text-[10px] font-bold text-gray-400">
            <button 
              onClick={onOpenCloakModal}
              className="hover:text-cyan-400 transition-colors"
            >
              Tab Cloaker
            </button>
            <span>•</span>
            <button 
              onClick={onOpenAddModal}
              className="hover:text-cyan-400 transition-colors"
            >
              Submit Game
            </button>
            <span>•</span>
            <span className="text-gray-600">Pure Web Arcade</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/5 text-[10px] text-gray-600">
          <div className="flex items-center gap-4">
            <span>&copy; {new Date().getFullYear()} Vortex Gaming Portal</span>
            <span>Network Status: <span className="text-emerald-400 font-bold">Secure</span></span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <span>Client-side iframe execution • 100% Free & Unblocked</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
