import React from 'react';
import { HelpCircle, X, CheckCircle2, ShieldCheck, FileSpreadsheet, BarChart2 } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">SMS Analyzer Knowledge Base</h3>
              <p className="text-xs text-slate-500">System overview &amp; calculation rules.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-600">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
            <BarChart2 className="w-4 h-4 text-[#006666] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800">Cost &amp; Rate Calculation</p>
              <p className="mt-0.5">
                SMS Costs are evaluated dynamically using standard rates (default FJD $0.10/SMS).
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
            <FileSpreadsheet className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800">Batch Spreadsheet Ingestion</p>
              <p className="mt-0.5">
                Files must contain valid headers: <code className="font-mono text-[11px] bg-slate-200 px-1 py-0.5 rounded">Dest_Network</code> and <code className="font-mono text-[11px] bg-slate-200 px-1 py-0.5 rounded">Cost_Per_Msg</code>.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800">Carrier SLA Monitoring</p>
              <p className="mt-0.5">
                Carriers with delivery rates below 95% are automatically flagged with warning states.
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
