import React from 'react';
import { AlertTriangle, X, Check, FileX, ArrowRight } from 'lucide-react';

interface ValidationErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName?: string;
}

export const ValidationErrorModal: React.FC<ValidationErrorModalProps> = ({
  isOpen,
  onClose,
  fileName = 'April_Routing_Data.xls',
}) => {
  if (!isOpen) return null;

  const expectedColumns = [
    { name: 'Timestamp', status: 'present', sample: '2024-04-01 00:00:12' },
    { name: 'Dest_Network', status: 'missing', sample: '— (Missing Column)' },
    { name: 'Source_Country', status: 'present', sample: 'Fiji (FJI)' },
    { name: 'Cost_Per_Msg', status: 'missing', sample: '— (Missing Column)' },
    { name: 'Delivery_Status', status: 'present', sample: 'DELIVERED' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Schema Validation Diagnostic</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{fileName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-rose-50/80 border border-rose-100 rounded-xl p-3.5 text-xs text-rose-800 space-y-1">
          <p className="font-semibold">Corrupted Headers in Sheet1 (Row 1):</p>
          <p>
            The ingestion pipeline failed because 2 mandatory routing header attributes are absent or misspelled in this spreadsheet.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Header Column Comparison
          </h4>
          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
            {expectedColumns.map((col, i) => (
              <div key={i} className="p-3 flex items-center justify-between bg-white hover:bg-slate-50">
                <div className="flex items-center gap-2">
                  {col.status === 'present' ? (
                    <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </span>
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                      <FileX className="w-3 h-3" />
                    </span>
                  )}
                  <span className={`font-mono font-medium ${col.status === 'missing' ? 'text-rose-600 font-bold' : 'text-slate-800'}`}>
                    {col.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                  <span>{col.sample}</span>
                  {col.status === 'missing' && (
                    <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-semibold text-[10px]">
                      Required
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
