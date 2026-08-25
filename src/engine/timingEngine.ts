import {
  DayBlock,
  DayBlockId,
  DayData,
  SunData,
  TimelineSegment,
  TimingPeriod,
  TrafficColor,
} from '../types';

/**
 * Parses time string like "06:57", "6:57 AM", "19:48", "7:48 PM" into minutes from midnight (0..1440)
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const str = timeStr.trim().toUpperCase();

  // If ISO string like "2026-08-24T06:57:00-04:00"
  if (str.includes('T')) {
    const timePart = str.split('T')[1]?.substring(0, 5);
    if (timePart) {
      const [h, m] = timePart.split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    }
  }

  // Check for AM / PM
  const isPM = str.includes('PM');
  const isAM = str.includes('AM');
  const cleaned = str.replace(/AM|PM/g, '').trim();
  const [hStr, mStr] = cleaned.split(':');
  let hours = parseInt(hStr, 10) || 0;
  const minutes = parseInt(mStr, 10) || 0;

  if (isPM && hours < 12) {
    hours += 12;
  } else if (isAM && hours === 12) {
    hours = 0;
  }

  return Math.min(1440, Math.max(0, hours * 60 + minutes));
}

/**
 * Formats minutes from midnight to readable string (e.g. "5:28 AM", "12:56 PM", "12:00 AM")
 */
export function formatMinutesToReadable(minutes: number, includeAmPm = true): string {
  const norm = ((minutes % 1440) + 1440) % 1440;
  let hours = Math.floor(norm / 60);
  const mins = norm % 60;
  const isPM = hours >= 12;

  let displayHours = hours % 12;
  if (displayHours === 0) displayHours = 12;

  const minStr = mins < 10 ? `0${mins}` : `${mins}`;
  if (!includeAmPm) {
    return `${displayHours}:${minStr}`;
  }
  return `${displayHours}:${minStr} ${isPM ? 'PM' : 'AM'}`;
}

/**
 * Formats minutes to 24h clock e.g. "06:57"
 */
export function formatMinutesTo24h(minutes: number): string {
  const norm = Math.min(1440, Math.max(0, minutes));
  const hours = Math.floor(norm / 60);
  const mins = norm % 60;
  const hStr = hours < 10 ? `0${hours}` : `${hours}`;
  const mStr = mins < 10 ? `0${mins}` : `${mins}`;
  return `${hStr}:${mStr}`;
}

export interface EngineOptions {
  isSleeping?: boolean;
  sleepSchedule?: {
    enabled: boolean;
    startMinutes: number; // e.g. 23:00 = 1380
    endMinutes: number;   // e.g. 06:30 = 390
  };
}

/**
 * Checks whether a given minute falls into a sleep schedule window
 */
export function isWithinSleepSchedule(
  minute: number,
  schedule: { enabled: boolean; startMinutes: number; endMinutes: number }
): boolean {
  if (!schedule.enabled) return false;
  const { startMinutes, endMinutes } = schedule;

  if (startMinutes <= endMinutes) {
    // Single day window e.g. 01:00 to 07:00
    return minute >= startMinutes && minute < endMinutes;
  } else {
    // Cross-midnight window e.g. 23:00 (1380) to 06:30 (390)
    return minute >= startMinutes || minute < endMinutes;
  }
}

/**
 * Primary Deterministic Timing Rule Engine
 * Generates the full 24-hour timeline by exact boundary computation.
 */
