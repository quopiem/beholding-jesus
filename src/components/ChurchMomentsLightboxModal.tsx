import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Sparkles, BookOpen, Heart, Eye } from 'lucide-react';
import { ChurchMomentPhoto } from '../features/landing/churchMomentsData';

interface ChurchMomentsLightboxModalProps {
  isOpen: boolean;
  photos: ChurchMomentPhoto[];
  currentIndex: number;
  onClose: () => void;
  onNavigateIndex: (index: number) => void;
}

export const ChurchMomentsLightboxModal: React.FC<ChurchMomentsLightboxModalProps> = ({
  isOpen,
  photos,
  currentIndex,
  onClose,
  onNavigateIndex
}) => {
  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex] || photos[0];
  const total = photos.length;

  const handleNext = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onNavigateIndex((currentIndex + 1) % total);
  }, [currentIndex, total, onNavigateIndex]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onNavigateIndex((currentIndex - 1 + total) % total);
  }, [currentIndex, total, onNavigateIndex]);

  // Keyboard navigation: Escape, ArrowLeft, ArrowRight
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handleNext, handlePrev]);

  // Download high-resolution photo
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = currentPhoto.imageUrl;
    const cleanName = currentPhoto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    a.download = `bjc-${cleanName}-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-2 sm:p-5 overflow-y-auto animate-fadeIn cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl bg-stone-950 text-white rounded-3xl border border-gold/30 shadow-2xl overflow-hidden flex flex-col my-auto cursor-default"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-stone-800 bg-stone-950/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${currentPhoto.badgeBg} ${currentPhoto.badgeText} ${currentPhoto.badgeBorder}`}>
              {currentPhoto.categoryLabel}
            </span>
            <span className="text-xs text-stone-400 font-mono">
              {currentIndex + 1} of {total}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="px-3 sm:px-4 py-1.5 rounded-full bg-gold hover:bg-gold-light text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
              title="Save Photo to Device"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Save Photo</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white flex items-center justify-center transition border border-stone-700 cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Photo Display with Navigation Arrows */}
        <div className="relative bg-black flex items-center justify-center min-h-[300px] sm:min-h-[460px] max-h-[64vh] overflow-hidden group">
          <img
            key={currentPhoto.id}
            src={currentPhoto.imageUrl}
            alt={currentPhoto.title}
            className="w-auto h-auto max-w-full max-h-[64vh] object-contain mx-auto select-none transition-all duration-300"
          />

          {/* Left Arrow */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition border border-white/20 backdrop-blur-md shadow-xl active:scale-95 cursor-pointer z-10"
            title="Previous Photo (←)"
          >
            <ChevronLeft className="w-6 h-6 text-gold" />
          </button>

          {/* Right Arrow */}
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition border border-white/20 backdrop-blur-md shadow-xl active:scale-95 cursor-pointer z-10"
            title="Next Photo (→)"
          >
            <ChevronRight className="w-6 h-6 text-gold" />
          </button>
        </div>

        {/* Bottom Story & Scripture Details Banner */}
        <div className="p-4 sm:p-6 bg-gradient-to-b from-stone-950 to-stone-900 border-t border-stone-800/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4">
            <div>
              <h3 className="font-serif font-bold text-base sm:text-xl text-white tracking-wide">
                {currentPhoto.title}
              </h3>
              <p className="text-xs text-amber-300/90 font-medium">
                {currentPhoto.tagline}
              </p>
            </div>
            <div className="text-[11px] font-bold text-gold shrink-0">
              Beholding Jesus Church
            </div>
          </div>

          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
            {currentPhoto.description}
          </p>

          {/* Scripture Verse Quote Card */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-black/50 border border-gold/30 flex items-start gap-3">
            <BookOpen className="w-4 h-4 text-gold shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs">
              <p className="italic text-stone-200 leading-relaxed">
                "{currentPhoto.scriptureText}"
              </p>
              <p className="text-[10px] font-bold tracking-wider uppercase text-gold">
                {currentPhoto.scriptureReference}
              </p>
            </div>
          </div>

          {/* Thumbnail Strip to Jump Directly */}
          <div className="pt-1 flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            {photos.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onNavigateIndex(idx)}
                className={`w-12 h-12 rounded-xl overflow-hidden shrink-0 transition-all border-2 cursor-pointer ${
                  idx === currentIndex
                    ? 'border-gold scale-105 shadow-gold'
                    : 'border-stone-800 opacity-60 hover:opacity-100 hover:border-stone-600'
                }`}
                title={p.title}
              >
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  className="w-full h-full object-cover object-center"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
