import React, { useMemo, useState } from 'react';
import {
  FileSpreadsheet,
  Code,
  FileText,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ReportEntry } from '../../types';
import { formatMoney, formatNumber } from '../../utils/format';

interface ReportsViewProps {
  reports: ReportEntry[];
  searchQuery: string;
  currency: string;
  hasData: boolean;
  onExport: (type: 'excel' | 'csv' | 'pdf') => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  reports,
  searchQuery,
  currency,
  hasData,
  onExport,
}) => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minVolume, setMinVolume] = useState('');
  const [maxVolume, setMaxVolume] = useState('');
  const [minCost, setMinCost] = useState('');
  const [maxCost, setMaxCost] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return reports.filter((item) => {
      if (query && !`${item.year} ${item.month}`.toLowerCase().includes(query)) return false;
      const monthStart = `${item.year}-${String(item.monthIndex).padStart(2, '0')}-01`;
      const monthEnd = `${item.year}-${String(item.monthIndex).padStart(2, '0')}-28`;
      if (dateFrom && monthEnd < dateFrom) return false;
      if (dateTo && monthStart > dateTo) return false;
      if (minVolume && item.smsCount < Number(minVolume)) return false;
      if (maxVolume && item.smsCount > Number(maxVolume)) return false;
      if (minCost && item.cost < Number(minCost)) return false;
      if (maxCost && item.cost > Number(maxCost)) return false;
      return true;
    });
  }, [reports, searchQuery, dateFrom, dateTo, minVolume, maxVolume, minCost, maxCost]);

  const pageSize = 12;
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const page = Math.min(currentPage, totalPages);
  const currentEntries = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalCount = filtered.reduce((sum, item) => sum + item.smsCount, 0);
  const totalSpend = filtered.reduce((sum, item) => sum + item.cost, 0);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight">
            Monthly Cost Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Daily files rolled up by month. Grand total is the 3-year SMS spend.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-1">Export:</span>
          <button
            onClick={() => onExport('excel')}
            disabled={!hasData}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-40 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel</span>
          </button>
          <button
            onClick={() => onExport('csv')}
            disabled={!hasData}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-40 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs"
          >
            <Code className="w-3.5 h-3.5 text-blue-600" />
            <span>CSV</span>
          </button>
          <button
            onClick={() => onExport('pdf')}
            disabled={!hasData}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-40 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            <span>Text</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm pb-3 border-b border-slate-100">
          <SlidersHorizontal className="w-4 h-4 text-[#006666]" />
          <span>Filters</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Date Range</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <span className="text-slate-400 text-xs">-</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">SMS Count</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minVolume}
                onChange={(e) => {
                  setMinVolume(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <span className="text-slate-400 text-xs">to</span>
              <input
                type="number"
                placeholder="Max"
                value={maxVolume}
                onChange={(e) => {
                  setMaxVolume(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
              Total Cost ({currency})
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minCost}
                onChange={(e) => {
                  setMinCost(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <span className="text-slate-400 text-xs">to</span>
              <input
                type="number"
                placeholder="Max"
                value={maxCost}
                onChange={(e) => {
                  setMaxCost(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button onClick={handleReset} className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5">
            Reset
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 font-bold bg-slate-50/50">
                <th className="py-3.5 px-6">Year</th>
                <th className="py-3.5 px-6">Month</th>
                <th className="py-3.5 px-6 text-right">SMS Count</th>
                <th className="py-3.5 px-6 text-right">Total Cost ({currency})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!currentEntries.length && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-400">
                    {hasData ? 'No months match these filters.' : 'Upload daily Excel files to build the monthly report.'}
                  </td>
                </tr>
              )}
              {currentEntries.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-6 font-semibold text-slate-800">{row.year}</td>
                  <td className="py-3.5 px-6 text-slate-700">{row.month}</td>
                  <td className="py-3.5 px-6 text-right font-mono">{formatNumber(row.smsCount)}</td>
                  <td className="py-3.5 px-6 text-right font-mono font-semibold text-slate-800">
                    {formatMoney(row.cost, currency)}
                  </td>
                </tr>
              ))}
              <tr className="bg-[#EBF3FE] font-bold text-slate-900 border-t-2 border-slate-200">
                <td className="py-4 px-6 uppercase tracking-wider" colSpan={2}>
                  Grand Total
                </td>
                <td className="py-4 px-6 text-right font-mono">{formatNumber(totalCount)}</td>
                <td className="py-4 px-6 text-right font-mono text-[#006666] text-sm">
                  {formatMoney(totalSpend, currency)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            {filtered.length
              ? `Showing ${(page - 1) * pageSize + 1} to ${Math.min(page * pageSize, filtered.length)} of ${filtered.length} months`
              : 'No months to show'}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg font-semibold text-xs ${
                  page === p ? 'bg-blue-100 text-blue-800' : 'border border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
