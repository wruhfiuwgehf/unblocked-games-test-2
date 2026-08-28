/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import initialGamesData from './data/games.json';
import { GameItem, GameCategory, CloakPreset } from './types';
import { Navbar } from './components/Navbar';
import { CategoryBar } from './components/CategoryBar';
import { GameCard } from './components/GameCard';
import { GamePlayer } from './components/GamePlayer';
import { AddGameModal } from './components/AddGameModal';
import { CloakModal } from './components/CloakModal';
import { Footer } from './components/Footer';
import { 
  Flame, 
  Sparkles, 
  History, 
  Bookmark, 
  SearchX, 
  Zap, 
  Play, 
  Shuffle,
  ShieldCheck,
  Gamepad2,
  Trophy,
  Radio,
  Target,
  CheckCircle2,
  ChevronRight,
  Award
} from 'lucide-react';

export default function App() {
  // 1. Games state (JSON source + custom local games)
  const [games, setGames] = useState<GameItem[]>(() => {
    const rawSaved = localStorage.getItem('unblocked_custom_games');
    const customList: GameItem[] = rawSaved ? JSON.parse(rawSaved) : [];
    return [...(initialGamesData as GameItem[]), ...customList];
  });

  // 2. Active selected game for playing
  const [activeGame, setActiveGame] = useState<GameItem | null>(null);

  // 3. User favorites list
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('unblocked_favorites');
    return saved ? JSON.parse(saved) : ['2048-classic', 'snake-neon', 'flappy-bird-classic'];
  });

  // 4. Recently played list
  const [recents, setRecents] = useState<string[]>(() => {
    const saved = localStorage.getItem('unblocked_recents');
    return saved ? JSON.parse(saved) : [];
  });

  // 5. Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | 'Favorites'>('All');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'title'>('popular');

  // 6. Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCloakModalOpen, setIsCloakModalOpen] = useState(false);

  // 7. Cloak & Panic settings
  const [activeCloak, setActiveCloak] = useState<string>(() => {
    return localStorage.getItem('unblocked_cloak_id') || 'default';
  });
  const [panicKey, setPanicKey] = useState<string>(() => {
    return localStorage.getItem('unblocked_panic_key') || 'Escape';
  });
  const [panicUrl, setPanicUrl] = useState<string>(() => {
    return localStorage.getItem('unblocked_panic_url') || 'https://classroom.google.com';
  });

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('unblocked_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Save recents to localStorage
  useEffect(() => {
    localStorage.setItem('unblocked_recents', JSON.stringify(recents));
  }, [recents]);

  // Save panic settings
  useEffect(() => {
    localStorage.setItem('unblocked_panic_key', panicKey);
    localStorage.setItem('unblocked_panic_url', panicUrl);
  }, [panicKey, panicUrl]);

  // Global Panic Key Listener
  useEffect(() => {
    const handlePanic = (e: KeyboardEvent) => {
      if (e.key === panicKey) {
        window.location.href = panicUrl;
      }
    };
    window.addEventListener('keydown', handlePanic);
    return () => window.removeEventListener('keydown', handlePanic);
  }, [panicKey, panicUrl]);

  // Apply tab disguise
  const handleApplyCloak = (preset: CloakPreset | null) => {
    if (!preset) {
      document.title = 'Unblocked Games Portal';
      setActiveCloak('default');
      localStorage.removeItem('unblocked_cloak_id');
      const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (link) link.href = '/favicon.ico';
      return;
    }

    document.title = preset.title;
    setActiveCloak(preset.id);
    localStorage.setItem('unblocked_cloak_id', preset.id);

    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = preset.icon;
  };

  // Toggle favorite
  const handleToggleFavorite = (e: React.MouseEvent, gameId: string) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(gameId) ? prev.filter(id => id !== gameId) : [...prev, gameId]
    );
  };

  // Play Game Handler
  const handlePlayGame = (game: GameItem) => {
    setActiveGame(game);
    // Add to recents
    setRecents(prev => [game.id, ...prev.filter(id => id !== game.id)].slice(0, 8));
    // Increment local play count
    setGames(prev => prev.map(g => g.id === game.id ? { ...g, plays: g.plays + 1 } : g));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add Custom Game Handler
  const handleAddGame = (newGame: GameItem) => {
    const updated = [newGame, ...games];
    setGames(updated);
    const customList = updated.filter(g => g.isCustom);
    localStorage.setItem('unblocked_custom_games', JSON.stringify(customList));
    handlePlayGame(newGame);
  };

  // Pick a random game
  const handleRandomGame = () => {
    if (games.length === 0) return;
    const randomIndex = Math.floor(Math.random() * games.length);
    handlePlayGame(games[randomIndex]);
  };

  // Filtered & Sorted Games List
  const filteredGames = useMemo(() => {
    return games
      .filter(game => {
        // Search text matching
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = game.title.toLowerCase().includes(q);
          const matchCategory = game.category.toLowerCase().includes(q);
          const matchTags = game.tags.some(t => t.toLowerCase().includes(q));
          const matchDesc = game.description.toLowerCase().includes(q);
          if (!matchTitle && !matchCategory && !matchTags && !matchDesc) return false;
        }

        // Favorites filter
        if (showFavoritesOnly || selectedCategory === 'Favorites') {
          if (!favorites.includes(game.id)) return false;
        }

        // Category filter
        if (selectedCategory !== 'All' && selectedCategory !== 'Favorites') {
          if (game.category !== selectedCategory) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return b.plays - a.plays;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [games, searchQuery, selectedCategory, showFavoritesOnly, favorites, sortBy]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: games.length };
    games.forEach(g => {
      counts[g.category] = (counts[g.category] || 0) + 1;
    });
    return counts;
  }, [games]);

  // Featured game for hero banner
  const featuredGame = useMemo(() => {
    return games.find(g => g.id === '2048-classic') || games[0];
  }, [games]);

  // Recent game items
  const recentGames = useMemo(() => {
    return recents
      .map(id => games.find(g => g.id === id))
      .filter((g): g is GameItem => Boolean(g));
  }, [recents, games]);

  // Related games for active player
  const relatedGames = useMemo(() => {
    if (!activeGame) return [];
    return games
      .filter(g => g.id !== activeGame.id && g.category === activeGame.category)
      .slice(0, 6);
  }, [activeGame, games]);

  return (
    <div className="min-h-screen bg-[#06070a] text-gray-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* Top Navigation */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onRandomGame={handleRandomGame}
        onOpenCloakModal={() => setIsCloakModalOpen(true)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        showFavoritesOnly={showFavoritesOnly}
        setShowFavoritesOnly={setShowFavoritesOnly}
        favoritesCount={favorites.length}
        totalGamesCount={games.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        
        {/* If a game is active -> render GamePlayer */}
        {activeGame ? (
          <GamePlayer
            game={activeGame}
            onClose={() => setActiveGame(null)}
            isFavorite={favorites.includes(activeGame.id)}
            onToggleFavorite={handleToggleFavorite}
            onSelectGame={handlePlayGame}
            relatedGames={relatedGames}
          />
        ) : (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150">
            
            {/* Grid Layout: Main Hero + Sidebar (when not searching and on 'All' category) */}
            {!searchQuery && selectedCategory === 'All' && !showFavoritesOnly && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Left 3 Cols: Immersive Featured Hero */}
                {featuredGame && (
                  <div 
                    id="hero-featured-banner"
                    onClick={() => handlePlayGame(featuredGame)}
                    className="lg:col-span-3 relative w-full min-h-[340px] sm:min-h-[400px] rounded-3xl overflow-hidden border border-white/10 p-6 sm:p-10 cursor-pointer group shadow-2xl hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] transition-all flex flex-col justify-end bg-black"
                  >
                    {/* Background Artwork Image */}
                    <img
                      src={featuredGame.thumbnail}
                      alt={featuredGame.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-75 group-hover:scale-105 transition-all duration-700"
                    />

                    {/* Gradient Overlay Mask */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#06070a] via-[#06070a]/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#06070a] via-[#06070a]/40 to-transparent" />

                    <div className="relative z-10 max-w-xl space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="bg-cyan-500 text-black text-xs font-black uppercase tracking-widest px-3 py-1 rounded shadow-[0_0_15px_rgba(34,211,238,0.6)]">
                          Featured Unblocked Classic
                        </span>
                        <span className="bg-black/60 text-cyan-300 text-xs font-mono font-bold px-2.5 py-1 rounded border border-white/10 backdrop-blur-md">
                          ★ {featuredGame.rating.toFixed(1)}
                        </span>
                      </div>
                      
                      <h1 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tighter text-white group-hover:text-cyan-400 transition-colors">
                        {featuredGame.title}
                      </h1>
                      
                      <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 leading-relaxed font-sans max-w-lg">
                        {featuredGame.description}
                      </p>

                      <div className="flex items-center gap-4 pt-2">
                        <button 
                          id="hero-play-btn"
                          className="px-8 py-3.5 bg-white hover:bg-cyan-400 text-black font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center gap-2.5 text-xs sm:text-sm"
                        >
                          <Play className="w-4 h-4 fill-black" />
                          Launch Game
                        </button>
                        <span className="text-xs text-gray-400 font-mono">
                          {featuredGame.plays.toLocaleString()} plays today
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Right 1 Col: Live Leaderboard & Daily Mission */}
                <div className="flex flex-col gap-5 justify-between">
                  {/* Live Leaderboard Card */}
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-xl backdrop-blur-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-cyan-400" />
                        <h3 className="font-black italic uppercase text-sm tracking-wider text-white">Live Ranks</h3>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        1,248 Online
                      </div>
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5">
                        <div className="flex items-center gap-2">
                          <span className="text-cyan-400 font-black">01</span>
                          <span className="text-gray-200 font-sans font-bold text-[11px]">Neon_Knight</span>
                        </div>
                        <span className="text-gray-400 font-bold">94,820</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 font-black">02</span>
                          <span className="text-gray-200 font-sans font-bold text-[11px]">VoidRunner</span>
                        </div>
                        <span className="text-gray-400 font-bold">88,150</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5">
                        <div className="flex items-center gap-2">
                          <span className="text-fuchsia-400 font-black">03</span>
                          <span className="text-gray-200 font-sans font-bold text-[11px]">CyberShift</span>
                        </div>
                        <span className="text-gray-400 font-bold">76,400</span>
                      </div>
                    </div>
                  </div>

                  {/* Daily Mission Card */}
                  <div className="bg-gradient-to-br from-fuchsia-600/20 to-purple-900/40 border border-fuchsia-500/30 rounded-3xl p-5 flex flex-col justify-center shadow-[inset_0_0_20px_rgba(255,0,242,0.1)] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-fuchsia-400 tracking-widest">Daily Quest</span>
                      <Target className="w-3.5 h-3.5 text-fuchsia-400" />
                    </div>
                    <div className="font-black text-sm uppercase italic tracking-tight text-white">Score 1024 in 2048</div>
                    <p className="text-[10px] text-gray-400">Unlock the Cyber Neon badge reward</p>
                    <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden mt-1 border border-white/10">
                      <div className="bg-gradient-to-r from-cyan-400 to-fuchsia-500 h-full w-2/3" />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Recently Played Strip */}
            {!searchQuery && recentGames.length > 0 && !showFavoritesOnly && (
              <div className="space-y-3 bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <History className="w-3.5 h-3.5 text-cyan-400" />
                    Jump Back In • Recent Sessions
                  </h2>
                  <button
                    onClick={() => setRecents([])}
                    className="text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    Clear History
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {recentGames.map((recGame) => (
                    <div
                      key={recGame.id}
                      onClick={() => handlePlayGame(recGame)}
                      className="group p-2 bg-black/40 hover:bg-white/10 border border-white/5 hover:border-cyan-500/40 rounded-2xl cursor-pointer transition-all flex flex-col gap-2"
                    >
                      <div className="aspect-[16/10] rounded-xl bg-black overflow-hidden relative border border-white/5">
                        <img
                          src={recGame.thumbnail}
                          alt={recGame.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      </div>
                      <span className="font-bold text-xs text-gray-300 group-hover:text-cyan-400 line-clamp-1">
                        {recGame.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category Filter & Sort Bar */}
            <CategoryBar
              selectedCategory={showFavoritesOnly ? 'Favorites' : selectedCategory}
              onSelectCategory={(cat) => {
                setShowFavoritesOnly(false);
                setSelectedCategory(cat);
              }}
              categoryCounts={categoryCounts}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />

            {/* Main Games Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-cyan-400" />
                  {showFavoritesOnly 
                    ? 'Saved Favorites' 
                    : searchQuery 
                      ? `Search Results for "${searchQuery}"`
                      : `${selectedCategory} Catalog`}
                  <span className="text-[10px] text-gray-500 font-mono">
                    [{filteredGames.length} TITLES]
                  </span>
                </h2>
              </div>

              {filteredGames.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                  {filteredGames.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      onPlay={handlePlayGame}
                      isFavorite={favorites.includes(game.id)}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center space-y-4 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 text-cyan-400 flex items-center justify-center mx-auto border border-white/10 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                    <SearchX className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black uppercase text-base text-gray-100">No Titles Found</h3>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                      {searchQuery 
                        ? `We couldn't find any games matching "${searchQuery}". Try a different keyword or category.`
                        : 'No games match the active filter criteria.'}
                    </p>
                  </div>
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setShowFavoritesOnly(false); }}
                    className="px-5 py-2.5 rounded-xl bg-white hover:bg-cyan-400 text-black text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <Footer
        totalGames={games.length}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenCloakModal={() => setIsCloakModalOpen(true)}
      />

      {/* Add Custom Game Modal */}
      <AddGameModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddGame={handleAddGame}
      />

      {/* Tab Cloak & Panic Modal */}
      <CloakModal
        isOpen={isCloakModalOpen}
        onClose={() => setIsCloakModalOpen(false)}
        activeCloak={activeCloak}
        onApplyCloak={handleApplyCloak}
        panicKey={panicKey}
        setPanicKey={setPanicKey}
        panicUrl={panicUrl}
        setPanicUrl={setPanicUrl}
      />

    </div>
  );
}
