import React, { useState } from 'react';
import { GameItem, GameCategory } from '../types';
import { X, PlusCircle, Code, Eye, AlertCircle } from 'lucide-react';

interface AddGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGame: (game: GameItem) => void;
}

export const AddGameModal: React.FC<AddGameModalProps> = ({
  isOpen,
  onClose,
  onAddGame,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GameCategory>('Arcade');
  const [embedType, setEmbedType] = useState<'url' | 'code'>('url');
  const [iframeUrl, setIframeUrl] = useState('');
  const [iframeHtml, setIframeHtml] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [controlsKey, setControlsKey] = useState('WASD / Arrow Keys');
  const [controlsAction, setControlsAction] = useState('Move / Action');
  const [tagsInput, setTagsInput] = useState('custom, unblocked, web');
  const [previewActive, setPreviewActive] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a game title.');
      return;
    }
    if (embedType === 'url' && !iframeUrl.trim()) {
      setError('Please enter a valid game iframe URL.');
      return;
    }
    if (embedType === 'code' && !iframeHtml.trim()) {
      setError('Please enter iframe HTML code.');
      return;
    }

    const newGame: GameItem = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      category: category,
      description: description.trim() || 'Custom embedded game added by user.',
      thumbnail: thumbnail.trim() || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
      badge: 'Custom',
      rating: 5.0,
      plays: 1,
      featured: false,
      iframeUrl: embedType === 'url' ? iframeUrl.trim() : undefined,
      iframeHtml: embedType === 'code' ? iframeHtml.trim() : undefined,
      controls: [
        { key: controlsKey || 'Keys', action: controlsAction || 'Action' }
      ],
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      author: 'User Embed',
      isCustom: true
    };

    onAddGame(newGame);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#06070a] border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.9)] p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-fuchsia-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(34,211,238,0.4)]">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black italic uppercase tracking-tighter text-base sm:text-lg text-white">Embed Custom Game</h2>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Add direct HTML5 game URLs or iframe source code</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-400 font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Game Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setError(''); }}
                placeholder="e.g. Neon Horizon"
                className="w-full px-3.5 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-gray-100 placeholder-gray-600 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GameCategory)}
                className="w-full px-3.5 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-gray-100 focus:outline-none focus:border-cyan-500/60 font-bold uppercase tracking-wider"
              >
                <option value="Action">Action</option>
                <option value="Arcade">Arcade</option>
                <option value="Puzzle">Puzzle</option>
                <option value="Retro">Retro</option>
                <option value="Casual">Casual</option>
                <option value="Sports">Sports</option>
                <option value="Strategy">Strategy</option>
              </select>
            </div>
          </div>

          {/* Embed Mode Switch */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Embed Source Type
              </label>
              <div className="flex bg-black/50 p-0.5 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setEmbedType('url')}
                  className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                    embedType === 'url' ? 'bg-cyan-500 text-black shadow-sm font-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Direct URL
                </button>
                <button
                  type="button"
                  onClick={() => setEmbedType('code')}
                  className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                    embedType === 'code' ? 'bg-cyan-500 text-black shadow-sm font-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Iframe HTML
                </button>
              </div>
            </div>

            {embedType === 'url' ? (
              <input
                type="url"
                value={iframeUrl}
                onChange={(e) => { setIframeUrl(e.target.value); setError(''); }}
                placeholder="https://example.com/games/mygame/index.html"
                className="w-full px-3.5 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-gray-100 font-mono placeholder-gray-600 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all"
              />
            ) : (
              <textarea
                rows={3}
                value={iframeHtml}
                onChange={(e) => { setIframeHtml(e.target.value); setError(''); }}
                placeholder='<iframe src="https://example.com/embed" width="100%" height="100%" frameborder="0"></iframe>'
                className="w-full px-3.5 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-gray-100 font-mono placeholder-gray-600 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all"
              />
            )}
          </div>

          {/* Description & Thumbnail */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Description (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of how to play..."
                className="w-full px-3.5 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-gray-100 placeholder-gray-600 focus:outline-none focus:border-cyan-500/60"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Thumbnail URL (Optional)
              </label>
              <input
                type="url"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-gray-100 placeholder-gray-600 focus:outline-none focus:border-cyan-500/60"
              />
            </div>
          </div>

          {/* Controls Config */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Primary Control Keys
              </label>
              <input
                type="text"
                value={controlsKey}
                onChange={(e) => setControlsKey(e.target.value)}
                placeholder="e.g. WASD / Space"
                className="w-full px-3.5 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-gray-100 placeholder-gray-600 focus:outline-none focus:border-cyan-500/60"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Control Action
              </label>
              <input
                type="text"
                value={controlsAction}
                onChange={(e) => setControlsAction(e.target.value)}
                placeholder="e.g. Steer / Boost"
                className="w-full px-3.5 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-gray-100 placeholder-gray-600 focus:outline-none focus:border-cyan-500/60"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="action, unblocked, 3d"
              className="w-full px-3.5 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-gray-100 placeholder-gray-600 focus:outline-none focus:border-cyan-500/60"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-white hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all"
            >
              Save & Play
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
