import React, { useState, useEffect } from 'react';
import { 
  Heart, Users, BookOpen, MapPin, Sparkles, X, 
  ChevronLeft, ChevronRight, Maximize2, Quote, ArrowRight
} from 'lucide-react';

export interface WhoWeAreItem {
  id: string;
  title: string;
  category: 'outreach' | 'missions' | 'family' | 'preaching';
  categoryLabel: string;
  location: string;
  image: string;
  story: string;
  verse?: { text: string; ref: string };
}

export const WHO_WE_ARE_ITEMS: WhoWeAreItem[] = [
  {
    id: 'community-outreach',
    title: 'Feeding & Preaching in the Neighborhood',
    category: 'outreach',
    categoryLabel: 'Community Outreach',
    location: 'Barangay Courtyards, Cavite',
    image: '/images/who-we-are/community-outreach-truck.jpg',
    story: 'We load up our speakers, bring warm cooked meals, and park right in the middle of the community. Kids gather on the ground, parents listen from their doors, and we get to share the Gospel right where everyday life happens.',
    verse: {
      text: 'For I was hungry and you gave me food, I was thirsty and you gave me drink, I was a stranger and you welcomed me.',
      ref: 'Matthew 25:35'
    }
  },
  {
    id: 'street-prayer',
    title: 'Stopping to Pray for a Child',
    category: 'outreach',
    categoryLabel: 'Street Compassion',
    location: 'Bacoor City Streets',
    image: '/images/who-we-are/street-prayer-child.jpg',
    story: "Ministry doesn't just happen inside church walls. When our sisters met this young boy on the street, they didn't just walk past. They handed him a warm meal, laid caring hands on his shoulders, and spoke God’s protection and future over his life.",
    verse: {
      text: 'Let the little children come to me, and do not hinder them, for the kingdom of heaven belongs to such as these.',
      ref: 'Matthew 19:14'
    }
  },
  {
    id: 'provincial-missions',
    title: 'Reaching the Faraway Villages',
    category: 'missions',
    categoryLabel: 'Provincial & Tribal Missions',
    location: 'Mountain & Remote Communities',
    image: '/images/who-we-are/village-mission-motorbike.jpg',
    story: 'Where regular vehicles cannot pass, our brothers ride motorbikes with sidecars across rocky dirt roads and hills. We sit down with local villagers in their front yards, share food, listen to their stories, and remind them that Jesus has never forgotten them.',
    verse: {
      text: 'How beautiful upon the mountains are the feet of him who brings good news, who publishes peace.',
      ref: 'Isaiah 52:7'
    }
  },
  {
    id: 'sidewalk-compassion',
    title: 'Sitting on the Pavement with the Overlooked',
    category: 'outreach',
    categoryLabel: 'Mercy on the Streets',
    location: 'City Sidewalks',
    image: '/images/who-we-are/sidewalk-compassion-meal.jpg',
    story: 'True love sits down where people are hurting. One of our young brothers sat on the pavement right beside a man resting on cardboard, listened to him, shared a packed meal, and placed a comforting hand on his shoulder in heartfelt prayer.',
    verse: {
      text: 'Truly, I say to you, as you did it to one of the least of these my brothers, you did it to me.',
      ref: 'Matthew 25:40'
    }
  },
  {
    id: 'church-family-gathering',
    title: 'One Big Family at the Table',
    category: 'family',
    categoryLabel: 'Church Family & Salo-Salo',
    location: 'BJC Fellowship Hall',
    image: '/images/who-we-are/church-family-gathering.jpg',
    story: 'No one eats alone here. After Sunday service, we push the tables together, bring out the home-cooked dishes, pizza, and pancit, and sit down together. Toddlers, youth, parents, and grandparents sharing life, laughing, and bearing each other’s burdens as one genuine family.',
    verse: {
      text: 'They broke bread in their homes and ate together with glad and sincere hearts, praising God.',
      ref: 'Acts 2:46-47'
    }
  },
  {
    id: 'women-sisterhood',
    title: 'Sisters Walking Together Before the Cross',
    category: 'family',
    categoryLabel: 'Women of Faith',
    location: 'BJC Sanctuary',
    image: '/images/who-we-are/women-sisterhood-cross.jpg',
    story: 'In a world that can feel isolating, these women have found true sisters in Christ. Through trials, tears, and breakthroughs, our sisters pray together before the cross and lift each other up every single week.',
    verse: {
      text: 'Therefore encourage one another and build one another up, just as you are doing.',
      ref: '1 Thessalonians 5:11'
    }
  },
  {
    id: 'campus-ministry',
    title: 'Reaching the Next Generation in Schools',
    category: 'missions',
    categoryLabel: 'Campus & Youth Outreach',
    location: 'Cavite High School Courts',
    image: '/images/who-we-are/campus-school-ministry.jpg',
    story: 'Standing in a covered court packed with hundreds of high school students bowing their heads to pray. Our heart is to reach young people with the unconditional love and grace of Jesus before the world tells them who they are supposed to be.',
    verse: {
      text: 'Set an example for the believers in speech, in conduct, in love, in faith and in purity.',
      ref: '1 Timothy 4:12'
    }
  },
  {
    id: 'bible-preaching',
    title: 'Unashamed of the Living Word of God',
    category: 'preaching',
    categoryLabel: 'Word of God & Pulpit',
    location: 'BJC Sanctuary',
    image: '/images/who-we-are/bible-preaching-pastora.jpg',
    story: 'Numbers 23:19 — “God is not a man, so he does not lie. He is not human, so he does not change his mind.” We don’t preach self-help or empty motivational speeches. We open the Bible, lift God’s Word high, and proclaim Jesus Christ crucified, risen, and reigning.',
    verse: {
      text: 'For the word of God is alive and active. Sharper than any double-edged sword.',
      ref: 'Hebrews 4:12'
    }
  }
];

