import {
  CoverageStats,
  DailySmsRecord,
  MetricCardData,
  ReportEntry,
  TrendPoint,
  VolumeDay,
  YearlySpend,
} from '../types';
import {
  formatCompactDate,
  formatMoney,
  formatNumber,
  formatRate,
  formatShortDate,
  monthName,
  parseIsoDate,
  toIsoDate,
} from './format';

export type TimeRange = 'Last 7 Days' | 'Last 30 Days' | 'Last 90 Days' | 'Year to Date' | 'All Time';

export function filterDays(
  days: DailySmsRecord[],
  range: TimeRange,
  selectedYear?: number | 'all'
): DailySmsRecord[] {
  let filtered = [...days];

  if (selectedYear && selectedYear !== 'all') {
    filtered = filtered.filter((day) => day.date.startsWith(`${selectedYear}-`));
  }

  if (range === 'All Time') return filtered;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (range === 'Year to Date') {
    const start = `${today.getFullYear()}-01-01`;
    return filtered.filter((day) => day.date >= start);
  }

  const daysBack = range === 'Last 7 Days' ? 7 : range === 'Last 30 Days' ? 30 : 90;
  const start = new Date(today);
  start.setDate(today.getDate() - (daysBack - 1));
  const startIso = toIsoDate(start);
  return filtered.filter((day) => day.date >= startIso);
}

export function sumSms(days: DailySmsRecord[]): number {
  return days.reduce((total, day) => total + day.smsCount, 0);
}

export function sumCost(days: DailySmsRecord[], rate: number): number {
  return sumSms(days) * rate;
}

export function coverageStats(days: DailySmsRecord[]): CoverageStats {
  if (!days.length) {
    return {
      dayCount: 0,
      firstDate: null,
      lastDate: null,
      spanDays: 0,
      missingDays: 0,
      completeness: 0,
    };
  }

  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const firstDate = sorted[0].date;
  const lastDate = sorted[sorted.length - 1].date;
  const spanDays =
    Math.round((parseIsoDate(lastDate).getTime() - parseIsoDate(firstDate).getTime()) / 86400000) + 1;
  const uniqueDays = new Set(sorted.map((day) => day.date)).size;
  const missingDays = Math.max(0, spanDays - uniqueDays);

  return {
    dayCount: uniqueDays,
    firstDate,
    lastDate,
    spanDays,
    missingDays,
    completeness: spanDays > 0 ? (uniqueDays / spanDays) * 100 : 0,
  };
}

export function buildMetrics(
  days: DailySmsRecord[],
  rate: number,
  currency: string
): MetricCardData[] {
  const totalSms = sumSms(days);
  const totalCost = totalSms * rate;
  const dayCount = days.length || 1;
  const avgSms = days.length ? totalSms / days.length : 0;
  const avgCost = avgSms * rate;

  return [
    {
      id: 'files-processed',
      title: 'Days Loaded',
      value: formatNumber(days.length),
      trend: {
        value: '—',
        isPositive: true,
        isNeutral: true,
        label: days.length ? 'daily Excel files' : 'upload to start',
      },
    },
    {
      id: 'sms-count',
      title: 'Total SMS Count',
      value: formatNumber(totalSms),
      trend: {
        value: '—',
        isPositive: true,
        isNeutral: true,
        label: 'each row = 1 SMS',
      },
    },
    {
      id: 'sms-rate',
      title: `SMS Rate (${currency})`,
      value: formatRate(rate, currency),
      trend: {
        value: '—',
        isPositive: true,
        isNeutral: true,
        label: 'per message',
      },
    },
    {
      id: 'total-cost',
      title: `Total SMS Cost (${currency})`,
      value: formatMoney(totalCost, currency),
      trend: {
        value: '—',
        isPositive: true,
        isNeutral: true,
        label: 'count × rate',
      },
    },
    {
      id: 'avg-sms-day',
      title: 'Avg SMS/Day',
      value: formatNumber(avgSms),
      trend: {
        value: '—',
        isPositive: true,
        isNeutral: true,
        label: days.length ? `across ${dayCount} days` : 'no days yet',
      },
    },
    {
      id: 'avg-cost-day',
      title: `Avg Cost/Day (${currency})`,
      value: formatMoney(avgCost, currency),
      trend: {
        value: '—',
        isPositive: true,
        isNeutral: true,
        label: days.length ? `across ${dayCount} days` : 'no days yet',
      },
    },
  ];
}

