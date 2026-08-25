import { describe, it, expect } from 'vitest';
import {
  generateDailyTimeline,
  parseTimeToMinutes,
  formatMinutesToReadable,
  formatMinutesTo24h,
  isWithinSleepSchedule,
  getSegmentAtTime,
  partitionTimelineIntoFourBlocks,
} from './timingEngine';
import {
  MIAMI_AUG_24_SUN_DATA,
  MIAMI_AUG_24_PERIODS,
  EXPECTED_BENCHMARK_SCHEDULE,
  validateAugust24Fixture,
} from './testFixture';
import { classifyPanchangPeriod, getCanonicalPanchangName } from './panchangRegistry';
import { SunData, TimingPeriod } from '../types';

describe('Deterministic Timing Engine — Canonical Benchmark Suite', () => {
  it('strictly validates all 17 segments of the Miami August 24, 2026 canonical fixture', () => {
    const result = validateAugust24Fixture();
    expect(result.passed).toBe(true);
    expect(result.passedChecks).toBe(17);
    expect(result.totalChecks).toBe(17);

    const timeline = generateDailyTimeline(MIAMI_AUG_24_SUN_DATA, MIAMI_AUG_24_PERIODS, {
      isSleeping: false,
    });

    expect(timeline.length).toBe(17);

    // Segment-by-segment verification
    EXPECTED_BENCHMARK_SCHEDULE.forEach((expected, index) => {
      const actual = timeline[index];
      expect(actual).toBeDefined();
      expect(actual.startMinutes).toBe(expected.startMinutes);
      expect(actual.endMinutes).toBe(expected.endMinutes);
      expect(actual.color).toBe(expected.expectedColor);
    });
  });

  it('correctly reports specific canonical timestamps on August 24', () => {
    const timeline = generateDailyTimeline(MIAMI_AUG_24_SUN_DATA, MIAMI_AUG_24_PERIODS);

    // 04:00 AM (240 min) -> Gray (Neutral night)
    expect(getSegmentAtTime(timeline, 240)?.color).toBe('gray');

    // 05:40 AM (340 min) -> Green (Brahma Muhurta)
    expect(getSegmentAtTime(timeline, 340)?.color).toBe('green');
    expect(getSegmentAtTime(timeline, 340)?.reason).toContain('Brahma');

    // 06:30 AM (390 min) -> Green (Amrita Gadiyas before sunrise)
    expect(getSegmentAtTime(timeline, 390)?.color).toBe('green');
    expect(getSegmentAtTime(timeline, 390)?.reason).toContain('Amrita');

    // 07:15 AM (435 min) -> Yellow (Dawn Golden Hour overrides Amrita)
    expect(getSegmentAtTime(timeline, 435)?.color).toBe('yellow');
    expect(getSegmentAtTime(timeline, 435)?.ruleTriggered).toBe('golden_hour_dawn');

    // 08:00 AM (480 min) -> Green (Amrita Gadiyas after golden hour)
    expect(getSegmentAtTime(timeline, 480)?.color).toBe('green');

    // 09:00 AM (540 min) -> Red (Rahu Kala)
    expect(getSegmentAtTime(timeline, 540)?.color).toBe('red');
    expect(getSegmentAtTime(timeline, 540)?.reason).toContain('Rahu');

    // 12:00 PM (720 min) -> Red (Yamaganda)
    expect(getSegmentAtTime(timeline, 720)?.color).toBe('red');

    // 01:05 PM (785 min) -> Yellow (Abhijit + Yamaganda overlap)
    expect(getSegmentAtTime(timeline, 785)?.color).toBe('yellow');
    expect(getSegmentAtTime(timeline, 785)?.ruleTriggered).toBe('multi_condition_overlap');

    // 01:30 PM (810 min) -> Green (Clear Abhijit Muhurta after Yamaganda ends)
    expect(getSegmentAtTime(timeline, 810)?.color).toBe('green');
    expect(getSegmentAtTime(timeline, 810)?.reason).toContain('Abhijit');

    // 03:30 PM (930 min) -> Red (Gulika Kala)
    expect(getSegmentAtTime(timeline, 930)?.color).toBe('red');

    // 07:00 PM (1140 min) -> Yellow (Dusk Golden Hour)
    expect(getSegmentAtTime(timeline, 1140)?.color).toBe('yellow');
    expect(getSegmentAtTime(timeline, 1140)?.ruleTriggered).toBe('golden_hour_dusk');

    // 09:00 PM (1260 min) -> Gray (Evening Neutral)
    expect(getSegmentAtTime(timeline, 1260)?.color).toBe('gray');
  });
});

