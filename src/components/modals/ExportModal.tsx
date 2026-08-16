import React, { useEffect, useState } from 'react';
import { Download, FileSpreadsheet, Code, FileText, CheckCircle2, X } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFormat?: 'excel' | 'csv' | 'pdf';
  hasData: boolean;
  onDownload: (format: 'excel' | 'csv' | 'pdf') => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  defaultFormat = 'excel',
  hasData,
  onDownload,
}) => {
  const [format, setFormat] = useState<'excel' | 'csv' | 'pdf'>(defaultFormat);
  const [downloading, setDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);

  useEffect(() => {
    setFormat(defaultFormat);
  }, [defaultFormat, isOpen]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!hasData) return;
    setDownloading(true);
    onDownload(format);
    setDownloading(false);
    setDownloadComplete(true);
    setTimeout(() => {
      setDownloadComplete(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#006666] flex items-center justify-center shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Export spend totals</h3>
              <p className="text-xs text-slate-500">Download monthly SMS count and cost from loaded files.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!hasData && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-xl p-3">
            Upload daily Excel files first. There is nothing to export yet.
          </p>
        )}

        <div className="space-y-2.5">
          <label className="block text-xs font-bold text-slate-700">Choose File Format</label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'excel' as const, label: 'Excel (.xlsx)', icon: FileSpreadsheet, color: 'text-emerald-600' },
              { id: 'csv' as const, label: 'CSV (.csv)', icon: Code, color: 'text-blue-600' },
              { id: 'pdf' as const, label: 'Text (.txt)', icon: FileText, color: 'text-rose-600' },
            ].map((f) => {
              const Icon = f.icon;
              const isSelected = format === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-semibold ${
                    isSelected
                      ? 'border-[#006666] bg-teal-50/50 text-[#006666] ring-1 ring-[#006666]'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${f.color}`} />
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-600"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading || !hasData}
            className="flex items-center gap-2 px-5 py-2 bg-[#006666] hover:bg-[#005555] disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            {downloadComplete ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Downloaded!</span>
              </>
            ) : downloading ? (
              <span>Preparing Export...</span>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
