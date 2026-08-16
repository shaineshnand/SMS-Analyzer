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
    isPositive: boolean; // green vs red
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
}

export interface ReportEntry {
  id: string;
  year: number;
  month: string;
  smsCount: number | string; // e.g. 25000 or "Pending"
  cost: number | null; // e.g. 2500.00
  status: 'completed' | 'pending';
}

export interface CarrierPerformance {
  carrier: string;
  region: string;
  volume: number;
  deliveryRate: number; // e.g. 98.2
  avgCostPerMsg: number; // e.g. 0.0075
  totalSpend: number; // e.g. 9337.50
}

export interface VolumeDay {
  date: string;
  volume: number;
  isPeak?: boolean;
}

export interface AppSettings {
  currency: string;
  smsRate: number;
  rateUnit: string;
  deliveryRateThreshold: number;
  notificationsEnabled: boolean;
  theme: 'light' | 'system';
}
