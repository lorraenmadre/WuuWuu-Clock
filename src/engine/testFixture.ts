import { DayData, SunData, TimingPeriod, TrafficColor } from '../types';
import { generateDailyTimeline, parseTimeToMinutes } from './timingEngine';

/**
 * Expected Miami August 24, 2026 Test Fixture Output:
 * 1. 12:00–5:28 AM   ⚪ gray    Neutral
 * 2. 5:28–6:12 AM    🟢 green   Brahma Muhurta
 * 3. 6:12–6:20 AM    ⚪ gray    Neutral
 * 4. 6:20–6:57 AM    🟢 green   Amrita
 * 5. 6:57–7:57 AM    🟡 yellow  Dawn golden hour
 * 6. 7:57–8:06 AM    🟢 green   Amrita
 * 7. 8:06–8:33 AM    ⚪ gray    Neutral
 * 8. 8:33–10:09 AM   🔴 red     Rahu Kala
 * 9. 10:09–11:46 AM  ⚪ gray    Neutral
 * 10. 11:46 AM–12:56 PM 🔴 red  Yamaganda
 * 11. 12:56–1:22 PM  🟡 yellow  Abhijit + Yamaganda overlap
 * 12. 1:22–1:48 PM   🟢 green   Clear Abhijit
 * 13. 1:48–2:58 PM   ⚪ gray    Neutral
 * 14. 2:58–4:34 PM   🔴 red     Gulika
 * 15. 4:34–6:48 PM   ⚪ gray    Neutral
 * 16. 6:48–7:48 PM   🟡 yellow  Dusk golden hour
 * 17. 7:48 PM–12:00 AM ⚪ gray  Neutral
 */

export interface ExpectedBenchmarkSegment {
  index: number;
  startMinutes: number;
  endMinutes: number;
  timeRange: string;
  expectedColor: TrafficColor;
  expectedReasonSubstrings: string[];
}

export const MIAMI_AUG_24_SUN_DATA: SunData = {
  sunrise: '06:57',
  sunset: '19:48',
  sunriseMinutes: 417, // 6 * 60 + 57
  sunsetMinutes: 1188, // 19 * 60 + 48
};

export const MIAMI_AUG_24_PERIODS: TimingPeriod[] = [
  {
    id: 'brahma-2026-08-24',
    name: 'Brahma Muhurta',
    start: '05:28',
    end: '06:12',
    startMinutes: 328, // 5 * 60 + 28
    endMinutes: 372,   // 6 * 60 + 12
    classification: 'green',
    category: 'panchang',
    description: 'Supreme auspicious dawn window for meditation and insight.',
  },
  {
    id: 'amrita-2026-08-24',
    name: 'Amrita Gadiyas',
    start: '06:20',
    end: '08:06',
    startMinutes: 380, // 6 * 60 + 20
    endMinutes: 486,   // 8 * 60 + 06
    classification: 'green',
    category: 'panchang',
    description: 'Nectar window for vital, life-affirming beginnings.',
  },
  {
    id: 'rahu-kala-2026-08-24',
    name: 'Rahu Kala',
    start: '08:33',
    end: '10:09',
    startMinutes: 513, // 8 * 60 + 33
    endMinutes: 609,   // 10 * 60 + 09
    classification: 'red',
    category: 'panchang',
    description: 'Avoid launches and irreversible decisions.',
  },
  {
    id: 'yamaganda-2026-08-24',
    name: 'Yamaganda',
    start: '11:46',
    end: '13:22',
    startMinutes: 706, // 11 * 60 + 46
    endMinutes: 802,   // 13 * 60 + 22 (1:22 PM)
    classification: 'red',
    category: 'panchang',
    description: 'Avoid signing long-term contracts and departures.',
  },
  {
    id: 'abhijit-2026-08-24',
    name: 'Abhijit Muhurta',
    start: '12:56',
    end: '13:48',
    startMinutes: 776, // 12 * 60 + 56
    endMinutes: 828,   // 13 * 60 + 48 (1:48 PM)
    classification: 'green',
    category: 'panchang',
    description: 'Midday victory window capable of neutralizing negative influences.',
  },
  {
    id: 'gulika-2026-08-24',
    name: 'Gulika Kala',
    start: '14:58',
    end: '16:34',
    startMinutes: 898, // 14 * 60 + 58 (2:58 PM)
    endMinutes: 994,   // 16 * 60 + 34 (4:34 PM)
    classification: 'red',
    category: 'panchang',
    description: 'Slow, heavy energy; avoid quick wins or initial celebrations.',
  },
];

