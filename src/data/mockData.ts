import { UserProfile, AppSettings } from '../types';

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
  role: 'Finance User',
  email: 'user@smsanalyzer.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  avatarInitials: 'CU',
  type: 'corporate',
};

export const DEFAULT_SETTINGS: AppSettings = {
  currency: 'FJD',
  smsRate: 0.1,
  rateUnit: 'per message',
  skipHeaderRow: true,
  notificationsEnabled: true,
  theme: 'light',
};
