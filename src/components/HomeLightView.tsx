import React, { useState } from 'react';
import {
  ChevronRight,
  Sparkles,
  Info,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Volume2,
  VolumeX,
  Sliders,
  Compass,
  Layers,
  Radio,
} from 'lucide-react';
import { TimelineSegment, TrafficColor } from '../types';
import { STATIC_INTERPRETATIONS } from '../data/defaultData';
import { formatMinutesToReadable } from '../engine/timingEngine';
import { AnalogTrafficClock } from './AnalogTrafficClock';

interface HomeLightViewProps {
  currentSegment: TimelineSegment | null;
  nextSegment: TimelineSegment | null;
  currentSimulatedMinutes: number;
  onOpenDetail: () => void;
  onOpenToday: () => void;
  isSleeping: boolean;
  onToggleSleep: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const HomeLightView: React.FC<HomeLightViewProps> = ({
  currentSegment,
  nextSegment,
  currentSimulatedMinutes,
  onOpenDetail,
  onOpenToday,
  isSleeping,
  onToggleSleep,
  soundEnabled,
  onToggleSound,
}) => {
  const [displayMode, setDisplayMode] = useState<'wuuwuu_clock' | 'signal_lamp'>('wuuwuu_clock');
  const color = currentSegment?.color || 'gray';

  // Calculate minutes remaining until current segment finishes
  const minutesRemaining = currentSegment
    ? Math.max(0, currentSegment.endMinutes - currentSimulatedMinutes)
    : 0;

  // Guidance texts according to color
  const defaultGuidance = STATIC_INTERPRETATIONS[color] || STATIC_INTERPRETATIONS.gray;

  // Clean Minimalism Color Configurations
  const colorTheme = {
    green: {
      label: 'GREEN',
      meaning: 'Favorable window for action',
      lampBg: 'bg-[#22C55E]',
      glow: 'shadow-[0_0_80px_rgba(34,197,94,0.3)]',
      textColor: 'text-white',
      dotColor: 'bg-[#22C55E]',
      accentBorder: 'border-emerald-200',
      nextDot: 'bg-[#22C55E]',
    },
    red: {
      label: 'RED',
      meaning: 'Unfavorable window for initiation',
      lampBg: 'bg-[#EF4444]',
      glow: 'shadow-[0_0_80px_rgba(239,68,68,0.3)]',
      textColor: 'text-white',
      dotColor: 'bg-[#EF4444]',
      accentBorder: 'border-rose-200',
      nextDot: 'bg-[#EF4444]',
    },
    yellow: {
      label: 'YELLOW',
      meaning: 'Transition, overlap, or golden hour',
      lampBg: 'bg-[#FBBF24]',
      glow: 'shadow-[0_0_80px_rgba(245,158,11,0.3)]',
      textColor: 'text-slate-900',
      dotColor: 'bg-[#FBBF24]',
      accentBorder: 'border-amber-200',
      nextDot: 'bg-[#FBBF24]',
    },
    gray: {
      label: isSleeping ? 'REST' : 'NEUTRAL',
      meaning: isSleeping ? 'Sleep / Rest override active' : 'Neutral timing / resting period',
      lampBg: 'bg-slate-300',
      glow: 'shadow-[0_0_40px_rgba(148,163,184,0.25)]',
      textColor: 'text-slate-700',
      dotColor: 'bg-slate-400',
      accentBorder: 'border-slate-200',
      nextDot: 'bg-slate-400',
    },
  }[color];

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6 flex flex-col items-center space-y-6">
      {/* Top Controls Bar: View Switcher & Audio Chime */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Mode Switcher Pill */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-full p-1 shadow-sm">
          <button
            id="view-mode-wuuwuu-clock-btn"
            onClick={() => setDisplayMode('wuuwuu_clock')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-semibold transition-all ${
              displayMode === 'wuuwuu_clock'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>WuuWuu Analog & Sky Clock</span>
          </button>

          <button
            id="view-mode-signal-lamp-btn"
            onClick={() => setDisplayMode('signal_lamp')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-semibold transition-all ${
              displayMode === 'signal_lamp'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Signal Lamp</span>
          </button>
        </div>

        {/* Chime & Duration Pill */}
        <div className="flex items-center gap-2">
          <button
            id="sound-toggle-btn"
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute transition tone' : 'Enable audio tone on color shift'}
            className="p-1.5 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-900 shadow-sm transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-slate-800" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-600 font-mono text-[11px] font-medium shadow-sm">
            {formatMinutesToReadable(currentSimulatedMinutes, true)}
          </span>
        </div>
      </div>

      {/* VIEW 1: WuuWuu Analog Clock with Two-Tone Digital Display and Natural Sky Elements */}
      {displayMode === 'wuuwuu_clock' && (
        <AnalogTrafficClock
          currentSimulatedMinutes={currentSimulatedMinutes}
          currentSegment={currentSegment}
          nextSegment={nextSegment}
          isSleeping={isSleeping}
          onOpenDetail={onOpenDetail}
        />
      )}

      {/* VIEW 2: Primary Clean Minimal Signal Lamp Card */}
      {displayMode === 'signal_lamp' && (
        <div
          id="traffic-light-card"
          onClick={onOpenDetail}
          className="w-full cursor-pointer group bg-white rounded-[36px] p-8 sm:p-10 border border-slate-200 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
        >
          {/* The Clean Minimal Signal Lamp */}
          <div className="relative mb-8">
            <div
              className={`w-60 h-60 sm:w-72 sm:h-72 rounded-full ${colorTheme.lampBg} flex flex-col items-center justify-center ${colorTheme.glow} border-8 border-white transition-all duration-500 group-hover:scale-[1.02] shadow-xl`}
            >
              <span
                id="traffic-state-title"
                className={`${colorTheme.textColor} text-5xl sm:text-6xl font-black tracking-tighter uppercase select-none`}
              >
                {colorTheme.label}
              </span>
            </div>

            {/* Quick tap hint badge */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-mono tracking-wider opacity-0 group-hover:opacity-100 transition-opacity shadow-md whitespace-nowrap">
              VIEW DETAIL & STORY
            </div>
          </div>

          {/* State Label & Subtitle in Clean Typography */}
          <div className="space-y-2 mb-6">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">
              Active State
            </div>
            <div className="text-2xl sm:text-3xl font-light italic font-serif text-slate-900">
              {currentSegment?.reason || 'Neutral Window'}
            </div>
          </div>

          {/* Valid until badge */}
          <div className="px-8 py-3 bg-slate-50 rounded-2xl border border-slate-100 inline-flex items-center gap-1.5 shadow-inner">
            <span className="text-slate-500 font-medium text-sm">Valid until</span>
            <span className="font-bold text-slate-900 font-mono text-sm">
              {currentSegment?.endTimeFormatted || '—'}
            </span>
          </div>

          {/* Next indicator preview */}
          {nextSegment && (
            <div className="mt-6 flex gap-3 justify-center items-center opacity-75 text-xs">
              <span className="font-bold uppercase text-slate-400 tracking-wider">Next:</span>
              <div
                className={`w-3 h-3 rounded-full ${
                  nextSegment.color === 'green'
                    ? 'bg-[#22C55E]'
                    : nextSegment.color === 'red'
                    ? 'bg-[#EF4444]'
                    : nextSegment.color === 'yellow'
                    ? 'bg-[#FBBF24]'
                    : 'bg-slate-300'
                }`}
              />
              <span className="font-mono text-slate-600 font-medium">
                {nextSegment.reason} ({nextSegment.startTimeFormatted})
              </span>
            </div>
          )}
        </div>
      )}

      {/* Best for & Quick Action bar */}
      <div className="w-full space-y-3">
        <div className="w-full bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-2 px-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-slate-700" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Current Timing Guidance
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-800 text-center sm:text-right">
            {defaultGuidance.bestFor}
          </p>
        </div>

        {/* Quick Jump to 4-Block Today View */}
        <button
          id="open-today-view-button"
          onClick={onOpenToday}
          className="w-full py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm group"
        >
          <span>View 4-Block Daily Timeline (24h)</span>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
