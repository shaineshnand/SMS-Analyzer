import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, HelpCircle, User, CheckCircle2, AlertTriangle, FileText, X } from 'lucide-react';
import { NavTab, UserProfile } from '../types';

interface HeaderProps {
  activeTab: NavTab;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentUser: UserProfile;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  searchQuery,
  setSearchQuery,
  currentUser,
  onOpenHelp,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Search analytics...';
      case 'reports':
        return 'Search reports...';
      case 'upload':
        return 'Search files...';
      case 'analytics':
        return 'Search metrics & carriers...';
      case 'settings':
        return 'Search settings...';
      default:
        return 'Search analytics...';
    }
  };

  const notifications = [
    {
      id: 1,
      title: 'Batch Q3_Marketing Processed',
      desc: '45,000 SMS records parsed successfully without errors.',
      time: '24 mins ago',
      type: 'success',
    },
    {
      id: 2,
      title: 'Header Mismatch Detected',
      desc: 'April_Routing_Data.xls failed schema validation.',
      time: '2 hours ago',
      type: 'error',
    },
    {
      id: 3,
      title: 'Monthly Billing Cycle Closed',
      desc: 'May invoices generated for FJD $45,023.00.',
      time: '1 day ago',
      type: 'info',
    },
  ];

  return (
    <header
      id="main-top-header"
      className="h-16 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20"
    >
      {/* Title */}
      <div className="flex items-center gap-3">
        <h2 className="text-[17px] font-bold text-slate-800 tracking-tight">
          SMS Cost Analyzer
        </h2>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-lg mx-6 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={getSearchPlaceholder()}
            className="w-full bg-[#F8FAFC] hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-full pl-9 pr-8 py-1.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            id="header-notifications-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-teal-500 ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-semibold text-slate-800 text-sm">Notifications</span>
                <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                  3 new
                </span>
              </div>
              <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors flex items-start gap-3"
                  >
                    {n.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    ) : n.type === 'error' ? (
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    ) : (
                      <FileText className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.desc}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Help Circle */}
        <button
          id="header-help-btn"
          onClick={onOpenHelp}
          aria-label="Help Documentation"
          className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* User Avatar */}
        <div className="relative" ref={userMenuRef}>
          <button
            id="header-user-avatar-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-9 h-9 rounded-full ring-2 ring-slate-200 overflow-hidden flex items-center justify-center bg-slate-800 text-white transition-transform active:scale-95"
          >
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-white" />
            )}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800">{currentUser.name}</p>
                <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
              </div>
              <div className="mt-2 text-xs text-slate-600 space-y-1">
                <div className="px-3 py-1.5 rounded-lg bg-slate-50 flex items-center justify-between">
                  <span>Role</span>
                  <span className="font-semibold text-teal-700">{currentUser.role}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