describe('Deterministic Timing Engine — Overlap & Edge Case Tests', () => {
  const dummySunData: SunData = {
    sunrise: '06:00',
    sunset: '18:00',
    sunriseMinutes: 360, // 6:00 AM
    sunsetMinutes: 1080, // 6:00 PM
  };

  it('evaluates overlapping two green periods to YELLOW during overlap', () => {
    // Green 1: 10:00 to 11:30 (600 to 690)
    // Green 2: 11:00 to 12:30 (660 to 750)
    // Overlap: 11:00 to 11:30 (660 to 690) -> YELLOW
    const periods: TimingPeriod[] = [
      {
        id: 'green-1',
        name: 'Auspicious Window A',
        start: '10:00',
        end: '11:30',
        startMinutes: 600,
        endMinutes: 690,
        classification: 'green',
        category: 'panchang',
      },
      {
        id: 'green-2',
        name: 'Auspicious Window B',
        start: '11:00',
        end: '12:30',
        startMinutes: 660,
        endMinutes: 750,
        classification: 'green',
        category: 'panchang',
      },
    ];

    const timeline = generateDailyTimeline(dummySunData, periods);

    // 10:00 - 11:00 -> Green (Single Auspicious)
    expect(getSegmentAtTime(timeline, 630)?.color).toBe('green');
    expect(getSegmentAtTime(timeline, 630)?.ruleTriggered).toBe('single_auspicious_green');

    // 11:00 - 11:30 -> Yellow (Multi-condition Overlap)
    expect(getSegmentAtTime(timeline, 675)?.color).toBe('yellow');
    expect(getSegmentAtTime(timeline, 675)?.ruleTriggered).toBe('multi_condition_overlap');

    // 11:30 - 12:30 -> Green (Single Auspicious)
    expect(getSegmentAtTime(timeline, 700)?.color).toBe('green');
    expect(getSegmentAtTime(timeline, 700)?.ruleTriggered).toBe('single_auspicious_green');
  });

  it('evaluates overlapping two red periods to YELLOW during overlap', () => {
    // Red 1: 13:00 to 14:30 (780 to 870)
    // Red 2: 14:00 to 15:30 (840 to 930)
    // Overlap: 14:00 to 14:30 (840 to 870) -> YELLOW
    const periods: TimingPeriod[] = [
      {
        id: 'red-1',
        name: 'Rahu Kala',
        start: '13:00',
        end: '14:30',
        startMinutes: 780,
        endMinutes: 870,
        classification: 'red',
        category: 'panchang',
      },
      {
        id: 'red-2',
        name: 'Yamaganda',
        start: '14:00',
        end: '15:30',
        startMinutes: 840,
        endMinutes: 930,
        classification: 'red',
        category: 'panchang',
      },
    ];

    const timeline = generateDailyTimeline(dummySunData, periods);

    // 13:00 - 14:00 -> Red (Single Inauspicious)
    expect(getSegmentAtTime(timeline, 800)?.color).toBe('red');
    expect(getSegmentAtTime(timeline, 800)?.ruleTriggered).toBe('single_inauspicious_red');

    // 14:00 - 14:30 -> Yellow (Multi-condition Overlap)
    expect(getSegmentAtTime(timeline, 855)?.color).toBe('yellow');
    expect(getSegmentAtTime(timeline, 855)?.ruleTriggered).toBe('multi_condition_overlap');

    // 14:30 - 15:30 -> Red (Single Inauspicious)
    expect(getSegmentAtTime(timeline, 890)?.color).toBe('red');
    expect(getSegmentAtTime(timeline, 890)?.ruleTriggered).toBe('single_inauspicious_red');
  });

  it('evaluates red + green overlap to YELLOW during overlap', () => {
    // Red: 12:00 to 13:30 (720 to 810)
    // Green: 13:00 to 14:00 (780 to 840)
    // Overlap: 13:00 to 13:30 (780 to 810) -> YELLOW
    const periods: TimingPeriod[] = [
      {
        id: 'red-yama',
        name: 'Yamaganda',
        start: '12:00',
        end: '13:30',
        startMinutes: 720,
        endMinutes: 810,
        classification: 'red',
        category: 'panchang',
      },
      {
        id: 'green-abhijit',
        name: 'Abhijit Muhurta',
        start: '13:00',
        end: '14:00',
        startMinutes: 780,
        endMinutes: 840,
        classification: 'green',
        category: 'panchang',
      },
    ];

    const timeline = generateDailyTimeline(dummySunData, periods);

    // 12:30 -> Red (Yamaganda alone)
    expect(getSegmentAtTime(timeline, 750)?.color).toBe('red');

    // 13:15 -> Yellow (Abhijit + Yamaganda overlap)
    expect(getSegmentAtTime(timeline, 795)?.color).toBe('yellow');
    expect(getSegmentAtTime(timeline, 795)?.ruleTriggered).toBe('multi_condition_overlap');

    // 13:45 -> Green (Clear Abhijit alone)
    expect(getSegmentAtTime(timeline, 825)?.color).toBe('green');
    expect(getSegmentAtTime(timeline, 825)?.ruleTriggered).toBe('single_auspicious_green');
  });

  it('correctly handles dawn golden-hour overlap with auspicious period', () => {
    // Sunrise at 06:00 (360 min). Dawn golden hour = 06:00 to 07:00 (360 to 420 min).
    // Auspicious period: 05:30 to 07:30 (330 to 450 min).
    const periods: TimingPeriod[] = [
      {
        id: 'green-dawn',
        name: 'Amrita Gadiyas',
        start: '05:30',
        end: '07:30',
        startMinutes: 330,
        endMinutes: 450,
        classification: 'green',
        category: 'panchang',
      },
    ];

    const timeline = generateDailyTimeline(dummySunData, periods);

    // 05:45 (345 min) -> Green (Pre-sunrise Amrita)
    expect(getSegmentAtTime(timeline, 345)?.color).toBe('green');
    expect(getSegmentAtTime(timeline, 345)?.ruleTriggered).toBe('single_auspicious_green');

    // 06:30 (390 min) -> Yellow (Dawn Golden Hour overrides green)
    expect(getSegmentAtTime(timeline, 390)?.color).toBe('yellow');
    expect(getSegmentAtTime(timeline, 390)?.ruleTriggered).toBe('golden_hour_dawn');

    // 07:15 (435 min) -> Green (Post-golden hour Amrita)
    expect(getSegmentAtTime(timeline, 435)?.color).toBe('green');
    expect(getSegmentAtTime(timeline, 435)?.ruleTriggered).toBe('single_auspicious_green');
  });

  it('correctly handles dusk golden-hour overlap with inauspicious period', () => {
    // Sunset at 18:00 (1080 min). Dusk golden hour = 17:00 to 18:00 (1020 to 1080 min).
    // Inauspicious period: 16:30 to 17:30 (990 to 1050 min).
    const periods: TimingPeriod[] = [
      {
        id: 'red-dusk',
        name: 'Gulika Kala',
        start: '16:30',
        end: '17:30',
        startMinutes: 990,
        endMinutes: 1050,
        classification: 'red',
        category: 'panchang',
      },
    ];

    const timeline = generateDailyTimeline(dummySunData, periods);

    // 16:45 (1005 min) -> Red (Pre-golden hour Gulika)
    expect(getSegmentAtTime(timeline, 1005)?.color).toBe('red');
    expect(getSegmentAtTime(timeline, 1005)?.ruleTriggered).toBe('single_inauspicious_red');

    // 17:15 (1035 min) -> Yellow (Dusk golden hour overrides red)
    expect(getSegmentAtTime(timeline, 1035)?.color).toBe('yellow');
    expect(getSegmentAtTime(timeline, 1035)?.ruleTriggered).toBe('golden_hour_dusk');

    // 17:45 (1065 min) -> Yellow (Dusk golden hour continuing)
    expect(getSegmentAtTime(timeline, 1065)?.color).toBe('yellow');
    expect(getSegmentAtTime(timeline, 1065)?.ruleTriggered).toBe('golden_hour_dusk');

    // 18:15 (1095 min) -> Gray (Post-sunset neutral)
    expect(getSegmentAtTime(timeline, 1095)?.color).toBe('gray');
  });

  it('correctly enforces sleep schedule crossing midnight (11:00 PM to 06:30 AM)', () => {
    // Sleep schedule: 23:00 (1380 min) to 06:30 (390 min)
    const sleepSchedule = {
      enabled: true,
      startMinutes: 23 * 60, // 1380
      endMinutes: 6 * 60 + 30, // 390
    };

    // Test isWithinSleepSchedule helper directly
    expect(isWithinSleepSchedule(1400, sleepSchedule)).toBe(true); // 11:20 PM
    expect(isWithinSleepSchedule(1380, sleepSchedule)).toBe(true); // 11:00 PM exact
    expect(isWithinSleepSchedule(0, sleepSchedule)).toBe(true);    // Midnight
    expect(isWithinSleepSchedule(200, sleepSchedule)).toBe(true);  // 03:20 AM
    expect(isWithinSleepSchedule(389, sleepSchedule)).toBe(true);  // 06:29 AM
    expect(isWithinSleepSchedule(390, sleepSchedule)).toBe(false); // 06:30 AM (wake up)
    expect(isWithinSleepSchedule(720, sleepSchedule)).toBe(false); // 12:00 PM noon
    expect(isWithinSleepSchedule(1379, sleepSchedule)).toBe(false); // 10:59 PM

    // Period that overlaps sleep window: Brahma Muhurta at 05:28 to 06:12 (328 to 372 min)
    // and Amrita Gadiyas from 06:20 to 08:00 (380 to 480 min)
    const periods: TimingPeriod[] = [
      {
        id: 'brahma',
        name: 'Brahma Muhurta',
        start: '05:28',
        end: '06:12',
        startMinutes: 328,
        endMinutes: 372,
        classification: 'green',
        category: 'panchang',
      },
      {
        id: 'amrita',
        name: 'Amrita Gadiyas',
        start: '06:20',
        end: '08:00',
        startMinutes: 380,
        endMinutes: 480,
        classification: 'green',
        category: 'panchang',
      },
    ];

    const timeline = generateDailyTimeline(dummySunData, periods, {
      sleepSchedule,
    });

    // 05:40 AM (340 min) during Brahma Muhurta is OVERRIDDEN BY SLEEP -> Gray
    const brahmaSegment = getSegmentAtTime(timeline, 340);
    expect(brahmaSegment?.color).toBe('gray');
    expect(brahmaSegment?.ruleTriggered).toBe('sleep_override');
    expect(brahmaSegment?.isSleepOverride).toBe(true);

    // 06:25 AM (385 min) during sleep window is OVERRIDDEN BY SLEEP -> Gray
    const earlyAmritaSegment = getSegmentAtTime(timeline, 385);
    expect(earlyAmritaSegment?.color).toBe('gray');
    expect(earlyAmritaSegment?.isSleepOverride).toBe(true);

    // 07:15 AM (435 min) after sleep window ends -> evaluates normally
    // Dawn golden hour is 06:00 to 07:00 (360 to 420), so 07:15 is Amrita Gadiyas alone -> Green
    const wakeAmritaSegment = getSegmentAtTime(timeline, 435);
    expect(wakeAmritaSegment?.color).toBe('green');
    expect(wakeAmritaSegment?.ruleTriggered).toBe('single_auspicious_green');

    // 11:30 PM (1390 min) -> Gray (Sleep override)
    const nightSleepSegment = getSegmentAtTime(timeline, 1390);
    expect(nightSleepSegment?.color).toBe('gray');
    expect(nightSleepSegment?.ruleTriggered).toBe('sleep_override');
  });
});