export function buildMonthlyReports(days: DailySmsRecord[], rate: number): ReportEntry[] {
  const buckets = new Map<string, { year: number; month: number; smsCount: number }>();

  for (const day of days) {
    const year = Number(day.date.slice(0, 4));
    const month = Number(day.date.slice(5, 7));
    const key = `${year}-${month}`;
    const current = buckets.get(key) ?? { year, month, smsCount: 0 };
    current.smsCount += day.smsCount;
    buckets.set(key, current);
  }

  return [...buckets.values()]
    .sort((a, b) => b.year - a.year || b.month - a.month)
    .map((bucket) => ({
      id: `${bucket.year}-${bucket.month}`,
      year: bucket.year,
      month: monthName(bucket.month),
      monthIndex: bucket.month,
      smsCount: bucket.smsCount,
      cost: bucket.smsCount * rate,
      status: 'completed' as const,
    }));
}

export function buildYearlySpend(days: DailySmsRecord[], rate: number): YearlySpend[] {
  const buckets = new Map<number, YearlySpend>();

  for (const day of days) {
    const year = Number(day.date.slice(0, 4));
    const current = buckets.get(year) ?? { year, smsCount: 0, cost: 0, days: 0 };
    current.smsCount += day.smsCount;
    current.days += 1;
    buckets.set(year, current);
  }

  return [...buckets.values()]
    .map((bucket) => ({ ...bucket, cost: bucket.smsCount * rate }))
    .sort((a, b) => a.year - b.year);
}

export function highestVolumeDays(days: DailySmsRecord[], rate: number, limit = 8): VolumeDay[] {
  return [...days]
    .sort((a, b) => b.smsCount - a.smsCount || b.date.localeCompare(a.date))
    .slice(0, limit)
    .map((day, index) => ({
      date: formatCompactDate(day.date),
      isoDate: day.date,
      volume: day.smsCount,
      cost: day.smsCount * rate,
      isPeak: index === 0,
    }));
}

export function availableYears(days: DailySmsRecord[]): number[] {
  return [...new Set(days.map((day) => Number(day.date.slice(0, 4))))].sort((a, b) => b - a);
}

export function buildTrend(days: DailySmsRecord[], rate: number, range: TimeRange): TrendPoint[] {
  if (!days.length) return [];

  const useDaily = range === 'Last 7 Days' || range === 'Last 30 Days';
  if (useDaily) {
    return [...days]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((day) => ({
        label: formatCompactDate(day.date),
        smsCount: day.smsCount,
        cost: day.smsCount * rate,
        year: Number(day.date.slice(0, 4)),
      }));
  }

  const buckets = new Map<string, { label: string; smsCount: number; order: string }>();
  for (const day of days) {
    const key = day.date.slice(0, 7);
    const current = buckets.get(key) ?? {
      label: `${monthName(Number(day.date.slice(5, 7))).slice(0, 3)} ${day.date.slice(0, 4)}`,
      smsCount: 0,
      order: key,
    };
    current.smsCount += day.smsCount;
    buckets.set(key, current);
  }

  return [...buckets.values()]
    .sort((a, b) => a.order.localeCompare(b.order))
    .map((bucket) => ({
      label: bucket.label,
      smsCount: bucket.smsCount,
      cost: bucket.smsCount * rate,
      year: Number(bucket.order.slice(0, 4)),
    }));
}

export function coverageLabel(stats: CoverageStats): string {
  if (!stats.firstDate || !stats.lastDate) return 'No files loaded yet';
  return `${formatShortDate(stats.firstDate)} – ${formatShortDate(stats.lastDate)}`;
}