export const MIAMI_AUG_24_DAY_DATA: DayData = {
  date: '2026-08-24',
  sunData: MIAMI_AUG_24_SUN_DATA,
  periods: MIAMI_AUG_24_PERIODS,
  astrologyContext: {
    nakshatra: 'Uttara Ashadha',
    nakshatraPada: 2,
    moonHouse: 7,
    moonSign: 'Capricorn / Makara',
    activeTransits: ['Jupiter in Gemini', 'Saturn in Pisces', 'Rahu in Aquarius'],
    dasha: {
      mahaDasha: 'Sun',
      antarDasha: 'Jupiter',
    },
  },
};

export const EXPECTED_BENCHMARK_SCHEDULE: ExpectedBenchmarkSegment[] = [
  {
    index: 1,
    startMinutes: 0,
    endMinutes: 328,
    timeRange: '12:00–5:28 AM',
    expectedColor: 'gray',
    expectedReasonSubstrings: ['Neutral'],
  },
  {
    index: 2,
    startMinutes: 328,
    endMinutes: 372,
    timeRange: '5:28–6:12 AM',
    expectedColor: 'green',
    expectedReasonSubstrings: ['Brahma Muhurta'],
  },
  {
    index: 3,
    startMinutes: 372,
    endMinutes: 380,
    timeRange: '6:12–6:20 AM',
    expectedColor: 'gray',
    expectedReasonSubstrings: ['Neutral'],
  },
  {
    index: 4,
    startMinutes: 380,
    endMinutes: 417,
    timeRange: '6:20–6:57 AM',
    expectedColor: 'green',
    expectedReasonSubstrings: ['Amrita'],
  },
  {
    index: 5,
    startMinutes: 417,
    endMinutes: 477,
    timeRange: '6:57–7:57 AM',
    expectedColor: 'yellow',
    expectedReasonSubstrings: ['Dawn golden hour', 'golden hour'],
  },
  {
    index: 6,
    startMinutes: 477,
    endMinutes: 486,
    timeRange: '7:57–8:06 AM',
    expectedColor: 'green',
    expectedReasonSubstrings: ['Amrita'],
  },
  {
    index: 7,
    startMinutes: 486,
    endMinutes: 513,
    timeRange: '8:06–8:33 AM',
    expectedColor: 'gray',
    expectedReasonSubstrings: ['Neutral'],
  },
  {
    index: 8,
    startMinutes: 513,
    endMinutes: 609,
    timeRange: '8:33–10:09 AM',
    expectedColor: 'red',
    expectedReasonSubstrings: ['Rahu Kala'],
  },
  {
    index: 9,
    startMinutes: 609,
    endMinutes: 706,
    timeRange: '10:09–11:46 AM',
    expectedColor: 'gray',
    expectedReasonSubstrings: ['Neutral'],
  },
  {
    index: 10,
    startMinutes: 706,
    endMinutes: 776,
    timeRange: '11:46 AM–12:56 PM',
    expectedColor: 'red',
    expectedReasonSubstrings: ['Yamaganda'],
  },
  {
    index: 11,
    startMinutes: 776,
    endMinutes: 802,
    timeRange: '12:56–1:22 PM',
    expectedColor: 'yellow',
    expectedReasonSubstrings: ['Abhijit', 'Yamaganda', 'overlap'],
  },
  {
    index: 12,
    startMinutes: 802,
    endMinutes: 828,
    timeRange: '1:22–1:48 PM',
    expectedColor: 'green',
    expectedReasonSubstrings: ['Clear Abhijit', 'Abhijit'],
  },
  {
    index: 13,
    startMinutes: 828,
    endMinutes: 898,
    timeRange: '1:48–2:58 PM',
    expectedColor: 'gray',
    expectedReasonSubstrings: ['Neutral'],
  },
  {
    index: 14,
    startMinutes: 898,
    endMinutes: 994,
    timeRange: '2:58–4:34 PM',
    expectedColor: 'red',
    expectedReasonSubstrings: ['Gulika'],
  },
  {
    index: 15,
    startMinutes: 994,
    endMinutes: 1128,
    timeRange: '4:34–6:48 PM',
    expectedColor: 'gray',
    expectedReasonSubstrings: ['Neutral'],
  },
  {
    index: 16,
    startMinutes: 1128,
    endMinutes: 1188,
    timeRange: '6:48–7:48 PM',
    expectedColor: 'yellow',
    expectedReasonSubstrings: ['Dusk golden hour', 'golden hour'],
  },
  {
    index: 17,
    startMinutes: 1188,
    endMinutes: 1440,
    timeRange: '7:48 PM–12:00 AM',
    expectedColor: 'gray',
    expectedReasonSubstrings: ['Neutral'],
  },
];

