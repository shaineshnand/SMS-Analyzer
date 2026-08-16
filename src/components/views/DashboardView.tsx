import React, { useState } from 'react';
import {
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  MoreVertical,
  FileText,
  AlertCircle,
  UploadCloud,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { MetricCardData, UploadItem, NavTab } from '../../types';

interface DashboardViewProps {
  metrics: MetricCardData[];
  recentUploads: UploadItem[];
  setActiveTab: (tab: NavTab) => void;
  onExport: () => void;
  onSelectFile: (file: File) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  recentUploads,
  setActiveTab,
  onExport,
  onSelectFile,
}) => {
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const [showTimeMenu, setShowTimeMenu] = useState(false);
  const [showChartMenu, setShowChartMenu] = useState(false);
  const [chartMode, setChartMode] = useState<'bars' | 'line'>('bars');
  const [hoveredTrendIndex, setHoveredTrendIndex] = useState<number | null>(null);

  // Daily Trend Data (matching Screenshot 1 bars)
  const trendBars = [
    { day: 'Day 1-4', height: 25, value: '11,200', cost: '$1,120' },
    { day: 'Day 5-8', height: 42, value: '18,400', cost: '$1,840' },
    { day: 'Day 9-12', height: 35, value: '15,200', cost: '$1,520' },
    { day: 'Day 13-16', height: 60, value: '26,800', cost: '$2,680' },
    { day: 'Day 17-20', height: 50, value: '22,100', cost: '$2,210' },
    { day: 'Day 21-24', height: 85, value: '38,500', cost: '$3,850' },
    { day: 'Day 25-28', height: 58, value: '25,900', cost: '$2,590' },
    { day: 'Day 29-30', height: 75, value: '34,200', cost: '$3,420' },
  ];

  // Monthly Usage Data (Domestic vs International)
  const monthlyData = [
    { month: 'Jan', domestic: 35, intl: 12 },
    { month: 'Feb', domestic: 45, intl: 18 },
    { month: 'Mar', domestic: 58, intl: 22 },
    { month: 'Apr', domestic: 65, intl: 25 },
    { month: 'May', domestic: 82, intl: 30 },
    { month: 'Jun', domestic: 95, intl: 38 },
    { month: 'Jul', domestic: 68, intl: 26 },
    { month: 'Aug', domestic: 78, intl: 29 },
  ];

  return (
    <div id="dashboard-view-container" className="p-6 sm:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight">
            Cost & Usage Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time analysis of SMS processing metrics and financial impact.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Selector Dropdown */}
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
                {['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Year to Date'].map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTimeRange(t);
                      setShowTimeMenu(false);
                    }}
                    className={`w-full text-left px-3.5 py-1.5 hover:bg-slate-50 text-xs ${
                      timeRange === t ? 'text-[#006666] font-semibold bg-teal-50/50' : 'text-slate-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Button */}
          <button
            id="dashboard-export-btn"
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-[#006666] hover:bg-[#005555] text-white rounded-xl text-sm font-medium shadow-xs transition-colors active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* 6 Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((card) => {
          return (
            <div
              key={card.id}
              id={`kpi-card-${card.id}`}
              className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <span className="text-[12px] font-medium text-slate-500 leading-tight">
                {card.title}
              </span>
              <div className="my-2">
                <span className="text-xl xl:text-2xl font-bold text-slate-900 tracking-tight">
                  {card.value}
                </span>
              </div>
              {card.trend && (
                <div className="flex items-center gap-1.5 text-[11px] font-medium">
                  {card.trend.isNeutral ? (
                    <div className="flex items-center gap-1 text-slate-400">
                      <Minus className="w-3 h-3" />
                      <span>{card.trend.label}</span>
                    </div>
                  ) : card.trend.isPositive ? (
                    <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <TrendingUp className="w-3 h-3" />
                      <span>{card.trend.value}</span>
                      <span className="text-slate-400 font-normal">{card.trend.label}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-rose-500 font-semibold">
                      <TrendingDown className="w-3 h-3" />
                      <span>{card.trend.value}</span>
                      <span className="text-slate-400 font-normal">{card.trend.label}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Trend Over Time & Usage by Month */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: SMS Trend Over Time */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800 tracking-tight">
                SMS Trend Over Time ({timeRange})
              </h3>
              <div className="relative">
                <button
                  onClick={() => setShowChartMenu(!showChartMenu)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {showChartMenu && (
                  <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30 text-xs">
                    <button
                      onClick={() => {
                        setChartMode(chartMode === 'bars' ? 'line' : 'bars');
                        setShowChartMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700"
                    >
                      Toggle {chartMode === 'bars' ? 'Line View' : 'Bar View'}
                    </button>
                    <button
                      onClick={() => {
                        onExport();
                        setShowChartMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700"
                    >
                      Download Chart Data
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Custom Interactive Visualization Container matching Screenshot 1 */}
            <div className="relative border border-dashed border-slate-200 rounded-xl p-4 bg-[#F8FAFC]/50 h-64 flex flex-col justify-end">
              {/* Badge placeholder label in center matching Screenshot 1 */}
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-xs px-3.5 py-1.5 rounded-lg border border-slate-200/80 shadow-xs text-xs font-medium text-slate-600 pointer-events-none z-10 flex items-center gap-2">
                <span>Interactive Line Chart Canvas Placeholder</span>
              </div>

              {/* Bar visualization */}
              <div className="grid grid-cols-8 gap-2 sm:gap-3 h-full items-end pt-8 pb-2">
                {trendBars.map((bar, i) => (
                  <div
                    key={i}
                    className="relative group flex flex-col items-center h-full justify-end"
                    onMouseEnter={() => setHoveredTrendIndex(i)}
                    onMouseLeave={() => setHoveredTrendIndex(null)}
                  >
                    <div
                      className="w-full bg-[#6BA3A5] hover:bg-[#006666] transition-all rounded-xs cursor-pointer duration-200"
                      style={{ height: `${bar.height}%` }}
                    />
                    {hoveredTrendIndex === i && (
                      <div className="absolute -top-10 bg-slate-900 text-white text-[11px] py-1 px-2 rounded shadow-md z-20 whitespace-nowrap pointer-events-none">
                        <span className="font-semibold">{bar.value} SMS</span> ({bar.cost})
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: SMS Usage by Month */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <h3 className="text-base font-bold text-slate-800 tracking-tight">
                SMS Usage by Month
              </h3>
              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#006666]" />
                  <span className="text-slate-600">Domestic</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
                  <span className="text-slate-600">International</span>
                </div>
              </div>
            </div>

            {/* Monthly grouped bars */}
            <div className="h-56 flex items-end justify-between gap-2 pt-6 px-2 border-b border-slate-100">
              {monthlyData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="w-full flex items-end justify-center gap-1 h-44">
                    {/* Domestic Bar */}
                    <div
                      className="w-3 sm:w-4 bg-[#006666] rounded-t-xs transition-all group-hover:opacity-90"
                      style={{ height: `${d.domestic}%` }}
                      title={`${d.month} Domestic: ${d.domestic * 4000} SMS`}
                    />
                    {/* International Bar */}
                    <div
                      className="w-3 sm:w-4 bg-[#3B82F6] rounded-t-xs transition-all group-hover:opacity-90"
                      style={{ height: `${d.intl}%` }}
                      title={`${d.month} International: ${d.intl * 4000} SMS`}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 mt-2">{d.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Validation Health & Recent Uploads */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Validation Health */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 tracking-tight mb-4">
              Validation Health
            </h3>

            {/* Donut Chart Ring */}
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="text-slate-100"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  {/* Success Arc (99%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="text-[#006666]"
                    strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 40 * 0.99} ${2 * Math.PI * 40 * 0.01}`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                {/* Center text */}
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    99%
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">Success</span>
                </div>
              </div>

              {/* Legend & Stats */}
              <div className="w-full mt-6 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#006666]" />
                    <span className="text-slate-600 font-medium">Clean Records</span>
                  </div>
                  <span className="font-bold text-slate-800">445,727</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-slate-600 font-medium">Invalid Formats</span>
                  </div>
                  <span className="font-bold text-slate-800">4,503</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Recent Uploads */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800 tracking-tight">
                Recent Uploads
              </h3>
              <button
                onClick={() => setActiveTab('upload')}
                className="text-xs font-semibold text-[#006666] hover:text-[#004d4d] transition-colors"
              >
                View All
              </button>
            </div>

            {/* List */}
            <div className="space-y-3">
              {recentUploads.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        item.status === 'error'
                          ? 'bg-rose-50 text-rose-600'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.status === 'error' ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate max-w-[130px] sm:max-w-[160px]">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                        <span>{item.uploadedAt}</span>
                        {item.status === 'processed' && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600 font-medium">Processed</span>
                          </>
                        )}
                        {item.status === 'error' && (
                          <>
                            <span>•</span>
                            <span className="text-rose-500 font-medium">Failed (Format)</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {item.status === 'processed' ? (
                      <span className="text-xs font-semibold text-slate-600">{item.rows}</span>
                    ) : (
                      <button
                        onClick={() => setActiveTab('upload')}
                        className="text-xs font-semibold text-teal-600 hover:underline"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Drag Drop Mini Zone */}
            <label className="mt-4 border border-dashed border-slate-200 hover:border-teal-500 hover:bg-teal-50/20 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all">
              <UploadCloud className="w-5 h-5 text-slate-400 mb-1" />
              <span className="text-xs font-medium text-slate-600">Quick Upload CSV / XLS</span>
              <input
                type="file"
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => {
                  if (e.target.files?.[0]) onSelectFile(e.target.files[0]);
                }}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
