import React, { useState } from 'react';
import {
  UploadCloud,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  RotateCw,
  X,
} from 'lucide-react';
import { UploadItem } from '../../types';

interface FileUploadViewProps {
  history: UploadItem[];
  activeProcessing: UploadItem[];
  onUploadFile: (file: File) => void;
  onOpenDetails: () => void;
  onCancelProcessing: (id: string) => void;
}

export const FileUploadView: React.FC<FileUploadViewProps> = ({
  history,
  activeProcessing,
  onUploadFile,
  onOpenDetails,
  onCancelProcessing,
}) => {
  const [showErrorBanner, setShowErrorBanner] = useState(true);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.[0]) {
      onUploadFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div id="file-upload-view" className="p-6 sm:p-8 max-w-[1600px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight">
          File Upload
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload your SMS volume and cost data (.xlsx, .xls) for processing and analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Left Section */}
        <div className="lg:col-span-8 space-y-6">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all bg-white ${
              dragOver ? 'border-[#006666] bg-teal-50/30' : 'border-slate-300 hover:border-slate-400'
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <UploadCloud className="w-7 h-7 stroke-[1.8]" />
            </div>

            <h3 className="text-base font-bold text-slate-800">
              Drag & Drop Files Here
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Supported formats: .xlsx, .xls. Maximum file size: 50MB
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
                    if (e.target.files?.[0]) onUploadFile(e.target.files[0]);
                  }}
                />
              </label>
              <label className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors">
                Select Folder
                <input
                  type="file"
                  // @ts-ignore
                  webkitdirectory=""
                  directory=""
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) onUploadFile(e.target.files[0]);
                  }}
                />
              </label>
            </div>
          </div>

          {/* Validation Error Banner matching Screenshot 4 */}
          {showErrorBanner && (
            <div className="bg-rose-50/90 border border-rose-200 rounded-2xl p-4 sm:p-5 flex items-start gap-4 relative">
              <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex-1 pr-6">
                <h4 className="text-sm font-bold text-rose-900">
                  Validation Error: April_Routing_Data.xls
                </h4>
                <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                  The uploaded file contains corrupted headers in Sheet1. Expected columns &apos;Dest_Network&apos; and &apos;Cost_Per_Msg&apos; not found.
                </p>
                <button
                  onClick={onOpenDetails}
                  className="mt-2 text-xs font-bold text-rose-900 hover:underline inline-block cursor-pointer"
                >
                  View Details
                </button>
              </div>
              <button
                onClick={() => setShowErrorBanner(false)}
                className="absolute top-4 right-4 text-rose-400 hover:text-rose-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Processing History Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 tracking-tight">
                Processing History
              </h3>
              <button className="text-xs font-semibold text-slate-700 hover:text-slate-900">
                View All &rarr;
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-medium">
                    <th className="py-3.5 px-5">File Name</th>
                    <th className="py-3.5 px-4">Date Uploaded</th>
                    <th className="py-3.5 px-4">Rows</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-5 flex items-center gap-2.5 font-medium">
                        <FileSpreadsheet
                          className={`w-4 h-4 ${
                            row.status === 'error' ? 'text-rose-500' : 'text-slate-500'
                          }`}
                        />
                        <span
                          className={
                            row.status === 'error' ? 'text-rose-600 font-semibold' : 'text-slate-800'
                          }
                        >
                          {row.name}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono">{row.uploadedAt}</td>
                      <td className="py-3.5 px-4 text-slate-700">{row.rows}</td>
                      <td className="py-3.5 px-4">
                        {row.status === 'processed' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                            <CheckCircle2 className="w-3 h-3 text-blue-600" />
                            Processed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            Error
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button className="text-slate-400 hover:text-slate-600 p-1">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Active Processing */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCw className="w-4 h-4 text-teal-600 animate-spin" />
                <h3 className="text-sm font-bold text-slate-800">Active Processing</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                {activeProcessing.length} Files
              </span>
            </div>

            <div className="space-y-3">
              {activeProcessing.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-200/90 bg-white space-y-2 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileSpreadsheet className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {item.name}
                      </span>
                    </div>
                    <button
                      onClick={() => onCancelProcessing(item.id)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>{item.stage}</span>
                    <span>{item.progress}%</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#006666] rounded-full transition-all duration-500"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
