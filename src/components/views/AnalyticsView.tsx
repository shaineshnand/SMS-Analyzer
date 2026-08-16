import React, { useState } from 'react';
import {
  Calendar,
  Download,
  MoreVertical,
  TrendingUp,
} from 'lucide-react';
import { CarrierPerformance, VolumeDay } from '../../types';

interface AnalyticsViewProps {
  carrierData: CarrierPerformance[];
  highestDays: VolumeDay[];
  onExport: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  carrierData,
  highestDays,
  onExport,
}) => {
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const [selectedYear, setSelectedYear] = useState('2023');
  const [selectedMonth, setSelectedMonth] = useState('All Months');

  const totalSpendSum = carrierData.reduce((acc, c) => acc + c.totalSpend, 0);
  const totalVolumeSum = carrierData.reduce((acc, c) => acc + c.volume, 0);

  return (
    <div id="analytics-view" className="p-6 sm:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight">
            Performance Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Deep dive into SMS volume trends and cost structures.
          </p>
        </div>

        {/* Filter Controls matching Screenshot 3 */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 text-xs font-medium shadow-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{timeRange}</span>
            </div>
            <div className="w-[1px] h-4 bg-slate-200 mx-1" />
            <button
              onClick={() => setSelectedYear(selectedYear === '2023' ? '2024' : '2023')}
              className="px-2.5 py-1 text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded"
            >
              {selectedYear}
            </button>
            <div className="w-[1px] h-4 bg-slate-200 mx-1" />
            <button className="px-2.5 py-1 text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded">
              {selectedMonth}
            </button>
          </div>
        </div>
      </div>

      {/* Top 2x2 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Left: Highest Volume Days (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              HIGHEST VOLUME DAYS
            </h3>
            <button className="text-slate-400 hover:text-slate-600">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3.5 pt-2">
            {highestDays.map((item, idx) => {
              const pct = (item.volume / 1050000) * 100;
              return (
                <div key={idx} className="flex items-center gap-4 text-xs">
                  <span className="w-14 font-mono font-medium text-slate-600 text-right shrink-0">
                    {item.date}
                  </span>
                  <div className="flex-1 h-5 bg-slate-50 rounded-xs overflow-hidden relative">
                    <div
                      className={`h-full rounded-xs transition-all ${
                        idx === 0 ? 'bg-[#0B192C]' : 'bg-[#53657D]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {/* X-axis ticks matching Screenshot 3 */}
            <div className="flex justify-between pl-18 pr-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
              <span>0</span>
              <span>250k</span>
              <span>500k</span>
              <span>750k</span>
              <span>1M+</span>
            </div>
          </div>
        </div>

        {/* Top Right: Usage Distribution Donut (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            USAGE DISTRIBUTION
          </h3>

          <div className="py-4 flex flex-col items-center justify-center">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* 55% Promo (#0B192C) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  strokeWidth="12"
                  stroke="#0B192C"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 38 * 0.55} ${2 * Math.PI * 38 * 0.45}`}
                  strokeDashoffset="0"
                />
                {/* 32% Transact (#53657D) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  strokeWidth="12"
                  stroke="#53657D"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 38 * 0.32} ${2 * Math.PI * 38 * 0.68}`}
                  strokeDashoffset={`${-2 * Math.PI * 38 * 0.55}`}
                />
                {/* 13% Alerts (#C7D7E8) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  strokeWidth="12"
                  stroke="#C7D7E8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 38 * 0.13} ${2 * Math.PI * 38 * 0.87}`}
                  strokeDashoffset={`${-2 * Math.PI * 38 * 0.87}`}
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight block">
                  2.8M
                </span>
                <span className="text-[10px] font-medium text-slate-400 uppercase">
                  Total SMS
                </span>
              </div>
            </div>

            {/* Legend matching Screenshot 3 */}
            <div className="flex items-center justify-center flex-wrap gap-4 mt-6 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0B192C]" />
                <span className="text-slate-700 font-medium">Promo (55%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#53657D]" />
                <span className="text-slate-700 font-medium">Transact (32%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C7D7E8]" />
                <span className="text-slate-700 font-medium">Alerts (13%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Left: Cost Analysis (USD) (6 cols) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              COST ANALYSIS (USD)
            </h3>
            <div className="flex items-center gap-3 text-[11px] font-medium">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-[#006666] rounded-xs" />
                <span className="text-slate-600">BASE</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-[#D1E0F0] rounded-xs" />
                <span className="text-slate-600">OVERAGE</span>
              </div>
            </div>
          </div>

          <div className="h-52 flex items-end justify-between pt-6 border-b border-slate-100 px-4">
            {[
              { q: 'Q1', base: 30, overage: 8 },
              { q: 'Q2', base: 45, overage: 12 },
              { q: 'Q3', base: 60, overage: 22 },
              { q: 'Q4', base: 78, overage: 35 },
            ].map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="flex items-end gap-1.5 h-40">
                  <div
                    className="w-7 bg-[#006666] rounded-t-xs"
                    style={{ height: `${d.base}%` }}
                    title={`${d.q} Base: $${d.base}k`}
                  />
                  <div
                    className="w-7 bg-[#D1E0F0] rounded-t-xs"
                    style={{ height: `${d.overage}%` }}
                    title={`${d.q} Overage: $${d.overage}k`}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-600">{d.q}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Middle Right: YoY Volume Trend (6 cols) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              YOY VOLUME TREND
            </h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700">
              <TrendingUp className="w-3 h-3" />
              +14.2%
            </span>
          </div>

          {/* Spline Area visual matching Screenshot 3 */}
          <div className="relative h-52 flex flex-col justify-end pt-4">
            <svg className="w-full h-40 overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#006666" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#006666" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Baseline dashed curve */}
              <path
                d="M 0 130 Q 125 120 250 85 T 500 130"
                fill="none"
                stroke="#94A3B8"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              {/* Area fill */}
              <path
                d="M 0 100 Q 125 90 250 55 T 450 65 T 500 20 L 500 150 L 0 150 Z"
                fill="url(#trendGrad)"
              />
              {/* Solid curve */}
              <path
                d="M 0 100 Q 125 90 250 55 T 450 65 T 500 20"
                fill="none"
                stroke="#006666"
                strokeWidth="3"
              />
              {/* Highlight point */}
              <circle cx="450" cy="65" r="5" fill="#FFFFFF" stroke="#006666" strokeWidth="2.5" />
            </svg>
            <div className="flex justify-between border-t border-slate-100 pt-2 text-[11px] font-medium text-slate-500">
              <span>Jan</span>
              <span>Apr</span>
              <span>Jul</span>
              <span>Oct</span>
              <span>Dec</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Card: Carrier Performance Summary matching Screenshot 3 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800 tracking-tight">
            Carrier Performance Summary
          </h3>
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold bg-slate-50/50 uppercase tracking-wider">
                <th className="py-3.5 px-6">CARRIER / REGION</th>
                <th className="py-3.5 px-6 text-right">VOLUME</th>
                <th className="py-3.5 px-6">DELIVERY RATE</th>
                <th className="py-3.5 px-6 text-right">AVG COST/MSG</th>
                <th className="py-3.5 px-6 text-right">TOTAL SPEND</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {carrierData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-800">{row.carrier}</td>
                  <td className="py-4 px-6 text-right font-mono font-medium">
                    {row.volume.toLocaleString()}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            row.deliveryRate >= 98 ? 'bg-[#006666]' : 'bg-rose-500'
                          }`}
                          style={{ width: `${row.deliveryRate}%` }}
                        />
                      </div>
                      <span
                        className={`font-mono font-bold ${
                          row.deliveryRate >= 98 ? 'text-slate-800' : 'text-rose-600'
                        }`}
                      >
                        {row.deliveryRate}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right font-mono">${row.avgCostPerMsg.toFixed(4)}</td>
                  <td className="py-4 px-6 text-right font-mono font-bold text-slate-900">
                    ${row.totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}

              {/* Aggregate Total */}
              <tr className="bg-slate-50 font-bold text-slate-900 border-t-2 border-slate-200">
                <td className="py-4 px-6">Aggregate Total</td>
                <td className="py-4 px-6 text-right font-mono">{totalVolumeSum.toLocaleString()}</td>
                <td className="py-4 px-6 font-mono text-slate-400">--</td>
                <td className="py-4 px-6 text-right font-mono text-slate-400">--</td>
                <td className="py-4 px-6 text-right font-mono text-base font-extrabold text-[#006666]">
                  ${totalSpendSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