describe('Deterministic Panchang Classification Registry', () => {
  it('correctly classifies standard auspicious and inauspicious periods', () => {
    // Auspicious
    expect(classifyPanchangPeriod('Brahma Muhurta')).toBe('green');
    expect(classifyPanchangPeriod('Amrita Gadiyas')).toBe('green');
    expect(classifyPanchangPeriod('Abhijit Muhurta')).toBe('green');
    expect(classifyPanchangPeriod('Shuba Muhurtham')).toBe('green');
    expect(classifyPanchangPeriod('Abhijit')).toBe('green');
    expect(classifyPanchangPeriod('Amrit Kaal')).toBe('green');

    // Inauspicious
    expect(classifyPanchangPeriod('Rahu Kala')).toBe('red');
    expect(classifyPanchangPeriod('Yamaganda')).toBe('red');
    expect(classifyPanchangPeriod('Gulika Kala')).toBe('red');
    expect(classifyPanchangPeriod('Dur Muhurtam')).toBe('red');
    expect(classifyPanchangPeriod('Varjyam')).toBe('red');
    expect(classifyPanchangPeriod('Bhadra')).toBe('red');

    // Unknown fallback: MUST remain gray and NEVER default to red or green
    expect(classifyPanchangPeriod('Custom Meditation Time')).toBe('gray');
    expect(classifyPanchangPeriod('Random Unrecognized Period')).toBe('gray');
    expect(classifyPanchangPeriod('Team Sync Meeting')).toBe('gray');
  });

  it('evaluates timeline segments with unknown/unrecognized periods as gray and never red', () => {
    const dummySun: SunData = {
      sunrise: '06:00',
      sunset: '18:00',
      sunriseMinutes: 360,
      sunsetMinutes: 1080,
    };

    // Unknown period imported or defined by user
    const unknownPeriodName = 'Custom Meditation Time';
    const classification = classifyPanchangPeriod(unknownPeriodName);
    expect(classification).toBe('gray');

    const periods: TimingPeriod[] = [
      {
        id: 'custom-meditation-1',
        name: unknownPeriodName,
        start: '10:00',
        end: '11:00',
        startMinutes: 600,
        endMinutes: 660,
        classification, // 'gray'
        category: 'panchang',
      },
    ];

    const timeline = generateDailyTimeline(dummySun, periods);

    // Segment during Custom Meditation Time (10:30 AM = 630 min)
    const segment = getSegmentAtTime(timeline, 630);
    expect(segment).toBeDefined();
    expect(segment?.color).toBe('gray');
    expect(segment?.color).not.toBe('red');
    expect(segment?.color).not.toBe('green');
    expect(segment?.ruleTriggered).toBe('neutral_gray');
    expect(segment?.reason).toBe('Custom Meditation Time');
  });

  it('normalizes names to canonical registry titles', () => {
    expect(getCanonicalPanchangName('rahu kaal')).toBe('Rahu Kala');
    expect(getCanonicalPanchangName('abhijit')).toBe('Abhijit Muhurta');
    expect(getCanonicalPanchangName('amrit gadiyas')).toBe('Amrita Gadiyas');
  });
});

