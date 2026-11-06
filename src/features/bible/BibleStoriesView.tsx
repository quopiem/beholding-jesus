import React, { useState } from 'react';
import { 
  BookMarked, Sparkles, Search, BookOpen, ChevronRight, 
  Heart, Filter, MessageSquare, Send, Check 
} from 'lucide-react';
import { BIBLE_STORIES_DATA, BibleStory } from './bibleStoriesData';
import { BibleStoryCardIllustration } from './BibleStoryCardIllustration';
import { BibleStoryReaderModal } from './BibleStoryReaderModal';

interface BibleStoriesViewProps {
  onNavigate: (tab: string) => void;
  onOpenInFullBible?: (bookId: string, chapter: number) => void;
}

export const BibleStoriesView: React.FC<BibleStoriesViewProps> = ({ 
  onNavigate,
  onOpenInFullBible 
}) => {
  const [selectedStory, setSelectedStory] = useState<BibleStory | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestionText, setSuggestionText] = useState('');
  const [isSuggestionSent, setIsSuggestionSent] = useState(false);

  const CATEGORIES = [
    'all',
    'The Life of Jesus',
    'Parables',
    'Women in the Bible',
    'New Testament',
    'Old Testament'
  ] as const;

  // Filtered stories by category and search
  const filteredStories = BIBLE_STORIES_DATA.filter(story => {
    const matchesCat = selectedCategory === 'all' || story.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.versesRange.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Group stories by section to match the reference screenshots
  const categoriesToDisplay = selectedCategory === 'all' 
    ? (['The Life of Jesus', 'Parables', 'Women in the Bible', 'New Testament', 'Old Testament'] as const)
    : [selectedCategory as any];

  const handleSendSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionText.trim()) return;
    setIsSuggestionSent(true);
    setSuggestionText('');
    setTimeout(() => setIsSuggestionSent(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0E0F15] text-stone-100 pb-36 pt-4 sm:pt-6">
      
      {/* ============================================================== */}
      {/* 1. TOP HEADER & TITLE (Matches Screenshot 3)                   */}
      {/* ============================================================== */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif font-black text-2xl sm:text-4xl text-white tracking-tight">
              Stories
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 mt-1">
              Immerse yourself in authentic biblical passages and pivotal moments of redemption
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('bible')}
            className="px-3.5 py-1.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold border border-stone-700 flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-gold" />
            <span className="hidden xs:inline">Standard</span> Bible
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search stories, characters, parables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#161720] border border-stone-800/80 text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-gold/60 transition"
          />
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition active:scale-95 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-gold to-amber-200 text-slate-950 shadow-gold'
                  : 'bg-[#181922] text-stone-300 hover:bg-[#222430] border border-stone-800/80'
              }`}
            >
              {cat === 'all' ? 'All Stories' : cat}
            </button>
          ))}
        </div>

      </div>

      {/* ============================================================== */}
      {/* 2. CATEGORY SECTIONS WITH 3-CARD GRIDS (Matches Screenshots)   */}
      {/* ============================================================== */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 space-y-10">
        
        {categoriesToDisplay.map(catTitle => {
          const storiesInCat = filteredStories.filter(s => s.category === catTitle);
          if (storiesInCat.length === 0) return null;

          return (
            <section key={catTitle} className="space-y-3.5">
              
              {/* Section Header */}
              <div className="flex items-center justify-between">
                <h2 className="font-serif font-black text-lg sm:text-xl text-white tracking-wide">
                  {catTitle}
                </h2>
                <span className="text-[11px] font-mono text-stone-400">
                  {storiesInCat.length} {storiesInCat.length === 1 ? 'story' : 'stories'}
                </span>
              </div>

              {/* 3-Card Grid matching Screenshot 2 & 3 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 sm:gap-5">
                {storiesInCat.map(story => (
                  <div
                    key={story.id}
                    onClick={() => setSelectedStory(story)}
                    className="flex flex-col group cursor-pointer text-left select-none"
                  >
                    {/* Visual Card with Illustration */}
                    <div className="relative aspect-[4/5] rounded-[22px] sm:rounded-[26px] bg-[#161720] border border-white/10 group-hover:border-gold/50 shadow-md group-hover:shadow-[0_8px_30px_rgba(197,164,109,0.2)] transition-all duration-300 overflow-hidden flex items-center justify-center p-3 sm:p-5">
                      
                      {/* Subtle ambient radial glow behind art */}
                      <div className="absolute inset-0 bg-radial from-white/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

                      {/* SVG Vector Artwork */}
                      <div className="relative w-full h-full flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
                        <BibleStoryCardIllustration theme={story.illustrationTheme} />
                      </div>

                      {/* Pill Badge with Scripture reference */}
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-mono text-gold font-bold">
                        {story.bookName} {story.chapter}
                      </div>
                    </div>

                    {/* Story Title Underneath */}
                    <div className="mt-2.5 px-1 space-y-0.5">
                      <h3 className="font-serif font-bold text-xs sm:text-sm text-stone-100 group-hover:text-gold transition-colors leading-snug">
                        {story.title}
                      </h3>
                      <p className="text-[11px] text-stone-400 font-sans truncate">
                        {story.versesRange}
                      </p>
                    </div>

                  </div>
                ))}
              </div>

            </section>
          );
        })}

        {filteredStories.length === 0 && (
          <div className="py-16 text-center space-y-3 bg-[#161720] rounded-3xl border border-stone-800 p-6">
            <BookMarked className="w-10 h-10 text-stone-500 mx-auto" />
            <h3 className="font-serif font-bold text-base text-white">No stories found</h3>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              We couldn't find any Bible story matching "{searchQuery}". Try selecting another category or clear the search.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="px-4 py-2 rounded-full bg-gold text-slate-950 font-bold text-xs shadow-gold hover:bg-gold-light transition"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* 3. BOTTOM FOOTER PROMPT (Exact Match to Screenshot 2)          */}
        {/* ============================================================== */}
        <div className="pt-8 pb-12 border-t border-stone-800/80 text-center space-y-3">
          <p className="font-serif font-semibold text-sm sm:text-base text-stone-200">
            Don’t see the Bible story you’re looking for?
          </p>

          {isSuggestionSent ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <Check className="w-4 h-4" />
              <span>Thank you! Your suggestion has been received by our pastoral team.</span>
            </div>
          ) : (
            <form onSubmit={handleSendSuggestion} className="max-w-md mx-auto flex items-center gap-2 px-2">
              <input
                type="text"
                placeholder="Let us know which Bible story you want added..."
                value={suggestionText}
                onChange={(e) => setSuggestionText(e.target.value)}
                className="flex-1 px-4 py-2 rounded-full bg-[#161720] border border-stone-800 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-gold"
              />
              <button
                type="submit"
                disabled={!suggestionText.trim()}
                className="px-4 py-2 rounded-full bg-gold disabled:opacity-50 text-slate-950 font-bold text-xs hover:bg-gold-light transition cursor-pointer shrink-0"
              >
                Let Us Know
              </button>
            </form>
          )}

          <p className="text-[11px] text-stone-500">
            Beholding Jesus Church &bull; Scripture Stories Ministry
          </p>
        </div>

      </div>

      {/* ============================================================== */}
      {/* 4. DEDICATED SCRIPTURE STORY READER MODAL                      */}
      {/* ============================================================== */}
      {selectedStory && (
        <BibleStoryReaderModal
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
          onSelectStory={(s) => setSelectedStory(s)}
          onOpenInFullBible={(bookId, chapter) => {
            setSelectedStory(null);
            if (onOpenInFullBible) {
              onOpenInFullBible(bookId, chapter);
            } else {
              onNavigate('bible');
            }
          }}
        />
      )}

    </div>
  );
};
