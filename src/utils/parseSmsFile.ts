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

const SMS_COMMS_DATE = /SMS_COMMS_(20\d{2})(\d{2})(\d{2})/i;

export function parseDateFromFileName(fileName: string): string | null {
  const smsComms = fileName.match(SMS_COMMS_DATE);
  if (smsComms) {
    return toValidIso(Number(smsComms[1]), Number(smsComms[2]), Number(smsComms[3]));
  }

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
  let workbook: XLSX.WorkBook;
  try {
    const buffer = await file.arrayBuffer();
    workbook = readWorkbook(file, buffer);
  } catch {
    throw new Error('File could not be read as Excel or CSV');
  }

  if (!workbook.SheetNames.length) {
    throw new Error('Workbook has no sheets');
  }

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  let rows: unknown[][];
  try {
    rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: null,
      raw: true,
      blankrows: false,
    });
  } catch {
    throw new Error('Sheet could not be read — skipped');
  }

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
    parseDateFromUpload(file) || parseDateFromSheet(shouldSkipHeader ? header : null, dataRows);

  if (!date) {
    throw new Error('No date found in the filename, year folder, or sheet');
  }

  return {
    fileName: file.name,
    date,
    smsCount: dataRows.length,
  };
}

export function parseDateFromUpload(file: File): string | null {
  const relative = file.webkitRelativePath || file.name;
  return (
    parseDateFromFileName(file.name) ||
    parseDateFromFileName(relative) ||
    parseDateFromFolderAndName(relative, file.name)
  );
}

function parseDateFromFolderAndName(relativePath: string, fileName: string): string | null {
  const yearMatch = relativePath.match(/(?:^|\/)(20\d{2})(?:\/|$)/);
  if (!yearMatch) return null;
  const year = Number(yearMatch[1]);
  const base = fileName.replace(/\.[^.]+$/, '');
  const monthDay = base.match(/(\d{1,2})[-_.](\d{1,2})/);
  if (!monthDay) return null;
  const first = Number(monthDay[1]);
  const second = Number(monthDay[2]);
  if (second > 12) return toValidIso(year, first, second);
  return toValidIso(year, second, first);
}

function isCsvLike(fileName: string): boolean {
  return /\.(csv|txt)$/i.test(fileName) || (isSmsCommsFile(fileName) && !/\.(xlsx|xls)$/i.test(fileName));
}

function readWorkbook(file: File, buffer: ArrayBuffer): XLSX.WorkBook {
  if (isCsvLike(file.name)) {
    const text = new TextDecoder('utf-8').decode(buffer);
    return XLSX.read(text, { type: 'string', raw: false });
  }
  return XLSX.read(buffer, { type: 'array', cellDates: true });
}

export function isSmsCommsFile(fileName: string): boolean {
  return SMS_COMMS_DATE.test(fileName);
}

export function isSpreadsheetFile(file: File): boolean {
  return /\.(xlsx|xls|csv|txt)$/i.test(file.name) || isSmsCommsFile(file.name);
}

export function isNoiseFile(fileName: string): boolean {
  const name = fileName.toLowerCase();
  return (
    name.startsWith('~$') ||
    name.startsWith('.') ||
    name === 'thumbs.db' ||
    name === 'desktop.ini' ||
    name === '.ds_store'
  );
}

export function skipReason(file: File): string | null {
  if (isNoiseFile(file.name)) return 'Ignored system or temp file';
  if (!isSpreadsheetFile(file)) return 'Not an Excel or CSV file';
  if (file.size === 0) return 'Empty file';
  return null;
}
