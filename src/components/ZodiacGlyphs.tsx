import React from 'react';

export type ZodiacSignName =
  | 'Aries'
  | 'Taurus'
  | 'Gemini'
  | 'Cancer'
  | 'Leo'
  | 'Virgo'
  | 'Libra'
  | 'Scorpio'
  | 'Sagittarius'
  | 'Capricorn'
  | 'Aquarius'
  | 'Pisces';

export interface ZodiacInfo {
  name: ZodiacSignName;
  symbol: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  ruler: string;
}

export const ZODIAC_LIST: ZodiacInfo[] = [
  { name: 'Aries', symbol: '♈', element: 'Fire', ruler: 'Mars' },
  { name: 'Taurus', symbol: '♉', element: 'Earth', ruler: 'Venus' },
  { name: 'Gemini', symbol: '♊', element: 'Air', ruler: 'Mercury' },
  { name: 'Cancer', symbol: '♋', element: 'Water', ruler: 'Moon' },
  { name: 'Leo', symbol: '♌', element: 'Fire', ruler: 'Sun' },
  { name: 'Virgo', symbol: '♍', element: 'Earth', ruler: 'Mercury' },
  { name: 'Libra', symbol: '♎', element: 'Air', ruler: 'Venus' },
  { name: 'Scorpio', symbol: '♏', element: 'Water', ruler: 'Mars / Pluto' },
  { name: 'Sagittarius', symbol: '♐', element: 'Fire', ruler: 'Jupiter' },
  { name: 'Capricorn', symbol: '♑', element: 'Earth', ruler: 'Saturn' },
  { name: 'Aquarius', symbol: '♒', element: 'Air', ruler: 'Saturn / Uranus' },
  { name: 'Pisces', symbol: '♓', element: 'Water', ruler: 'Jupiter / Neptune' },
];

/**
 * Pure vector SVG astrological glyphs (no emojis).
 * Crisp, scalable, high-contrast astrological iconography.
 */
export const ZodiacGlyph: React.FC<{
  sign: ZodiacSignName | string;
  className?: string;
  strokeWidth?: number;
}> = ({ sign, className = 'w-4 h-4', strokeWidth = 2 }) => {
  const norm = sign.toLowerCase();

  switch (norm) {
    case 'aries':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M12 21V9" />
          <path d="M12 9C9 9 5 5 5 2c0 4 3 7 7 7 4 0 7-3 7-7 0 3-4 7-7 7z" />
        </svg>
      );
    case 'taurus':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="15" r="6" />
          <path d="M5 4c1 4 4 6 7 6s6-2 7-6" />
        </svg>
      );
    case 'gemini':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M4 4c8 3 8 3 16 0" />
          <path d="M4 20c8-3 8-3 16 0" />
          <path d="M9 5v14" />
          <path d="M15 5v14" />
        </svg>
      );
    case 'cancer':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="7" cy="9" r="3.5" />
          <circle cx="17" cy="15" r="3.5" />
          <path d="M7 5.5c7 0 11 3.5 11 3.5" />
          <path d="M17 18.5c-7 0-11-3.5-11-3.5" />
        </svg>
      );
    case 'leo':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="7.5" cy="15.5" r="3" />
          <path d="M9.5 13.5C10 7 17.5 6 17.5 11.5c0 4-3.5 7.5 2 7.5" />
        </svg>
      );
    case 'virgo':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M4 17V8c0-2.2 1.8-4 4-4s4 1.8 4 4v9" />
          <path d="M12 8c0-2.2 1.8-4 4-4s4 1.8 4 4v11c0 2.5-3 2.5-3 0v-5c0-1.5 2.5-1.5 2.5 0" />
        </svg>
      );
    case 'libra':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M3 20h18" />
          <path d="M3 15h6c0-3.3 2.7-6 6-6s6 2.7 6 6h3" />
        </svg>
      );
    case 'scorpio':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M4 17V8c0-2.2 1.8-4 4-4s4 1.8 4 4v9" />
          <path d="M12 8c0-2.2 1.8-4 4-4s4 1.8 4 4v9l4-1" />
          <path d="M17 14l3 3-3 3" />
        </svg>
      );
    case 'sagittarius':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M6 18L19 5" />
          <path d="M13 5h6v6" />
          <path d="M9 15l6-6" />
        </svg>
      );
    case 'capricorn':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M5 6l4 12 3-6c2 0 4 1.5 4 4s-1.5 4-3.5 3.5c-2-.5-1.5-3 .5-3" />
        </svg>
      );
    case 'aquarius':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M3 9l3-3 4 4 4-4 4 4 3-3" />
          <path d="M3 16l3-3 4 4 4-4 4 4 3-3" />
        </svg>
      );
    case 'pisces':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M6 4c3 4 3 12 0 16" />
          <path d="M18 4c-3 4-3 12 0 16" />
          <path d="M3 12h18" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      );
  }
};

/**
 * Pure vector SVG Moon Phase renderer (no emojis).
 */
export const MoonPhaseVector: React.FC<{
  phase: 'waxing_gibbous' | 'full_moon' | 'waning_gibbous' | 'new_moon' | 'waxing_crescent' | 'first_quarter' | string;
  className?: string;
}> = ({ phase, className = 'w-6 h-6' }) => {
  switch (phase) {
    case 'new_moon':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <circle cx="12" cy="12" r="10" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
        </svg>
      );
    case 'waxing_crescent':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <circle cx="12" cy="12" r="10" fill="#1E293B" stroke="#475569" strokeWidth="1" />
          <path d="M12 2 A10 10 0 0 1 12 22 A6 10 0 0 0 12 2" fill="#F1F5F9" />
        </svg>
      );
    case 'first_quarter':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <circle cx="12" cy="12" r="10" fill="#1E293B" stroke="#475569" strokeWidth="1" />
          <path d="M12 2 A10 10 0 0 1 12 22 Z" fill="#F1F5F9" />
        </svg>
      );
    case 'waxing_gibbous':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <circle cx="12" cy="12" r="10" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1" />
          <path d="M12 2 A10 10 0 0 0 12 22 A5 10 0 0 1 12 2" fill="#1E293B" />
        </svg>
      );
    case 'full_moon':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <circle cx="12" cy="12" r="10" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
          <circle cx="9" cy="9" r="1.5" fill="#E2E8F0" opacity="0.6" />
          <circle cx="14" cy="13" r="2" fill="#E2E8F0" opacity="0.5" />
          <circle cx="10" cy="15" r="1.2" fill="#E2E8F0" opacity="0.6" />
        </svg>
      );
    case 'waning_gibbous':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <circle cx="12" cy="12" r="10" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1" />
          <path d="M12 2 A10 10 0 0 1 12 22 A5 10 0 0 0 12 2" fill="#1E293B" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <circle cx="12" cy="12" r="10" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1" />
        </svg>
      );
  }
};
