import React from 'react';
import { BibleStory } from './bibleStoriesData';

interface BibleStoryCardIllustrationProps {
  theme: BibleStory['illustrationTheme'];
  className?: string;
}

export const BibleStoryCardIllustration: React.FC<BibleStoryCardIllustrationProps> = ({ theme, className = "w-full h-full" }) => {
  switch (theme) {
    case 'nativity': // Jesus' Birth
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <radialGradient id="starGlow" cx="50%" cy="30%" r="50%">
              <stop offset="0%" stopColor="#FFF1B8" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#C5A46D" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#1E202A" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Gentle warm background glow */}
          <circle cx="100" cy="100" r="75" fill="url(#starGlow)" />
          {/* Bethlehem Star */}
          <path d="M100 22 L103 40 L120 43 L103 46 L100 64 L97 46 L80 43 L97 40 Z" fill="#FFE27A" />
          <circle cx="100" cy="43" r="3" fill="#FFFFFF" />
          {/* Joseph figure (right) */}
          <path d="M115 160 C115 125 128 100 135 100 C142 100 152 125 152 160 Z" fill="#606678" />
          <circle cx="135" cy="85" r="11" fill="#4B382A" />
          {/* Staff */}
          <line x1="156" y1="70" x2="156" y2="165" stroke="#C5A46D" strokeWidth="3" strokeLinecap="round" />
          {/* Mary figure (left, seated) */}
          <path d="M55 160 C55 130 68 115 80 115 C92 115 102 135 102 160 Z" fill="#2E5276" />
          <circle cx="78" cy="102" r="10" fill="#3D291D" />
          <path d="M68 98 C68 90 88 90 88 98 C88 120 68 120 68 98 Z" fill="#3C6B99" opacity="0.6" />
          {/* Manger with Hay & Baby Jesus */}
          <ellipse cx="100" cy="162" rx="35" ry="12" fill="#422C1D" />
          <path d="M85 150 L115 150 L120 162 L80 162 Z" fill="#D4A76A" />
          {/* Swaddling clothes baby */}
          <ellipse cx="100" cy="148" rx="14" ry="8" fill="#FFF7E6" />
          <circle cx="94" cy="147" r="5" fill="#FCEBD4" />
          {/* Gentle hay straws */}
          <path d="M78 152 L70 148 M122 152 L130 147 M95 162 L90 168 M105 162 L110 168" stroke="#FFE27A" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'disciples': // Jesus Chooses His Disciples
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="100" cy="100" r="70" fill="#C5A46D" fillOpacity="0.1" />
          {/* Jesus in cream/white robe */}
          <path d="M82 165 C82 120 90 95 100 95 C110 95 118 120 118 165 Z" fill="#EDE9DF" />
          <path d="M96 95 L118 165 L106 165 L88 100 Z" fill="#C5A46D" opacity="0.4" />
          <circle cx="100" cy="80" r="11" fill="#3E2723" />
          {/* Head covering / cowl */}
          <path d="M89 74 C89 65 111 65 111 74 C111 92 89 92 89 74 Z" fill="#D7D2C5" />
          {/* Walking Staff */}
          <line x1="80" y1="65" x2="80" y2="170" stroke="#C5A46D" strokeWidth="3" strokeLinecap="round" />
          {/* Shadow */}
          <ellipse cx="100" cy="168" rx="30" ry="7" fill="#000000" fillOpacity="0.3" />
        </svg>
      );

    case 'water': // Jesus Walks on Water
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Water ripples glow */}
          <ellipse cx="100" cy="155" rx="45" ry="14" stroke="#4AA3E0" strokeWidth="2.5" fill="#3B82F6" fillOpacity="0.2" />
          <ellipse cx="100" cy="155" rx="26" ry="8" stroke="#7DD3FC" strokeWidth="2" fill="#60A5FA" fillOpacity="0.3" />
          <circle cx="100" cy="155" r="7" fill="#BAE6FD" />
          {/* Jesus walking */}
          <path d="M86 150 C86 112 92 90 100 90 C108 90 114 112 114 150 Z" fill="#F8FAFC" />
          {/* Blue sash */}
          <path d="M92 92 L108 148 L114 145 L98 90 Z" fill="#2563EB" />
          <circle cx="100" cy="76" r="10" fill="#3D2619" />
          {/* Divine aura */}
          <circle cx="100" cy="76" r="16" stroke="#FDE047" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
        </svg>
      );

    case 'rock': // House on Rock
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Solid Rock Base */}
          <path d="M40 160 C50 145 90 140 100 140 C115 140 150 145 160 160 Z" fill="#78716C" />
          <path d="M55 160 C65 148 95 145 105 145 C120 145 145 150 155 160 Z" fill="#A8A29E" opacity="0.6" />
          {/* House foundation & walls */}
          <rect x="75" y="95" width="50" height="48" rx="4" fill="#D6C4A3" />
          {/* Door & Window */}
          <rect x="92" y="118" width="16" height="25" rx="3" fill="#573824" />
          <rect x="83" y="105" width="10" height="10" rx="2" fill="#88B4D4" />
          <rect x="107" y="105" width="10" height="10" rx="2" fill="#88B4D4" />
          {/* Roof */}
          <path d="M68 97 L100 68 L132 97 Z" fill="#8C3A27" />
          {/* Golden cross on peak */}
          <path d="M100 58 L100 68 M96 62 L104 62" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'sower': // The Sower
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Pot / Soil */}
          <path d="M72 135 L80 165 L120 165 L128 135 Z" fill="#573824" />
          <ellipse cx="100" cy="135" rx="28" ry="7" fill="#382315" />
          {/* Sprout Stem */}
          <path d="M100 135 C100 110 98 95 100 78" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
          {/* Leaves */}
          <path d="M100 95 C82 90 75 75 88 72 C98 75 100 88 100 95 Z" fill="#34D399" />
          <path d="M100 86 C118 80 125 65 112 62 C102 65 100 78 100 86 Z" fill="#059669" />
          <path d="M100 78 C95 62 100 50 102 48 C105 50 108 62 100 78 Z" fill="#6EE7B7" />
          {/* Sun droplet / golden life */}
          <circle cx="130" cy="55" r="14" fill="#FBBF24" fillOpacity="0.4" />
          <circle cx="130" cy="55" r="8" fill="#F59E0B" />
        </svg>
      );

    case 'sheep': // Lost Sheep & Coin
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Sheep body (fluffy) */}
          <ellipse cx="90" cy="120" rx="32" ry="24" fill="#F1F5F9" />
          <circle cx="70" cy="115" r="16" fill="#F1F5F9" />
          <circle cx="105" cy="115" r="16" fill="#F1F5F9" />
          <circle cx="80" cy="102" r="15" fill="#F1F5F9" />
          <circle cx="98" cy="102" r="15" fill="#F1F5F9" />
          {/* Sheep Face */}
          <ellipse cx="64" cy="112" rx="11" ry="14" fill="#334155" />
          <circle cx="61" cy="108" r="2" fill="#FFFFFF" />
          {/* Legs */}
          <line x1="75" y1="138" x2="75" y2="158" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
          <line x1="102" y1="138" x2="102" y2="158" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
          {/* Glowing Golden Lost Coin (Right) */}
          <circle cx="140" cy="95" r="20" fill="#FBBF24" fillOpacity="0.25" />
          <circle cx="140" cy="95" r="14" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
          <path d="M140 88 L140 102 M135 93 L145 93" stroke="#FFFBEB" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'ruth': // Ruth & Naomi
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Naomi (elder) */}
          <path d="M70 165 C70 125 78 105 88 105 C98 105 105 125 105 165 Z" fill="#78350F" />
          <circle cx="88" cy="90" r="10" fill="#D97706" />
          {/* Ruth (embracing) */}
          <path d="M96 165 C96 120 108 95 118 95 C128 95 138 120 138 165 Z" fill="#1E3A8A" />
          <circle cx="118" cy="80" r="10" fill="#93C5FD" />
          {/* Covenant heart glow */}
          <path d="M103 62 C103 56 109 52 114 55 C118 52 124 56 124 62 C124 70 114 78 114 78 C114 78 103 70 103 62 Z" fill="#F43F5E" opacity="0.8" />
        </svg>
      );

    case 'esther': // Esther before the King
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Royal Throne */}
          <rect x="110" y="70" width="45" height="90" rx="6" fill="#7C2D12" />
          <path d="M105 60 L160 60 L155 75 L110 75 Z" fill="#F59E0B" />
          {/* King silhouette */}
          <circle cx="132" cy="85" r="9" fill="#1C1917" />
          {/* Esther in white & gold gown */}
          <path d="M60 165 C60 125 70 105 80 105 C90 105 98 125 98 165 Z" fill="#F8FAFC" />
          <circle cx="80" cy="92" r="9" fill="#FDBA74" />
          <path d="M72 88 C72 80 88 80 88 88" stroke="#F59E0B" strokeWidth="2" />
          {/* Golden Scepter extended */}
          <line x1="125" y1="105" x2="88" y2="115" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
          <circle cx="88" cy="115" r="3" fill="#F59E0B" />
        </svg>
      );

    case 'deborah': // Deborah Israel's Judge
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Palm of Deborah */}
          <line x1="65" y1="60" x2="65" y2="165" stroke="#78350F" strokeWidth="6" strokeLinecap="round" />
          <path d="M65 60 C40 45 30 30 45 25 C60 25 65 50 65 60 Z" fill="#047857" />
          <path d="M65 60 C80 40 95 30 95 45 C85 60 70 60 65 60 Z" fill="#059669" />
          <path d="M65 60 C50 65 30 70 35 85 C50 80 60 70 65 60 Z" fill="#10B981" />
          {/* Deborah seated leading */}
          <path d="M95 165 C95 130 105 110 115 110 C125 110 135 130 135 165 Z" fill="#6B21A8" />
          <circle cx="115" cy="96" r="10" fill="#FBCFE8" />
          {/* Lamp / Wisdom flame */}
          <circle cx="145" cy="120" r="6" fill="#F59E0B" />
        </svg>
      );

    case 'shepherds': // Shepherds visit Jesus
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Heavenly light */}
          <path d="M100 20 L160 170 L40 170 Z" fill="#FEF08A" fillOpacity="0.15" />
          {/* Shepherds in reverence */}
          <path d="M60 165 C60 135 68 120 76 120 C84 120 90 135 90 165 Z" fill="#475569" />
          <circle cx="76" cy="108" r="9" fill="#1E293B" />
          <line x1="56" y1="100" x2="56" y2="165" stroke="#C5A46D" strokeWidth="2.5" />
          <path d="M95 165 C95 140 102 125 110 125 C118 125 125 140 125 165 Z" fill="#64748B" />
          <circle cx="110" cy="114" r="8" fill="#334155" />
        </svg>
      );

    case 'leper': // The Man with Leprosy
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Jesus reaching out hand */}
          <path d="M65 165 C65 125 75 100 85 100 C95 100 102 125 102 165 Z" fill="#F8FAFC" />
          <circle cx="85" cy="85" r="10" fill="#3F2E21" />
          {/* Jesus arm outstretched */}
          <path d="M96 112 Q120 110 135 116" stroke="#C5A46D" strokeWidth="3" strokeLinecap="round" />
          {/* Leper kneeling */}
          <path d="M130 165 C130 140 140 125 150 125 C158 125 165 140 165 165 Z" fill="#92400E" />
          <circle cx="148" cy="115" r="8" fill="#573824" />
          {/* Healing sparkles */}
          <circle cx="135" cy="116" r="4" fill="#38BDF8" />
        </svg>
      );

    case 'beatitudes': // The Beatitudes
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Mount silhouette */}
          <path d="M20 170 Q100 110 180 170 Z" fill="#334155" />
          {/* Jesus proclaiming with open arms */}
          <path d="M92 145 C92 115 97 95 102 95 C107 95 112 115 112 145 Z" fill="#F1F5F9" />
          <circle cx="102" cy="82" r="9" fill="#451A03" />
          {/* Outstretched arms blessing */}
          <line x1="82" y1="102" x2="122" y2="102" stroke="#F1F5F9" strokeWidth="3" strokeLinecap="round" />
          {/* Divine sun rays */}
          <circle cx="102" cy="82" r="22" stroke="#FACC15" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
        </svg>
      );

    case 'creation': // Creation of the World
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Earth sphere */}
          <circle cx="100" cy="105" r="42" fill="#38BDF8" />
          {/* Continents */}
          <path d="M80 85 C85 80 100 82 105 90 C110 98 95 110 88 105 Z" fill="#4ADE80" />
          <path d="M105 115 C115 110 125 120 120 130 C110 135 100 125 105 115 Z" fill="#22C55E" />
          {/* Sun & Moon */}
          <circle cx="65" cy="60" r="10" fill="#F59E0B" />
          {/* Clouds */}
          <ellipse cx="125" cy="72" rx="14" ry="7" fill="#F8FAFC" fillOpacity="0.8" />
        </svg>
      );

    case 'fall': // The Fall / Eden Tree
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Tree trunk */}
          <path d="M94 165 C94 135 90 120 92 105 C94 90 105 85 105 105 C107 120 106 135 106 165 Z" fill="#E2E8F0" />
          {/* Canopy */}
          <ellipse cx="100" cy="80" rx="36" ry="24" fill="#047857" />
          <circle cx="82" cy="75" r="16" fill="#065F46" />
          <circle cx="118" cy="75" r="16" fill="#059669" />
          {/* Fruit */}
          <circle cx="95" cy="85" r="4" fill="#DC2626" />
        </svg>
      );

    case 'abraham': // Abraham's Call
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Starry Night Sky */}
          <circle cx="55" cy="45" r="1.5" fill="#FFE27A" />
          <circle cx="85" cy="35" r="2" fill="#FFE27A" />
          <circle cx="120" cy="40" r="2.5" fill="#FFE27A" />
          <circle cx="145" cy="55" r="1.5" fill="#FFE27A" />
          <circle cx="100" cy="50" r="1.5" fill="#FFE27A" />
          {/* Abraham kneeling looking up */}
          <path d="M90 165 C90 140 100 125 110 125 C120 125 125 140 125 165 Z" fill="#E2E8F0" />
          <circle cx="112" cy="115" r="9" fill="#78350F" />
          {/* Prayer hands */}
          <path d="M102 135 L106 128 L110 135" stroke="#C5A46D" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="100" cy="100" r="50" fill="#C5A46D" fillOpacity="0.2" />
        </svg>
      );
  }
};
