import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  CloudSun,
  Cloud,
  Wind,
  Compass,
  Eye,
  Camera,
  Sparkles,
  Maximize2,
  Minimize2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { TimelineSegment, TrafficColor } from '../types';
import { formatMinutesToReadable, formatMinutesTo24h } from '../engine/timingEngine';

interface AnalogTrafficClockProps {
  currentSimulatedMinutes: number;
  currentSegment: TimelineSegment | null;
  nextSegment: TimelineSegment | null;
  isSleeping: boolean;
  onOpenDetail?: () => void;
}

// Sky photo presets for natural atmospheric integration
export interface SkyTheme {
  id: string;
  name: string;
  condition: string;
  temp: string;
  humidity: string;
  uv: string;
  wind: string;
  solarAltitude: string;
  imageUrl: string;
  overlayGradient: string;
  badge: string;
  description: string;
}

export const SKY_THEMES: Record<string, SkyTheme> = {
  dawn: {
    id: 'dawn',
    name: 'Dawn Golden Hour',
    condition: 'Golden Horizon · Clear Skies',
    temp: '76°F (24°C)',
    humidity: '72%',
    uv: '2 (Low)',
    wind: '6 mph ENE',
    solarAltitude: '+4.2° (Sunrise)',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    overlayGradient: 'from-amber-900/30 via-orange-950/20 to-slate-950/60',
    badge: 'DAWN SUNRISE',
    description: 'First light over the ocean with soft peach and golden amber atmospheric tones.',
  },
  day: {
    id: 'day',
    name: 'Daylight Azure',
    condition: 'Sunny · Crisp Blue Sky',
    temp: '86°F (30°C)',
    humidity: '58%',
    uv: '8 (Very High)',
    wind: '11 mph E',
    solarAltitude: '+62.4° (Midday)',
    imageUrl: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1200&q=80',
    overlayGradient: 'from-sky-900/20 via-blue-950/20 to-slate-950/50',
    badge: 'CLEAR MIDDAY',
    description: 'Radiant tropical sunlight with gentle trade-wind cirrus clouds.',
  },
  dusk: {
    id: 'dusk',
    name: 'Golden Sunset Glow',
    condition: 'Sunset Dusk · Vivid Amber Horizon',
    temp: '82°F (28°C)',
    humidity: '68%',
    uv: '1 (Minimal)',
    wind: '8 mph SE',
    solarAltitude: '+2.1° (Dusk)',
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
    overlayGradient: 'from-rose-950/30 via-amber-950/30 to-slate-950/70',
    badge: 'DUSK GOLDEN HOUR',
    description: 'Atmospheric amber rays diffusing through the evening twilight boundary.',
  },
  night: {
    id: 'night',
    name: 'Celestial Night Sky',
    condition: 'Clear Starlit Night · Waxing Moon',
    temp: '78°F (25°C)',
    humidity: '75%',
    uv: '0 (None)',
    wind: '5 mph ESE',
    solarAltitude: '-38.5° (Night)',
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
    overlayGradient: 'from-indigo-950/40 via-slate-950/50 to-black/80',
    badge: 'COSMIC NIGHT',
    description: 'Deep cosmic atmosphere with twinkling constellations and silver lunar radiance.',
  },
};

