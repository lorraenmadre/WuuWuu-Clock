import React, { useState } from 'react';
import { User, Globe, Moon, Clock, Compass, Save, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';
import { formatMinutesTo24h, parseTimeToMinutes } from '../engine/timingEngine';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile,
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [sleepStartStr, setSleepStartStr] = useState(
    formatMinutesTo24h(formData.sleepSchedule.startMinutes)
  );
  const [sleepEndStr, setSleepEndStr] = useState(
    formatMinutesTo24h(formData.sleepSchedule.endMinutes)
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...formData,
      sleepSchedule: {
        ...formData.sleepSchedule,
        startMinutes: parseTimeToMinutes(sleepStartStr),
        endMinutes: parseTimeToMinutes(sleepEndStr),
      },
    };
    onUpdateProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <User className="w-5 h-5 text-slate-700" />
          <span>User Profile & Personal Transit Settings</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configures natal parameters and sleep windows. Panchang traffic-light timing functions independently.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Details */}
        <div className="rounded-3xl bg-white border border-slate-200 p-5 space-y-4 shadow-sm">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Birth & Location Data
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-mono text-slate-400 font-bold block mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:border-slate-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 font-bold block mb-1">
                Birth Location
              </label>
              <input
                type="text"
                value={formData.birthLocation}
                onChange={(e) =>
                  setFormData({ ...formData, birthLocation: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:border-slate-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 font-bold block mb-1">
                Birth Date
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) =>
                  setFormData({ ...formData, birthDate: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:border-slate-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 font-bold block mb-1">
                Birth Time (24h)
              </label>
              <input
                type="time"
                value={formData.birthTime}
                onChange={(e) =>
                  setFormData({ ...formData, birthTime: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:border-slate-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 font-bold block mb-1">
                Timezone
              </label>
              <input
                type="text"
                value={formData.timezone}
                onChange={(e) =>
                  setFormData({ ...formData, timezone: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:border-slate-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-mono text-slate-400 font-bold block mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.latitude}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      latitude: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:border-slate-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 font-bold block mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      longitude: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:border-slate-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Astrological Computation System */}
        <div className="rounded-3xl bg-white border border-slate-200 p-5 space-y-4 shadow-sm">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-slate-700" />
            <span>Astrology Ephemeris Model</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-mono text-slate-400 font-bold block mb-1">
                Zodiac System
              </label>
              <select
                value={formData.astrologySystem}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    astrologySystem: e.target.value as 'sidereal' | 'tropical',
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:border-slate-400 focus:outline-none"
              >
                <option value="sidereal">Sidereal (Vedic / Jyotish)</option>
                <option value="tropical">Tropical (Western)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 font-bold block mb-1">
                Ayanamsa
              </label>
              <select
                value={formData.ayanamsa}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ayanamsa: e.target.value as 'lahiri' | 'raman' | 'kp' | 'yukteshwar',
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:border-slate-400 focus:outline-none"
              >
                <option value="lahiri">Lahiri (Chitrapaksha) - Standard</option>
                <option value="raman">B.V. Raman</option>
                <option value="kp">Krishnamurti Padhdhati (KP)</option>
                <option value="yukteshwar">Sri Yukteshwar</option>
              </select>
            </div>
          </div>
        </div>

        {/* Automated Sleep Schedule Window */}
        <div className="rounded-3xl bg-white border border-slate-200 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-slate-700" />
              <span>Automated Sleep Schedule Window</span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.sleepSchedule.enabled}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sleepSchedule: {
                      ...formData.sleepSchedule,
                      enabled: e.target.checked,
                    },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
            </label>
          </div>

          <p className="text-xs text-slate-500">
            When enabled, all time intervals inside the specified sleep window automatically evaluate to <strong className="text-slate-900">GRAY</strong> (Rule 1).
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-mono text-slate-400 font-bold block mb-1">
                Sleep Start Time
              </label>
              <input
                type="time"
                value={sleepStartStr}
                onChange={(e) => setSleepStartStr(e.target.value)}
                disabled={!formData.sleepSchedule.enabled}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono disabled:opacity-40 focus:border-slate-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 font-bold block mb-1">
                Wake Time
              </label>
              <input
                type="time"
                value={sleepEndStr}
                onChange={(e) => setSleepEndStr(e.target.value)}
                disabled={!formData.sleepSchedule.enabled}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono disabled:opacity-40 focus:border-slate-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Profile updated successfully!</span>
            </div>
          ) : (
            <div />
          )}

          <button
            id="save-user-profile-btn"
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-white" />
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};
