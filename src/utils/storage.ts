import { AppSettings, DailySmsRecord, FailedUpload } from '../types';

const DAYS_KEY = 'sms-analyzer-days';
const FAILURES_KEY = 'sms-analyzer-failures';
const SETTINGS_KEY = 'sms-analyzer-settings';

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadDays(): DailySmsRecord[] {
  return readJson<DailySmsRecord[]>(DAYS_KEY, []);
}

export function saveDays(days: DailySmsRecord[]): void {
  localStorage.setItem(DAYS_KEY, JSON.stringify(days));
}

export function loadFailures(): FailedUpload[] {
  return readJson<FailedUpload[]>(FAILURES_KEY, []);
}

export function saveFailures(failures: FailedUpload[]): void {
  localStorage.setItem(FAILURES_KEY, JSON.stringify(failures));
}

export function loadSettings(defaults: AppSettings): AppSettings {
  const stored = readJson<Partial<AppSettings> | null>(SETTINGS_KEY, null);
  if (!stored) return defaults;
  return { ...defaults, ...stored };
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function clearStoredData(): void {
  localStorage.removeItem(DAYS_KEY);
  localStorage.removeItem(FAILURES_KEY);
}