export function generateDailyTimeline(
  sunData: SunData,
  periods: TimingPeriod[],
  options: EngineOptions = {}
): TimelineSegment[] {
  const { isSleeping = false, sleepSchedule } = options;

  // 1. Collect all boundary / change points in [0..1440]
  const changePointsSet = new Set<number>();
  changePointsSet.add(0);
  changePointsSet.add(1440);

  // Panchang period boundaries
  for (const p of periods) {
    if (p.startMinutes >= 0 && p.startMinutes <= 1440) changePointsSet.add(p.startMinutes);
    if (p.endMinutes >= 0 && p.endMinutes <= 1440) changePointsSet.add(p.endMinutes);
  }

  // Golden Hour boundaries:
  // Dawn: first 60 minutes after sunrise [sunrise, sunrise + 60]
  const dawnStart = sunData.sunriseMinutes;
  const dawnEnd = Math.min(1440, sunData.sunriseMinutes + 60);
  if (dawnStart >= 0 && dawnStart <= 1440) changePointsSet.add(dawnStart);
  if (dawnEnd >= 0 && dawnEnd <= 1440) changePointsSet.add(dawnEnd);

  // Dusk: final 60 minutes before sunset [sunset - 60, sunset]
  const duskStart = Math.max(0, sunData.sunsetMinutes - 60);
  const duskEnd = sunData.sunsetMinutes;
  if (duskStart >= 0 && duskStart <= 1440) changePointsSet.add(duskStart);
  if (duskEnd >= 0 && duskEnd <= 1440) changePointsSet.add(duskEnd);

  // Sleep schedule boundaries if active
  if (sleepSchedule?.enabled) {
    if (sleepSchedule.startMinutes >= 0 && sleepSchedule.startMinutes <= 1440) {
      changePointsSet.add(sleepSchedule.startMinutes);
    }
    if (sleepSchedule.endMinutes >= 0 && sleepSchedule.endMinutes <= 1440) {
      changePointsSet.add(sleepSchedule.endMinutes);
    }
  }

  // Sorted unique change points
  const points = Array.from(changePointsSet).sort((a, b) => a - b);

  // 2. Evaluate each interval
  const rawSegments: TimelineSegment[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];
    if (start === end) continue;

    // Use midpoint for interval status check
    const mid = (start + end) / 2;

    // Active Panchang periods strictly covering this interval
    const activePeriods = periods.filter(
      (p) => p.startMinutes <= start && p.endMinutes >= end
    );

    // Auspicious and inauspicious timing conditions that drive color states
    const activeClassified = activePeriods.filter(
      (p) => p.classification === 'green' || p.classification === 'red'
    );

    // Golden hour status
    const isDawnGoldenHour = mid >= dawnStart && mid < dawnEnd;
    const isDuskGoldenHour = mid >= duskStart && mid < duskEnd;
    const isGoldenHour = isDawnGoldenHour || isDuskGoldenHour;

    // Sleep state check
    const isSleepMode =
      isSleeping || (sleepSchedule ? isWithinSleepSchedule(mid, sleepSchedule) : false);

    let color: TrafficColor = 'gray';
    let ruleTriggered: TimelineSegment['ruleTriggered'] = 'neutral_gray';
    let reason = 'Neutral';

    // Priority Hierarchy
    // Rule 1: Sleep/rest overrides everything -> GRAY
    if (isSleepMode) {
      color = 'gray';
      ruleTriggered = 'sleep_override';
      reason = 'Sleep / Rest Mode active';
    }
    // Rule 3: Golden hour is Yellow (first 60m after sunrise, final 60m before sunset). Overrides overlaps too.
    else if (isGoldenHour) {
      color = 'yellow';
      if (isDawnGoldenHour) {
        ruleTriggered = 'golden_hour_dawn';
        reason = 'Dawn golden hour';
      } else {
        ruleTriggered = 'golden_hour_dusk';
        reason = 'Dusk golden hour';
      }
    }
    // Rule 2: Any overlap of two or more timing conditions becomes Yellow
    else if (activeClassified.length > 1) {
      color = 'yellow';
      ruleTriggered = 'multi_condition_overlap';
      const names = activeClassified.map((p) => p.name.replace(/ Muhurta| Kala| Gadiyas/gi, ''));
      reason = `${names.join(' + ')} overlap`;
    }
    // Rule 4 & 5: Single Panchang period (Auspicious / Inauspicious)
    else if (activeClassified.length === 1) {
      const p = activeClassified[0];
      if (p.classification === 'red') {
        color = 'red';
        ruleTriggered = 'single_inauspicious_red';
        reason = p.name;
      } else if (p.classification === 'green') {
        color = 'green';
        ruleTriggered = 'single_auspicious_green';
        // Clean name formatting
        if (p.name.toLowerCase().includes('abhijit')) {
          reason = 'Clear Abhijit';
        } else {
          reason = p.name;
        }
      }
    }
    // Rule 6: Unclassified / Gray periods remain Gray
    else if (activePeriods.length > 0) {
      color = 'gray';
      ruleTriggered = 'neutral_gray';
      reason = activePeriods[0].name || 'Neutral';
    }
    // Rule 6: Anything else is Gray
    else {
      color = 'gray';
      ruleTriggered = 'neutral_gray';
      reason = 'Neutral';
    }

    rawSegments.push({
      id: `seg-${start}-${end}`,
      startMinutes: start,
      endMinutes: end,
      startTimeFormatted: formatMinutesToReadable(start),
      endTimeFormatted: formatMinutesToReadable(end),
      color,
      ruleTriggered,
      reason,
      activePeriods,
      isGoldenHour,
      goldenHourType: isDawnGoldenHour ? 'dawn' : isDuskGoldenHour ? 'dusk' : undefined,
      isSleepOverride: isSleepMode,
    });
  }

  // 3. Merge consecutive segments if identical color, ruleTriggered, and reason
  const mergedSegments: TimelineSegment[] = [];
  for (const seg of rawSegments) {
    const prev = mergedSegments[mergedSegments.length - 1];
    if (
      prev &&
      prev.color === seg.color &&
      prev.ruleTriggered === seg.ruleTriggered &&
      prev.reason === seg.reason &&
      prev.isSleepOverride === seg.isSleepOverride &&
      prev.isGoldenHour === seg.isGoldenHour &&
      arePeriodListsEqual(prev.activePeriods, seg.activePeriods)
    ) {
      // Extend previous segment
      prev.endMinutes = seg.endMinutes;
      prev.endTimeFormatted = seg.endTimeFormatted;
    } else {
      mergedSegments.push({ ...seg });
    }
  }

  return mergedSegments;
}

