import React from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import { PublicPageId } from '../types';

interface PublicPageHeroProps {
  badge: string;
  title: string;
  subtitle: string;
  onNavigateHome: () => void;
  scriptureText?: string;
  scriptureRef?: string;
}

export const PublicPageHero: React.FC<PublicPageHeroProps> = ({
  badge,
  title,
  subtitle,
  onNavigateHome,
  scriptureText,
  scriptureRef
}) => {
  return (
    <div className="relative py-14 sm:py-20 overflow-hidden bg-gradient-to-b from-stone-900 via-stone-900 to-slate-900 text-white border-b border-gold/30">
      {/* Background Decorative Glow */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gold blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 font-semibold tracking-wider uppercase">
          <button 
            onClick={onNavigateHome}
            className="hover:text-gold transition cursor-pointer"
          >
            Home
          </button>
          <ChevronRight className="w-3 h-3 text-stone-500" />
          <span className="text-gold">{title}</span>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-bold uppercase tracking-widest shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-gold shrink-0" />
          <span>{badge}</span>
        </div>

        {/* Title */}
        <h1 className="font-serif font-black text-2xl sm:text-4xl md:text-5xl text-white tracking-tight uppercase">
          {title}
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto leading-relaxed font-sans">
          {subtitle}
        </p>

        {/* Optional Scripture Banner */}
        {scriptureText && (
          <div className="pt-2 max-w-xl mx-auto">
            <p className="font-serif italic text-xs sm:text-sm text-gold/90 leading-relaxed border-t border-b border-gold/20 py-2.5">
              &ldquo;{scriptureText}&rdquo;
              {scriptureRef && (
                <span className="block not-italic font-sans text-[11px] font-bold text-stone-300 mt-1">
                  — {scriptureRef}
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
