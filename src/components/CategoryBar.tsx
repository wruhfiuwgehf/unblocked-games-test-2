import React from 'react';
import { GameCategory } from '../types';
import { 
  Sparkles, 
  Flame, 
  Sword, 
  Gamepad2, 
  Puzzle, 
  Clock, 
  Coffee, 
  Trophy, 
  BrainCircuit,
  ArrowUpDown
} from 'lucide-react';

interface CategoryBarProps {
  selectedCategory: GameCategory | 'Favorites';
  onSelectCategory: (cat: GameCategory | 'Favorites') => void;
  categoryCounts: Record<string, number>;
  sortBy: 'popular' | 'rating' | 'title';
  setSortBy: (sort: 'popular' | 'rating' | 'title') => void;
}

const categories: { name: GameCategory; icon: React.FC<{ className?: string }> }[] = [
  { name: 'All', icon: Sparkles },
  { name: 'Action', icon: Sword },
  { name: 'Arcade', icon: Gamepad2 },
  { name: 'Puzzle', icon: Puzzle },
  { name: 'Retro', icon: Clock },
  { name: 'Casual', icon: Coffee },
  { name: 'Sports', icon: Trophy },
  { name: 'Strategy', icon: BrainCircuit },
];

export const CategoryBar: React.FC<CategoryBarProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  sortBy,
  setSortBy,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
      
      {/* Categories Horizontal Scroll */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.name;
          const count = categoryCounts[cat.name] || 0;

          return (
            <button
              key={cat.name}
              id={`cat-btn-${cat.name.toLowerCase()}`}
              onClick={() => onSelectCategory(cat.name)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.3)] ring-1 ring-cyan-400/40'
                  : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 border border-white/10 hover:border-white/20'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-gray-400'}`} />
              <span>{cat.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono font-bold ${
                isSelected ? 'bg-cyan-500/30 text-cyan-200' : 'bg-black/40 text-gray-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sort Option */}
      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1">
          <ArrowUpDown className="w-3 h-3 text-cyan-400" />
          Sort:
        </span>
        <select
          id="sort-games-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          aria-label="Sort games"
          className="bg-black/50 border border-white/10 text-gray-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500/50 font-bold uppercase tracking-wider"
        >
          <option value="popular">Most Played</option>
          <option value="rating">Highest Rated</option>
          <option value="title">Alphabetical (A-Z)</option>
        </select>
      </div>

    </div>
  );
};
