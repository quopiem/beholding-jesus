import React from 'react';
import { 
  Heart, MapPin, Calendar, Clock, ExternalLink, 
  ArrowRight, LogIn, UserPlus, ShieldCheck 
} from 'lucide-react';
import { PublicPageId } from '../types';
import { PUBLIC_CHURCH_DATA } from '../data/publicChurchData';

interface PublicFooterProps {
  onNavigate: (page: PublicPageId) => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({
  onNavigate,
  onOpenLogin,
  onOpenRegister
}) => {
  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-gold/30 pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          
          {/* Col 1: Brand & Calling (span 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold/30 via-gold/15 to-transparent border border-gold/40 flex items-center justify-center shrink-0">
                <img 
                  src="/icons/church-seal-gold.png" 
                  alt="Beholding Jesus Church" 
                  className="w-9 h-9 object-contain drop-shadow-sm" 
                />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-white uppercase tracking-wider">
                  Beholding Jesus Church
                </h3>
                <p className="text-xs text-gold font-medium tracking-wide">
                  Bacoor City, Cavite, Philippines
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-400 font-serif italic leading-relaxed pt-1">
              &ldquo;Looking unto Jesus the author and finisher of our faith; who for the joy that was set before him endured the cross, despising the shame, and is set down at the right hand of the throne of God.&rdquo;
              <span className="block not-italic font-sans text-[11px] font-bold text-gold mt-1">
                — Hebrews 12:2
              </span>
            </p>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1 text-xs">
              <div className="text-gold font-bold uppercase tracking-wider text-[10px]">
                Our Motto
              </div>
              <div className="text-stone-200 font-medium">
                Love God, Love People, Make Christ-like Disciples
              </div>
            </div>

            {/* Social Media Channels (Facebook & YouTube) */}
            <div className="pt-2 space-y-2">
              <div className="text-gold font-bold uppercase tracking-wider text-[10px]">
                Connect With Us Online
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={PUBLIC_CHURCH_DATA.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white flex items-center justify-center shadow-md transition-all duration-300 transform hover:scale-110 active:scale-95 group border border-white/20"
                  aria-label="Facebook Page"
                  title="Follow us on Facebook"
                >
                  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href={PUBLIC_CHURCH_DATA.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#FF0000] hover:bg-[#E60000] text-white flex items-center justify-center shadow-md transition-all duration-300 transform hover:scale-110 active:scale-95 group border border-white/20"
                  aria-label="YouTube Channel"
                  title="Subscribe on YouTube"
                >
                  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <span className="text-xs text-stone-400">@beholdingjesuschurch</span>
              </div>
            </div>
          </div>

          {/* Col 2: About & Doctrine */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-gold">
              About BJC
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => onNavigate('about')} 
                  className="hover:text-gold transition-colors text-left cursor-pointer"
                >
                  Our Story & Pastors
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('vision-mission')} 
                  className="hover:text-gold transition-colors text-left cursor-pointer"
                >
                  Vision, Mission & Values
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('beliefs')} 
                  className="hover:text-gold transition-colors text-left cursor-pointer"
                >
                  What We Believe
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('first-time')} 
                  className="hover:text-gold transition-colors text-left cursor-pointer"
                >
                  First Time Visiting?
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Community & Ministries */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-gold">
              Ministries & Care
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => onNavigate('ministries')} 
                  className="hover:text-gold transition-colors text-left cursor-pointer"
                >
                  Church Ministry Teams
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('life-groups')} 
                  className="hover:text-gold transition-colors text-left cursor-pointer"
                >
                  Life Groups & Fellowship
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('prayer')} 
                  className="hover:text-gold transition-colors text-left cursor-pointer"
                >
                  Prayer & Intercession
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('events')} 
                  className="hover:text-gold transition-colors text-left cursor-pointer"
                >
                  Church Gatherings & Events
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('contact')} 
                  className="hover:text-gold transition-colors text-left cursor-pointer"
                >
                  Sanctuary Directions
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Member Portal Access */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-gold">
              Member Portal
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Are you an active church member? Log in to access the fellowship feed, community chat, worship tools, and Bible studies.
            </p>
            <div className="space-y-2 pt-1">
              <button
                onClick={onOpenLogin}
                className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-stone-100 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-gold" />
                <span>Member Sign In</span>
              </button>
              <button
                onClick={onOpenRegister}
                className="w-full py-2.5 px-3 rounded-xl bg-gold hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Join Church Family</span>
              </button>
            </div>
          </div>

        </div>

        {/* Sanctuary Location Strip */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-2.5 text-xs text-stone-300">
            <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">Sanctuary Address:</span>
              <span>{PUBLIC_CHURCH_DATA.address}</span>
            </div>
          </div>
          <a
            href={PUBLIC_CHURCH_DATA.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-gold/15 hover:bg-gold/25 border border-gold/40 text-gold font-bold text-xs flex items-center gap-1.5 shrink-0 transition"
          >
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500 text-center sm:text-left">
          <div>
            &copy; {new Date().getFullYear()} Beholding Jesus Church. All rights reserved. Sola Scriptura • Solus Christus • Sola Gratia.
          </div>
          <div className="flex items-center gap-4 text-stone-400">
            <span>Molino 3, Bacoor City, Cavite</span>
            <span>•</span>
            <span className="text-gold font-medium">To God Be All The Glory</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
