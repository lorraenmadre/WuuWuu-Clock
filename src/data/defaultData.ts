import { DayData, UserProfile } from '../types';
import { MIAMI_AUG_24_DAY_DATA } from '../engine/testFixture';

export { MIAMI_AUG_24_DAY_DATA };

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Rae',
  birthDate: '1988-12-01',
  birthTime: '20:24',
  birthLocation: 'Miami, Florida',
  timezone: 'America/New_York',
  latitude: 25.7617,
  longitude: -80.1918,
  astrologySystem: 'sidereal',
  ayanamsa: 'lahiri',
  sleepSchedule: {
    enabled: false,
    startMinutes: 23 * 60,      // 11:00 PM (1380)
    endMinutes: 6 * 60 + 30,    // 06:30 AM (390)
  },
};

export const INITIAL_DAY_DATA: DayData = MIAMI_AUG_24_DAY_DATA;

export const SAMPLE_DATASETS: { name: string; description: string; data: DayData }[] = [
  {
    name: 'Miami, FL — August 24, 2026 (Benchmark)',
    description: 'Source-of-truth PRD test fixture with 6 Panchang periods and exact 17-segment timeline.',
    data: MIAMI_AUG_24_DAY_DATA,
  },
  {
    name: 'New Delhi, India — Sample Day',
    description: 'Panchang timing for New Delhi (Sunrise 05:54, Sunset 18:52) with clear Rahu Kala & Abhijit.',
    data: {
      date: '2026-08-24',
      sunData: {
        sunrise: '05:54',
        sunset: '18:52',
        sunriseMinutes: 354,
        sunsetMinutes: 1132,
      },
      periods: [
        {
          id: 'delhi-brahma',
          name: 'Brahma Muhurta',
          start: '04:18',
          end: '05:06',
          startMinutes: 258,
          endMinutes: 306,
          classification: 'green',
          category: 'panchang',
        },
        {
          id: 'delhi-rahu',
          name: 'Rahu Kala',
          start: '07:31',
          end: '09:08',
          startMinutes: 451,
          endMinutes: 548,
          classification: 'red',
          category: 'panchang',
        },
        {
          id: 'delhi-yamaganda',
          name: 'Yamaganda',
          start: '10:45',
          end: '12:23',
          startMinutes: 645,
          endMinutes: 743,
          classification: 'red',
          category: 'panchang',
        },
        {
          id: 'delhi-abhijit',
          name: 'Abhijit Muhurta',
          start: '11:57',
          end: '12:49',
          startMinutes: 717,
          endMinutes: 769,
          classification: 'green',
          category: 'panchang',
        },
        {
          id: 'delhi-gulika',
          name: 'Gulika Kala',
          start: '13:59',
          end: '15:37',
          startMinutes: 839,
          endMinutes: 937,
          classification: 'red',
          category: 'panchang',
        },
      ],
      astrologyContext: {
        nakshatra: 'Uttara Ashadha',
        moonHouse: 7,
        moonSign: 'Capricorn / Makara',
        activeTransits: ['Jupiter in Gemini', 'Saturn in Pisces'],
      },
    },
  },
];

export const RAW_PASTE_EXAMPLE = `Brahma Muhurta 5:28–6:12 AM
Amrita Gadiyas 6:20–8:06 AM
Rahu Kala 8:33–10:09 AM
Yamaganda 11:46 AM–1:22 PM
Abhijit 12:56–1:48 PM
Gulika 2:58–4:34 PM
Sunrise 6:57 AM
Sunset 7:48 PM`;

export const STATIC_INTERPRETATIONS: Record<string, { bestFor: string; theme: string }> = {
  green: {
    bestFor: 'send · submit · decide · sign · commit',
    theme: 'Clean auspicious window for pivotal actions, long-term decisions, and formal commitments.',
  },
  red: {
    bestFor: 'rest · reflect · audit · maintain · pause',
    theme: 'Inauspicious window for new ventures or departures. Favor routine work and introspective stillness.',
  },
  yellow: {
    bestFor: 'transition · adapt · synthesize · adjust',
    theme: 'Overlapping influences or solar threshold (golden hour). Proceed with heightened awareness.',
  },
  gray: {
    bestFor: 'routine work · recharge · study · organize',
    theme: 'Neutral temporal flow with no pressing Panchang restrictions. Carry on daily operations calmly.',
  },
};
