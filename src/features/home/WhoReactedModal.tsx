import React, { useState } from 'react';
import { X, Heart, Sparkles } from 'lucide-react';
import { FeedPost, FeedReactionType, FEED_REACTIONS } from '../../types';

interface WhoReactedModalProps {
  post: FeedPost | null;
  onClose: () => void;
}

export const WhoReactedModal: React.FC<WhoReactedModalProps> = ({ post, onClose }) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | FeedReactionType>('all');

  if (!post) return null;

  const reactions = post.reactions || [];
  const filteredReactions = selectedFilter === 'all'
    ? reactions
    : reactions.filter(r => r.reactionType === selectedFilter);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-stone-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white flex items-center gap-2">
            <span>People who reacted</span>
            <span className="text-xs text-stone-400 font-sans">({reactions.length})</span>
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Reaction Filter Tabs */}
        <div className="px-3 py-2 flex items-center gap-1.5 overflow-x-auto border-b border-stone-100 dark:border-slate-800 text-xs no-scrollbar">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1 rounded-full font-bold transition cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-stone-900 dark:bg-gold text-white dark:text-slate-950 shadow-xs'
                : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-slate-800'
            }`}
          >
            All ({reactions.length})
          </button>

          {(['pray', 'love', 'celebrate', 'like', 'care'] as FeedReactionType[]).map(type => {
            const count = post.reactionCounts[type] || 0;
            if (count === 0 && !reactions.some(r => r.reactionType === type)) return null;

            const meta = FEED_REACTIONS[type];
            return (
              <button
                key={type}
                onClick={() => setSelectedFilter(type)}
                className={`px-2.5 py-1 rounded-full font-semibold transition cursor-pointer flex items-center gap-1 ${
                  selectedFilter === type
                    ? 'bg-stone-900 dark:bg-gold text-white dark:text-slate-950 shadow-xs'
                    : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{meta.emoji}</span>
                <span>{count}</span>
              </button>
            );
          })}
        </div>

        {/* User Reaction List */}
        <div className="p-3 max-h-80 overflow-y-auto space-y-2">
          {filteredReactions.length > 0 ? (
            filteredReactions.map(rx => {
              const meta = FEED_REACTIONS[rx.reactionType];
              return (
                <div key={rx.id} className="p-2 rounded-2xl hover:bg-stone-50 dark:hover:bg-slate-800/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-stone-200 dark:border-slate-700">
                        <img src={rx.userAvatar || '/icons/church-logo.png'} alt={rx.userName} className="w-full h-full object-cover" />
                      </div>
                      <span className="absolute -bottom-1 -right-1 text-sm bg-white dark:bg-slate-800 rounded-full shadow-xs">
                        {meta.emoji}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white truncate">
                        {rx.userName}
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400">
                        Reacted with {meta.label}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] text-stone-400 shrink-0">
                    {new Date(rx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-stone-400">
              No reactions in this category.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
