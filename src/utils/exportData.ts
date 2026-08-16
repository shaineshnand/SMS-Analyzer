import * as XLSX from 'xlsx';
import { DailySmsRecord, ReportEntry } from '../types';
import { formatMoney, formatNumber } from './format';

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

export function exportMonthlyCsv(reports: ReportEntry[], currency: string) {
  const header = `Year,Month,SMS Count,Total Cost (${currency})`;
  const rows = reports.map(
    (row) => `${row.year},${row.month},${row.smsCount},${row.cost.toFixed(2)}`
  );
  const totalSms = reports.reduce((sum, row) => sum + row.smsCount, 0);
  const totalCost = reports.reduce((sum, row) => sum + row.cost, 0);
  rows.push(`TOTAL,,${totalSms},${totalCost.toFixed(2)}`);
  downloadBlob([header, ...rows].join('\n'), `SMS_Cost_Report_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

export function exportMonthlyExcel(reports: ReportEntry[], currency: string) {
  const sheet = XLSX.utils.json_to_sheet(
    reports.map((row) => ({
      Year: row.year,
      Month: row.month,
      'SMS Count': row.smsCount,
      [`Total Cost (${currency})`]: Number(row.cost.toFixed(2)),
    }))
  );
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Monthly Spend');
  XLSX.writeFile(workbook, `SMS_Cost_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportDailyExcel(days: DailySmsRecord[], rate: number, currency: string) {
  const sheet = XLSX.utils.json_to_sheet(
    days.map((day) => ({
      Date: day.date,
      File: day.fileName,
      'SMS Count': day.smsCount,
      [`Cost (${currency})`]: Number((day.smsCount * rate).toFixed(2)),
    }))
  );
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Daily Spend');
  XLSX.writeFile(workbook, `SMS_Daily_Spend_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportSummaryText(reports: ReportEntry[], currency: string) {
  const totalSms = reports.reduce((sum, row) => sum + row.smsCount, 0);
  const totalCost = reports.reduce((sum, row) => sum + row.cost, 0);
  const lines = [
    'SMS Cost Analyzer Report',
    `Generated ${new Date().toISOString().slice(0, 10)}`,
    '',
    ...reports.map(
      (row) =>
        `${row.year} ${row.month}: ${formatNumber(row.smsCount)} SMS · ${formatMoney(row.cost, currency)}`
    ),
    '',
    `GRAND TOTAL: ${formatNumber(totalSms)} SMS · ${formatMoney(totalCost, currency)}`,
  ];
  downloadBlob(lines.join('\n'), `SMS_Cost_Report_${new Date().toISOString().slice(0, 10)}.txt`, 'text/plain;charset=utf-8;');
}