describe('Helper Functions & Block Partitioning', () => {
  it('correctly converts time strings to minutes and back', () => {
    expect(parseTimeToMinutes('06:57')).toBe(417);
    expect(parseTimeToMinutes('6:57 AM')).toBe(417);
    expect(parseTimeToMinutes('19:48')).toBe(1188);
    expect(parseTimeToMinutes('7:48 PM')).toBe(1188);
    expect(parseTimeToMinutes('12:00 AM')).toBe(0);
    expect(parseTimeToMinutes('12:00 PM')).toBe(720);

    expect(formatMinutesTo24h(417)).toBe('06:57');
    expect(formatMinutesTo24h(1188)).toBe('19:48');
    expect(formatMinutesToReadable(417, true)).toBe('6:57 AM');
    expect(formatMinutesToReadable(1188, true)).toBe('7:48 PM');
  });

  it('partitions 24-hour timeline into four canonical blocks', () => {
    const timeline = generateDailyTimeline(MIAMI_AUG_24_SUN_DATA, MIAMI_AUG_24_PERIODS);
    const blocks = partitionTimelineIntoFourBlocks(timeline);

    expect(blocks.length).toBe(4);
    expect(blocks[0].id).toBe('night');
    expect(blocks[0].startMinutes).toBe(0);
    expect(blocks[0].endMinutes).toBe(360);

    expect(blocks[1].id).toBe('morning');
    expect(blocks[1].startMinutes).toBe(360);
    expect(blocks[1].endMinutes).toBe(720);

    expect(blocks[2].id).toBe('afternoon');
    expect(blocks[2].startMinutes).toBe(720);
    expect(blocks[2].endMinutes).toBe(1080);

    expect(blocks[3].id).toBe('evening');
    expect(blocks[3].startMinutes).toBe(1080);
    expect(blocks[3].endMinutes).toBe(1440);
  });
});
