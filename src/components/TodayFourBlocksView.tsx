import React, { useState } from 'react';
import {
  Clock,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Sun,
  Moon,
  Sunset,
  Sunrise,
  Sparkles,
} from 'lucide-react';
import { DayBlock, TimelineSegment, TrafficColor } from '../types';
import { formatMinutesToReadable } from '../engine/timingEngine';
import { STATIC_INTERPRETATIONS } from '../data/defaultData';

interface TodayFourBlocksViewProps {
  blocks: DayBlock[];
  currentSimulatedMinutes: number;
  onSelectSegment: (segment: TimelineSegment) => void;
}

export const TodayFourBlocksView: React.FC<TodayFourBlocksViewProps> = ({
  blocks,
  currentSimulatedMinutes,
  onSelectSegment,
}) => {
  const [activeSelectedSegment, setActiveSelectedSegment] =
    useState<TimelineSegment | null>(null);

  const getBlockIcon = (blockId: string) => {
    switch (blockId) {
      case 'night':
        return <Moon className="w-4 h-4 text-indigo-500" />;
      case 'morning':
        return <Sunrise className="w-4 h-4 text-amber-500" />;
      case 'afternoon':
        return <Sun className="w-4 h-4 text-amber-600" />;
      case 'evening':
        return <Sunset className="w-4 h-4 text-rose-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getSegmentBg = (color: TrafficColor) => {
    switch (color) {
      case 'green':
        return 'bg-[#22C55E] hover:bg-emerald-600 border-emerald-600/30';
      case 'red':
        return 'bg-[#EF4444] hover:bg-rose-600 border-rose-600/30';
      case 'yellow':
        return 'bg-[#FBBF24] hover:bg-amber-500 border-amber-500/30';
      case 'gray':
      default:
        return 'bg-slate-200 hover:bg-slate-300 border-slate-300';
    }
  };

  const getHourTicks = (block: DayBlock) => {
    const hoursCount = (block.endMinutes - block.startMinutes) / 60;
    const ticks: { hourLabel: string; percent: number }[] = [];
    for (let i = 0; i <= hoursCount; i++) {
      const min = block.startMinutes + i * 60;
      const hourVal = (Math.floor(min / 60) % 12) || 12;
      ticks.push({
        hourLabel: `${hourVal}`,
        percent: (i / hoursCount) * 100,
      });
    }
    return ticks;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Four-Block Daily Timeline
          </h2>
          <p className="text-xs text-slate-500">
            24-hour deterministic timeline partitioned into four 6-hour quadrants. Tap any window for details.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-mono text-slate-600 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
            <span>Green (Action)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
            <span>Red (Inauspicious)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]" />
            <span>Yellow (Transition)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span>Gray (Neutral)</span>
          </div>
        </div>
      </div>

      {/* 4 Blocks Stack */}
      <div className="space-y-6">
        {blocks.map((block) => {
          const isCurrentBlock =
            currentSimulatedMinutes >= block.startMinutes &&
            currentSimulatedMinutes < block.endMinutes;
          const currentProgressInBlock =
            ((currentSimulatedMinutes - block.startMinutes) /
              (block.endMinutes - block.startMinutes)) *
            100;
          const hourTicks = getHourTicks(block);

          return (
            <div
              key={block.id}
              id={`block-${block.id}`}
              className={`rounded-3xl p-5 sm:p-6 border transition-all bg-white shadow-sm ${
                isCurrentBlock
                  ? 'border-slate-400 ring-2 ring-slate-900/5'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Block Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-100 border border-slate-200">
                    {getBlockIcon(block.id)}
                  </div>
                  <div>
                    <div className="text-xs font-bold font-mono tracking-wider uppercase text-slate-900">
                      {block.label}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {block.timeRangeLabel}
                    </div>
                  </div>
                </div>

                {isCurrentBlock && (
                  <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-mono font-bold tracking-wider shadow-sm">
                    CURRENT BLOCK
                  </span>
                )}
              </div>

              {/* Timeline Bar Container */}
              <div className="relative pt-1 pb-6">
                {/* Horizontal Segmented Bar */}
                <div className="relative h-10 w-full rounded-2xl bg-slate-100 overflow-hidden flex border border-slate-200 shadow-inner">
                  {block.segments.map((seg) => {
                    const blockDuration = block.endMinutes - block.startMinutes;
                    const segDuration = seg.endMinutes - seg.startMinutes;
                    const widthPercent = (segDuration / blockDuration) * 100;

                    const isNowInSegment =
                      currentSimulatedMinutes >= seg.startMinutes &&
                      currentSimulatedMinutes < seg.endMinutes;

                    return (
                      <button
                        key={seg.id}
                        onClick={() => {
                          setActiveSelectedSegment(seg);
                          onSelectSegment(seg);
                        }}
                        title={`${seg.startTimeFormatted}–${seg.endTimeFormatted}: ${seg.reason} (${seg.color.toUpperCase()})`}
                        style={{ width: `${widthPercent}%` }}
                        className={`h-full relative transition-all group flex items-center justify-center border-r border-white/40 first:rounded-l-xl last:rounded-r-xl ${getSegmentBg(
                          seg.color
                        )} ${isNowInSegment ? 'brightness-105 ring-2 ring-slate-900/40 z-10' : ''}`}
                      >
                        {/* Segment label if wide enough */}
                        {widthPercent > 14 && (
                          <span className={`text-[10px] font-mono font-bold truncate px-1 drop-shadow-sm select-none ${seg.color === 'yellow' || seg.color === 'gray' ? 'text-slate-900' : 'text-white'}`}>
                            {seg.reason.split(' ')[0]}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Current Time Indicator Needle */}
                {isCurrentBlock && (
                  <div
                    style={{ left: `${Math.min(100, Math.max(0, currentProgressInBlock))}%` }}
                    className="absolute top-0 bottom-2 w-0.5 bg-slate-900 shadow-sm z-20 pointer-events-none -translate-x-1/2 flex flex-col items-center"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-900 -mt-1 shadow" />
                  </div>
                )}

                {/* Hour Ticks underneath */}
                <div className="relative w-full h-4 mt-1.5">
                  {hourTicks.map((tick, idx) => (
                    <div
                      key={idx}
                      style={{ left: `${tick.percent}%` }}
                      className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
                    >
                      <div className="w-px h-1.5 bg-slate-300" />
                      <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {tick.hourLabel}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Segments List for this block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
                {block.segments.map((seg) => (
                  <div
                    key={seg.id}
                    onClick={() => {
                      setActiveSelectedSegment(seg);
                      onSelectSegment(seg);
                    }}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 cursor-pointer flex items-center justify-between text-xs transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                          seg.color === 'green'
                            ? 'bg-[#22C55E]'
                            : seg.color === 'red'
                            ? 'bg-[#EF4444]'
                            : seg.color === 'yellow'
                            ? 'bg-[#FBBF24]'
                            : 'bg-slate-400'
                        }`}
                      />
                      <div className="truncate">
                        <div className="font-semibold text-slate-900 truncate">
                          {seg.reason}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {seg.startTimeFormatted} – {seg.endTimeFormatted}
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Segment Quick Modal / Bottom Sheet */}
      {activeSelectedSegment && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={() => setActiveSelectedSegment(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 text-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-3.5 h-3.5 rounded-full ${
                    activeSelectedSegment.color === 'green'
                      ? 'bg-[#22C55E]'
                      : activeSelectedSegment.color === 'red'
                      ? 'bg-[#EF4444]'
                      : activeSelectedSegment.color === 'yellow'
                      ? 'bg-[#FBBF24]'
                      : 'bg-slate-400'
                  }`}
                />
                <h3 className="font-bold text-base uppercase tracking-wide text-slate-900">
                  {activeSelectedSegment.color} Window
                </h3>
              </div>

              <span className="font-mono text-xs text-slate-500 font-semibold">
                {activeSelectedSegment.startTimeFormatted} – {activeSelectedSegment.endTimeFormatted}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-[11px] font-mono uppercase text-slate-400 font-semibold">
                  Triggered Condition
                </div>
                <div className="text-base font-semibold text-slate-900">
                  {activeSelectedSegment.reason}
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  Rule Trigger: {activeSelectedSegment.ruleTriggered}
                </div>
              </div>

              {activeSelectedSegment.activePeriods.length > 0 && (
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="text-[11px] font-mono uppercase text-slate-400 font-bold mb-1.5">
                    Active Panchang Periods
                  </div>
                  {activeSelectedSegment.activePeriods.map((p) => (
                    <div key={p.id} className="text-xs text-slate-700 mb-1">
                      • <strong className="text-slate-900">{p.name}</strong> ({p.start}–{p.end}) — {p.description || p.classification}
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="text-[11px] font-mono uppercase text-slate-400 font-bold mb-1.5">
                  Story & Guidance
                </div>
                <div className="text-xs text-slate-700 leading-relaxed">
                  {STATIC_INTERPRETATIONS[activeSelectedSegment.color]?.theme}
                </div>
                <div className="mt-2 text-xs font-semibold text-slate-900">
                  Best for: {STATIC_INTERPRETATIONS[activeSelectedSegment.color]?.bestFor}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setActiveSelectedSegment(null)}
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
