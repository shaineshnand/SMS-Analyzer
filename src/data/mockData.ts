import {
  MetricCardData,
  UploadItem,
  ReportEntry,
  CarrierPerformance,
  VolumeDay,
  UserProfile,
  AppSettings,
} from '../types';

export const ADMIN_USER: UserProfile = {
  name: 'Admin User',
  role: 'System Admin',
  email: 'admin@smsanalyzer.io',
  avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  avatarInitials: 'AU',
  type: 'admin',
};

export const CORPORATE_USER: UserProfile = {
  name: 'Corporate User',
  role: 'user@smsanalyzer.com',
  email: 'user@smsanalyzer.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  avatarInitials: 'CU',
  type: 'corporate',
};

export const DEFAULT_METRICS: MetricCardData[] = [
  {
    id: 'files-processed',
    title: 'Total Files Processed',
    value: '1,245',
    trend: {
      value: '+12%',
      isPositive: true,
      label: 'vs last month',
    },
  },
  {
    id: 'sms-count',
    title: 'Total SMS Count',
    value: '450,230',
    trend: {
      value: '+5.4%',
      isPositive: true,
      label: 'vs last month',
    },
  },
  {
    id: 'sms-rate',
    title: 'SMS Rate (FJD)',
    value: '$0.10',
    trend: {
      value: '—',
      isPositive: true,
      isNeutral: true,
      label: 'Unchanged',
    },
  },
  {
    id: 'total-cost',
    title: 'Total SMS Cost (FJD)',
    value: '$45,023',
    trend: {
      value: '+5.4%',
      isPositive: true,
      label: 'vs last month',
    },
  },
  {
    id: 'avg-sms-day',
    title: 'Avg SMS/Day',
    value: '1,233',
    trend: {
      value: '-2.1%',
      isPositive: false,
      label: 'vs last month',
    },
  },
  {
    id: 'avg-cost-day',
    title: 'Avg Cost/Day (FJD)',
    value: '$123.30',
    trend: {
      value: '-2.1%',
      isPositive: false,
      label: 'vs last month',
    },
  },
];

export const VALIDATION_HEALTH_DATA = {
  successRate: 99,
  cleanRecords: 445727,
  invalidFormats: 4503,
  totalRecords: 450230,
};

export const RECENT_UPLOADS: UploadItem[] = [
  {
    id: 'up-1',
    name: 'Q3_Marketing_Batch.xlsx',
    rows: '45k rows',
    uploadedAt: '24 mins ago',
    status: 'processed',
  },
  {
    id: 'up-2',
    name: 'Support_Alerts_Oct.csv',
    rows: '12k rows',
    uploadedAt: '2 hrs ago',
    status: 'processed',
  },
  {
    id: 'up-3',
    name: 'Legacy_Export_Old.csv',
    rows: '-',
    uploadedAt: 'Yesterday',
    status: 'error',
    errorDetails: 'Failed (Format)',
  },
];

export const ACTIVE_PROCESSING_FILES: UploadItem[] = [
  {
    id: 'act-1',
    name: 'Daily_SMS_2024_05_12.xlsx',
    stage: 'Parsing rows...',
    progress: 75,
    status: 'processing',
    uploadedAt: 'Just now',
  },
  {
    id: 'act-2',
    name: 'EU_Routing_Update_v2.xlsx',
    stage: 'Validating schema...',
    progress: 40,
    status: 'processing',
    uploadedAt: '1 min ago',
  },
  {
    id: 'act-3',
    name: 'APAC_Cost_Centers.xlsx',
    stage: 'Queued',
    progress: 0,
    status: 'processing',
    uploadedAt: '2 mins ago',
  },
];

