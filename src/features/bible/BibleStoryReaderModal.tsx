import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  ChevronLeft, ChevronRight, Settings, BookOpen, Share2, 
  Check, ArrowRight, Sparkles, SlidersHorizontal 
} from 'lucide-react';
import { BibleStory, BIBLE_STORIES_DATA } from './bibleStoriesData';

interface BibleStoryReaderModalProps {
  story: BibleStory | null;
  onClose: () => void;
  onSelectStory: (story: BibleStory) => void;
  onOpenInFullBible?: (bookId: string, chapter: number) => void;
}

export const BibleStoryReaderModal: React.FC<BibleStoryReaderModalProps> = ({
  story,
  onClose,
  onSelectStory,
  onOpenInFullBible
}) => {
  // Reading preferences
  const [fontSizePx, setFontSizePx] = useState<number>(18);
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');
  const [readingTheme, setReadingTheme] = useState<'dark' | 'midnight' | 'sepia' | 'light'>('dark');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  // Lock body scroll while reading modal is open
  useEffect(() => {
    if (!story) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [story]);

  // Keyboard navigation: Escape closes, ArrowLeft/Right navigates
  useEffect(() => {
    if (!story) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [story, onClose]);

  if (!story || typeof document === 'undefined') return null;

  const allStories = BIBLE_STORIES_DATA;
  const currentIndex = allStories.findIndex(s => s.id === story.id);
  const total = allStories.length;

  const handlePrev = () => {
    const prevIdx = (currentIndex - 1 + total) % total;
    onSelectStory(allStories[prevIdx]);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % total;
    onSelectStory(allStories[nextIdx]);
  };

  // Theme styling classes
  const themeClasses = {
    dark: 'bg-[#12131A] text-[#F3F4F6] border-stone-800',
    midnight: 'bg-[#090A0F] text-[#F8FAFC] border-slate-900',
    sepia: 'bg-[#F4ECD8] text-[#2C2416] border-[#E3D4B8]',
    light: 'bg-[#FAFAF8] text-[#1E293B] border-stone-200'
  }[readingTheme];

  const pillThemeClasses = {
    dark: 'bg-[#1F222E] text-stone-200 border-stone-700/60',
    midnight: 'bg-[#151824] text-slate-200 border-slate-800',
    sepia: 'bg-[#E7DBC2] text-[#423420] border-[#D6C4A3]',
    light: 'bg-stone-200/80 text-stone-800 border-stone-300'
  }[readingTheme];

  const handleShare = () => {
    const text = `${story.title} (${story.versesRange})\n\n"${story.verses[0]?.text || ''}"\n\nRead on Beholding Jesus Church Community Platform`;
    if (navigator.share) {
      navigator.share({ title: story.title, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopiedToast('Story scripture copied to clipboard!');
      setTimeout(() => setCopiedToast(null), 2500);
    }
  };

  return createPortal(
    <div 
      className={`fixed inset-0 z-[100] ${themeClasses} flex flex-col overflow-hidden animate-in fade-in duration-200`}
    >
      {/* ============================================================== */}
      {/* 1. TOP HEADER BAR (Exact Match to Screenshot 1)                */}
      {/* ============================================================== */}
      <header className={`shrink-0 px-4 sm:px-6 py-3 pt-[max(env(safe-area-inset-top),16px)] border-b ${themeClasses} flex items-center justify-between z-20`}>
        {/* Left: "Done" button */}
        <button
          type="button"
          onClick={onClose}
          className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition active:scale-95 cursor-pointer shadow-xs ${pillThemeClasses}`}
        >
          Done
        </button>

        {/* Center: Story Title */}
        <div className="flex-1 text-center px-3 min-w-0">
          <h2 className="font-serif font-black text-sm sm:text-base tracking-wide truncate">
            {story.title}
          </h2>
          <span className="text-[10px] opacity-60 tracking-wider uppercase font-sans">
            {story.category}
          </span>
        </div>

        {/* Right: Settings Gear */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleShare}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition active:scale-95 cursor-pointer ${pillThemeClasses}`}
            title="Share Story"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition active:scale-95 cursor-pointer ${pillThemeClasses}`}
            title="Reading Settings"
          >
            <Settings className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. SUB-HEADER BAR: Selector Pills [Luke 2] [NIV]               */}
      {/* ============================================================== */}
      <div className={`shrink-0 px-4 sm:px-6 py-2.5 border-b ${themeClasses} flex items-center justify-between text-xs`}>
        <div className="flex items-center gap-2">
          {/* Book & Chapter Pill */}
          <div className={`px-3 py-1 rounded-xl font-bold border flex items-center gap-1.5 shadow-2xs ${pillThemeClasses}`}>
            <span>{story.bookName} {story.chapter}</span>
          </div>

          {/* Translation Pill */}
          <div className={`px-2.5 py-1 rounded-xl font-bold border tracking-wider text-[11px] shadow-2xs ${pillThemeClasses}`}>
            <span>{story.translation}</span>
          </div>
        </div>

        {/* Jump to Full Bible View */}
        {onOpenInFullBible && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenInFullBible(story.bookId, story.chapter);
            }}
            className="flex items-center gap-1 text-[11px] font-bold text-gold hover:underline transition cursor-pointer"
          >
            <span>Open in Full Bible</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Optional Settings Drawer Popover */}
      {isSettingsOpen && (
        <div className={`shrink-0 px-4 sm:px-6 py-3 border-b border-gold/30 bg-black/40 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs animate-in slide-in-from-top-2 duration-150`}>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-stone-400">Font:</span>
            <button
              onClick={() => setFontFamily('serif')}
              className={`px-3 py-1 rounded-lg font-serif font-bold ${fontFamily === 'serif' ? 'bg-gold text-slate-950' : 'bg-white/10 text-stone-300'}`}
            >
              Serif
            </button>
            <button
              onClick={() => setFontFamily('sans')}
              className={`px-3 py-1 rounded-lg font-sans font-bold ${fontFamily === 'sans' ? 'bg-gold text-slate-950' : 'bg-white/10 text-stone-300'}`}
            >
              Sans
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-semibold text-stone-400">Size:</span>
            <button
              onClick={() => setFontSizePx(prev => Math.max(14, prev - 2))}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 font-bold"
            >
              A-
            </button>
            <span className="font-mono text-xs">{fontSizePx}px</span>
            <button
              onClick={() => setFontSizePx(prev => Math.min(28, prev + 2))}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 font-bold"
            >
              A+
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-400">Theme:</span>
            {(['dark', 'midnight', 'sepia', 'light'] as const).map(th => (
              <button
                key={th}
                onClick={() => setReadingTheme(th)}
                className={`px-2.5 py-1 rounded-lg capitalize text-[11px] font-bold ${readingTheme === th ? 'ring-2 ring-gold' : 'opacity-70'}`}
              >
                {th}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Copy Toast */}
      {copiedToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-xl animate-in fade-in flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{copiedToast}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. SCRIPTURE TEXT READING BODY (Exact Match to Screenshot 1)   */}
      {/* ============================================================== */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-3xl mx-auto w-full overscroll-contain">
        {/* Story Intro Tagline */}
        <div className="mb-6 pb-4 border-b border-white/10">
          <p className="text-xs sm:text-sm text-gold font-medium italic leading-relaxed">
            {story.summary}
          </p>
          <div className="mt-2 text-[11px] font-mono opacity-50 tracking-wider">
            {story.versesRange} &bull; Holy Bible, {story.translation}
          </div>
        </div>

        {/* Verses Layout with Super-scripted Numbers */}
        <div 
          className={`space-y-4 leading-relaxed ${fontFamily === 'serif' ? 'font-serif' : 'font-sans'}`}
          style={{ fontSize: `${fontSizePx}px`, lineHeight: 1.75 }}
        >
          {story.verses.map((v) => (
            <div key={v.verse} className="flex items-baseline gap-2 group hover:bg-white/5 p-1 rounded-lg transition-colors">
              <span className="text-[0.68em] font-mono font-bold text-gold opacity-80 select-none shrink-0 align-super">
                {v.verse}
              </span>
              <p className="flex-1">
                {v.text}
              </p>
            </div>
          ))}
        </div>

        {/* Story Complete End Marker */}
        <div className="mt-12 pt-6 border-t border-white/10 text-center pb-24 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/15 text-gold text-xs font-bold border border-gold/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Story Passage Complete &bull; {story.versesRange}</span>
          </div>

          <p className="text-xs opacity-60 max-w-md mx-auto leading-relaxed">
            &ldquo;Faith comes from hearing, and hearing through the word of Christ.&rdquo; &mdash; Romans 10:17
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handlePrev}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${pillThemeClasses}`}
            >
              &larr; Previous Story
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gold text-slate-950 hover:bg-gold-light transition cursor-pointer shadow-gold"
            >
              Next Story &rarr;
            </button>
          </div>
        </div>
      </main>

      {/* ============================================================== */}
      {/* 4. FLOATING BOTTOM NAVIGATION BUTTONS (< and > as in image 1)  */}
      {/* ============================================================== */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center justify-between w-[calc(100%-32px)] max-w-sm pointer-events-none">
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={handlePrev}
          className="pointer-events-auto min-w-[46px] min-h-[46px] w-12 h-12 rounded-full bg-[#1E222E]/95 hover:bg-[#2B3042] text-white flex items-center justify-center border border-white/20 shadow-2xl transition active:scale-90 cursor-pointer backdrop-blur-xl group"
          title="Previous Story (←)"
          aria-label="Previous Story"
        >
          <ChevronLeft className="w-6 h-6 text-gold group-hover:scale-110 transition-transform" />
        </button>

        {/* Current Story Counter Pill */}
        <div className="pointer-events-auto px-3.5 py-1.5 rounded-full bg-[#12131A]/90 backdrop-blur-xl border border-white/15 text-[11px] font-mono text-stone-300 shadow-xl">
          {currentIndex + 1} / {total}
        </div>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={handleNext}
          className="pointer-events-auto min-w-[46px] min-h-[46px] w-12 h-12 rounded-full bg-[#1E222E]/95 hover:bg-[#2B3042] text-white flex items-center justify-center border border-white/20 shadow-2xl transition active:scale-90 cursor-pointer backdrop-blur-xl group"
          title="Next Story (→)"
          aria-label="Next Story"
        >
          <ChevronRight className="w-6 h-6 text-gold group-hover:scale-110 transition-transform" />
        </button>
      </div>

    </div>,
    document.body
  );
};
