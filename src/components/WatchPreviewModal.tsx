import React, { useState, useEffect } from 'react';
import { Watch, Sparkles, Sun, Moon } from 'lucide-react';
import { TimelineSegment, TrafficColor } from '../types';
import { STATIC_INTERPRETATIONS } from '../data/defaultData';
import { formatMinutesToReadable } from '../engine/timingEngine';
import { ZodiacGlyph, MoonPhaseVector, ZODIAC_LIST, ZodiacSignName } from './ZodiacGlyphs';

interface WatchPreviewModalProps {
  currentSegment: TimelineSegment | null;
  currentSimulatedMinutes: number;
  isSleeping: boolean;
}

export const MOON_PHASE_OPTIONS = [
  { id: 'waxing_gibbous', name: 'Waxing Gibbous', illumination: '82%', description: 'Building energy & clarity' },
  { id: 'full_moon', name: 'Full Moon', illumination: '100%', description: 'Peak illumination & intuition' },
  { id: 'waning_gibbous', name: 'Waning Gibbous', illumination: '84%', description: 'Reflective integration' },
  { id: 'new_moon', name: 'New Moon', illumination: '0%', description: 'New beginnings & planting seeds' },
  { id: 'waxing_crescent', name: 'Waxing Crescent', illumination: '25%', description: 'Intention setting' },
  { id: 'first_quarter', name: 'First Quarter', illumination: '50%', description: 'Action & decision momentum' },
];

