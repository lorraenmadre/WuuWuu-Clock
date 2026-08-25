import React, { useState } from 'react';
import {
  Sparkles,
  Upload,
  RotateCcw,
  CheckCircle,
  Plus,
  Trash2,
  Calendar,
  Sun,
  Sunset,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { DayData, TimingPeriod } from '../types';
import {
  MIAMI_AUG_24_DAY_DATA,
  RAW_PASTE_EXAMPLE,
  SAMPLE_DATASETS,
} from '../data/defaultData';
import { parseTimeToMinutes } from '../engine/timingEngine';
import {
  classifyPanchangPeriod,
  getCanonicalPanchangName,
} from '../engine/panchangRegistry';

interface DataImportViewProps {
  currentDayData: DayData;
  onUpdateDayData: (newData: DayData) => void;
  onApplySuccess: () => void;
}

export const DataImportView: React.FC<DataImportViewProps> = ({
  currentDayData,
  onUpdateDayData,
  onApplySuccess,
}) => {
  const [pasteText, setPasteText] = useState(RAW_PASTE_EXAMPLE);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parseSuccessMsg, setParseSuccessMsg] = useState<string | null>(null);

  // Manual editable state
  const [editableDate, setEditableDate] = useState(currentDayData.date);
  const [editableSunrise, setEditableSunrise] = useState(
    currentDayData.sunData.sunrise
  );
  const [editableSunset, setEditableSunset] = useState(
    currentDayData.sunData.sunset
  );
  const [editablePeriods, setEditablePeriods] = useState<TimingPeriod[]>(
    currentDayData.periods
  );

  const handleParseWithAi = async () => {
    if (!pasteText.trim()) return;
    setIsParsing(true);
    setParseError(null);
    setParseSuccessMsg(null);

    try {
      const res = await fetch('/api/gemini/parse-timing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: pasteText,
          targetDate: editableDate,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Server parsing error');
      }

      const result = await res.json();
      if (result.data) {
        const d = result.data;
        const sunriseMin = parseTimeToMinutes(d.sunrise || editableSunrise);
        const sunsetMin = parseTimeToMinutes(d.sunset || editableSunset);

        const newPeriods: TimingPeriod[] = (d.periods || []).map(
          (p: any, idx: number) => {
            const canonicalName = getCanonicalPanchangName(p.name);
            const deterministicClassification = classifyPanchangPeriod(p.name);
            const validClassification: 'green' | 'red' =
              deterministicClassification === 'green' ? 'green' : 'red';

            return {
              id: p.id || `custom-${idx}-${Date.now()}`,
              name: canonicalName,
              start: p.startTime,
              end: p.endTime,
              startMinutes: parseTimeToMinutes(p.startTime),
              endMinutes: parseTimeToMinutes(p.endTime),
              classification: validClassification,
              category: 'panchang',
              description: p.description || '',
            };
          }
        );

        setEditableSunrise(d.sunrise || editableSunrise);
        setEditableSunset(d.sunset || editableSunset);
        setEditablePeriods(newPeriods);

        const fullData: DayData = {
          date: d.date || editableDate,
          sunData: {
            sunrise: d.sunrise || editableSunrise,
            sunset: d.sunset || editableSunset,
            sunriseMinutes: sunriseMin,
            sunsetMinutes: sunsetMin,
          },
          periods: newPeriods,
          astrologyContext: {
            ...currentDayData.astrologyContext,
            nakshatra: d.nakshatra || currentDayData.astrologyContext.nakshatra,
            moonHouse: d.moonHouse || currentDayData.astrologyContext.moonHouse,
          },
        };

        onUpdateDayData(fullData);
        setParseSuccessMsg(
          `Successfully parsed ${newPeriods.length} Panchang periods via Gemini!`
        );
      }
    } catch (err: any) {
      console.error('Failed to parse:', err);
      setParseError(err.message || 'AI Parsing failed. Check format or use manual input.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleApplyDataset = (preset: DayData) => {
    setEditableDate(preset.date);
    setEditableSunrise(preset.sunData.sunrise);
    setEditableSunset(preset.sunData.sunset);
    setEditablePeriods(preset.periods);
    onUpdateDayData(preset);
    setParseSuccessMsg('Applied preset dataset successfully.');
  };

  const handleSaveManualChanges = () => {
    const sunriseMin = parseTimeToMinutes(editableSunrise);
    const sunsetMin = parseTimeToMinutes(editableSunset);

    const updatedData: DayData = {
      date: editableDate,
      sunData: {
        sunrise: editableSunrise,
        sunset: editableSunset,
        sunriseMinutes: sunriseMin,
        sunsetMinutes: sunsetMin,
      },
      periods: editablePeriods.map((p) => ({
        ...p,
        startMinutes: parseTimeToMinutes(p.start),
        endMinutes: parseTimeToMinutes(p.end),
      })),
      astrologyContext: currentDayData.astrologyContext,
    };

    onUpdateDayData(updatedData);
    setParseSuccessMsg('Saved changes into timing engine.');
    onApplySuccess();
  };

  const handleAddPeriod = () => {
    const newP: TimingPeriod = {
      id: `custom-${Date.now()}`,
      name: 'New Period',
      start: '12:00',
      end: '13:00',
      startMinutes: 720,
      endMinutes: 780,
      classification: 'green',
      category: 'panchang',
    };
    setEditablePeriods([...editablePeriods, newP]);
  };

  const handleDeletePeriod = (id: string) => {
    setEditablePeriods(editablePeriods.filter((p) => p.id !== id));
  };

  const handleUpdatePeriodField = (
    id: string,
    field: keyof TimingPeriod,
    value: any
  ) => {
    setEditablePeriods(
      editablePeriods.map((p) => {
        if (p.id !== id) return p;
        return {
          ...p,
          [field]: value,
        };
      })
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>Panchang & Timing Data Import</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Paste unstructured timing from Steer Astro or ephemeris sources. AI extracts the facts; the deterministic engine assigns all colors.
        </p>
      </div>

      {/* Preset Quick Load Bar */}
      <div className="rounded-3xl bg-white border border-slate-200 p-5 space-y-3 shadow-sm">
        <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          Quick Preset Datasets
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {SAMPLE_DATASETS.map((ds, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyDataset(ds.data)}
              className="text-left p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 hover:border-slate-300 transition-colors group"
            >
              <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                {ds.name}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                {ds.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Paste Steer Timing Box */}
      <div className="rounded-3xl bg-white border border-slate-200 p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-slate-700" />
            <span>Paste Panchang / Steer Timing Text</span>
          </label>
          <span className="text-[11px] text-slate-400 font-mono font-medium">
            Gemini AI Parser
          </span>
        </div>

        <textarea
          id="paste-panchang-textarea"
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          rows={6}
          placeholder="e.g. Brahma Muhurta 5:28–6:12 AM&#10;Rahu Kala 8:33–10:09 AM&#10;Sunrise 6:57 AM&#10;Sunset 7:48 PM"
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-400 resize-y"
        />

        {parseError && (
          <div className="text-xs text-rose-800 bg-rose-50 p-3 rounded-xl border border-rose-200 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{parseError}</span>
          </div>
        )}

        {parseSuccessMsg && (
          <div className="text-xs text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{parseSuccessMsg}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setPasteText(RAW_PASTE_EXAMPLE)}
            className="text-xs text-slate-500 hover:text-slate-900 underline font-mono"
          >
            Reset to Miami Aug 24 Text
          </button>

          <button
            id="parse-with-gemini-btn"
            onClick={handleParseWithAi}
            disabled={isParsing || !pasteText.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isParsing ? 'animate-spin' : ''}`} />
            <span>{isParsing ? 'Parsing with AI...' : 'Parse & Extract with AI'}</span>
          </button>
        </div>
      </div>

      {/* Manual Data Inspector & Editor */}
      <div className="rounded-3xl bg-white border border-slate-200 p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            Daily Parameters & Panchang Table
          </h3>
          <button
            onClick={handleAddPeriod}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Add Period</span>
          </button>
        </div>

        {/* Date, Sunrise, Sunset */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-mono text-slate-400 font-bold block mb-1">
              Date
            </label>
            <input
              type="date"
              value={editableDate}
              onChange={(e) => setEditableDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:border-slate-400"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 font-bold block mb-1">
              Sunrise (Golden hour start)
            </label>
            <input
              type="text"
              value={editableSunrise}
              onChange={(e) => setEditableSunrise(e.target.value)}
              placeholder="06:57"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:border-slate-400"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 font-bold block mb-1">
              Sunset (Golden hour end)
            </label>
            <input
              type="text"
              value={editableSunset}
              onChange={(e) => setEditableSunset(e.target.value)}
              placeholder="19:48"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:border-slate-400"
            />
          </div>
        </div>

        {/* Periods Table */}
        <div className="space-y-2 pt-2">
          {editablePeriods.map((p) => (
            <div
              key={p.id}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 flex-grow">
                <input
                  type="text"
                  value={p.name}
                  onChange={(e) =>
                    handleUpdatePeriodField(p.id, 'name', e.target.value)
                  }
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-medium"
                  placeholder="Period Name"
                />

                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={p.start}
                    onChange={(e) =>
                      handleUpdatePeriodField(p.id, 'start', e.target.value)
                    }
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 font-mono"
                    placeholder="Start (08:33)"
                  />
                  <span className="text-slate-400 text-xs">–</span>
                  <input
                    type="text"
                    value={p.end}
                    onChange={(e) =>
                      handleUpdatePeriodField(p.id, 'end', e.target.value)
                    }
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 font-mono"
                    placeholder="End (10:09)"
                  />
                </div>

                <select
                  value={p.classification}
                  onChange={(e) =>
                    handleUpdatePeriodField(
                      p.id,
                      'classification',
                      e.target.value as 'green' | 'red'
                    )
                  }
                  className={`bg-white border rounded-lg px-2 py-1 text-xs font-semibold ${
                    p.classification === 'green'
                      ? 'text-emerald-700 border-emerald-200'
                      : 'text-rose-700 border-rose-200'
                  }`}
                >
                  <option value="green">🟢 Auspicious (Green)</option>
                  <option value="red">🔴 Inauspicious (Red)</option>
                </select>

                <input
                  type="text"
                  value={p.description || ''}
                  onChange={(e) =>
                    handleUpdatePeriodField(p.id, 'description', e.target.value)
                  }
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-600"
                  placeholder="Notes / guidance"
                />
              </div>

              <button
                onClick={() => handleDeletePeriod(p.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors self-end sm:self-center"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Save button */}
        <div className="pt-2 flex justify-end">
          <button
            id="apply-panchang-data-button"
            onClick={handleSaveManualChanges}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <span>Apply to Timeline Engine</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
