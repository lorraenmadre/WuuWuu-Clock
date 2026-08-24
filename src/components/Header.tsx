import React from 'react';
import {
  Moon,
  Sun,
  Radio,
  Calendar,
  Layers,
  FileText,
  Sliders,
  Watch,
  User,
  Activity,
  Sparkles,
  Clock,
} from 'lucide-react';
import { formatMinutesToReadable } from '../engine/timingEngine';

interface HeaderProps {
  activeTab: 'light' | 'today' | 'detail' | 'import' | 'debug' | 'watch' | 'profile';
  setActiveTab: (tab: 'light' | 'today' | 'detail' | 'import' | 'debug' | 'watch' | 'profile') => void;
  currentSimulatedMinutes: number;
  isSimulating: boolean;
  setIsSimulating: (sim: boolean) => void;
  isSleeping: boolean;
  setIsSleeping: (sleeping: boolean | ((prev: boolean) => boolean)) => void;
  dateStr: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentSimulatedMinutes,
  isSimulating,
  setIsSimulating,
  isSleeping,
  setIsSleeping,
  dateStr,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div
            id="brand-logo-button"
            onClick={() => setActiveTab('light')}
            className="cursor-pointer flex items-center gap-3 group"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <div className="w-4 h-1 bg-white rounded-full"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-base sm:text-lg uppercase text-slate-900">
                  WuuWuu Clock
                </span>
                <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                  TRAFFIC SIGNAL
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider font-mono hidden sm:block">
                ANALOG OVERLAY · TWO-TONE TRAFFIC LIGHT · SKY
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls: Live Clock & Sleep Mode Switch */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Location & Time Indicator */}
          <div
            id="time-indicator-pill"
            onClick={() => setActiveTab('debug')}
            title="Click to open time scrubber and engine debug"
            className="cursor-pointer text-right group"
          >
            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-widest flex items-center justify-end gap-1.5">
              <span>Miami, FL</span>
              {isSimulating ? (
                <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  TEST
                </span>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </div>
            <div className="text-base sm:text-lg font-mono font-bold text-slate-900 group-hover:text-slate-700 transition-colors">
              {formatMinutesToReadable(currentSimulatedMinutes, true)}
            </div>
          </div>

          {/* Clean Sleep Mode Toggle Pill */}
          <div
            id="quick-sleep-toggle-button"
            onClick={() => setIsSleeping((prev) => !prev)}
            className={`cursor-pointer flex items-center gap-2.5 p-1.5 rounded-full px-3.5 border transition-all select-none shadow-sm ${
              isSleeping
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/70'
            }`}
            title={isSleeping ? 'Sleep Mode Active (Forces GRAY)' : 'Click to activate Rest / Sleep Mode'}
          >
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isSleeping ? 'text-slate-200' : 'text-slate-500'}`}>
              Sleep
            </span>
            <div className={`w-8 h-4.5 rounded-full relative transition-colors ${isSleeping ? 'bg-indigo-500' : 'bg-slate-300'}`}>
              <div
                className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform ${
                  isSleeping ? 'left-4' : 'left-0.5'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation tabs bar */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 overflow-x-auto no-scrollbar flex items-center border-t border-slate-100 text-xs">
        <button
          id="nav-tab-light"
          onClick={() => setActiveTab('light')}
          className={`flex items-center gap-1.5 py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'light'
              ? 'border-slate-900 text-slate-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>WuuWuu Clock</span>
        </button>

        <button
          id="nav-tab-today"
          onClick={() => setActiveTab('today')}
          className={`flex items-center gap-1.5 py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'today'
              ? 'border-slate-900 text-slate-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>4-Block Today</span>
        </button>

        <button
          id="nav-tab-detail"
          onClick={() => setActiveTab('detail')}
          className={`flex items-center gap-1.5 py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'detail'
              ? 'border-slate-900 text-slate-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Detail & Story</span>
        </button>

        <button
          id="nav-tab-import"
          onClick={() => setActiveTab('import')}
          className={`flex items-center gap-1.5 py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'import'
              ? 'border-slate-900 text-slate-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Data Import</span>
        </button>

        <button
          id="nav-tab-debug"
          onClick={() => setActiveTab('debug')}
          className={`flex items-center gap-1.5 py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'debug'
              ? 'border-slate-900 text-slate-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Debug & Tests</span>
        </button>

        <button
          id="nav-tab-watch"
          onClick={() => setActiveTab('watch')}
          className={`flex items-center gap-1.5 py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'watch'
              ? 'border-slate-900 text-slate-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <Watch className="w-3.5 h-3.5" />
          <span>Watch Preview</span>
        </button>

        <button
          id="nav-tab-profile"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-1.5 py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-slate-900 text-slate-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profile</span>
        </button>
      </div>
    </header>
  );
};
