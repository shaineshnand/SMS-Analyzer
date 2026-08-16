import React, { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { TrendPoint, VolumeDay, YearlySpend } from '../../types';
import { formatMoney, formatNumber, formatRate } from '../../utils/format';

interface AnalyticsViewProps {
  yearly: YearlySpend[];
  highestDays: VolumeDay[];
  trend: TrendPoint[];
  years: number[];
  currency: string;
  rate: number;
  hasData: boolean;
  onExport: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  yearly,
  highestDays,
  trend,
  years,
  currency,
  rate,
  hasData,
  onExport,
}) => {
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');

  const filteredYearly = useMemo(
    () => (selectedYear === 'all' ? yearly : yearly.filter((item) => item.year === selectedYear)),
    [yearly, selectedYear]
  );
  const filteredHighest = useMemo(
    () =>
      selectedYear === 'all'
        ? highestDays
        : highestDays.filter((item) => item.isoDate.startsWith(`${selectedYear}-`)),
    [highestDays, selectedYear]
  );
  const filteredTrend = useMemo(
    () => (selectedYear === 'all' ? trend : trend.filter((item) => item.year === selectedYear)),
    [trend, selectedYear]
  );

  const totalSms = filteredYearly.reduce((sum, item) => sum + item.smsCount, 0);
  const totalCost = filteredYearly.reduce((sum, item) => sum + item.cost, 0);
  const maxVolume = Math.max(...filteredHighest.map((item) => item.volume), 1);
  const maxTrend = Math.max(...filteredTrend.map((item) => item.smsCount), 1);
  const tick = maxVolume > 1000000 ? 250000 : maxVolume > 100000 ? 25000 : Math.max(Math.ceil(maxVolume / 4), 1);

  return (
    <div id="analytics-view" className="p-6 sm:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight">
            Spend Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Busiest days, yearly totals, and volume over time from the files you loaded.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs"
          >
            <option value="all">All years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4">
            Highest Volume Days
          </h3>
          {!hasData || !filteredHighest.length ? (
            <EmptyState />
          ) : (
            <div className="space-y-3.5 pt-2">
              {filteredHighest.map((item, idx) => {
                const pct = (item.volume / maxVolume) * 100;
                return (
                  <div key={`${item.date}-${idx}`} className="flex items-center gap-4 text-xs">
                    <span className="w-16 font-mono font-medium text-slate-600 text-right shrink-0">
                      {item.date}
                    </span>
                    <div className="flex-1 h-5 bg-slate-50 rounded-xs overflow-hidden relative">
                      <div
                        className={`h-full rounded-xs ${idx === 0 ? 'bg-[#0B192C]' : 'bg-[#53657D]'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-24 text-right font-mono text-slate-600">
                      {formatNumber(item.volume)}
                    </span>
                  </div>
                );
              })}
              <div className="flex justify-between pl-20 pr-28 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                <span>0</span>
                <span>{formatNumber(tick)}</span>
                <span>{formatNumber(tick * 2)}</span>
                <span>{formatNumber(maxVolume)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Spend by Year</h3>
          {!hasData || !filteredYearly.length ? (
            <div className="flex-1 flex items-center">
              <EmptyState />
            </div>
          ) : (
            <div className="py-4 flex flex-col items-center justify-center flex-1">
              <YearDonut yearly={filteredYearly} totalSms={totalSms} />
              <div className="flex items-center justify-center flex-wrap gap-4 mt-6 text-xs">
                {filteredYearly.map((item, index) => {
                  const colors = ['#0B192C', '#006666', '#53657D', '#C7D7E8'];
                  const share = totalSms ? Math.round((item.smsCount / totalSms) * 100) : 0;
                  return (
                    <div key={item.year} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: colors[index % colors.length] }} />
                      <span className="text-slate-700 font-medium">
                        {item.year} ({share}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4">
            Volume Over Time
          </h3>
          {!hasData || !filteredTrend.length ? (
            <EmptyState />
          ) : (
            <div className="h-52 flex items-end gap-1 pt-6 border-b border-slate-100 px-1">
              {filteredTrend.slice(-24).map((point) => (
                <div key={point.label} className="flex-1 flex flex-col items-center justify-end h-full group">
                  <div
                    className="w-full max-w-[18px] bg-[#006666] rounded-t-xs"
                    style={{ height: `${Math.max(6, (point.smsCount / maxTrend) * 100)}%` }}
                    title={`${point.label}: ${formatNumber(point.smsCount)} SMS`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Rate Impact
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            At {formatRate(rate, currency)} per SMS, the loaded files total{' '}
            <span className="font-bold text-slate-900">{formatNumber(totalSms)} messages</span> and{' '}
            <span className="font-bold text-[#006666]">{formatMoney(totalCost, currency)}</span>.
            Change the rate in Settings to recalculate every year at once.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {filteredYearly.map((item) => (
              <div key={item.year} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <p className="text-[11px] font-semibold text-slate-500">{item.year}</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{formatMoney(item.cost, currency)}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {formatNumber(item.smsCount)} SMS · {item.days} days
                </p>
              </div>
            ))}
            {!filteredYearly.length && <EmptyState />}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800 tracking-tight">Yearly Spend Summary</h3>
          <button
            onClick={onExport}
            disabled={!hasData}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 hover:bg-slate-50 disabled:opacity-40 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold bg-slate-50/50 uppercase tracking-wider">
                <th className="py-3.5 px-6">Year</th>
                <th className="py-3.5 px-6 text-right">Days Loaded</th>
                <th className="py-3.5 px-6 text-right">SMS Volume</th>
                <th className="py-3.5 px-6 text-right">Avg Cost/Msg</th>
                <th className="py-3.5 px-6 text-right">Total Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredYearly.map((row) => (
                <tr key={row.year} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-800">{row.year}</td>
                  <td className="py-4 px-6 text-right font-mono">{formatNumber(row.days)}</td>
                  <td className="py-4 px-6 text-right font-mono">{formatNumber(row.smsCount)}</td>
                  <td className="py-4 px-6 text-right font-mono">{formatRate(rate, currency)}</td>
                  <td className="py-4 px-6 text-right font-mono font-bold text-slate-900">
                    {formatMoney(row.cost, currency)}
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-50 font-bold text-slate-900 border-t-2 border-slate-200">
                <td className="py-4 px-6">Grand Total</td>
                <td className="py-4 px-6 text-right font-mono">
                  {formatNumber(filteredYearly.reduce((sum, row) => sum + row.days, 0))}
                </td>
                <td className="py-4 px-6 text-right font-mono">{formatNumber(totalSms)}</td>
                <td className="py-4 px-6 text-right font-mono text-slate-400">—</td>
                <td className="py-4 px-6 text-right font-mono text-base font-extrabold text-[#006666]">
                  {formatMoney(totalCost, currency)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

function YearDonut({ yearly, totalSms }: { yearly: YearlySpend[]; totalSms: number }) {
  const colors = ['#0B192C', '#006666', '#53657D', '#C7D7E8'];
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="relative w-44 h-44 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        {yearly.map((item, index) => {
          const share = totalSms ? item.smsCount / totalSms : 0;
          const dash = circumference * share;
          const circle = (
            <circle
              key={item.year}
              cx="50"
              cy="50"
              r={radius}
              strokeWidth="12"
              stroke={colors[index % colors.length]}
              fill="transparent"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
            />
          );
          offset += dash;
          return circle;
        })}
      </svg>
      <div className="absolute text-center">
        <span className="text-2xl font-extrabold text-slate-900 tracking-tight block">
          {formatNumber(totalSms)}
        </span>
        <span className="text-[10px] font-medium text-slate-400 uppercase">Total SMS</span>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-40 flex items-center justify-center text-sm text-slate-400">
      Upload daily Excel files to see analytics.
    </div>
  );
}
