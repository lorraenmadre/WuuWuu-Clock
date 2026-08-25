export type TrafficColor = 'green' | 'red' | 'yellow' | 'gray';

export type PanchangClassification = 'green' | 'red' | 'gray';

export interface TimingPeriod {
  id: string;
  name: string;
  start: string; // ISO string or "HH:mm"
  end: string;   // ISO string or "HH:mm"
  startMinutes: number; // minutes from 00:00 (0..1440)
  endMinutes: number;   // minutes from 00:00 (0..1440)
  classification: PanchangClassification;
  category?: 'panchang' | 'transit' | 'muhurta' | 'custom';
  description?: string;
}

export interface SunData {
  sunrise: string; // "06:57" or ISO
  sunset: string;  // "19:48" or ISO
  sunriseMinutes: number; // e.g. 417
  sunsetMinutes: number;  // e.g. 1188
}

export interface GoldenHourPeriod {
  type: 'dawn' | 'dusk';
  startMinutes: number;
  endMinutes: number;
  label: string;
}

export interface TimelineSegment {
  id: string;
  startMinutes: number;
  endMinutes: number;
  startTimeFormatted: string; // e.g. "5:28 AM" or "05:28"
  endTimeFormatted: string;   // e.g. "6:12 AM" or "06:12"
  color: TrafficColor;
  ruleTriggered:
    | 'sleep_override'
    | 'golden_hour_dawn'
    | 'golden_hour_dusk'
    | 'multi_condition_overlap'
    | 'single_inauspicious_red'
    | 'single_auspicious_green'
    | 'neutral_gray';
  reason: string;
  activePeriods: TimingPeriod[];
  isGoldenHour: boolean;
  goldenHourType?: 'dawn' | 'dusk';
  isSleepOverride?: boolean;
}

export interface UserProfile {
  name: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  timezone: string;
  latitude: number;
  longitude: number;
  astrologySystem: 'sidereal' | 'tropical';
  ayanamsa: 'lahiri' | 'raman' | 'kp' | 'yukteshwar';
  sleepSchedule: {
    enabled: boolean;
    startMinutes: number; // e.g. 23:00 = 1380
    endMinutes: number;   // e.g. 06:30 = 390
  };
}

export interface AstrologicalContext {
  nakshatra: string;
  nakshatraPada?: number;
  moonHouse?: number;
  moonSign?: string;
  activeTransits?: string[];
  dasha?: {
    mahaDasha?: string;
    antarDasha?: string;
  };
}

export interface InterpretationStory {
  bestFor: string;
  theme: string;
  generatedByAi?: boolean;
}

export interface DayData {
  date: string; // "2026-08-24"
  sunData: SunData;
  periods: TimingPeriod[];
  astrologyContext: AstrologicalContext;
}

export type DayBlockId = 'night' | 'morning' | 'afternoon' | 'evening';

export interface DayBlock {
  id: DayBlockId;
  label: string;
  timeRangeLabel: string;
  startMinutes: number;
  endMinutes: number;
  segments: TimelineSegment[];
}
