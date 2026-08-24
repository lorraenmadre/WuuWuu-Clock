import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Sliders,
  ShieldCheck,
  Zap,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import {
  DayData,
  TimelineSegment,
  TrafficColor,
} from '../types';
import {
  formatMinutesTo24h,
  formatMinutesToReadable,
  parseTimeToMinutes,
} from '../engine/timingEngine';
import {
  validateAugust24Fixture,
  ValidationTestResult,
} from '../engine/testFixture';

interface DebugViewProps {
  currentSimulatedMinutes: number;
  setSimulatedMinutes: (mins: number) => void;
  isSimulating: boolean;
  setIsSimulating: (sim: boolean) => void;
  isSleeping: boolean;
  setIsSleeping: (sleeping: boolean | ((prev: boolean) => boolean)) => void;
  currentSegment: TimelineSegment | null;
  nextSegment: TimelineSegment | null;
  dayData: DayData;
  onResetToLiveTime: () => void;
}

export const DebugView: React.FC<DebugViewProps> = ({
  currentSimulatedMinutes,
  setSimulatedMinutes,
  isSimulating,
  setIsSimulating,
  isSleeping,
  setIsSleeping,
  currentSegment,
  nextSegment,
  dayData,
  onResetToLiveTime,
}) => {
  const [testResult, setTestResult] = useState<ValidationTestResult | null>(null);

  const handleRunValidation = () => {
    const res = validateAugust24Fixture();
    setTestResult(res);
  };

  const quickJumpPresets = [
    { label: '04:00 AM (Neutral Night)', minutes: 4 * 60 },
    { label: '05:35 AM (🟢 Brahma Muhurta)', minutes: 5 * 60 + 35 },
    { label: '06:30 AM (🟢 Amrita Gadiyas)', minutes: 6 * 60 + 30 },
    { label: '07:15 AM (🟡 Dawn Golden Hour)', minutes: 7 * 60 + 15 },
    { label: '08:00 AM (🟢 Amrita End Window)', minutes: 8 * 60 },
    { label: '09:00 AM (🔴 Rahu Kala)', minutes: 9 * 60 },
    { label: '11:00 AM (⚪ Midday Neutral)', minutes: 11 * 60 },
    { label: '12:00 PM (🔴 Yamaganda)', minutes: 12 * 60 },
    { label: '01:05 PM (🟡 Overlap: Abhijit + Yamaganda)', minutes: 13 * 60 + 5 },
    { label: '01:30 PM (🟢 Clear Abhijit)', minutes: 13 * 60 + 30 },
    { label: '03:30 PM (🔴 Gulika Kala)', minutes: 15 * 60 + 30 },
    { label: '07:00 PM (🟡 Dusk Golden Hour)', minutes: 19 * 60 },
    { label: '09:00 PM (⚪ Evening Neutral)', minutes: 21 * 60 },
  ];

  const dawnStart = dayData.sunData.sunriseMinutes;
  const dawnEnd = dawnStart + 60;
  const duskStart = dayData.sunData.sunsetMinutes - 60;
  const duskEnd = dayData.sunData.sunsetMinutes;

  const isDawnGH =
    currentSimulatedMinutes >= dawnStart && currentSimulatedMinutes < dawnEnd;
  const isDuskGH =
    currentSimulatedMinutes >= duskStart && currentSimulatedMinutes < duskEnd;

  const activePeriodsAtCurrentTime = dayData.periods.filter(
    (p) =>
      currentSimulatedMinutes >= p.startMinutes &&
      currentSimulatedMinutes < p.endMinutes
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>Engine Debugger & Verification Test Suite</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time rule engine execution trace, interactive time scrubber, and benchmark test verification.
        </p>
      </div>

      {/* Time Scrubber / Simulator */}
      <div className="rounded-3xl bg-white border border-slate-200 p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-700" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
              Interactive Time Scrubber
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-700 font-bold px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200">
              {formatMinutesToReadable(currentSimulatedMinutes, true)} ({formatMinutesTo24h(currentSimulatedMinutes)})
            </span>
            <button
              onClick={onResetToLiveTime}
              className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              title="Reset to Real-time Device Clock"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Range slider */}
        <div className="space-y-1">
          <input
            id="time-scrubber-slider"
            type="range"
            min={0}
            max={1440}
            step={1}
            value={currentSimulatedMinutes}
            onChange={(e) => {
              setIsSimulating(true);
              setSimulatedMinutes(parseInt(e.target.value, 10));
            }}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>12:00 AM (0m)</span>
            <span>06:00 AM (360m)</span>
            <span>12:00 PM (720m)</span>
            <span>06:00 PM (1080m)</span>
            <span>12:00 AM (1440m)</span>
          </div>
        </div>

        {/* Quick jump test buttons */}
        <div className="pt-2">
          <div className="text-[11px] font-mono font-bold text-slate-400 mb-2 uppercase">
            Quick Jump to State Conditions:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickJumpPresets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsSimulating(true);
                  setSimulatedMinutes(p.minutes);
                }}
                className={`px-2.5 py-1 rounded-full text-[11px] font-mono border transition-colors ${
                  currentSimulatedMinutes === p.minutes
                    ? 'bg-slate-900 text-white border-slate-900 font-semibold shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Engine Execution Trace */}
      <div className="rounded-3xl bg-white border border-slate-200 p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Rule Engine Evaluation Trace</span>
          </span>

          <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-medium">
            Deterministic Output
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Evaluated Minute</div>
            <div className="font-mono text-slate-900 font-bold">
              {currentSimulatedMinutes} mins ({formatMinutesToReadable(currentSimulatedMinutes)})
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Final Color Output</div>
            <div className="font-mono font-bold uppercase flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  currentSegment?.color === 'green'
                    ? 'bg-[#22C55E]'
                    : currentSegment?.color === 'red'
                    ? 'bg-[#EF4444]'
                    : currentSegment?.color === 'yellow'
                    ? 'bg-[#FBBF24]'
                    : 'bg-slate-400'
                }`}
              />
              <span className="text-slate-900 font-bold">{currentSegment?.color || 'gray'}</span>
              <span className="text-slate-500 font-normal">({currentSegment?.reason})</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Golden Hour State</div>
            <div className="font-mono text-slate-700 font-medium">
              {isDawnGH && '🟢 Dawn Golden Hour (6:57–7:57 AM)'}
              {isDuskGH && '🟢 Dusk Golden Hour (6:48–7:48 PM)'}
              {!isDawnGH && !isDuskGH && '⚪ Inactive (Outside golden hours)'}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Sleep / Rest Override</div>
            <div className="font-mono text-slate-700 font-medium">
              {isSleeping ? '🔴 Sleep Mode Active (Forces GRAY)' : '⚪ Inactive'}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Active Panchang Periods</div>
            <div className="font-mono text-slate-700 font-medium">
              {activePeriodsAtCurrentTime.length === 0
                ? 'None (0)'
                : activePeriodsAtCurrentTime
                    .map((p) => `${p.name} [${p.classification.toUpperCase()}]`)
                    .join(', ')}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Priority Rule Applied</div>
            <div className="font-mono text-slate-900 font-semibold">
              {currentSegment?.ruleTriggered || 'neutral_gray'}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 sm:col-span-2">
            <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Next Boundary</div>
            <div className="font-mono text-slate-700 font-medium">
              {currentSegment
                ? `Changes at ${currentSegment.endTimeFormatted} (${currentSegment.endMinutes - currentSimulatedMinutes}m remaining) -> ${
                    nextSegment ? `${nextSegment.color.toUpperCase()} (${nextSegment.reason})` : 'End of day'
                  }`
                : 'None'}
            </div>
          </div>
        </div>
      </div>

      {/* Automated August 24 Benchmark Test Suite */}
      <div className="rounded-3xl bg-white border border-slate-200 p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>August 24 Benchmark Test Suite</span>
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Verifies all 17 expected schedule intervals from PRD Section 8 against the deterministic engine.
            </p>
          </div>

          <button
            id="run-benchmark-tests-btn"
            onClick={handleRunValidation}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Run Benchmark Test</span>
          </button>
        </div>

        {testResult && (
          <div className="space-y-3">
            {/* Status Summary Banner */}
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between ${
                testResult.passed
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {testResult.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600" />
                )}
                <div>
                  <div className="font-bold text-sm">
                    {testResult.passed
                      ? 'ALL 17 BENCHMARK CHECKS PASSED (100%)'
                      : 'BENCHMARK CHECKS FAILED'}
                  </div>
                  <div className="text-xs font-mono mt-0.5">
                    {testResult.passedChecks} / {testResult.totalChecks} intervals strictly verified.
                  </div>
                </div>
              </div>

              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 font-medium shadow-sm">
                Miami, FL · Aug 24, 2026
              </span>
            </div>

            {/* Verification Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[10px] uppercase font-bold">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Time Range</th>
                    <th className="py-2.5 px-3">Expected</th>
                    <th className="py-2.5 px-3">Actual</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {testResult.segmentResults.map((row) => (
                    <tr key={row.index} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 text-slate-400">{row.index}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{row.expectedRange}</td>
                      <td className="py-2.5 px-3 uppercase font-bold text-slate-500">{row.expectedColor}</td>
                      <td className="py-2.5 px-3 uppercase font-bold text-slate-900">{row.actualColor}</td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px]">{row.reason}</td>
                      <td className="py-2.5 px-3 text-right">
                        {row.passed ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            PASS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                            <XCircle className="w-3.5 h-3.5" />
                            FAIL
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