function arePeriodListsEqual(a: TimingPeriod[], b: TimingPeriod[]): boolean {
  if (a.length !== b.length) return false;
  const aIds = a.map((p) => p.id).sort().join(',');
  const bIds = b.map((p) => p.id).sort().join(',');
  return aIds === bIds;
}

/**
 * Finds the active segment at a given minute (0..1440)
 */
export function getSegmentAtTime(
  timeline: TimelineSegment[],
  minute: number
): TimelineSegment | null {
  const norm = ((minute % 1440) + 1440) % 1440;
  for (const seg of timeline) {
    if (norm >= seg.startMinutes && norm < seg.endMinutes) {
      return seg;
    }
  }
  // Handle edge case of 1440 (midnight at day end)
  if (timeline.length > 0 && norm >= timeline[timeline.length - 1].startMinutes) {
    return timeline[timeline.length - 1];
  }
  return timeline[0] || null;
}

/**
 * Finds the next upcoming segment
 */
export function getNextSegment(
  timeline: TimelineSegment[],
  currentSegment: TimelineSegment | null
): TimelineSegment | null {
  if (!currentSegment || timeline.length === 0) return null;
  const currentIndex = timeline.findIndex((s) => s.id === currentSegment.id);
  if (currentIndex >= 0 && currentIndex < timeline.length - 1) {
    return timeline[currentIndex + 1];
  }
  return null;
}

/**
 * Splits the 24-hour daily timeline into the 4 fixed canonical blocks:
 * 1. Night: 12 AM – 6 AM (0 to 360 min)
 * 2. Morning: 6 AM – 12 PM (360 to 720 min)
 * 3. Afternoon: 12 PM – 6 PM (720 to 1080 min)
 * 4. Evening: 6 PM – 12 AM (1080 to 1440 min)
 */
export function partitionTimelineIntoFourBlocks(
  timeline: TimelineSegment[]
): DayBlock[] {
  const blockDefinitions: {
    id: DayBlockId;
    label: string;
    timeRangeLabel: string;
    startMinutes: number;
    endMinutes: number;
  }[] = [
    {
      id: 'night',
      label: 'NIGHT',
      timeRangeLabel: '12 AM – 6 AM',
      startMinutes: 0,
      endMinutes: 360,
    },
    {
      id: 'morning',
      label: 'MORNING',
      timeRangeLabel: '6 AM – 12 PM',
      startMinutes: 360,
      endMinutes: 720,
    },
    {
      id: 'afternoon',
      label: 'AFTERNOON',
      timeRangeLabel: '12 PM – 6 PM',
      startMinutes: 720,
      endMinutes: 1080,
    },
    {
      id: 'evening',
      label: 'EVENING',
      timeRangeLabel: '6 PM – 12 AM',
      startMinutes: 1080,
      endMinutes: 1440,
    },
  ];

  return blockDefinitions.map((def) => {
    const blockSegments: TimelineSegment[] = [];

    for (const seg of timeline) {
      // Check for overlap between seg [seg.start, seg.end] and def [def.start, def.end]
      const overlapStart = Math.max(seg.startMinutes, def.startMinutes);
      const overlapEnd = Math.min(seg.endMinutes, def.endMinutes);

      if (overlapStart < overlapEnd) {
        blockSegments.push({
          ...seg,
          id: `${def.id}-${seg.id}-${overlapStart}-${overlapEnd}`,
          startMinutes: overlapStart,
          endMinutes: overlapEnd,
          startTimeFormatted: formatMinutesToReadable(overlapStart),
          endTimeFormatted: formatMinutesToReadable(overlapEnd),
        });
      }
    }

    return {
      ...def,
      segments: blockSegments,
    };
  });
}