export const PROCESSING_HISTORY_DATA: UploadItem[] = [
  {
    id: 'hist-1',
    name: 'Q1_Volume_Report.xlsx',
    uploadedAt: '2024-05-02 14:30',
    rows: '124,500',
    status: 'processed',
  },
  {
    id: 'hist-2',
    name: 'VendorB_Rates_May.xls',
    uploadedAt: '2024-05-01 09:15',
    rows: '8,200',
    status: 'processed',
  },
  {
    id: 'hist-3',
    name: 'April_Routing_Data.xls',
    uploadedAt: '2024-05-01 08:45',
    rows: '-',
    status: 'error',
    errorDetails: "Expected columns 'Dest_Network' and 'Cost_Per_Msg' not found.",
  },
  {
    id: 'hist-4',
    name: 'March_Final_Billing.xlsx',
    uploadedAt: '2024-04-30 18:20',
    rows: '98,400',
    status: 'processed',
  },
  {
    id: 'hist-5',
    name: 'Carrier_Rate_Matrix_2024.xls',
    uploadedAt: '2024-04-28 11:05',
    rows: '4,150',
    status: 'processed',
  },
];

export const REPORT_ENTRIES: ReportEntry[] = [
  {
    id: 'rep-1',
    year: 2024,
    month: 'January',
    smsCount: 25000,
    cost: 2500.0,
    status: 'completed',
  },
  {
    id: 'rep-2',
    year: 2024,
    month: 'February',
    smsCount: 22000,
    cost: 2200.0,
    status: 'completed',
  },
  {
    id: 'rep-3',
    year: 2024,
    month: 'March',
    smsCount: 'Pending',
    cost: null,
    status: 'pending',
  },
  {
    id: 'rep-4',
    year: 2025,
    month: 'January',
    smsCount: 30000,
    cost: 3000.0,
    status: 'completed',
  },
  // Additional entries for pagination demo (pages 2-3)
  {
    id: 'rep-5',
    year: 2024,
    month: 'April',
    smsCount: 28400,
    cost: 2840.0,
    status: 'completed',
  },
  {
    id: 'rep-6',
    year: 2024,
    month: 'May',
    smsCount: 31200,
    cost: 3120.0,
    status: 'completed',
  },
  {
    id: 'rep-7',
    year: 2024,
    month: 'June',
    smsCount: 29500,
    cost: 2950.0,
    status: 'completed',
  },
  {
    id: 'rep-8',
    year: 2024,
    month: 'July',
    smsCount: 33100,
    cost: 3310.0,
    status: 'completed',
  },
  {
    id: 'rep-9',
    year: 2024,
    month: 'August',
    smsCount: 27800,
    cost: 2780.0,
    status: 'completed',
  },
  {
    id: 'rep-10',
    year: 2024,
    month: 'September',
    smsCount: 35000,
    cost: 3500.0,
    status: 'completed',
  },
  {
    id: 'rep-11',
    year: 2024,
    month: 'October',
    smsCount: 38200,
    cost: 3820.0,
    status: 'completed',
  },
  {
    id: 'rep-12',
    year: 2024,
    month: 'November',
    smsCount: 42000,
    cost: 4200.0,
    status: 'completed',
  },
];

export const HIGHEST_VOLUME_DAYS: VolumeDay[] = [
  { date: 'Nov 24', volume: 980000, isPeak: true },
  { date: 'Dec 01', volume: 1050000, isPeak: false },
  { date: 'Oct 31', volume: 1020000, isPeak: false },
  { date: 'Nov 25', volume: 950000, isPeak: false },
  { date: 'Sep 15', volume: 800000, isPeak: false },
  { date: 'Aug 01', volume: 750000, isPeak: false },
  { date: 'Jul 04', volume: 650000, isPeak: false },
];

export const CARRIER_SUMMARY_DATA: CarrierPerformance[] = [
  {
    carrier: 'AT&T (North America)',
    region: 'North America',
    volume: 1245000,
    deliveryRate: 98.2,
    avgCostPerMsg: 0.0075,
    totalSpend: 9337.5,
  },
  {
    carrier: 'Verizon (North America)',
    region: 'North America',
    volume: 890500,
    deliveryRate: 99.1,
    avgCostPerMsg: 0.008,
    totalSpend: 7124.0,
  },
  {
    carrier: 'Vodafone (EMEA)',
    region: 'EMEA',
    volume: 450200,
    deliveryRate: 94.5,
    avgCostPerMsg: 0.012,
    totalSpend: 5402.4,
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  currency: 'FJD',
  smsRate: 0.1,
  rateUnit: 'per message',
  deliveryRateThreshold: 95.0,
  notificationsEnabled: true,
  theme: 'light',
};