interface WhoWeAreSectionProps {
  onNavigate?: (page: any) => void;
  showExploreButton?: boolean;
}

export const WhoWeAreSection: React.FC<WhoWeAreSectionProps> = ({ 
  onNavigate,
  showExploreButton = false 
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'outreach' | 'missions' | 'family' | 'preaching'>('all');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const filteredItems = activeFilter === 'all' 
    ? WHO_WE_ARE_ITEMS 
    : WHO_WE_ARE_ITEMS.filter(item => item.category === activeFilter);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null) return;
      if (e.key === 'Escape') setSelectedPhotoIndex(null);
      if (e.key === 'ArrowLeft') {
        setSelectedPhotoIndex(prev => (prev === null || prev === 0 ? filteredItems.length - 1 : prev - 1));
      }
      if (e.key === 'ArrowRight') {
        setSelectedPhotoIndex(prev => (prev === null || prev === filteredItems.length - 1 ? 0 : prev + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex, filteredItems.length]);

  const activePhoto = selectedPhotoIndex !== null ? filteredItems[selectedPhotoIndex] : null;

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#18110b] via-[#120f12] to-[#0d0f18] text-white py-14 sm:py-20 px-4 sm:px-6">
      {/* Background warm atmospheric glow */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#C5A46D]/20 via-amber-700/10 to-transparent blur-[120px]" />
      </div>

      <div className="relative max-w-6xl mx-auto space-y-10 z-10">
        
        {/* ============================================================== */}
        {/* SECTION HEADER (Matches Reference Style: Big Bold Italic Title) */}
        {/* ============================================================== */}
        <div className="text-center space-y-3.5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-[11px] font-bold uppercase tracking-widest shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-gold shrink-0" />
            <span>Beholding Jesus Church In Action</span>
          </div>

          <h2 className="font-sans font-black italic tracking-wide uppercase text-3xl sm:text-5xl md:text-6xl text-white drop-shadow-md">
            WHO WE ARE
          </h2>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed font-sans max-w-2xl mx-auto">
            We’re not a building, and we’re not just a Sunday service. We are a family of everyday people in Cavite who found mercy in Jesus, and we just want to bring His love to the streets, the homes, and the quiet places where people are hurting.
          </p>
        </div>

        {/* ============================================================== */}
        {/* FILTER PILLS                                                   */}
        {/* ============================================================== */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 pb-2">
          {([
            { id: 'all', label: `All Moments (${WHO_WE_ARE_ITEMS.length})` },
            { id: 'outreach', label: 'Street & Outreach' },
            { id: 'missions', label: 'Missions & Schools' },
            { id: 'family', label: 'Family & Sisterhood' },
            { id: 'preaching', label: 'God’s Word' }
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveFilter(tab.id);
                setSelectedPhotoIndex(null);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-gradient-to-r from-gold via-amber-400 to-gold text-slate-950 shadow-md scale-105'
                  : 'bg-white/10 hover:bg-white/15 text-stone-300 border border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ============================================================== */}
        {/* PHOTO MOSAIC GRID (Matches Reference 3-Column Visual Layout)   */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setSelectedPhotoIndex(idx)}
              className="group relative rounded-2xl overflow-hidden bg-stone-900 border border-white/15 hover:border-gold/60 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer flex flex-col"
            >
              {/* Image Frame */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                {/* Top Badge: Category */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-gold font-bold text-[10.5px] uppercase tracking-wider shadow-sm">
                    {item.categoryLabel}
                  </span>
                </div>

                {/* Top Right: Zoom prompt on hover */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white flex items-center justify-center">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>

                {/* Bottom Location Pill over image */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 text-stone-300 text-[11px] font-medium">
                  <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>
              </div>

              {/* Text Card Content */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 bg-[#131215]">
                <div className="space-y-2">
                  <h3 className="font-serif font-bold text-base sm:text-lg text-white group-hover:text-gold transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-[13px] text-stone-300 font-sans leading-relaxed line-clamp-3">
                    {item.story}
                  </p>
                </div>

                {/* Read story prompt */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-gold font-bold">
                  <span>View Story & Scripture</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Optional Button to explore church or visit */}
        {showExploreButton && onNavigate && (
          <div className="pt-4 text-center">
            <button
              onClick={() => onNavigate('about')}
              className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-gold/40 text-gold font-bold text-xs sm:text-sm shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Learn More About Our Church Family</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

      {/* ============================================================== */}
      {/* INTERACTIVE FULL RESOLUTION STORY LIGHTBOX MODAL                */}
      {/* ============================================================== */}
      {activePhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedPhotoIndex(null);
          }}
        >
          <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl text-white flex flex-col lg:flex-row max-h-[92vh]">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedPhotoIndex(null)}
              className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-black/75 hover:bg-black border border-white/20 text-white flex items-center justify-center cursor-pointer transition active:scale-95"
              title="Close modal (Esc)"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left / Prev Button */}
            <button
              onClick={() => setSelectedPhotoIndex(prev => (prev === null || prev === 0 ? filteredItems.length - 1 : prev - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/75 hover:bg-black border border-white/20 text-white flex items-center justify-center cursor-pointer transition active:scale-95"
              title="Previous Photo (Left Arrow)"
              aria-label="Previous Photo"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Right / Next Button */}
            <button
              onClick={() => setSelectedPhotoIndex(prev => (prev === null || prev === filteredItems.length - 1 ? 0 : prev + 1))}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/75 hover:bg-black border border-white/20 text-white flex items-center justify-center cursor-pointer transition active:scale-95"
              title="Next Photo (Right Arrow)"
              aria-label="Next Photo"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Photo Column */}
            <div className="relative lg:w-3/5 bg-black flex items-center justify-center min-h-[280px] sm:min-h-[420px]">
              <img
                src={activePhoto.image}
                alt={activePhoto.title}
                className="w-full h-full object-contain max-h-[60vh] lg:max-h-[85vh]"
              />
            </div>

            {/* Story & Context Details Column */}
            <div className="lg:w-2/5 p-6 sm:p-8 flex flex-col justify-between space-y-5 bg-[#141417] overflow-y-auto">
              <div className="space-y-4">
                {/* Category & Location */}
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold/15 border border-gold/30 text-gold text-[10.5px] font-bold uppercase tracking-wider">
                    <span>{activePhoto.categoryLabel}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs text-stone-400">
                    <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                    <span>{activePhoto.location}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-serif font-black text-xl sm:text-2xl text-white leading-snug">
                  {activePhoto.title}
                </h3>

                {/* Human Story */}
                <p className="text-stone-200 text-sm sm:text-base leading-relaxed font-sans">
                  {activePhoto.story}
                </p>

                {/* Scripture Connection */}
                {activePhoto.verse && (
                  <div className="p-4 rounded-2xl bg-white/5 border-l-2 border-l-gold border-white/10 space-y-1.5 text-xs sm:text-sm">
                    <p className="font-serif italic text-stone-200 leading-relaxed">
                      &ldquo;{activePhoto.verse.text}&rdquo;
                    </p>
                    <span className="font-sans font-bold text-gold block text-[11px]">
                      — {activePhoto.verse.ref}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom counter */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
                <span>Moment {(selectedPhotoIndex ?? 0) + 1} of {filteredItems.length}</span>
                <span className="text-[11px] text-stone-500">Press Left / Right arrows</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
