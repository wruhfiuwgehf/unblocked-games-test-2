import React, { useState } from 'react';
import { GameItem } from '../types';
import { Play, Star, Bookmark, Users, Code, Gamepad2 } from 'lucide-react';

interface GameCardProps {
  game: GameItem;
  onPlay: (game: GameItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, gameId: string) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  onPlay,
  isFavorite,
  onToggleFavorite,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const formattedPlays = game.plays >= 1000 ? `${(game.plays / 1000).toFixed(0)}k` : game.plays;

  const isHotOrTrending = game.badge === 'Hot' || game.badge === 'Trending' || game.badge === 'Extreme';

  return (
    <div
      id={`game-card-${game.id}`}
      onClick={() => onPlay(game)}
      className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 rounded-2xl p-3 flex flex-col gap-3 cursor-pointer transition-all duration-200 hover:shadow-[0_0_25px_rgba(34,211,238,0.2)] hover:-translate-y-1"
    >
      {/* Thumbnail Aspect Box */}
      <div className="relative w-full aspect-[16/10] bg-black/40 rounded-xl overflow-hidden border border-white/5">
        {!imgFailed ? (
          <img
            src={game.thumbnail}
            alt={game.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-85 group-hover:opacity-100"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cyan-950/40 via-zinc-900 to-fuchsia-950/40 flex flex-col items-center justify-center p-4">
            <Gamepad2 className="w-8 h-8 text-cyan-400/70 mb-1" />
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 text-center line-clamp-1">{game.title}</span>
          </div>
        )}

        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges & Favorite */}
        <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {game.badge && (
              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest shadow-sm backdrop-blur-md ${
                isHotOrTrending 
                  ? 'bg-fuchsia-500 text-black shadow-[0_0_10px_rgba(217,70,239,0.6)]' 
                  : 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(34,211,238,0.6)]'
              }`}>
                {game.badge}
              </span>
            )}
            {game.isCustom && (
              <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-amber-400 text-black flex items-center gap-1 shadow-sm">
                <Code className="w-2.5 h-2.5" />
                Custom
              </span>
            )}
          </div>

          <button
            id={`fav-btn-${game.id}`}
            onClick={(e) => onToggleFavorite(e, game.id)}
            className={`p-1.5 rounded-lg backdrop-blur-md transition-all pointer-events-auto ${
              isFavorite
                ? 'bg-fuchsia-500/30 text-fuchsia-300 border border-fuchsia-500/50 shadow-[0_0_10px_rgba(217,70,239,0.4)]'
                : 'bg-black/60 text-gray-400 hover:text-white hover:bg-black/80 border border-white/10'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-fuchsia-400 text-fuchsia-400' : ''}`} />
          </button>
        </div>

        {/* Hover Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/40 backdrop-blur-[2px]">
          <div className="w-11 h-11 rounded-xl bg-white text-black flex items-center justify-center shadow-lg shadow-white/20 scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-black translate-x-0.5" />
          </div>
        </div>

        {/* Bottom category badge */}
        <div className="absolute bottom-2 left-2">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/70 text-gray-300 border border-white/10 backdrop-blur-md">
            {game.category}
          </span>
        </div>
      </div>

      {/* Card Info */}
      <div className="flex flex-col flex-1 justify-between gap-2 px-1">
        <div>
          <h3 className="font-black text-sm text-gray-100 uppercase tracking-tight group-hover:text-cyan-400 transition-colors line-clamp-1">
            {game.title}
          </h3>
          <p className="text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed">
            {game.description}
          </p>
        </div>

        {/* Footer Metrics */}
        <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-white/10 mt-auto">
          <div className="flex items-center gap-1 font-mono font-bold text-cyan-400">
            <Star className="w-3 h-3 fill-cyan-400 text-cyan-400" />
            <span>{game.rating.toFixed(1)}★</span>
          </div>

          <div className="flex items-center gap-1 font-mono text-gray-500">
            <Users className="w-3 h-3 text-gray-600" />
            <span>{formattedPlays} plays</span>
          </div>
        </div>
      </div>
    </div>
  );
};
