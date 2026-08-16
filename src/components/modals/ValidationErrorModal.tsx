import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ValidationErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName?: string;
  errorDetails?: string;
}

export const ValidationErrorModal: React.FC<ValidationErrorModalProps> = ({
  isOpen,
  onClose,
  fileName = 'Unknown file',
  errorDetails = 'This file could not be read as a daily SMS spreadsheet.',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">File could not be counted</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{fileName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-rose-50/80 border border-rose-100 rounded-xl p-3.5 text-xs text-rose-800 space-y-1">
          <p className="font-semibold">What went wrong</p>
          <p>{errorDetails}</p>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Check that the file is .xlsx, .xls, or .csv, has at least one data row, and is not password-protected.
          Fix it and upload that day again — it will replace the failed file in the total.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
