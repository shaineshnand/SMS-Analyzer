import React, { useState } from 'react';
import {
  Calendar,
  Download,
  Minus,
  FileText,
  AlertCircle,
  UploadCloud,
  FolderOpen,
} from 'lucide-react';
import {
  CoverageStats,
  MetricCardData,
  NavTab,
  TrendPoint,
  UploadItem,
  YearlySpend,
} from '../../types';
import { TimeRange, coverageLabel } from '../../utils/aggregations';
import { formatMoney, formatNumber } from '../../utils/format';

interface DashboardViewProps {
  metrics: MetricCardData[];
  recentUploads: UploadItem[];
  coverage: CoverageStats;
  trend: TrendPoint[];
  yearly: YearlySpend[];
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  currency: string;
  hasData: boolean;
  setActiveTab: (tab: NavTab) => void;
  onExport: () => void;
  onSelectFiles: (files: File[]) => void;
}

const RANGES: TimeRange[] = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Year to Date', 'All Time'];

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  recentUploads,
  coverage,
  trend,
  yearly,
  timeRange,
  setTimeRange,
  currency,
  hasData,
  setActiveTab,
  onExport,
  onSelectFiles,
}) => {
  const [showTimeMenu, setShowTimeMenu] = useState(false);
  const [hoveredTrendIndex, setHoveredTrendIndex] = useState<number | null>(null);

  const maxTrend = Math.max(...trend.map((point) => point.smsCount), 1);
  const maxYearCost = Math.max(...yearly.map((item) => item.cost), 1);

  return (
    <div id="dashboard-view-container" className="p-6 sm:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight">
            SMS Spend Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Count every SMS row in daily Excel files, then multiply by your rate.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              id="dashboard-date-range-btn"
              onClick={() => setShowTimeMenu(!showTimeMenu)}
              className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
            >
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>{timeRange}</span>
            </button>

            {showTimeMenu && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30 text-sm">
                {RANGES.map((range) => (
                  <button
                    key={range}
                    onClick={() => {
                      setTimeRange(range);
                      setShowTimeMenu(false);
                    }}
                    className={`w-full text-left px-3.5 py-1.5 hover:bg-slate-50 text-xs ${
                      timeRange === range ? 'text-[#006666] font-semibold bg-teal-50/50' : 'text-slate-700'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            id="dashboard-export-btn"
            onClick={onExport}
            disabled={!hasData}
            className="flex items-center gap-2 px-4 py-2 bg-[#006666] hover:bg-[#005555] disabled:opacity-40 disabled:hover:bg-[#006666] text-white rounded-xl text-sm font-medium shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((card) => (
          <div
            key={card.id}
            id={`kpi-card-${card.id}`}
            className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
          >
            <span className="text-[12px] font-medium text-slate-500 leading-tight">{card.title}</span>
            <div className="my-2">
              <span className="text-xl xl:text-2xl font-bold text-slate-900 tracking-tight">{card.value}</span>
            </div>
            {card.trend && (
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                <Minus className="w-3 h-3" />
                <span>{card.trend.label}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 tracking-tight mb-4">
              SMS Volume ({timeRange})
            </h3>

            {!hasData || !trend.length ? (
              <EmptyChartPrompt onUpload={() => setActiveTab('upload')} />
            ) : (
              <div className="relative rounded-xl p-4 bg-[#F8FAFC]/50 h-64 flex flex-col justify-end">
                <div
                  className="grid gap-1.5 sm:gap-2 h-full items-end pt-8 pb-2"
                  style={{ gridTemplateColumns: `repeat(${Math.min(trend.length, 36)}, minmax(0, 1fr))` }}
                >
                  {trend.slice(-36).map((point, i) => {
                    const height = Math.max(4, (point.smsCount / maxTrend) * 100);
                    return (
                      <div
                        key={`${point.label}-${i}`}
                        className="relative group flex flex-col items-center h-full justify-end"
                        onMouseEnter={() => setHoveredTrendIndex(i)}
                        onMouseLeave={() => setHoveredTrendIndex(null)}
                      >
                        <div
                          className="w-full bg-[#6BA3A5] hover:bg-[#006666] transition-all rounded-xs cursor-pointer duration-200"
                          style={{ height: `${height}%` }}
                        />
                        {hoveredTrendIndex === i && (
                          <div className="absolute -top-12 bg-slate-900 text-white text-[11px] py-1 px-2 rounded shadow-md z-20 whitespace-nowrap pointer-events-none">
                            <div className="font-semibold">{point.label}</div>
                            <div>
                              {formatNumber(point.smsCount)} SMS · {formatMoney(point.cost, currency)}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 tracking-tight mb-6">Spend by Year</h3>
            {!hasData || !yearly.length ? (
              <EmptyChartPrompt onUpload={() => setActiveTab('upload')} />
            ) : (
              <div className="h-56 flex items-end justify-start gap-6 pt-6 px-2 border-b border-slate-100">
                {yearly.map((item) => (
                  <div key={item.year} className="flex-1 max-w-[120px] flex flex-col items-center gap-1 group">
                    <div className="w-full flex items-end justify-center h-44">
                      <div
                        className="w-10 bg-[#006666] rounded-t-xs transition-all group-hover:opacity-90"
                        style={{ height: `${Math.max(8, (item.cost / maxYearCost) * 100)}%` }}
                        title={`${item.year}: ${formatMoney(item.cost, currency)}`}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600 mt-2">{item.year}</span>
                    <span className="text-[10px] text-slate-400">{formatMoney(item.cost, currency)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 tracking-tight mb-4">Coverage</h3>
            {hasData ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center py-2">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="text-slate-100"
                        strokeWidth="10"
                        stroke="currentColor"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="text-[#006666]"
                        strokeWidth="10"
                        strokeDasharray={`${2 * Math.PI * 40 * (coverage.completeness / 100)} ${2 * Math.PI * 40}`}
                        strokeDashoffset="0"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        {Math.round(coverage.completeness)}%
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">Complete</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2.5 text-xs">
                  <CoverageRow label="Date range" value={coverageLabel(coverage)} />
                  <CoverageRow label="Days loaded" value={formatNumber(coverage.dayCount)} />
                  <CoverageRow label="Missing days" value={formatNumber(coverage.missingDays)} />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Completeness is days loaded versus the span between your first and last file. Upload the
                  missing daily Excel files to close the gaps.
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500 leading-relaxed">
                Upload one Excel file per day. Each row is one SMS. The dashboard will total count × rate
                across all loaded days.
              </p>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800 tracking-tight">Recent Files</h3>
              <button
                onClick={() => setActiveTab('upload')}
                className="text-xs font-semibold text-[#006666] hover:text-[#004d4d] transition-colors"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {recentUploads.length === 0 && (
                <p className="text-xs text-slate-400 py-4 text-center">No files uploaded yet.</p>
              )}
              {recentUploads.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        item.status === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.status === 'error' ? <AlertCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate max-w-[160px]">{item.name}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                        <span>{item.date ?? item.uploadedAt}</span>
                        {item.status === 'processed' && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600 font-medium">Counted</span>
                          </>
                        )}
                        {item.status === 'error' && (
                          <>
                            <span>•</span>
                            <span className="text-rose-500 font-medium">Failed</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {item.status === 'processed' && (
                    <span className="text-xs font-semibold text-slate-600">{item.rows}</span>
                  )}
                </div>
              ))}
            </div>

            <label className="mt-4 border border-dashed border-slate-200 hover:border-teal-500 hover:bg-teal-50/20 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all">
              <UploadCloud className="w-5 h-5 text-slate-400 mb-1" />
              <span className="text-xs font-medium text-slate-600">Upload daily Excel files</span>
              <input
                type="file"
                className="hidden"
                multiple
                accept=".xlsx,.xls,.csv"
                onChange={(e) => {
                  if (e.target.files?.length) onSelectFiles(Array.from(e.target.files));
                }}
              />
            </label>
            <label className="mt-2 text-center block text-[11px] font-semibold text-[#006666] hover:underline cursor-pointer">
              <FolderOpen className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
              Or select a folder of daily files
              <input
                type="file"
                className="hidden"
                multiple
                webkitdirectory=""
                onChange={(e) => {
                  if (e.target.files?.length) onSelectFiles(Array.from(e.target.files));
                }}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

function CoverageRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-slate-500 font-medium">{label}</span>
      <span className="font-semibold text-slate-800 text-right">{value}</span>
    </div>
  );
}

function EmptyChartPrompt({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="h-48 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 flex flex-col items-center justify-center text-center px-6">
      <p className="text-sm font-semibold text-slate-700">No daily files loaded yet</p>
      <p className="text-xs text-slate-500 mt-1 max-w-sm">
        Select a folder of daily Excel files — about 1,095 files for 3 years — and totals will appear here.
      </p>
      <button
        onClick={onUpload}
        className="mt-3 px-3.5 py-1.5 bg-[#006666] text-white rounded-lg text-xs font-semibold"
      >
        Go to File Upload
      </button>
    </div>
  );
}
