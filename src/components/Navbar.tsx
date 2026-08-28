import React from 'react';
import { 
  Gamepad2, 
  Search, 
  Shuffle, 
  EyeOff, 
  PlusCircle, 
  Bookmark, 
  Sparkles,
  X
} from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onRandomGame: () => void;
  onOpenCloakModal: () => void;
  onOpenAddModal: () => void;
  showFavoritesOnly: boolean;
  setShowFavoritesOnly: (fav: boolean) => void;
  favoritesCount: number;
  totalGamesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  setSearchQuery,
  onRandomGame,
  onOpenCloakModal,
  onOpenAddModal,
  showFavoritesOnly,
  setShowFavoritesOnly,
  favoritesCount,
  totalGamesCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#06070a]/80 backdrop-blur-md shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div 
          onClick={() => { setSearchQuery(''); setShowFavoritesOnly(false); }}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.4)] group-hover:scale-105 transition-transform">
            <Gamepad2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tighter italic uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
                VORTEX ARCADE
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_8px_rgba(34,211,238,0.25)]">
                UNBLOCKED
              </span>
            </div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest -mt-0.5">
              {totalGamesCount} Games Active
            </p>
          </div>
        </div>

        {/* Live Search Field */}
        <div className="flex-1 max-w-md mx-2 relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 pointer-events-none" />
            <input
              id="game-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search games, categories, tags..."
              className="w-full pl-10 pr-9 py-2 bg-black/40 border border-white/10 rounded-full text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 shadow-inner focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-0.5 text-gray-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Favorites Filter */}
          <button
            id="nav-favorites-btn"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              showFavoritesOnly 
                ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/50 shadow-[0_0_12px_rgba(217,70,239,0.3)]'
                : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 hover:border-white/20'
            }`}
            title="View saved favorite games"
          >
            <Bookmark className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-fuchsia-400 text-fuchsia-400' : ''}`} />
            <span className="hidden sm:inline">Favorites</span>
            {favoritesCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-fuchsia-500/30 text-fuchsia-200 font-mono font-bold">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Random Game */}
          <button
            id="nav-random-btn"
            onClick={onRandomGame}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 hover:border-cyan-500/40 transition-all group"
            title="Launch a random game"
          >
            <Shuffle className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-45 transition-transform" />
            <span className="hidden md:inline">Random</span>
          </button>

          {/* Tab Cloak / Stealth Panic */}
          <button
            id="nav-cloak-btn"
            onClick={onOpenCloakModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 hover:border-emerald-500/40 transition-all"
            title="Tab Cloak & Panic Button Settings"
          >
            <EyeOff className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Cloak</span>
          </button>

          {/* Add Custom Game */}
          <button
            id="nav-add-game-btn"
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-fuchsia-500 hover:from-cyan-300 hover:to-fuchsia-400 text-black shadow-[0_0_15px_rgba(34,211,238,0.4)] hover:scale-105 transition-all"
            title="Embed a new custom iframe game"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Game</span>
          </button>
        </div>

      </div>
    </header>
  );
};
