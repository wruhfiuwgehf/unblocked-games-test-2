import React, { useState, useEffect } from 'react';
import { CloakPreset } from '../types';
import { 
  X, 
  EyeOff, 
  ShieldCheck, 
  AlertTriangle, 
  Zap, 
  RefreshCw,
  FolderLock,
  Globe
} from 'lucide-react';

interface CloakModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCloak: string;
  onApplyCloak: (preset: CloakPreset | null) => void;
  panicKey: string;
  setPanicKey: (key: string) => void;
  panicUrl: string;
  setPanicUrl: (url: string) => void;
}

const presets: CloakPreset[] = [
  {
    id: 'classroom',
    name: 'Google Classroom',
    title: 'Classes - Google Classroom',
    icon: 'https://ssl.gstatic.com/classroom/favicon.png'
  },
  {
    id: 'drive',
    name: 'Google Drive',
    title: 'My Drive - Google Drive',
    icon: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png'
  },
  {
    id: 'docs',
    name: 'Google Docs',
    title: 'Untitled document - Google Docs',
    icon: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico'
  },
  {
    id: 'canvas',
    name: 'Canvas LMS',
    title: 'Dashboard - Canvas',
    icon: 'https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico'
  },
  {
    id: 'desmos',
    name: 'Desmos Calculator',
    title: 'Desmos | Graphing Calculator',
    icon: 'https://www.desmos.com/favicon.ico'
  },
  {
    id: 'wikipedia',
    name: 'Wikipedia Reference',
    title: 'Special Relativity - Wikipedia',
    icon: 'https://en.wikipedia.org/static/favicon/wikipedia.ico'
  }
];

export const CloakModal: React.FC<CloakModalProps> = ({
  isOpen,
  onClose,
  activeCloak,
  onApplyCloak,
  panicKey,
  setPanicKey,
  panicUrl,
  setPanicUrl,
}) => {
  const [customTitle, setCustomTitle] = useState('');
  const [customIcon, setCustomIcon] = useState('');
  const [keyCapturing, setKeyCapturing] = useState(false);

  useEffect(() => {
    if (!keyCapturing) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      setPanicKey(e.key);
      setKeyCapturing(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyCapturing, setPanicKey]);

  if (!isOpen) return null;

  const handleApplyCustom = () => {
    if (!customTitle.trim()) return;
    onApplyCloak({
      id: 'custom',
      name: 'Custom Cloak',
      title: customTitle.trim(),
      icon: customIcon.trim() || 'https://www.google.com/favicon.ico'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#06070a] border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.9)] p-6 sm:p-7 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-black shadow-[0_0_15px_rgba(52,211,153,0.4)]">
              <EyeOff className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black italic uppercase tracking-tighter text-base sm:text-lg text-white">Stealth Tab Cloak</h2>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Disguise browser tab title & favicon as educational portals</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Presets Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Preset Disguises
            </label>
            {activeCloak !== 'default' && (
              <button
                onClick={() => onApplyCloak(null)}
                className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Reset Defaults
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {presets.map((p) => {
              const isSelected = activeCloak === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onApplyCloak(p)}
                  className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-400/60 shadow-[0_0_15px_rgba(52,211,153,0.2)]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-cyan-500/40'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <img 
                      src={p.icon} 
                      alt={p.name} 
                      className="w-4 h-4 rounded-sm object-contain"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                    <span className="font-bold text-xs text-gray-200 line-clamp-1">{p.name}</span>
                  </div>
                  <span className="text-[9px] text-gray-500 line-clamp-1 font-mono">
                    {p.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Cloak */}
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            Custom Disguise Configuration
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. History Essay Notes"
              className="px-3.5 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-cyan-500/60"
            />
            <input
              type="url"
              value={customIcon}
              onChange={(e) => setCustomIcon(e.target.value)}
              placeholder="Favicon URL (Optional)"
              className="px-3.5 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-cyan-500/60"
            />
          </div>
          <button
            onClick={handleApplyCustom}
            disabled={!customTitle.trim()}
            className="w-full py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 disabled:opacity-40 text-gray-200 border border-white/10 transition-all"
          >
            Apply Custom Disguise
          </button>
        </div>

        {/* Panic Button Settings */}
        <div className="p-4 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-2xl space-y-3 shadow-[0_0_20px_rgba(217,70,239,0.1)]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-fuchsia-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-fuchsia-300">Instant Panic Escape Hotkey</h3>
          </div>
          <p className="text-[10px] text-gray-400 leading-relaxed font-sans">
            Pressing this key anywhere instantly redirects your browser to a safe academic destination.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Trigger Key
              </label>
              <button
                type="button"
                onClick={() => setKeyCapturing(true)}
                className="w-full px-3.5 py-2 bg-black/50 border border-white/10 hover:border-fuchsia-500/50 rounded-xl text-xs font-mono font-bold text-fuchsia-300 flex items-center justify-between transition-all"
              >
                <span>{keyCapturing ? 'Press Any Key...' : `Key: [ ${panicKey.toUpperCase()} ]`}</span>
                <span className="text-[9px] text-gray-500 uppercase">Change</span>
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Safe Redirect URL
              </label>
              <input
                type="url"
                value={panicUrl}
                onChange={(e) => setPanicUrl(e.target.value)}
                className="w-full px-3.5 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-gray-200 font-mono focus:outline-none focus:border-fuchsia-500/50"
              />
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-white hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
