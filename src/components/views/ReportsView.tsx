import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Code,
  FileText,
  SlidersHorizontal,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ReportEntry } from '../../types';

interface ReportsViewProps {
  reports: ReportEntry[];
  onExport: (type: 'excel' | 'csv' | 'pdf') => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ reports, onExport }) => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minVolume, setMinVolume] = useState('');
  const [maxVolume, setMaxVolume] = useState('');
  const [minCost, setMinCost] = useState('');
  const [maxCost, setMaxCost] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filtered dataset
  const filtered = reports.filter((item) => {
    if (minVolume && typeof item.smsCount === 'number' && item.smsCount < Number(minVolume)) return false;
    if (maxVolume && typeof item.smsCount === 'number' && item.smsCount > Number(maxVolume)) return false;
    if (minCost && item.cost !== null && item.cost < Number(minCost)) return false;
    if (maxCost && item.cost !== null && item.cost > Number(maxCost)) return false;
    return true;
  });

  const pageSize = 4;
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const currentEntries = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Grand total calculation
  const totalCount = filtered.reduce((acc, curr) => (typeof curr.smsCount === 'number' ? acc + curr.smsCount : acc), 0);
  const totalSpend = filtered.reduce((acc, curr) => (curr.cost ? acc + curr.cost : acc), 0);

  const handleReset = () => {
    setDateFrom('');
    setDateTo('');
    setMinVolume('');
    setMaxVolume('');
    setMinCost('');
    setMaxCost('');
    setCurrentPage(1);
  };

  return (
    <div id="reports-view" className="p-6 sm:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight">
            Detailed Cost Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Comprehensive view of SMS volume and financial impact over time.
          </p>
        </div>

        {/* Export Buttons matching Screenshot 2 */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-1">Export:</span>
          <button
            onClick={() => onExport('excel')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel</span>
          </button>
          <button
            onClick={() => onExport('csv')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
          >
            <Code className="w-3.5 h-3.5 text-blue-600" />
            <span>CSV</span>
          </button>
          <button
            onClick={() => onExport('pdf')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters Box matching Screenshot 2 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm pb-3 border-b border-slate-100">
          <SlidersHorizontal className="w-4 h-4 text-[#006666]" />
          <span>Advanced Filters</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Date Range */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
              Date Range
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <span className="text-slate-400 text-xs">-</span>
              <div className="relative flex-1">
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* SMS Count Volume */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
              SMS Count Volume
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minVolume}
                onChange={(e) => setMinVolume(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <span className="text-slate-400 text-xs">to</span>
              <input
                type="number"
                placeholder="Max"
                value={maxVolume}
                onChange={(e) => setMaxVolume(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Total Cost (FJD) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
              Total Cost (FJD)
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">$</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={minCost}
                  onChange={(e) => setMinCost(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-6 pr-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <span className="text-slate-400 text-xs">to</span>
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">$</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxCost}
                  onChange={(e) => setMaxCost(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-6 pr-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={handleReset}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5"
          >
            Reset
          </button>
          <button
            onClick={() => setCurrentPage(1)}
            className="px-4 py-1.5 bg-[#006666] hover:bg-[#005555] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Reports Table matching Screenshot 2 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 font-bold bg-slate-50/50">
                <th className="py-3.5 px-6">Year</th>
                <th className="py-3.5 px-6">Month</th>
                <th className="py-3.5 px-6 text-right">SMS Count</th>
                <th className="py-3.5 px-6 text-right">Total Cost (FJD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentEntries.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-6 font-semibold text-slate-800">{row.year}</td>
                  <td className="py-3.5 px-6 text-slate-700">{row.month}</td>
                  <td className="py-3.5 px-6 text-right font-mono">
                    {row.smsCount === 'Pending' ? (
                      <span className="italic text-slate-400">Pending</span>
                    ) : (
                      Number(row.smsCount).toLocaleString()
                    )}
                  </td>
                  <td className="py-3.5 px-6 text-right font-mono font-semibold text-slate-800">
                    {row.cost !== null ? `$${row.cost.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                  </td>
                </tr>
              ))}

              {/* Grand Total Row */}
              <tr className="bg-[#EBF3FE] font-bold text-slate-900 border-t-2 border-slate-200">
                <td className="py-4 px-6 uppercase tracking-wider" colSpan={2}>
                  GRAND TOTAL
                </td>
                <td className="py-4 px-6 text-right font-mono">
                  {totalCount.toLocaleString()}
                </td>
                <td className="py-4 px-6 text-right font-mono text-[#006666] text-sm">
                  ${totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination matching Screenshot 2 */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} entries
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg font-semibold text-xs transition-colors ${
                  currentPage === p
                    ? 'bg-blue-100 text-blue-800'
                    : 'border border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
