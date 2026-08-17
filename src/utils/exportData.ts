import ExcelJS from 'exceljs';
import { DailySmsRecord, ReportEntry } from '../types';
import { formatMoney, formatNumber } from './format';
import { drawBarChart } from './excelCharts';

function downloadBlob(content: BlobPart, fileName: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function chronological(reports: ReportEntry[]): ReportEntry[] {
  return [...reports].sort((a, b) => a.year - b.year || a.monthIndex - b.monthIndex);
}

function yearlyTotals(reports: ReportEntry[]) {
  const buckets = new Map<number, { year: number; smsCount: number; cost: number; months: number }>();
  for (const row of chronological(reports)) {
    const current = buckets.get(row.year) ?? { year: row.year, smsCount: 0, cost: 0, months: 0 };
    current.smsCount += row.smsCount;
    current.cost += row.cost;
    current.months += 1;
    buckets.set(row.year, current);
  }
  return [...buckets.values()];
}

const headerFill = {
  type: 'pattern' as const,
  pattern: 'solid' as const,
  fgColor: { argb: 'FF006666' },
};
const yearFill = {
  type: 'pattern' as const,
  pattern: 'solid' as const,
  fgColor: { argb: 'FFD9EDED' },
};
const grandFill = {
  type: 'pattern' as const,
  pattern: 'solid' as const,
  fgColor: { argb: 'FF0F172A' },
};

function styleHeader(row: ExcelJS.Row) {
  row.font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Calibri', size: 11 };
  row.fill = headerFill as ExcelJS.Fill;
  row.alignment = { vertical: 'middle' };
  row.height = 22;
}

export function exportMonthlyCsv(reports: ReportEntry[], currency: string) {
  const header = `Year,Month,SMS Count,Total Cost (${currency})`;
  const lines = [header];
  const ordered = chronological(reports);
  let currentYear: number | null = null;
  let yearSms = 0;
  let yearCost = 0;

  const flushYear = (year: number) => {
    lines.push(`${year},YEAR TOTAL,${yearSms},${yearCost.toFixed(2)}`);
    yearSms = 0;
    yearCost = 0;
  };

  for (const row of ordered) {
    if (currentYear !== null && row.year !== currentYear) flushYear(currentYear);
    currentYear = row.year;
    yearSms += row.smsCount;
    yearCost += row.cost;
    lines.push(`${row.year},${row.month},${row.smsCount},${row.cost.toFixed(2)}`);
  }
  if (currentYear !== null) flushYear(currentYear);

  const totalSms = ordered.reduce((sum, row) => sum + row.smsCount, 0);
  const totalCost = ordered.reduce((sum, row) => sum + row.cost, 0);
  lines.push(`ALL YEARS,GRAND TOTAL,${totalSms},${totalCost.toFixed(2)}`);
  downloadBlob(lines.join('\n'), `SMS_Cost_Report_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

export async function exportSpendWorkbook(options: {
  reports: ReportEntry[];
  days: DailySmsRecord[];
  currency: string;
  rate: number;
}) {
  const { reports, days, currency, rate } = options;
  const ordered = chronological(reports);
  const years = yearlyTotals(ordered);
  const totalSms = ordered.reduce((sum, row) => sum + row.smsCount, 0);
  const totalCost = ordered.reduce((sum, row) => sum + row.cost, 0);
  const stamp = new Date().toISOString().slice(0, 10);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SMS Cost Analyzer';
  workbook.created = new Date();

  addOverviewSheet(workbook, {
    years,
    ordered,
    totalSms,
    totalCost,
    currency,
    rate,
    stamp,
  });
  addMonthlySheet(workbook, ordered, years, totalSms, totalCost, currency);
  addDailySheet(workbook, days, rate, currency);

  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(
    buffer as ArrayBuffer,
    `SMS_Cost_Report_${stamp}.xlsx`,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
}

function addOverviewSheet(
  workbook: ExcelJS.Workbook,
  data: {
    years: ReturnType<typeof yearlyTotals>;
    ordered: ReportEntry[];
    totalSms: number;
    totalCost: number;
    currency: string;
    rate: number;
    stamp: string;
  }
) {
  const sheet = workbook.addWorksheet('Overview', { views: [{ showGridLines: false }] });
  sheet.columns = [
    { width: 16 },
    { width: 16 },
    { width: 18 },
    { width: 22 },
    { width: 16 },
    { width: 18 },
  ];

  sheet.mergeCells('A1:F1');
  sheet.getCell('A1').value = 'SMS Cost Analyzer';
  sheet.getCell('A1').font = { bold: true, size: 20, color: { argb: 'FF0F172A' }, name: 'Calibri' };

  sheet.mergeCells('A2:F2');
  sheet.getCell('A2').value = `Generated ${data.stamp}  ·  Rate ${formatMoney(data.rate, data.currency)} per SMS`;
  sheet.getCell('A2').font = { size: 11, color: { argb: 'FF64748B' } };

  sheet.getCell('A4').value = 'Grand total SMS';
  sheet.getCell('B4').value = data.totalSms;
  sheet.getCell('B4').numFmt = '#,##0';
  sheet.getCell('C4').value = `Grand total (${data.currency})`;
  sheet.getCell('D4').value = Number(data.totalCost.toFixed(2));
  sheet.getCell('D4').numFmt = '"$"#,##0.00';
  ['A4', 'C4'].forEach((ref) => {
    sheet.getCell(ref).font = { bold: true, color: { argb: 'FF006666' } };
  });
  ['B4', 'D4'].forEach((ref) => {
    sheet.getCell(ref).font = { bold: true, size: 14 };
  });

  sheet.getCell('A6').value = 'Year-end totals';
  sheet.getCell('A6').font = { bold: true, size: 13 };

  const header = sheet.getRow(7);
  header.values = ['Year', 'Months loaded', 'SMS Count', `Total Cost (${data.currency})`, 'Share of spend'];
  styleHeader(header);

  data.years.forEach((year, index) => {
    const row = sheet.getRow(8 + index);
    const share = data.totalCost ? year.cost / data.totalCost : 0;
    row.values = [year.year, year.months, year.smsCount, Number(year.cost.toFixed(2)), share];
    row.getCell(3).numFmt = '#,##0';
    row.getCell(4).numFmt = '"$"#,##0.00';
    row.getCell(5).numFmt = '0.0%';
  });

  const totalRow = sheet.getRow(8 + data.years.length);
  totalRow.values = ['ALL YEARS', data.years.reduce((s, y) => s + y.months, 0), data.totalSms, Number(data.totalCost.toFixed(2)), 1];
  totalRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  totalRow.fill = grandFill as ExcelJS.Fill;
  totalRow.getCell(3).numFmt = '#,##0';
  totalRow.getCell(4).numFmt = '"$"#,##0.00';
  totalRow.getCell(5).numFmt = '0.0%';

  const chartStart = 10 + data.years.length;
  sheet.getCell(`A${chartStart}`).value = 'Charts';
  sheet.getCell(`A${chartStart}`).font = { bold: true, size: 13 };

  if (data.years.length) {
    const spendChart = drawBarChart({
      title: `Spend by year (${data.currency})`,
      labels: data.years.map((item) => String(item.year)),
      values: data.years.map((item) => item.cost),
      formatValue: (value) => formatMoney(value, data.currency),
      barColor: '#006666',
    });
    const volumeChart = drawBarChart({
      title: 'SMS volume by year',
      labels: data.years.map((item) => String(item.year)),
      values: data.years.map((item) => item.smsCount),
      formatValue: (value) => formatNumber(value),
      barColor: '#0F172A',
    });

    if (spendChart) {
      const spendId = workbook.addImage({
        base64: spendChart.replace(/^data:image\/png;base64,/, ''),
        extension: 'png',
      });
      sheet.addImage(spendId, {
        tl: { col: 0, row: chartStart + 1 },
        ext: { width: 620, height: 252 },
      });
    }
    if (volumeChart) {
      const volumeId = workbook.addImage({
        base64: volumeChart.replace(/^data:image\/png;base64,/, ''),
        extension: 'png',
      });
      sheet.addImage(volumeId, {
        tl: { col: 0, row: chartStart + 15 },
        ext: { width: 620, height: 252 },
      });
    }
  }

  if (data.ordered.length) {
    const monthChart = drawBarChart({
      title: 'Monthly SMS volume',
      labels: data.ordered.map((row) => `${row.month.slice(0, 3)} ${String(row.year).slice(2)}`),
      values: data.ordered.map((row) => row.smsCount),
      formatValue: (value) => formatNumber(value),
      barColor: '#3B82F6',
      width: 1200,
      height: 460,
    });
    if (monthChart) {
      const monthId = workbook.addImage({
        base64: monthChart.replace(/^data:image\/png;base64,/, ''),
        extension: 'png',
      });
      sheet.addImage(monthId, {
        tl: { col: 0, row: chartStart + 29 },
        ext: { width: 920, height: 340 },
      });
    }
  }
}

function addMonthlySheet(
  workbook: ExcelJS.Workbook,
  ordered: ReportEntry[],
  years: ReturnType<typeof yearlyTotals>,
  totalSms: number,
  totalCost: number,
  currency: string
) {
  const sheet = workbook.addWorksheet('Monthly');
  sheet.columns = [
    { header: 'Year', key: 'year', width: 14 },
    { header: 'Month', key: 'month', width: 18 },
    { header: 'SMS Count', key: 'sms', width: 16 },
    { header: `Total Cost (${currency})`, key: 'cost', width: 22 },
    { header: 'Volume', key: 'bar', width: 28 },
  ];
  styleHeader(sheet.getRow(1));

  const maxSms = Math.max(...ordered.map((row) => row.smsCount), 1);
  let excelRow = 2;

  const writeYearTotal = (year: (typeof years)[number]) => {
    const row = sheet.getRow(excelRow);
    row.values = [year.year, `${year.year} YEAR TOTAL`, year.smsCount, Number(year.cost.toFixed(2)), ''];
    row.font = { bold: true };
    row.fill = yearFill as ExcelJS.Fill;
    row.getCell(3).numFmt = '#,##0';
    row.getCell(4).numFmt = '"$"#,##0.00';
    excelRow += 1;
  };

  for (let i = 0; i < ordered.length; i++) {
    const item = ordered[i];
    const row = sheet.getRow(excelRow);
    const blocks = Math.max(1, Math.round((item.smsCount / maxSms) * 16));
    row.values = [item.year, item.month, item.smsCount, Number(item.cost.toFixed(2)), '█'.repeat(blocks)];
    row.getCell(3).numFmt = '#,##0';
    row.getCell(4).numFmt = '"$"#,##0.00';
    row.getCell(5).font = { color: { argb: 'FF006666' }, name: 'Calibri' };
    excelRow += 1;

    const next = ordered[i + 1];
    if (!next || next.year !== item.year) {
      const year = years.find((entry) => entry.year === item.year);
      if (year) writeYearTotal(year);
    }
  }

  const grand = sheet.getRow(excelRow);
  grand.values = ['ALL YEARS', 'GRAND TOTAL', totalSms, Number(totalCost.toFixed(2)), ''];
  grand.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  grand.fill = grandFill as ExcelJS.Fill;
  grand.getCell(3).numFmt = '#,##0';
  grand.getCell(4).numFmt = '"$"#,##0.00';

  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: 4 },
  };
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
}

function addDailySheet(workbook: ExcelJS.Workbook, days: DailySmsRecord[], rate: number, currency: string) {
  const sheet = workbook.addWorksheet('Daily');
  sheet.columns = [
    { header: 'Date', key: 'date', width: 14 },
    { header: 'File', key: 'file', width: 36 },
    { header: 'SMS Count', key: 'sms', width: 14 },
    { header: `Cost (${currency})`, key: 'cost', width: 18 },
  ];
  styleHeader(sheet.getRow(1));

  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  sorted.forEach((day, index) => {
    const row = sheet.getRow(index + 2);
    row.values = [day.date, day.fileName, day.smsCount, Number((day.smsCount * rate).toFixed(2))];
    row.getCell(3).numFmt = '#,##0';
    row.getCell(4).numFmt = '"$"#,##0.00';
  });
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: 4 },
  };
}

export function exportMonthlyExcel(reports: ReportEntry[], currency: string) {
  return exportSpendWorkbook({ reports, days: [], currency, rate: 0 });
}

export function exportDailyExcel(days: DailySmsRecord[], rate: number, currency: string) {
  return exportSpendWorkbook({
    reports: [],
    days,
    currency,
    rate,
  });
}

export function exportSummaryText(reports: ReportEntry[], currency: string) {
  const ordered = chronological(reports);
  const years = yearlyTotals(ordered);
  const totalSms = ordered.reduce((sum, row) => sum + row.smsCount, 0);
  const totalCost = ordered.reduce((sum, row) => sum + row.cost, 0);
  const lines = [
    'SMS Cost Analyzer Report',
    `Generated ${new Date().toISOString().slice(0, 10)}`,
    '',
    ...ordered.flatMap((row, index, list) => {
      const linesForRow = [
        `${row.year} ${row.month}: ${formatNumber(row.smsCount)} SMS · ${formatMoney(row.cost, currency)}`,
      ];
      const next = list[index + 1];
      if (!next || next.year !== row.year) {
        const year = years.find((item) => item.year === row.year);
        if (year) {
          linesForRow.push(
            `${row.year} YEAR TOTAL: ${formatNumber(year.smsCount)} SMS · ${formatMoney(year.cost, currency)}`,
            ''
          );
        }
      }
      return linesForRow;
    }),
    `GRAND TOTAL: ${formatNumber(totalSms)} SMS · ${formatMoney(totalCost, currency)}`,
  ];
  downloadBlob(lines.join('\n'), `SMS_Cost_Report_${new Date().toISOString().slice(0, 10)}.txt`, 'text/plain;charset=utf-8;');
}
