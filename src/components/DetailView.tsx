import React, { useState } from 'react';
import {
  Sparkles,
  Info,
  Clock,
  ArrowRight,
  ShieldCheck,
  Compass,
  Layers,
  BookOpen,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { AstrologicalContext, TimelineSegment, TrafficColor } from '../types';
import { STATIC_INTERPRETATIONS } from '../data/defaultData';

interface DetailViewProps {
  currentSegment: TimelineSegment | null;
  nextSegment: TimelineSegment | null;
  astrologyContext: AstrologicalContext;
  onNavigateTab: (tab: 'light' | 'today') => void;
}

export const DetailView: React.FC<DetailViewProps> = ({
  currentSegment,
  nextSegment,
  astrologyContext,
  onNavigateTab,
}) => {
  const color = currentSegment?.color || 'gray';
  const defaultGuidance = STATIC_INTERPRETATIONS[color] || STATIC_INTERPRETATIONS.gray;

  const [aiInterpretation, setAiInterpretation] = useState<{
    bestFor: string;
    theme: string;
  } | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const fetchAiStory = async () => {
    setIsLoadingAi(true);
    setAiError(null);
    try {
      const response = await fetch('/api/gemini/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          color: currentSegment?.color || 'gray',
          panchangName: currentSegment?.reason || 'Neutral window',
          nakshatra: astrologyContext.nakshatra || 'Uttara Ashadha',
          moonHouse: astrologyContext.moonHouse || 7,
          activeTransits: astrologyContext.activeTransits || [],
          dasha: astrologyContext.dasha || {},
          windowTime: `${currentSegment?.startTimeFormatted || ''}–${
            currentSegment?.endTimeFormatted || ''
          }`,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Server interpretation request failed');
      }

      const result = await response.json();
      if (result.data) {
        setAiInterpretation(result.data);
      }
    } catch (err: any) {
      console.error('AI Interpretation error:', err);
      setAiError(err.message || 'Could not generate story with Gemini.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const getBadgeColor = (col: TrafficColor) => {
    switch (col) {
      case 'green':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'red':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'yellow':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const currentTheme = aiInterpretation?.theme || defaultGuidance.theme;
  const currentBestFor = aiInterpretation?.bestFor || defaultGuidance.bestFor;

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      {/* Header breadcrumb */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>Window Detail & Story</span>
        </h2>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400 font-medium">COLOR = TIMING</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 font-medium">STORY = INTERPRETATION</span>
        </div>
      </div>

      {/* Section 1: CURRENT TIMING STATUS (Deterministic) */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            CURRENT TIMING WINDOW
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${getBadgeColor(
              color
            )}`}
          >
            {color}
          </span>
        </div>

        <div>
          <div className="text-2xl font-serif italic text-slate-900 tracking-tight">
            {currentSegment?.reason || 'Neutral Window'}
          </div>
          <div className="text-sm font-mono text-slate-500 mt-1 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {currentSegment?.startTimeFormatted || '12:00 AM'} –{' '}
              {currentSegment?.endTimeFormatted || '12:00 AM'}
            </span>
          </div>
        </div>

        {/* Engine rule verification tag */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>DETERMINISTIC RULE ENGINE STATUS</span>
          </div>
          <p className="text-slate-700">
            Rule triggered:{' '}
            <code className="text-slate-900 font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[11px] font-semibold">
              {currentSegment?.ruleTriggered}
            </code>
          </p>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            {color === 'green' && 'Single auspicious Panchang window active with no conflicting overlap.'}
            {color === 'red' && 'Single inauspicious Panchang period active (inauspicious for initiation).'}
            {color === 'yellow' && 'Threshold boundary, overlap of conditions, or solar golden hour window.'}
            {color === 'gray' && 'No conflicting timing conditions or sleep override active.'}
          </p>
        </div>
      </div>

      {/* Section 2: ASTROLOGICAL CONTEXT (Facts) */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-slate-700" />
            <span>ASTROLOGICAL CONTEXT</span>
          </span>
          <span className="text-[11px] text-slate-400 font-mono font-medium">Factual Data</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="text-[10px] uppercase font-mono text-slate-400 font-bold">Moon Nakshatra</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {astrologyContext.nakshatra || 'Uttara Ashadha'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Pada {astrologyContext.nakshatraPada || 2} · {astrologyContext.moonSign || 'Capricorn'}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="text-[10px] uppercase font-mono text-slate-400 font-bold">Moon House</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              House {astrologyContext.moonHouse || 7}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Relational / Public Axis</div>
          </div>
        </div>

        {astrologyContext.activeTransits && astrologyContext.activeTransits.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="text-[10px] uppercase font-mono text-slate-400 font-bold mb-1.5">
              Active Planetary Transits
            </div>
            <div className="flex flex-wrap gap-1.5">
              {astrologyContext.activeTransits.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 text-[11px] font-medium shadow-sm"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Section 3: CURRENT STORY & GUIDANCE */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-700" />
            <span>CURRENT STORY</span>
          </span>

          <button
            id="ask-gemini-story-btn"
            onClick={fetchAiStory}
            disabled={isLoadingAi}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
            title="Generate custom contextual story using Gemini without altering the deterministic color"
          >
            <Sparkles className={`w-3 h-3 text-amber-300 ${isLoadingAi ? 'animate-spin' : ''}`} />
            <span>{isLoadingAi ? 'Interpreting...' : 'AI Story Sync'}</span>
          </button>
        </div>

        {aiError && (
          <div className="text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200">
            {aiError}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <div className="text-[11px] font-mono uppercase text-slate-400 font-bold mb-1">Theme</div>
            <p className="text-sm text-slate-800 leading-relaxed font-serif italic text-base">
              "{currentTheme}"
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <div className="text-[11px] font-mono uppercase text-slate-400 font-bold mb-1">Best For</div>
            <div className="text-sm font-bold text-slate-900 tracking-wide">
              {currentBestFor}
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: NEXT WINDOW */}
      {nextSegment && (
        <div className="rounded-3xl bg-white border border-slate-200 p-5 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Upcoming Next</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-2">
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
              <span>{nextSegment.reason}</span>
            </div>
            <div className="text-xs font-mono text-slate-500 mt-0.5">
              {nextSegment.startTimeFormatted} – {nextSegment.endTimeFormatted}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('light')}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
