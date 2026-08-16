import React, { useMemo, useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  X,
  FolderOpen,
  Trash2,
} from 'lucide-react';
import { BatchProgress, UploadItem } from '../../types';

interface FileUploadViewProps {
  history: UploadItem[];
  searchQuery: string;
  batch: BatchProgress | null;
  onUploadFiles: (files: File[]) => void;
  onOpenDetails: (item: UploadItem) => void;
  onCancelProcessing: () => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export const FileUploadView: React.FC<FileUploadViewProps> = ({
  history,
  searchQuery,
  batch,
  onUploadFiles,
  onOpenDetails,
  onCancelProcessing,
  onDeleteItem,
  onClearAll,
}) => {
  const [dragOver, setDragOver] = useState(false);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return history;
    return history.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        (item.date ?? '').includes(query) ||
        (item.errorDetails ?? '').toLowerCase().includes(query)
    );
  }, [history, searchQuery]);

  const takeFiles = (list: FileList | File[]) => {
    onUploadFiles(Array.from(list));
  };

  const progress = batch ? Math.round((batch.completed / Math.max(batch.total, 1)) * 100) : 0;

  return (
    <div id="file-upload-view" className="p-6 sm:p-8 max-w-[1600px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight">
          Daily File Upload
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          One Excel file per day. Each row is one SMS. Select a folder to load three years at once.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files?.length) takeFiles(e.dataTransfer.files);
            }}
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all bg-white ${
              dragOver ? 'border-[#006666] bg-teal-50/30' : 'border-slate-300 hover:border-slate-400'
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <UploadCloud className="w-7 h-7 stroke-[1.8]" />
            </div>

            <h3 className="text-base font-bold text-slate-800">Drop daily Excel files here</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              Supported: .xlsx, .xls, .csv. Dates are read from the filename when possible
              (for example <span className="font-mono">Daily_SMS_2024_05_12.xlsx</span>).
            </p>

            <div className="flex items-center gap-3 mt-6">
              <label className="px-5 py-2.5 bg-[#006666] hover:bg-[#005555] text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors">
                Select Files
                <input
                  type="file"
                  multiple
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.length) takeFiles(e.target.files);
                    e.target.value = '';
                  }}
                />
              </label>
              <label className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors inline-flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5" />
                Select Folder
                <input
                  type="file"
                  multiple
                  className="hidden"
                  webkitdirectory=""
                  onChange={(e) => {
                    if (e.target.files?.length) takeFiles(e.target.files);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 tracking-tight">Processed Days</h3>
              {history.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-800"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-medium">
                    <th className="py-3.5 px-5">File Name</th>
                    <th className="py-3.5 px-4">Day</th>
                    <th className="py-3.5 px-4">SMS Rows</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400">
                        No daily files yet. Upload a folder to total three years of SMS spend.
                      </td>
                    </tr>
                  )}
                  {filtered.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5 font-medium min-w-0">
                          <FileSpreadsheet
                            className={`w-4 h-4 shrink-0 ${
                              row.status === 'error' ? 'text-rose-500' : 'text-slate-500'
                            }`}
                          />
                          <span
                            className={`truncate max-w-[280px] ${
                              row.status === 'error' ? 'text-rose-600 font-semibold' : 'text-slate-800'
                            }`}
                          >
                            {row.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono">{row.date ?? '—'}</td>
                      <td className="py-3.5 px-4 text-slate-700">{row.rows}</td>
                      <td className="py-3.5 px-4">
                        {row.status === 'processed' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                            <CheckCircle2 className="w-3 h-3 text-blue-600" />
                            Counted
                          </span>
                        ) : (
                          <button
                            onClick={() => onOpenDetails(row)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-100"
                          >
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            Error
                          </button>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onDeleteItem(row.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Remove this day"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {batch ? <RotateCw className="w-4 h-4 text-teal-600 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-slate-400" />}
                <h3 className="text-sm font-bold text-slate-800">
                  {batch ? 'Counting rows' : 'Batch status'}
                </h3>
              </div>
              {batch && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                  {batch.completed} / {batch.total}
                </span>
              )}
            </div>

            {batch ? (
              <div className="p-3.5 rounded-xl border border-slate-200/90 bg-white space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileSpreadsheet className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 truncate">{batch.currentFile}</span>
                  </div>
                  <button onClick={onCancelProcessing} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>
                    {batch.succeeded} counted
                    {batch.failed > 0 ? ` · ${batch.failed} failed` : ''}
                    {batch.replaced > 0 ? ` · ${batch.replaced} replaced` : ''}
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#006666] rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 leading-relaxed">
                Idle. Re-uploading a file for the same date replaces that day so three-year totals stay
                accurate.
              </p>
            )}

            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5 text-xs text-slate-600 space-y-1.5">
              <p className="font-bold text-slate-800">How spend is calculated</p>
              <p>1. Count data rows in each daily file</p>
              <p>2. Multiply by the SMS rate in Settings</p>
              <p>3. Sum every loaded day for the 3-year total</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
