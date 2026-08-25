import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  DayData,
  TimelineSegment,
  UserProfile,
} from './types';
import {
  DEFAULT_USER_PROFILE,
  INITIAL_DAY_DATA,
} from './data/defaultData';
import {
  generateDailyTimeline,
  getNextSegment,
  getSegmentAtTime,
  partitionTimelineIntoFourBlocks,
} from './engine/timingEngine';
import { Header } from './components/Header';
import { HomeLightView } from './components/HomeLightView';
import { TodayFourBlocksView } from './components/TodayFourBlocksView';
import { DetailView } from './components/DetailView';
import { DataImportView } from './components/DataImportView';
import { DebugView } from './components/DebugView';
import { WatchPreviewModal } from './components/WatchPreviewModal';
import { ProfileView } from './components/ProfileView';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'light' | 'today' | 'detail' | 'import' | 'debug' | 'watch' | 'profile'
  >('light');

  // Application Data & Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('ufo_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_USER_PROFILE;
      }
    }
    return DEFAULT_USER_PROFILE;
  });

  const [dayData, setDayData] = useState<DayData>(() => {
    const saved = localStorage.getItem('ufo_day_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_DAY_DATA;
      }
    }
    return INITIAL_DAY_DATA;
  });

  // Sleep mode state (manual toggle)
  const [isSleeping, setIsSleeping] = useState<boolean>(false);

  // Time state: Live device time is the default application state
  const getDeviceMinutes = () => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  };

  // Live device time is default; simulation mode only activates deliberately from Debug
  const [currentSimulatedMinutes, setCurrentSimulatedMinutes] = useState<number>(getDeviceMinutes);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Audio tone notification toggle
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const prevColorRef = useRef<string>('');

  // Persist Profile & DayData
  useEffect(() => {
    localStorage.setItem('ufo_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('ufo_day_data', JSON.stringify(dayData));
  }, [dayData]);

  // Live timer tick when not simulating
  useEffect(() => {
    if (isSimulating) return;

    const interval = setInterval(() => {
      setCurrentSimulatedMinutes(getDeviceMinutes());
    }, 10000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Reset to live device time
  const handleResetToLiveTime = () => {
    setIsSimulating(false);
    setCurrentSimulatedMinutes(getDeviceMinutes());
  };

  // 1. GENERATE DETERMINISTIC 24-HOUR TIMELINE
  const timeline: TimelineSegment[] = useMemo(() => {
    return generateDailyTimeline(dayData.sunData, dayData.periods, {
      isSleeping,
      sleepSchedule: userProfile.sleepSchedule,
    });
  }, [dayData, isSleeping, userProfile.sleepSchedule]);

  // 2. PARTITION INTO FOUR CANONICAL BLOCKS
  const fourBlocks = useMemo(() => {
    return partitionTimelineIntoFourBlocks(timeline);
  }, [timeline]);

  // 3. CURRENT ACTIVE SEGMENT & NEXT SEGMENT
  const currentSegment = useMemo(() => {
    return getSegmentAtTime(timeline, currentSimulatedMinutes);
  }, [timeline, currentSimulatedMinutes]);

  const nextSegment = useMemo(() => {
    return getNextSegment(timeline, currentSegment);
  }, [timeline, currentSegment]);

  // Gentle audio chime synthesizer on color change
  useEffect(() => {
    if (!currentSegment) return;
    if (prevColorRef.current && prevColorRef.current !== currentSegment.color && soundEnabled) {
      playChime(currentSegment.color);
    }
    prevColorRef.current = currentSegment.color;
  }, [currentSegment?.color, soundEnabled]);

  const playChime = (color: string) => {
    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const freqMap: Record<string, number> = {
        green: 528, // healing / action frequency
        red: 396,
        yellow: 432,
        gray: 300,
      };

      osc.frequency.value = freqMap[color] || 440;
      osc.type = 'sine';

      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.85);
    } catch {
      // Audio playback silently ignored if blocked by browser policy
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-slate-200 selection:text-slate-900 flex flex-col justify-between">
      <div>
        {/* Top Header & Navigation */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentSimulatedMinutes={currentSimulatedMinutes}
          isSimulating={isSimulating}
          setIsSimulating={setIsSimulating}
          isSleeping={isSleeping}
          setIsSleeping={setIsSleeping}
          dateStr={dayData.date}
        />

        {/* Main Content Area */}
        <main className="pb-12 pt-2">
          {activeTab === 'light' && (
            <HomeLightView
              currentSegment={currentSegment}
              nextSegment={nextSegment}
              currentSimulatedMinutes={currentSimulatedMinutes}
              onOpenDetail={() => setActiveTab('detail')}
              onOpenToday={() => setActiveTab('today')}
              isSleeping={isSleeping}
              onToggleSleep={() => setIsSleeping((prev) => !prev)}
              soundEnabled={soundEnabled}
              onToggleSound={() => {
                setSoundEnabled((prev) => !prev);
                if (!soundEnabled) {
                  playChime(currentSegment?.color || 'green');
                }
              }}
            />
          )}

          {activeTab === 'today' && (
            <TodayFourBlocksView
              blocks={fourBlocks}
              currentSimulatedMinutes={currentSimulatedMinutes}
              onSelectSegment={(seg) => {
                // Can inspect details
              }}
            />
          )}

          {activeTab === 'detail' && (
            <DetailView
              currentSegment={currentSegment}
              nextSegment={nextSegment}
              astrologyContext={dayData.astrologyContext}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'import' && (
            <DataImportView
              currentDayData={dayData}
              onUpdateDayData={(newData) => setDayData(newData)}
              onApplySuccess={() => setActiveTab('light')}
            />
          )}

          {activeTab === 'debug' && (
            <DebugView
              currentSimulatedMinutes={currentSimulatedMinutes}
              setSimulatedMinutes={setCurrentSimulatedMinutes}
              isSimulating={isSimulating}
              setIsSimulating={setIsSimulating}
              isSleeping={isSleeping}
              setIsSleeping={setIsSleeping}
              currentSegment={currentSegment}
              nextSegment={nextSegment}
              dayData={dayData}
              onResetToLiveTime={handleResetToLiveTime}
            />
          )}

          {activeTab === 'watch' && (
            <WatchPreviewModal
              currentSegment={currentSegment}
              currentSimulatedMinutes={currentSimulatedMinutes}
              isSleeping={isSleeping}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              profile={userProfile}
              onUpdateProfile={(updated) => setUserProfile(updated)}
            />
          )}
        </main>
      </div>

      {/* Clean Minimalism Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 sm:px-10 py-3 text-xs font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {isSimulating ? 'Simulation Mode' : 'Live Mode'}
          </span>
          <div className="flex gap-2 items-center">
            <span
              className={`w-2 h-2 rounded-full ${
                currentSegment?.color === 'green'
                  ? 'bg-emerald-500'
                  : currentSegment?.color === 'red'
                  ? 'bg-rose-500'
                  : currentSegment?.color === 'yellow'
                  ? 'bg-amber-400'
                  : 'bg-slate-400'
              }`}
            />
            <span className="text-[11px] text-slate-600 font-mono">
              Rule: {currentSegment?.ruleTriggered || 'neutral_gray'}
            </span>
          </div>
        </div>
        <div className="text-[11px] text-slate-400">
          WuuWuu Clock · Miami, FL · Panchang Engine v1.0.4
        </div>
      </footer>
    </div>
  );
}