export const WatchPreviewModal: React.FC<WatchPreviewModalProps> = ({
  currentSegment,
  currentSimulatedMinutes,
  isSleeping,
}) => {
  const [seconds, setSeconds] = useState<number>(() => new Date().getSeconds());
  const [watchFaceStyle, setWatchFaceStyle] = useState<'traffic_dial' | 'sky_dial'>('traffic_dial');

  // Sun & Moon Zodiac Astrological Placements (August 24 Vedic/Sidereal: Sun in Leo, Moon in Sagittarius)
  const [sunSign, setSunSign] = useState<ZodiacSignName>('Leo');
  const [moonSign, setMoonSign] = useState<ZodiacSignName>('Sagittarius');
  const [moonPhaseId, setMoonPhaseId] = useState<string>('waxing_gibbous');

  // Real-time ticking second hand
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(new Date().getSeconds());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const color = currentSegment?.color || 'gray';
  const minutesRemaining = currentSegment
    ? Math.max(0, currentSegment.endMinutes - currentSimulatedMinutes)
    : 0;

  // Angles for Watch Analog Hands
  const hoursFraction = (currentSimulatedMinutes % 720) / 720;
  const hourAngle = hoursFraction * 360;
  const minuteAngle = ((currentSimulatedMinutes % 60) / 60) * 360;
  const secondAngle = (seconds / 60) * 360;

  // Digital Two-Tone values
  const hoursNum = Math.floor(currentSimulatedMinutes / 60) % 24;
  const minsNum = currentSimulatedMinutes % 60;
  const ampm = hoursNum >= 12 ? 'PM' : 'AM';
  const display12Hours = hoursNum % 12 === 0 ? 12 : hoursNum % 12;
  const formattedHours = display12Hours.toString().padStart(2, '0');
  const formattedMins = minsNum.toString().padStart(2, '0');

  const selectedMoonPhase = MOON_PHASE_OPTIONS.find((p) => p.id === moonPhaseId) || MOON_PHASE_OPTIONS[0];

  const colorData = {
    green: {
      text: 'GREEN',
      glow: 'shadow-[0_0_30px_rgba(34,197,94,0.6)]',
      dot: 'bg-emerald-400',
      textColor: 'text-emerald-400',
      ringColor: '#22C55E',
      badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-700',
      minuteTone: 'bg-emerald-900/80 text-emerald-300 border-emerald-600',
    },
    red: {
      text: 'RED',
      glow: 'shadow-[0_0_30px_rgba(239,68,68,0.6)]',
      dot: 'bg-rose-500',
      textColor: 'text-rose-400',
      ringColor: '#EF4444',
      badgeBg: 'bg-rose-950/80 text-rose-300 border-rose-700',
      minuteTone: 'bg-rose-900/80 text-rose-300 border-rose-600',
    },
    yellow: {
      text: 'YELLOW',
      glow: 'shadow-[0_0_30px_rgba(251,191,36,0.6)]',
      dot: 'bg-amber-400',
      textColor: 'text-amber-400',
      ringColor: '#FBBF24',
      badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-700',
      minuteTone: 'bg-amber-900/80 text-amber-300 border-amber-600',
    },
    gray: {
      text: isSleeping ? 'REST' : 'NEUTRAL',
      glow: 'shadow-[0_0_20px_rgba(148,163,184,0.3)]',
      dot: 'bg-slate-400',
      textColor: 'text-slate-300',
      ringColor: '#94A3B8',
      badgeBg: 'bg-slate-900/80 text-slate-300 border-slate-700',
      minuteTone: 'bg-slate-800/80 text-slate-300 border-slate-600',
    },
  }[color];

  const bestFor = STATIC_INTERPRETATIONS[color]?.bestFor || 'routine work';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Watch className="w-5 h-5 text-slate-700" />
            <span>Apple Watch & Celestial Complications</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Vector astrological glyphs for Sun in {sunSign} (hour tip), Moon in {moonSign} (minute tip), and vector moon phase background.
          </p>
        </div>

        {/* Watch face style toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full text-xs self-start sm:self-auto">
          <button
            onClick={() => setWatchFaceStyle('traffic_dial')}
            className={`px-3 py-1 rounded-full font-semibold transition-colors ${
              watchFaceStyle === 'traffic_dial'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Classic Dial
          </button>
          <button
            onClick={() => setWatchFaceStyle('sky_dial')}
            className={`px-3 py-1 rounded-full font-semibold transition-colors ${
              watchFaceStyle === 'sky_dial'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sky Atmosphere
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center">
        {/* Watch Face Simulation */}
        <div className="flex flex-col items-center">
          <div className="text-xs font-mono uppercase text-slate-400 mb-3 font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Apple Watch Series 9 / Ultra (45mm)</span>
          </div>

          {/* Watch Chassis */}
          <div className="w-68 h-84 bg-black rounded-[50px] border-[7px] border-slate-300 p-3.5 shadow-2xl relative flex flex-col justify-between items-center text-center overflow-hidden ring-1 ring-slate-400/30">
            {/* Optional Sky Backdrop behind dial */}
            {watchFaceStyle === 'sky_dial' && (
              <div className="absolute inset-0 opacity-30 pointer-events-none">
                <img
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
                  alt="Sky"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80" />
              </div>
            )}

            {/* Top Watch Complication Row */}
            <div className="w-full flex justify-between items-center text-[10px] font-mono text-zinc-300 px-3 pt-1 z-10">
              <span className="flex items-center gap-1 font-bold">
                <span className={`w-2 h-2 rounded-full ${colorData.dot} animate-pulse`} />
                <span className="text-white">{colorData.text}</span>
              </span>
              <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1.5">
                <MoonPhaseVector phase={moonPhaseId} className="w-3.5 h-3.5" />
                <span className="text-zinc-300 font-mono">{selectedMoonPhase.illumination}</span>
              </span>
            </div>

            {/* ANALOG CLOCK OVERLAY DIAL WITH MOON PHASE BACKGROUND */}
            <div className="relative w-48 h-48 my-auto flex items-center justify-center z-10">
              {/* Outer Signal Glow Ring */}
              <div
                className="absolute inset-0 rounded-full transition-all duration-700 filter blur-md opacity-40"
                style={{ backgroundColor: colorData.ringColor }}
              />

              {/* Analog Watch Dial Bezel */}
              <div
                className="w-full h-full rounded-full bg-zinc-950/95 border-2 relative shadow-inner flex items-center justify-center transition-colors duration-500 overflow-hidden"
                style={{ borderColor: colorData.ringColor }}
              >
                {/* 1. MOON PHASE BACKGROUND GRAPHIC IN CLOCK FACE (Clean Vector Lunar Silhouette) */}
                <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none">
                  <div className="w-36 h-36 rounded-full relative flex items-center justify-center">
                    <MoonPhaseVector phase={moonPhaseId} className="w-32 h-32 opacity-75" />
                    {/* Moon Phase Watermark Text */}
                    <div className="text-[7px] font-mono tracking-widest text-slate-400 absolute bottom-9 font-bold uppercase select-none">
                      {selectedMoonPhase.name}
                    </div>
                  </div>
                </div>

                {/* SVG Dial for Indices & Numbers */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 160 160">
                  {/* Subtle track */}
                  <circle cx="80" cy="80" r="74" fill="none" stroke="#27272A" strokeWidth="1.5" />

                  {/* 12 Hour Index Markers */}
                  {Array.from({ length: 12 }).map((_, i) => {
                    const angle = (i * 30 * Math.PI) / 180;
                    const isCardinal = i % 3 === 0;
                    const r1 = 72;
                    const r2 = isCardinal ? 62 : 66;
                    const x1 = 80 + r1 * Math.sin(angle);
                    const y1 = 80 - r1 * Math.cos(angle);
                    const x2 = 80 + r2 * Math.sin(angle);
                    const y2 = 80 - r2 * Math.cos(angle);

                    return (
                      <line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={isCardinal ? '#FFFFFF' : '#71717A'}
                        strokeWidth={isCardinal ? 2 : 1}
                        strokeLinecap="round"
                      />
                    );
                  })}

                  {/* Cardinal Numerals 12, 3, 6, 9 */}
                  <text
                    x="80"
                    y="25"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="font-bold text-[10px] fill-white font-mono select-none"
                  >
                    12
                  </text>
                  <text
                    x="137"
                    y="80"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="font-bold text-[10px] fill-white font-mono select-none"
                  >
                    3
                  </text>
                  <text
                    x="80"
                    y="135"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="font-bold text-[10px] fill-white font-mono select-none"
                  >
                    6
                  </text>
                  <text
                    x="23"
                    y="80"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="font-bold text-[10px] fill-white font-mono select-none"
                  >
                    9
                  </text>
                </svg>

                {/* Subdial / Digital Two-Tone Complication Capsule at Center-Bottom */}
                <div className="absolute bottom-5 flex items-center gap-1 bg-black/85 px-2 py-0.5 rounded-full border border-zinc-800 z-10 shadow-md">
                  <span className="text-[9px] font-mono font-bold text-white">{formattedHours}</span>
                  <span className="text-[9px] font-mono text-zinc-500">:</span>
                  <span className="text-[9px] font-mono font-bold" style={{ color: colorData.ringColor }}>
                    {formattedMins}
                  </span>
                  <span className="text-[7px] font-mono text-zinc-400 uppercase">{ampm}</span>
                </div>

                {/* 2. HOUR HAND WITH MINI SUN & VECTOR ZODIAC GLYPH AT TIP */}
                <div
                  className="absolute w-1.5 h-12 bg-gradient-to-t from-zinc-400 to-amber-200 rounded-full origin-bottom shadow-md transition-transform duration-500 z-20 flex flex-col items-center"
                  style={{
                    top: 'calc(50% - 3rem)',
                    left: 'calc(50% - 0.1875rem)',
                    transform: `rotate(${hourAngle}deg)`,
                  }}
                >
                  {/* Sun Tip Charm with Vector Zodiac Glyph (No Emoji) */}
                  <div
                    className="w-5.5 h-5.5 -mt-3.5 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border border-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.8)] flex items-center justify-center text-amber-950 select-none animate-pulse"
                    title={`Sun in ${sunSign}`}
                    style={{ transform: `rotate(${-hourAngle}deg)` }}
                  >
                    <ZodiacGlyph sign={sunSign} className="w-3.5 h-3.5 text-amber-950" strokeWidth={2.5} />
                  </div>
                </div>

                {/* 3. MINUTE HAND WITH MINI MOON & VECTOR ZODIAC GLYPH AT TIP */}
                <div
                  className="absolute w-1 h-16 bg-gradient-to-t from-zinc-500 to-sky-200 rounded-full origin-bottom shadow transition-transform duration-500 z-20 flex flex-col items-center"
                  style={{
                    top: 'calc(50% - 4rem)',
                    left: 'calc(50% - 0.125rem)',
                    transform: `rotate(${minuteAngle}deg)`,
                  }}
                >
                  {/* Moon Tip Charm with Vector Zodiac Glyph (No Emoji) */}
                  <div
                    className="w-5 h-5 -mt-3 rounded-full bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 border border-sky-300/80 shadow-[0_0_8px_rgba(56,189,248,0.8)] flex items-center justify-center text-sky-200 select-none"
                    title={`Moon in ${moonSign}`}
                    style={{ transform: `rotate(${-minuteAngle}deg)` }}
                  >
                    <ZodiacGlyph sign={moonSign} className="w-3 h-3 text-sky-200" strokeWidth={2.5} />
                  </div>
                </div>

                {/* Second Hand (Signal Color) */}
                <div
                  className="absolute w-0.5 h-20 rounded-full origin-bottom transition-transform duration-100 z-30"
                  style={{
                    backgroundColor: colorData.ringColor,
                    top: 'calc(50% - 5rem)',
                    left: 'calc(50% - 0.0625rem)',
                    transform: `rotate(${secondAngle}deg)`,
                  }}
                />

                {/* Pivot Center Pin */}
                <div
                  className="absolute w-3.5 h-3.5 rounded-full border border-black shadow-md flex items-center justify-center z-40 transition-colors duration-500"
                  style={{ backgroundColor: colorData.ringColor }}
                >
                  <div className="w-1 h-1 rounded-full bg-white" />
                </div>
              </div>
            </div>

            {/* Bottom Watch Info Card */}
            <div className="w-full bg-zinc-900/90 rounded-2xl p-2 border border-zinc-800 text-[10px] z-10 space-y-0.5">
              <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400">
                <span className="truncate max-w-[130px] text-zinc-200 font-semibold flex items-center gap-1.5">
                  <span className="flex items-center gap-1 text-amber-300">
                    <Sun className="w-2.5 h-2.5" />
                    <ZodiacGlyph sign={sunSign} className="w-2.5 h-2.5 text-amber-300" strokeWidth={2.5} />
                  </span>
                  <span className="text-zinc-500">·</span>
                  <span className="flex items-center gap-1 text-sky-300">
                    <Moon className="w-2.5 h-2.5" />
                    <ZodiacGlyph sign={moonSign} className="w-2.5 h-2.5 text-sky-300" strokeWidth={2.5} />
                  </span>
                </span>
                <span className="font-bold text-white">
                  {minutesRemaining}m left
                </span>
              </div>
              <div className="text-[9px] font-mono text-zinc-400 truncate text-left">
                {currentSegment?.reason || 'Neutral'} · {bestFor}
              </div>
            </div>
          </div>
        </div>

        {/* Watch Complications & Celestial Controls */}
        <div className="space-y-4">
          {/* Celestial Placements Banner */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-sm">
            <div className="text-xs font-semibold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Sun & Moon Vector Astrology Hands</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">Sidereal Placements</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Sun Hand Placement */}
              <div className="p-2.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-amber-800 flex items-center gap-1">
                    <Sun className="w-3 h-3 text-amber-600" />
                    <span>Hour Tip (Sun)</span>
                  </span>
                  <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center">
                    <ZodiacGlyph sign={sunSign} className="w-3 h-3 text-amber-900" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="font-bold text-slate-900">Sun in {sunSign}</div>
                <div className="text-[10px] text-slate-500">Vector glyph inside solar hour tip</div>
              </div>

              {/* Moon Hand Placement */}
              <div className="p-2.5 rounded-2xl bg-sky-50/60 border border-sky-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-sky-800 flex items-center gap-1">
                    <Moon className="w-3 h-3 text-sky-600" />
                    <span>Minute Tip (Moon)</span>
                  </span>
                  <div className="w-5 h-5 rounded-full bg-sky-200 flex items-center justify-center">
                    <ZodiacGlyph sign={moonSign} className="w-3 h-3 text-sky-900" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="font-bold text-slate-900">Moon in {moonSign}</div>
                <div className="text-[10px] text-slate-500">Vector glyph inside lunar minute tip</div>
              </div>
            </div>

            {/* Moon Phase Dial Info */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MoonPhaseVector phase={moonPhaseId} className="w-7 h-7" />
                <div>
                  <div className="text-xs font-bold text-slate-900">{selectedMoonPhase.name} Background</div>
                  <div className="text-[10px] text-slate-500">{selectedMoonPhase.description}</div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                {selectedMoonPhase.illumination}
              </span>
            </div>

            {/* Quick Astrological Transit Selectors */}
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                Test Astrological Transits
              </div>
              <div className="flex items-center gap-2 text-xs">
                <label className="text-[11px] font-medium text-slate-600 w-16">Sun Sign:</label>
                <select
                  value={sunSign}
                  onChange={(e) => setSunSign(e.target.value as ZodiacSignName)}
                  className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {ZODIAC_LIST.map((z) => (
                    <option key={z.name} value={z.name}>
                      {z.name} ({z.element})
                    </option>
                  ))}
                </select>

                <label className="text-[11px] font-medium text-slate-600 w-16 ml-2">Moon Sign:</label>
                <select
                  value={moonSign}
                  onChange={(e) => setMoonSign(e.target.value as ZodiacSignName)}
                  className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  {ZODIAC_LIST.map((z) => (
                    <option key={z.name} value={z.name}>
                      {z.name} ({z.element})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 1. Circular Corner Complication */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-sm">
            <div className="text-xs font-semibold text-slate-900 flex items-center justify-between">
              <span>Circular Dial Complication</span>
              <span className="text-[10px] font-mono text-slate-400">Corner / Modular</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-slate-950 border-2 border-slate-700 flex flex-col items-center justify-center shadow-md relative">
                <span
                  className="w-3.5 h-3.5 rounded-full mb-0.5 animate-pulse"
                  style={{ backgroundColor: colorData.ringColor }}
                />
                <span className="text-[10px] font-mono font-bold text-white">
                  {minutesRemaining}m
                </span>
                <div
                  className="absolute inset-0 rounded-full border border-dashed opacity-40"
                  style={{ borderColor: colorData.ringColor }}
                />
              </div>

              <div className="text-xs text-slate-600 leading-relaxed">
                Real-time traffic dot + remaining duration (<strong className="text-slate-900 font-semibold">{minutesRemaining}m remaining</strong> in {colorData.text} light).
              </div>
            </div>
          </div>

          {/* 2. Two-Tone Inline Rectangular Widget */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-sm">
            <div className="text-xs font-semibold text-slate-900 flex items-center justify-between">
              <span>Two-Tone Lockscreen Widget</span>
              <span className="text-[10px] font-mono text-slate-400">Smart Stack / Lockscreen</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 text-white border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center font-mono font-bold text-xs bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                  <span className="text-white">{formattedHours}</span>
                  <span className="text-slate-500">:</span>
                  <span style={{ color: colorData.ringColor }}>{formattedMins}</span>
                </div>
                <span className="text-xs font-bold text-white truncate max-w-[140px]">
                  {colorData.text} · {currentSegment?.reason}
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                to {currentSegment?.endTimeFormatted}
              </span>
            </div>
          </div>

          {/* 3. JSON Payload Spec for WatchOS Sync */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 space-y-2 shadow-sm">
            <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">
              WatchOS Sync Payload (WuuWuu Analog Dial)
            </div>
            <pre className="text-[11px] font-mono text-slate-800 overflow-x-auto p-3 bg-slate-50 rounded-2xl border border-slate-200">
{JSON.stringify(
  {
    appName: 'WuuWuu Clock',
    celestialHands: {
      sunHourTip: {
        vectorSymbol: `ZodiacGlyph:${sunSign}`,
        sign: sunSign,
      },
      moonMinuteTip: {
        vectorSymbol: `ZodiacGlyph:${moonSign}`,
        sign: moonSign,
      },
      moonPhase: {
        id: selectedMoonPhase.id,
        name: selectedMoonPhase.name,
        illumination: selectedMoonPhase.illumination,
      },
    },
    analogOverlay: {
      hourAngle: Math.round(hourAngle),
      minuteAngle: Math.round(minuteAngle),
      signalBezelColor: colorData.ringColor,
    },
    twoToneDigital: {
      hours: formattedHours,
      minutes: formattedMins,
      period: ampm,
    },
    currentState: color,
    reason: currentSegment?.reason,
    minutesRemaining,
    sleepMode: isSleeping,
  },
  null,
  2
)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};


