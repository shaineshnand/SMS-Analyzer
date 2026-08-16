import React, { useEffect, useState } from 'react';
import { Save, CheckCircle, Coins, Bell, UserCheck, FileSpreadsheet } from 'lucide-react';
import { AppSettings, UserProfile } from '../../types';
import { formatMoney, formatRate } from '../../utils/format';

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  currentUser: UserProfile;
  onToggleUser: () => void;
  dayCount: number;
  totalSms: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  currentUser,
  onToggleUser,
  dayCount,
  totalSms,
}) => {
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFormData({ ...settings });
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const previewCost = totalSms * formData.smsRate;

  return (
    <div id="settings-view" className="p-6 sm:p-8 max-w-[1200px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight">
          Rate &amp; File Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Spend is always SMS count × this rate. Changing the rate recalculates every loaded day.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <UserCheck className="w-5 h-5 text-[#006666]" />
            <h2 className="text-base font-bold text-slate-800">User Identity</h2>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
              />
              <div>
                <p className="font-bold text-slate-800">{currentUser.name}</p>
                <p className="text-xs text-slate-500">
                  {currentUser.role} ({currentUser.email})
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleUser}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-colors shadow-2xs"
            >
              Switch Persona ({currentUser.type === 'admin' ? 'Corporate User' : 'Admin User'})
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <Coins className="w-5 h-5 text-[#006666]" />
            <h2 className="text-base font-bold text-slate-800">Currency &amp; SMS Rate</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Primary Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:ring-1 focus:ring-teal-500 focus:outline-none"
              >
                <option value="FJD">FJD - Fijian Dollar ($)</option>
                <option value="USD">USD - US Dollar ($)</option>
                <option value="AUD">AUD - Australian Dollar ($)</option>
                <option value="EUR">EUR - Euro (€)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                SMS Unit Rate ({formData.currency})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2 text-sm text-slate-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.smsRate}
                  onChange={(e) => setFormData({ ...formData, smsRate: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3.5 py-2 text-sm text-slate-800 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-teal-50/60 border border-teal-100 p-4 text-xs text-slate-700">
            <p className="font-bold text-slate-800">Live total at this rate</p>
            <p className="mt-1">
              {dayCount.toLocaleString()} day{dayCount === 1 ? '' : 's'} · {totalSms.toLocaleString()} SMS ×{' '}
              {formatRate(formData.smsRate, formData.currency)} ={' '}
              <span className="font-bold text-[#006666]">{formatMoney(previewCost, formData.currency)}</span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <FileSpreadsheet className="w-5 h-5 text-[#006666]" />
            <h2 className="text-base font-bold text-slate-800">Excel Parsing</h2>
          </div>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.skipHeaderRow}
              onChange={(e) => setFormData({ ...formData, skipHeaderRow: e.target.checked })}
              className="w-4 h-4 rounded text-[#006666] accent-[#006666] focus:ring-teal-500"
            />
            <div>
              <p className="text-xs font-bold text-slate-800">Skip the first row (column headers)</p>
              <p className="text-[11px] text-slate-500">
                Leave this on if each daily file starts with a header. Turn it off if the first row is already an SMS.
              </p>
            </div>
          </label>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <Bell className="w-5 h-5 text-[#006666]" />
            <h2 className="text-base font-bold text-slate-800">Notifications</h2>
          </div>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.notificationsEnabled}
              onChange={(e) => setFormData({ ...formData, notificationsEnabled: e.target.checked })}
              className="w-4 h-4 rounded text-[#006666] accent-[#006666] focus:ring-teal-500"
            />
            <div>
              <p className="text-xs font-bold text-slate-800">Show upload results in the header</p>
              <p className="text-[11px] text-slate-500">
                Alerts when a batch finishes, including how many daily files failed.
              </p>
            </div>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <CheckCircle className="w-4 h-4" />
              Rate saved. Totals have been recalculated.
            </span>
          )}
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#006666] hover:bg-[#005555] text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};
