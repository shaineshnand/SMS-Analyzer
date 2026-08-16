import React from 'react';
import {
  LayoutDashboard,
  Upload,
  BarChart3,
  FileSpreadsheet,
  Settings,
  TrendingUp,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { NavTab, UserProfile } from '../types';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  currentUser: UserProfile;
  onToggleUser: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onToggleUser,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'upload' as NavTab,
      label: 'File Upload',
      icon: Upload,
    },
    {
      id: 'analytics' as NavTab,
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      id: 'reports' as NavTab,
      label: 'Reports',
      icon: FileSpreadsheet,
    },
    {
      id: 'settings' as NavTab,
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <aside
      id="main-sidebar"
      className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none z-30 transition-all"
    >
      {/* Top Brand Logo Section */}
      <div>
        <div className="p-6 pb-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F172A] flex items-center justify-center text-white shadow-sm shrink-0">
            <TrendingUp className="w-5 h-5 text-teal-400 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="font-bold text-[17px] text-[#0F172A] tracking-tight leading-tight">
              SMS Analyzer
            </h1>
            <p className="text-[12px] font-semibold text-[#006666] tracking-tight">
              Daily SMS Spend
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 mt-4 space-y-1.5" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[14.5px] font-medium transition-all text-left group ${
                  isActive
                    ? 'bg-[#EBF3FE] text-[#0A5C67] font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive
                      ? 'text-[#0A5C67]'
                      : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Info at Bottom */}
      <div className="p-3 border-t border-slate-100">
        <button
          id="user-profile-toggle-btn"
          onClick={onToggleUser}
          title="Click to toggle user persona (Admin / Corporate)"
          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 transition-colors text-left group"
        >
          {currentUser.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-slate-700 text-white font-semibold text-xs flex items-center justify-center shrink-0">
              {currentUser.avatarInitials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm text-slate-800 truncate">
                {currentUser.name}
              </span>
              {currentUser.type === 'admin' ? (
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              ) : (
                <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              )}
            </div>
            <p className="text-xs text-slate-500 truncate">
              {currentUser.role}
            </p>
          </div>
        </button>
      </div>
    </aside>
  );
};