export const AnalogTrafficClock: React.FC<AnalogTrafficClockProps> = ({
  currentSimulatedMinutes,
  currentSegment,
  nextSegment,
  isSleeping,
  onOpenDetail,
}) => {
  const [seconds, setSeconds] = useState<number>(() => new Date().getSeconds());
  const [skyMode, setSkyMode] = useState<'auto' | 'dawn' | 'day' | 'dusk' | 'night'>('auto');
  const [skyFraming, setSkyFraming] = useState<'framed' | 'backdrop' | 'minimal'>('framed');

  // Real-time second hand tick
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(new Date().getSeconds());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const color = currentSegment?.color || 'gray';

  // Calculate clock hand angles
  // 12-hour clock: 720 minutes = 360 deg => 0.5 deg per minute
  const hoursFraction = (currentSimulatedMinutes % 720) / 720;
  const hourAngle = hoursFraction * 360;

  // 60 minutes = 360 deg => 6 deg per minute
  const minuteAngle = ((currentSimulatedMinutes % 60) / 60) * 360;

  // Second angle
  const secondAngle = (seconds / 60) * 360;

  // Derive auto sky theme based on solar time
  const activeSkyThemeKey = React.useMemo(() => {
    if (skyMode !== 'auto') return skyMode;
    // Miami sunrise ~417m (6:57 AM), sunset ~1188m (7:48 PM)
    if (currentSimulatedMinutes >= 330 && currentSimulatedMinutes < 480) {
      return 'dawn'; // 5:30 AM to 8:00 AM
    } else if (currentSimulatedMinutes >= 480 && currentSimulatedMinutes < 1080) {
      return 'day'; // 8:00 AM to 6:00 PM
    } else if (currentSimulatedMinutes >= 1080 && currentSimulatedMinutes < 1230) {
      return 'dusk'; // 6:00 PM to 8:30 PM
    } else {
      return 'night'; // 8:30 PM to 5:30 AM
    }
  }, [skyMode, currentSimulatedMinutes]);

  const activeSky = SKY_THEMES[activeSkyThemeKey] || SKY_THEMES.day;

  // Remaining minutes
  const minutesRemaining = currentSegment
    ? Math.max(0, currentSegment.endMinutes - currentSimulatedMinutes)
    : 0;

  // Signal color styles
  const signalTheme = {
    green: {
      label: 'GREEN SIGNAL',
      statusText: 'GO · AUSPICIOUS',
      ringColor: '#22C55E',
      ringGlow: 'rgba(34, 197, 94, 0.4)',
      bgLight: 'bg-emerald-50',
      borderLight: 'border-emerald-200',
      badgeBg: 'bg-emerald-600',
      badgeText: 'text-white',
      digitAccent: 'text-emerald-600 bg-emerald-50 border-emerald-300',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
    },
    red: {
      label: 'RED SIGNAL',
      statusText: 'STOP · INITIATION REST',
      ringColor: '#EF4444',
      ringGlow: 'rgba(239, 68, 68, 0.4)',
      bgLight: 'bg-rose-50',
      borderLight: 'border-rose-200',
      badgeBg: 'bg-rose-600',
      badgeText: 'text-white',
      digitAccent: 'text-rose-600 bg-rose-50 border-rose-300',
      icon: <XCircle className="w-4 h-4 text-rose-600" />,
    },
    yellow: {
      label: 'YELLOW SIGNAL',
      statusText: 'CAUTION · GOLDEN HOUR / OVERLAP',
      ringColor: '#FBBF24',
      ringGlow: 'rgba(251, 191, 36, 0.4)',
      bgLight: 'bg-amber-50',
      borderLight: 'border-amber-200',
      badgeBg: 'bg-amber-500',
      badgeText: 'text-slate-950',
      digitAccent: 'text-amber-700 bg-amber-50 border-amber-300',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
    },
    gray: {
      label: isSleeping ? 'REST SIGNAL' : 'NEUTRAL SIGNAL',
      statusText: isSleeping ? 'REST · SLEEP SCHEDULE ACTIVE' : 'NEUTRAL · PASSIVE REST',
      ringColor: '#94A3B8',
      ringGlow: 'rgba(148, 163, 184, 0.3)',
      bgLight: 'bg-slate-50',
      borderLight: 'border-slate-200',
      badgeBg: 'bg-slate-700',
      badgeText: 'text-white',
      digitAccent: 'text-slate-700 bg-slate-100 border-slate-300',
      icon: <Clock className="w-4 h-4 text-slate-500" />,
    },
  }[color];

  // Hours and minutes for two-tone digital split display
  const hoursNum = Math.floor(currentSimulatedMinutes / 60) % 24;
  const minsNum = currentSimulatedMinutes % 60;
  const ampm = hoursNum >= 12 ? 'PM' : 'AM';
  const display12Hours = hoursNum % 12 === 0 ? 12 : hoursNum % 12;
  const formattedHours = display12Hours.toString().padStart(2, '0');
  const formattedMins = minsNum.toString().padStart(2, '0');
  const formattedSecs = seconds.toString().padStart(2, '0');

  return (
    <div className="w-full space-y-6">
      {/* Top Atmosphere & Sky Photo Control Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Weather & Sky Badge */}
        <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-full px-4 py-1.5 shadow-sm">
          <CloudSun className="w-4 h-4 text-amber-500" />
          <span className="font-bold text-slate-900">Miami, FL</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-600 font-medium">{activeSky.temp}</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-500 font-mono hidden sm:inline">{activeSky.condition}</span>
        </div>

        {/* Sky Photo Mode Selector */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full p-1 shadow-sm">
          <button
            onClick={() => setSkyMode('auto')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
              skyMode === 'auto'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Auto synchronize with solar day cycle"
          >
            Auto Solar
          </button>
          <button
            onClick={() => setSkyMode('dawn')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
              skyMode === 'dawn'
                ? 'bg-amber-600 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dawn
          </button>
          <button
            onClick={() => setSkyMode('day')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
              skyMode === 'day'
                ? 'bg-sky-600 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setSkyMode('dusk')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
              skyMode === 'dusk'
                ? 'bg-rose-600 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dusk
          </button>
          <button
            onClick={() => setSkyMode('night')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
              skyMode === 'night'
                ? 'bg-indigo-900 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Night
          </button>
        </div>
      </div>

      {/* Main Clock Card: Merged Analog Dial, Two-Tone Display & Natural Sky Window */}
      <div className="relative rounded-[36px] bg-white border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-8">
        {/* Natural Sky Photo Element Header / Window */}
        <div className="relative w-full h-32 sm:h-40 rounded-3xl overflow-hidden border border-slate-200/80 shadow-inner group">
          {/* Background Sky Image */}
          <img
            src={activeSky.imageUrl}
            alt={activeSky.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-95"
          />
          {/* Sky Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

          {/* Live Sky & Weather telemetry inside photo */}
          <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-white drop-shadow">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[10px] font-mono font-bold tracking-wider uppercase text-amber-300">
                {activeSky.badge}
              </span>
              <span className="text-xs font-semibold text-white/90 hidden sm:inline">
                {activeSky.name}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-white/90">
              <span className="flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-300" />
                <span>Alt {activeSky.solarAltitude}</span>
              </span>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-sky-300" />
                <span>{activeSky.wind}</span>
              </span>
            </div>
          </div>

          {/* Bottom title in sky card */}
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
            <div>
              <div className="text-sm sm:text-base font-bold drop-shadow-md">
                {activeSky.condition}
              </div>
              <div className="text-[11px] text-white/80 line-clamp-1 max-w-md">
                {activeSky.description}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-mono text-white/80 uppercase">Humidity</div>
              <div className="text-sm font-bold font-mono text-amber-300">{activeSky.humidity}</div>
            </div>
          </div>
        </div>

        {/* Center: Analog Traffic Clock Dial & Two-Tone Digital Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-items-center">
          {/* 1. Precision Analog Clock Dial */}
          <div className="flex flex-col items-center">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
              {/* Outer Traffic Signal Glow Halo */}
              <div
                className="absolute inset-0 rounded-full transition-all duration-700 filter blur-xl opacity-30"
                style={{ backgroundColor: signalTheme.ringColor }}
              />

              {/* Clock Outer Bezel */}
              <div
                className="w-full h-full rounded-full bg-white border-4 relative shadow-2xl flex items-center justify-center transition-colors duration-500"
                style={{ borderColor: signalTheme.ringColor }}
              >
                {/* SVG Dial for Indices and Hour Marks */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
                  {/* Subtle outer circular track */}
                  <circle
                    cx="100"
                    cy="100"
                    r="92"
                    fill="none"
                    stroke="#F1F5F9"
                    strokeWidth="3"
                  />

                  {/* 12 Hour Index Markers */}
                  {Array.from({ length: 12 }).map((_, i) => {
                    const angle = (i * 30 * Math.PI) / 180;
                    const isCardinal = i % 3 === 0;
                    const r1 = 88;
                    const r2 = isCardinal ? 74 : 80;
                    const x1 = 100 + r1 * Math.sin(angle);
                    const y1 = 100 - r1 * Math.cos(angle);
                    const x2 = 100 + r2 * Math.sin(angle);
                    const y2 = 100 - r2 * Math.cos(angle);

                    return (
                      <line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={isCardinal ? '#0F172A' : '#94A3B8'}
                        strokeWidth={isCardinal ? 2.5 : 1.2}
                        strokeLinecap="round"
                      />
                    );
                  })}

                  {/* 60 Minute Fine Ticks */}
                  {Array.from({ length: 60 }).map((_, i) => {
                    if (i % 5 === 0) return null; // skip hour markers
                    const angle = (i * 6 * Math.PI) / 180;
                    const r1 = 88;
                    const r2 = 84;
                    const x1 = 100 + r1 * Math.sin(angle);
                    const y1 = 100 - r1 * Math.cos(angle);
                    const x2 = 100 + r2 * Math.sin(angle);
                    const y2 = 100 - r2 * Math.cos(angle);

                    return (
                      <line
                        key={`m-${i}`}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#CBD5E1"
                        strokeWidth="0.8"
                      />
                    );
                  })}

                  {/* Cardinal Numerals 12, 3, 6, 9 */}
                  <text
                    x="100"
                    y="36"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="font-bold text-[13px] fill-slate-900 font-mono select-none"
                  >
                    12
                  </text>
                  <text
                    x="168"
                    y="100"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="font-bold text-[13px] fill-slate-900 font-mono select-none"
                  >
                    3
                  </text>
                  <text
                    x="100"
                    y="166"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="font-bold text-[13px] fill-slate-900 font-mono select-none"
                  >
                    6
                  </text>
                  <text
                    x="32"
                    y="100"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="font-bold text-[13px] fill-slate-900 font-mono select-none"
                  >
                    9
                  </text>

                  {/* WuuWuu Brand Watermark */}
                  <text
                    x="100"
                    y="72"
                    textAnchor="middle"
                    className="text-[8px] tracking-[0.25em] font-mono font-bold uppercase fill-slate-400 select-none"
                  >
                    WUUWUU
                  </text>
                  <text
                    x="100"
                    y="130"
                    textAnchor="middle"
                    className="text-[7px] tracking-widest font-mono uppercase fill-slate-400 select-none"
                  >
                    TRAFFIC SIGNAL
                  </text>
                </svg>

                {/* Clock Hands Container */}
                {/* Hour Hand */}
                <div
                  className="absolute w-1.5 h-18 bg-slate-900 rounded-full origin-bottom shadow-md transition-transform duration-500"
                  style={{
                    top: 'calc(50% - 4.5rem)',
                    left: 'calc(50% - 0.1875rem)',
                    transform: `rotate(${hourAngle}deg)`,
                  }}
                />

                {/* Minute Hand */}
                <div
                  className="absolute w-1 h-24 bg-slate-800 rounded-full origin-bottom shadow transition-transform duration-500"
                  style={{
                    top: 'calc(50% - 6rem)',
                    left: 'calc(50% - 0.125rem)',
                    transform: `rotate(${minuteAngle}deg)`,
                  }}
                />

                {/* Smooth Second Hand (Traffic Colored) */}
                <div
                  className="absolute w-0.5 h-28 rounded-full origin-bottom transition-transform duration-100"
                  style={{
                    backgroundColor: signalTheme.ringColor,
                    top: 'calc(50% - 7rem)',
                    left: 'calc(50% - 0.0625rem)',
                    transform: `rotate(${secondAngle}deg)`,
                  }}
                />

                {/* Center Pivot Bezel with Traffic Glow Halo */}
                <div
                  className="absolute w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center transition-colors duration-500"
                  style={{ backgroundColor: signalTheme.ringColor }}
                >
                  <div className="w-2 h-2 rounded-full bg-white shadow-inner" />
                </div>
              </div>
            </div>

            <div className="mt-3 text-center">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Analog Cosmic Overlay
              </span>
            </div>
          </div>

          {/* 2. Digital Two-Tone Display & Traffic Status */}
          <div className="w-full space-y-5 flex flex-col items-center md:items-start text-center md:text-left">
            {/* Signal Badge */}
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border flex items-center gap-1.5 ${signalTheme.digitAccent}`}
              >
                {signalTheme.icon}
                <span>{signalTheme.label}</span>
              </span>

              <span className="text-xs font-mono text-slate-400">
                {minutesRemaining}m left
              </span>
            </div>

            {/* TWO-TONE DIGITAL TIME DISPLAY */}
            <div className="space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                TWO-TONE DIGITAL TRAFFIC READOUT
              </div>

              {/* The Two-Tone High Contrast Time Block */}
              <div className="inline-flex items-center gap-2 p-2.5 rounded-3xl bg-slate-50 border border-slate-200 shadow-inner">
                {/* Tone 1: Midnight Slate Hours */}
                <div className="px-4 py-2 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <span className="text-4xl sm:text-5xl font-mono font-extrabold text-slate-900 tracking-tight">
                    {formattedHours}
                  </span>
                </div>

                <span className="text-3xl font-mono font-bold text-slate-400 animate-pulse">:</span>

                {/* Tone 2: Signal Light Responsive Minute Box */}
                <div
                  className={`px-4 py-2 rounded-2xl border shadow-sm transition-colors duration-500 ${signalTheme.digitAccent}`}
                >
                  <span className="text-4xl sm:text-5xl font-mono font-extrabold tracking-tight">
                    {formattedMins}
                  </span>
                </div>

                {/* Seconds & AM/PM Column */}
                <div className="flex flex-col justify-between pl-1 text-left font-mono">
                  <span className="text-sm font-bold text-slate-900">{ampm}</span>
                  <span className="text-xs font-semibold text-slate-400">:{formattedSecs}s</span>
                </div>
              </div>
            </div>

            {/* Current Active Window & Story Context */}
            <div className="w-full space-y-1.5 pt-1">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Active Panchang Interval
              </div>
              <div className="text-2xl font-serif italic text-slate-900 font-normal">
                {currentSegment?.reason || 'Neutral Window'}
              </div>
              <div className="text-xs font-mono text-slate-500">
                {currentSegment?.startTimeFormatted || '12:00 AM'} – {currentSegment?.endTimeFormatted || '12:00 AM'} · Rule: {currentSegment?.ruleTriggered}
              </div>
            </div>

            {/* Quick Action Button to Detail & Story */}
            {onOpenDetail && (
              <button
                id="wuuwuu-open-detail-btn"
                onClick={onOpenDetail}
                className="mt-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2 group"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Inspect Window Detail & Story</span>
              </button>
            )}
          </div>
        </div>

        {/* Next Upcoming Transition Bar */}
        {nextSegment && (
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-400 uppercase tracking-wider">Next Shift:</span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  nextSegment.color === 'green'
                    ? 'bg-[#22C55E]'
                    : nextSegment.color === 'red'
                    ? 'bg-[#EF4444]'
                    : nextSegment.color === 'yellow'
                    ? 'bg-[#FBBF24]'
                    : 'bg-slate-400'
                }`}
              />
              <span className="font-bold text-slate-900">{nextSegment.reason}</span>
              <span className="font-mono text-slate-500">
                ({nextSegment.startTimeFormatted} – {nextSegment.endTimeFormatted})
              </span>
            </div>

            <div className="text-slate-400 font-mono text-[11px]">
              Automatic rule evaluation active
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