export interface ValidationTestResult {
  passed: boolean;
  totalChecks: number;
  passedChecks: number;
  segmentResults: {
    index: number;
    expectedRange: string;
    actualRange: string;
    expectedColor: TrafficColor;
    actualColor: TrafficColor;
    reason: string;
    passed: boolean;
    errorDetails?: string;
  }[];
}

/**
 * Runs automated verification test against the Miami August 24, 2026 benchmark fixture
 */
export function validateAugust24Fixture(): ValidationTestResult {
  const actualTimeline = generateDailyTimeline(
    MIAMI_AUG_24_SUN_DATA,
    MIAMI_AUG_24_PERIODS,
    { isSleeping: false }
  );

  let passedChecks = 0;
  const segmentResults = [];

  const maxLen = Math.max(actualTimeline.length, EXPECTED_BENCHMARK_SCHEDULE.length);

  for (let i = 0; i < maxLen; i++) {
    const expected = EXPECTED_BENCHMARK_SCHEDULE[i];
    const actual = actualTimeline[i];

    if (!expected || !actual) {
      segmentResults.push({
        index: i + 1,
        expectedRange: expected ? expected.timeRange : 'None',
        actualRange: actual ? `${actual.startTimeFormatted}–${actual.endTimeFormatted}` : 'None',
        expectedColor: expected ? expected.expectedColor : 'gray',
        actualColor: actual ? actual.color : 'gray',
        reason: actual ? actual.reason : 'Missing segment',
        passed: false,
        errorDetails: expected ? 'Actual segment count mismatch' : 'Unexpected extra segment',
      });
      continue;
    }

    const timeMatches =
      actual.startMinutes === expected.startMinutes && actual.endMinutes === expected.endMinutes;
    const colorMatches = actual.color === expected.expectedColor;
    const isSuccess = timeMatches && colorMatches;

    if (isSuccess) passedChecks++;

    segmentResults.push({
      index: i + 1,
      expectedRange: expected.timeRange,
      actualRange: `${actual.startTimeFormatted}–${actual.endTimeFormatted}`,
      expectedColor: expected.expectedColor,
      actualColor: actual.color,
      reason: actual.reason,
      passed: isSuccess,
      errorDetails: !isSuccess
        ? `Expected ${expected.timeRange} [${expected.startMinutes}-${expected.endMinutes}] ${expected.expectedColor}, got [${actual.startMinutes}-${actual.endMinutes}] ${actual.color}`
        : undefined,
    });
  }

  const allPassed = passedChecks === EXPECTED_BENCHMARK_SCHEDULE.length && actualTimeline.length === EXPECTED_BENCHMARK_SCHEDULE.length;

  return {
    passed: allPassed,
    totalChecks: EXPECTED_BENCHMARK_SCHEDULE.length,
    passedChecks,
    segmentResults,
  };
}
