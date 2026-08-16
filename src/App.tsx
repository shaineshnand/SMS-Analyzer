import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/views/DashboardView';
import { FileUploadView } from './components/views/FileUploadView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { ReportsView } from './components/views/ReportsView';
import { SettingsView } from './components/views/SettingsView';
import { ValidationErrorModal } from './components/modals/ValidationErrorModal';
import { ExportModal } from './components/modals/ExportModal';
import { HelpModal } from './components/modals/HelpModal';
import {
  NavTab,
  UserProfile,
  UploadItem,
  ReportEntry,
  AppSettings,
} from './types';
import {
  ADMIN_USER,
  CORPORATE_USER,
  DEFAULT_METRICS,
  RECENT_UPLOADS,
  ACTIVE_PROCESSING_FILES,
  PROCESSING_HISTORY_DATA,
  REPORT_ENTRIES,
  HIGHEST_VOLUME_DAYS,
  CARRIER_SUMMARY_DATA,
  DEFAULT_SETTINGS,
} from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<UserProfile>(ADMIN_USER);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Dynamic state
  const [recentUploads, setRecentUploads] = useState<UploadItem[]>(RECENT_UPLOADS);
  const [activeProcessing, setActiveProcessing] = useState<UploadItem[]>(ACTIVE_PROCESSING_FILES);
  const [processingHistory, setProcessingHistory] = useState<UploadItem[]>(PROCESSING_HISTORY_DATA);
  const [reports, setReports] = useState<ReportEntry[]>(REPORT_ENTRIES);

  // Modals state
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv' | 'pdf'>('excel');
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Toggle user persona
  const handleToggleUser = () => {
    setCurrentUser((prev) => (prev.type === 'admin' ? CORPORATE_USER : ADMIN_USER));
  };

  // Upload file simulation
  const handleUploadFile = (file: File) => {
    const newActiveId = `act-${Date.now()}`;
    const newActiveItem: UploadItem = {
      id: newActiveId,
      name: file.name,
      stage: 'Parsing rows...',
      progress: 15,
      status: 'processing',
      uploadedAt: 'Just now',
    };

    setActiveProcessing((prev) => [newActiveItem, ...prev]);

    // Simulate progress
    let p = 15;
    const interval = setInterval(() => {
      p += 25;
      if (p >= 100) {
        clearInterval(interval);
        setActiveProcessing((prev) => prev.filter((item) => item.id !== newActiveId));

        // Add to processed history
        const rowCount = Math.floor(Math.random() * 40000 + 5000);
        const newHistItem: UploadItem = {
          id: `hist-${Date.now()}`,
          name: file.name,
          uploadedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
          rows: rowCount.toLocaleString(),
          status: 'processed',
        };
        setProcessingHistory((prev) => [newHistItem, ...prev]);
        setRecentUploads((prev) => [
          {
            id: `up-${Date.now()}`,
            name: file.name,
            rows: `${(rowCount / 1000).toFixed(0)}k rows`,
            uploadedAt: 'Just now',
            status: 'processed',
          },
          ...prev.slice(0, 2),
        ]);
      } else {
        setActiveProcessing((prev) =>
          prev.map((item) =>
            item.id === newActiveId
              ? {
                  ...item,
                  progress: p,
                  stage: p > 60 ? 'Validating schema...' : 'Parsing rows...',
                }
              : item
          )
        );
      }
    }, 600);
  };

  const handleCancelProcessing = (id: string) => {
    setActiveProcessing((prev) => prev.filter((item) => item.id !== id));
  };

  const handleOpenExport = (format: 'excel' | 'csv' | 'pdf' = 'excel') => {
    setExportFormat(format);
    setShowExportModal(true);
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-slate-800">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onToggleUser={handleToggleUser}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentUser={currentUser}
          onOpenHelp={() => setShowHelpModal(true)}
        />

        <main className="flex-1 pb-12">
          {activeTab === 'dashboard' && (
            <DashboardView
              metrics={DEFAULT_METRICS}
              recentUploads={recentUploads}
              setActiveTab={setActiveTab}
              onExport={() => handleOpenExport('excel')}
              onSelectFile={handleUploadFile}
            />
          )}

          {activeTab === 'upload' && (
            <FileUploadView
              history={processingHistory}
              activeProcessing={activeProcessing}
              onUploadFile={handleUploadFile}
              onOpenDetails={() => setShowErrorModal(true)}
              onCancelProcessing={handleCancelProcessing}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              carrierData={CARRIER_SUMMARY_DATA}
              highestDays={HIGHEST_VOLUME_DAYS}
              onExport={() => handleOpenExport('csv')}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              reports={reports}
              onExport={(format) => handleOpenExport(format)}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={(newSettings) => setSettings(newSettings)}
              currentUser={currentUser}
              onToggleUser={handleToggleUser}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <ValidationErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        defaultFormat={exportFormat}
      />

      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </div>
  );
}
