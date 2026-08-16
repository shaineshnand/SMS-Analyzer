export type NavTab = 'dashboard' | 'upload' | 'analytics' | 'reports' | 'settings';

export interface UserProfile {
  name: string;
  role: string;
  email: string;
  avatarUrl: string;
  avatarInitials: string;
  type: 'admin' | 'corporate';
}

export interface MetricCardData {
  id: string;
  title: string;
  value: string;
  trend?: {
    value: string;
    isPositive: boolean;
    isNeutral?: boolean;
    label: string;
  };
}

export interface UploadItem {
  id: string;
  name: string;
  size?: string;
  rows?: string | number;
  uploadedAt: string;
  status: 'processed' | 'error' | 'pending' | 'processing';
  errorDetails?: string;
  progress?: number;
  stage?: string;
  date?: string;
}

export interface DailySmsRecord {
  id: string;
  date: string;
  fileName: string;
  smsCount: number;
  uploadedAt: string;
}

export interface FailedUpload {
  id: string;
  fileName: string;
  uploadedAt: string;
  errorDetails: string;
}

export interface BatchProgress {
  total: number;
  completed: number;
  currentFile: string;
  succeeded: number;
  failed: number;
  replaced: number;
}

export interface ReportEntry {
  id: string;
  year: number;
  month: string;
  monthIndex: number;
  smsCount: number;
  cost: number;
  status: 'completed' | 'pending';
}

export interface YearlySpend {
  year: number;
  smsCount: number;
  cost: number;
  days: number;
}

export interface VolumeDay {
  date: string;
  isoDate: string;
  volume: number;
  cost: number;
  isPeak?: boolean;
}

export interface TrendPoint {
  label: string;
  smsCount: number;
  cost: number;
  year: number;
}

export interface CoverageStats {
  dayCount: number;
  firstDate: string | null;
  lastDate: string | null;
  spanDays: number;
  missingDays: number;
  completeness: number;
}

export interface AppNotification {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: 'success' | 'error' | 'info';
}

export interface AppSettings {
  currency: string;
  smsRate: number;
  rateUnit: string;
  skipHeaderRow: boolean;
  notificationsEnabled: boolean;
  theme: 'light' | 'system';
}
