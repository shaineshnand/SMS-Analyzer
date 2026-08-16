import React from 'react';
import { HelpCircle, X, Coins, FileSpreadsheet, FolderOpen } from 'lucide-react';
import { formatRate } from '../../utils/format';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: string;
  rate: number;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, currency, rate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">How SMS spend is calculated</h3>
              <p className="text-xs text-slate-500">One daily Excel file. Each row is one SMS.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-600">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
            <FolderOpen className="w-4 h-4 text-[#006666] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800">Load the 2024, 2025, and 2026 folders</p>
              <p className="mt-0.5">
                Select the parent folder that contains all three years, or upload each year folder in turn.
                Totals merge. If a file is the wrong type or will not parse, it is skipped and counting continues.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
            <FileSpreadsheet className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800">Dates come from the filename</p>
              <p className="mt-0.5">
                Names like <code className="font-mono text-[11px] bg-slate-200 px-1 py-0.5 rounded">Daily_SMS_2024_05_12.xlsx</code>{' '}
                or <code className="font-mono text-[11px] bg-slate-200 px-1 py-0.5 rounded">2024-05-12.csv</code> work.
                If the name has no date, a date column in the sheet is used.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
            <Coins className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800">Cost = SMS count × rate</p>
              <p className="mt-0.5">
                The current rate is {formatRate(rate, currency)} per message. Change it in Settings and every
                loaded day is recalculated. Message text is not stored.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
