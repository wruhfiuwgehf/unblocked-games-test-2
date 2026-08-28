import React, { useState, useRef, useEffect } from 'react';
import { GameItem } from '../types';
import { getGameSrcDoc } from '../data/gameEmbeds';
import { 
  X, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  ExternalLink, 
  Bookmark, 
  Star, 
  Users, 
  Gamepad2, 
  Keyboard, 
  Info,
  Tv
} from 'lucide-react';

interface GamePlayerProps {
  game: GameItem;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, gameId: string) => void;
  onSelectGame: (game: GameItem) => void;
  relatedGames: GameItem[];
}

export const GamePlayer: React.FC<GamePlayerProps> = ({
  game,
  onClose,
  isFavorite,
  onToggleFavorite,
  onSelectGame,
  relatedGames,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isTheater, setIsTheater] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Reset loading state whenever game changes
  useEffect(() => {
    setIsLoading(true);
    setIframeKey(prev => prev + 1);

    // Fallback safety timeout for iframe loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [game.id]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Reload the game iframe
  const handleReload = () => {
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
  };

  // Toggle standard fullscreen
  const toggleFullscreen = () => {
    if (!playerRef.current) return;
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().catch((err) => {
        console.error('Failed to enter fullscreen:', err);
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Pop-out stealth tab (about:blank with game iframe embedded)
  const handlePopOut = () => {
    const newTab = window.open('about:blank', '_blank');
    if (!newTab) return;

    const gameContent = game.iframeUrl 
      ? `<iframe src="${game.iframeUrl}" style="border:0;width:100%;height:100%;position:fixed;top:0;left:0;right:0;bottom:0;" allowfullscreen></iframe>`
      : `<div style="width:100vw;height:100vh;margin:0;padding:0;background:#09090b;display:flex;align-items:center;justify-content:center;">
           <iframe srcdoc="${getGameSrcDoc(game.id, game.title).replace(/"/g, '&quot;')}" style="border:0;width:100%;height:100%;" allowfullscreen></iframe>
         </div>`;

    newTab.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Google Drive - My Drive</title>
          <link rel="icon" href="https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png" />
          <style>body,html{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#09090b;}</style>
        </head>
        <body>
          ${gameContent}
        </body>
      </html>
    `);
    newTab.document.close();
  };

  // Generate either srcdoc or iframe source
  const srcDocContent = (!game.iframeUrl && !game.iframeHtml) 
    ? getGameSrcDoc(game.id, game.title) 
    : undefined;

  return (
    <div className="w-full max-w-7xl mx-auto py-4 px-3 sm:px-6 space-y-5 animate-in fade-in duration-200">
      
      {/* Top Breadcrumb & Quick Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/5 border border-white/10 p-3.5 rounded-2xl backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-3">
          <button
            id="player-back-btn"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-bold uppercase tracking-wider border border-white/10 transition-all hover:border-cyan-500/40"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black italic uppercase tracking-tighter text-base sm:text-xl text-white">
                {game.title}
              </h1>
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_8px_rgba(34,211,238,0.25)]">
                {game.category}
              </span>
            </div>
            {game.author && (
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Creator: {game.author}</p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Favorite */}
          <button
            id="player-fav-btn"
            onClick={(e) => onToggleFavorite(e, game.id)}
            className={`p-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
              isFavorite
                ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/50 shadow-[0_0_12px_rgba(217,70,239,0.3)]'
                : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
            }`}
            title={isFavorite ? 'Remove Favorite' : 'Save Favorite'}
          >
            <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-fuchsia-400 text-fuchsia-400' : ''}`} />
          </button>

          {/* Reload Iframe */}
          <button
            id="player-reload-btn"
            onClick={handleReload}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 hover:border-cyan-500/40 transition-all"
            title="Reload Game"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Theater Mode Toggle */}
          <button
            id="player-theater-btn"
            onClick={() => setIsTheater(!isTheater)}
            className={`p-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all hidden sm:flex items-center gap-1.5 ${
              isTheater
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
            }`}
            title="Toggle Theater Mode"
          >
            <Tv className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px]">{isTheater ? 'Default' : 'Theater'}</span>
          </button>

          {/* Pop-out Stealth Tab */}
          <button
            id="player-popout-btn"
            onClick={handlePopOut}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 hover:border-white/20 transition-all hidden sm:flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
            title="Open disguised popout tab"
          >
            <ExternalLink className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px]">Pop-Out</span>
          </button>

          {/* Fullscreen */}
          <button
            id="player-fullscreen-btn"
            onClick={toggleFullscreen}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-cyan-400 text-black font-black uppercase tracking-widest shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all flex items-center gap-1.5 text-xs"
            title="Fullscreen Mode"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* Main Iframe Player Stage */}
      <div 
        ref={playerRef}
        className={`relative w-full bg-black rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(34,211,238,0.12)] transition-all duration-300 ${
          isTheater ? 'max-w-none h-[82vh]' : 'aspect-[16/10] max-h-[75vh] min-h-[440px]'
        }`}
      >
        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-[#06070a] flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin shadow-[0_0_15px_rgba(34,211,238,0.4)]" />
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
              Initializing {game.title}...
            </p>
          </div>
        )}

        {/* Game Iframe */}
        {game.iframeHtml ? (
          <div 
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: game.iframeHtml }} 
          />
        ) : (
          <iframe
            key={iframeKey}
            ref={iframeRef}
            src={game.iframeUrl}
            srcDoc={srcDocContent}
            title={game.title}
            className="w-full h-full border-0"
            allow="autoplay; fullscreen; gamepad; accelerometer; gyroscope; pointer-lock"
            sandbox="allow-scripts allow-popups allow-forms allow-same-origin allow-popups-to-escape-sandbox allow-downloads allow-pointer-lock allow-storage-access-by-user-activation"
            onLoad={() => setIsLoading(false)}
          />
        )}
      </div>

      {/* Game Info & Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left 2 Cols: Description & Details */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase text-cyan-400 tracking-widest flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              Game Intel • {game.title}
            </h2>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1 text-cyan-400 font-mono font-bold">
                <Star className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
                {game.rating.toFixed(1)}★
              </span>
              <span className="flex items-center gap-1 font-mono text-gray-500">
                <Users className="w-3.5 h-3.5 text-gray-500" />
                {game.plays.toLocaleString()} plays
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-300 leading-relaxed font-sans">
            {game.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {game.tags.map((tag) => (
              <span 
                key={tag}
                className="px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/5 text-gray-400 border border-white/10"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right Col: Controls Guide */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
          <h2 className="text-sm font-black uppercase text-fuchsia-400 tracking-widest flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-fuchsia-400" />
            Keybind Matrix
          </h2>

          <div className="space-y-2.5">
            {game.controls && game.controls.length > 0 ? (
              game.controls.map((ctrl, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs"
                >
                  <span className="font-mono font-bold px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_8px_rgba(34,211,238,0.2)]">
                    {ctrl.key}
                  </span>
                  <span className="text-gray-300 font-bold uppercase tracking-wider text-[11px]">
                    {ctrl.action}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-400 py-2">
                Use standard mouse click or Arrow keys / WASD to interact.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Recommended / Related Games Carousel */}
      {relatedGames.length > 0 && (
        <div className="pt-4 space-y-3">
          <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-cyan-400" />
            Related Titles in {game.category}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {relatedGames.map((relGame) => (
              <div
                key={relGame.id}
                onClick={() => onSelectGame(relGame)}
                className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 rounded-2xl overflow-hidden cursor-pointer transition-all p-2 flex flex-col gap-2 shadow-lg hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
              >
                <div className="aspect-[16/10] bg-black/40 rounded-xl overflow-hidden relative border border-white/5">
                  <img
                    src={relGame.thumbnail}
                    alt={relGame.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                </div>
                <h4 className="font-black text-xs text-gray-200 uppercase tracking-tight group-hover:text-cyan-400 line-clamp-1">
                  {relGame.title}
                </h4>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
