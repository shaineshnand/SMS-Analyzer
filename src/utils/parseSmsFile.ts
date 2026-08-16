import * as XLSX from 'xlsx';
import { toIsoDate } from './format';

export interface ParseSmsResult {
  fileName: string;
  date: string;
  smsCount: number;
}

const HEADER_HINTS =
  /^(date|time|timestamp|datetime|day|message|sms|text|phone|mobile|msisdn|number|status|destination|dest|to|from|sender|recipient|content|body|id|sn|type)$/i;

function isBlank(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

function cellToString(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value ?? '').trim();
}

function looksLikeHeader(row: unknown[]): boolean {
  const values = row.filter((cell) => !isBlank(cell));
  if (!values.length) return false;

  const hinted = values.some((cell) => HEADER_HINTS.test(cellToString(cell)));
  if (hinted) return true;

  const strings = values.filter((cell) => typeof cell === 'string' && cell.trim().length > 0);
  return strings.length === values.length && strings.every((cell) => String(cell).length <= 40);
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function toValidIso(year: number, month: number, day: number): string | null {
  if (year < 2000 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function parseDateFromFileName(fileName: string): string | null {
  const base = fileName.replace(/\.[^.]+$/, '');

  const iso = base.match(/(20\d{2})[-_./](\d{1,2})[-_./](\d{1,2})/);
  if (iso) {
    return toValidIso(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  }

  const compact = base.match(/(20\d{2})(\d{2})(\d{2})/);
  if (compact) {
    return toValidIso(Number(compact[1]), Number(compact[2]), Number(compact[3]));
  }

  const dmy = base.match(/(\d{1,2})[-_./](\d{1,2})[-_./](20\d{2})/);
  if (dmy) {
    const first = Number(dmy[1]);
    const second = Number(dmy[2]);
    const year = Number(dmy[3]);
    if (second > 12) return toValidIso(year, first, second);
    return toValidIso(year, second, first);
  }

  return null;
}

function excelSerialToIso(serial: number): string | null {
  if (!Number.isFinite(serial) || serial < 20000 || serial > 60000) return null;
  const parsed = XLSX.SSF.parse_date_code(serial);
  if (!parsed) return null;
  return toValidIso(parsed.y, parsed.m, parsed.d);
}

function parseCellDate(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return toIsoDate(value);
  }
  if (typeof value === 'number') {
    return excelSerialToIso(value);
  }
  const text = cellToString(value);
  if (!text) return null;

  const iso = text.match(/(20\d{2})[-_./](\d{1,2})[-_./](\d{1,2})/);
  if (iso) return toValidIso(Number(iso[1]), Number(iso[2]), Number(iso[3]));

  const dmy = text.match(/(\d{1,2})[-_./](\d{1,2})[-_./](20\d{2})/);
  if (dmy) {
    const first = Number(dmy[1]);
    const second = Number(dmy[2]);
    const year = Number(dmy[3]);
    if (second > 12) return toValidIso(year, first, second);
    return toValidIso(year, second, first);
  }

  return null;
}

function parseDateFromSheet(header: unknown[] | null, dataRows: unknown[][]): string | null {
  let dateCol = -1;
  if (header) {
    dateCol = header.findIndex((cell) => /date|time|day|timestamp/i.test(cellToString(cell)));
  }

  const candidates = dataRows.slice(0, 25);
  for (const row of candidates) {
    if (dateCol >= 0) {
      const parsed = parseCellDate(row[dateCol]);
      if (parsed) return parsed;
    }
    for (const cell of row) {
      const parsed = parseCellDate(cell);
      if (parsed) return parsed;
    }
  }

  return null;
}

export async function parseSmsFile(file: File, skipHeaderRow: boolean): Promise<ParseSmsResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  if (!workbook.SheetNames.length) {
    throw new Error('Workbook has no sheets');
  }

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: null,
    raw: true,
    blankrows: false,
  });

  const nonEmpty = rows.filter(
    (row) => Array.isArray(row) && row.some((cell) => !isBlank(cell))
  );

  if (!nonEmpty.length) {
    throw new Error('File has no SMS rows');
  }

  const header = nonEmpty[0];
  const shouldSkipHeader = skipHeaderRow || looksLikeHeader(header);
  const dataRows = shouldSkipHeader ? nonEmpty.slice(1) : nonEmpty;

  if (!dataRows.length) {
    throw new Error('File has a header but no SMS rows');
  }

  const date =
    parseDateFromFileName(file.name) ||
    parseDateFromSheet(shouldSkipHeader ? header : null, dataRows) ||
    toIsoDate(new Date(file.lastModified));

  return {
    fileName: file.name,
    date,
    smsCount: dataRows.length,
  };
}

export function isSpreadsheetFile(file: File): boolean {
  return /\.(xlsx|xls|csv)$/i.test(file.name);
}
