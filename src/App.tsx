import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  AppNotification,
  AppSettings,
  BatchProgress,
  DailySmsRecord,
  FailedUpload,
  NavTab,
  UploadItem,
  UserProfile,
} from './types';
import { ADMIN_USER, CORPORATE_USER, DEFAULT_SETTINGS } from './data/mockData';
import { isNoiseFile, parseSmsFile, skipReason } from './utils/parseSmsFile';
import {
  availableYears,
  buildMetrics,
  buildMonthlyReports,
  buildTrend,
  buildYearlySpend,
  coverageStats,
  filterDays,
  highestVolumeDays,
  TimeRange,
} from './utils/aggregations';
import { formatDateTime } from './utils/format';
import {
  clearStoredData,
  loadDays,
  loadFailures,
  loadSettings,
  saveDays,
  saveFailures,
  saveSettings,
} from './utils/storage';
import { exportDailyExcel, exportMonthlyCsv, exportMonthlyExcel, exportSummaryText } from './utils/exportData';

function toHistory(days: DailySmsRecord[], failures: FailedUpload[]): UploadItem[] {
  const processed: UploadItem[] = days.map((day) => ({
    id: day.id,
    name: day.fileName,
    rows: day.smsCount.toLocaleString('en-US'),
    uploadedAt: formatDateTime(day.uploadedAt),
    status: 'processed',
    date: day.date,
  }));

  const errored: UploadItem[] = failures.map((item) => ({
    id: item.id,
    name: item.fileName,
    rows: '-',
    uploadedAt: formatDateTime(item.uploadedAt),
    status: 'skipped',
    errorDetails: item.errorDetails,
  }));

  return [...errored, ...processed].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<UserProfile>(ADMIN_USER);
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings(DEFAULT_SETTINGS));
  const [days, setDays] = useState<DailySmsRecord[]>(() => loadDays());
  const [failures, setFailures] = useState<FailedUpload[]>(() => loadFailures());
  const [timeRange, setTimeRange] = useState<TimeRange>('All Time');
  const [batch, setBatch] = useState<BatchProgress | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalFile, setErrorModalFile] = useState<UploadItem | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv' | 'pdf'>('excel');
  const [exportScope, setExportScope] = useState<'monthly' | 'daily'>('monthly');
  const [showHelpModal, setShowHelpModal] = useState(false);

  const cancelRef = useRef(false);
  const processingRef = useRef(false);

  useEffect(() => saveDays(days), [days]);
  useEffect(() => saveFailures(failures), [failures]);
  useEffect(() => saveSettings(settings), [settings]);

  const visibleDays = useMemo(() => filterDays(days, timeRange), [days, timeRange]);
  const metrics = useMemo(
    () => buildMetrics(visibleDays, settings.smsRate, settings.currency),
    [visibleDays, settings.smsRate, settings.currency]
  );
  const coverage = useMemo(() => coverageStats(visibleDays), [visibleDays]);
  const dashboardYearly = useMemo(
    () => buildYearlySpend(visibleDays, settings.smsRate),
    [visibleDays, settings.smsRate]
  );
  const dashboardTrend = useMemo(
    () => buildTrend(visibleDays, settings.smsRate, timeRange),
    [visibleDays, settings.smsRate, timeRange]
  );
  const reports = useMemo(
    () => buildMonthlyReports(days, settings.smsRate),
    [days, settings.smsRate]
  );
  const yearly = useMemo(
    () => buildYearlySpend(days, settings.smsRate),
    [days, settings.smsRate]
  );
  const peakDays = useMemo(
    () => highestVolumeDays(days, settings.smsRate),
    [days, settings.smsRate]
  );
  const trend = useMemo(
    () => buildTrend(days, settings.smsRate, 'All Time'),
    [days, settings.smsRate]
  );
  const years = useMemo(() => availableYears(days), [days]);
  const history = useMemo(() => toHistory(days, failures), [days, failures]);
  const recentUploads = useMemo(() => history.slice(0, 5), [history]);

  const pushNotification = (item: Omit<AppNotification, 'id' | 'time'>) => {
    if (!settings.notificationsEnabled) return;
    setNotifications((prev) => [
      {
        ...item,
        id: `n-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        time: 'Just now',
      },
      ...prev.slice(0, 19),
    ]);
  };

  const handleToggleUser = () => {
    setCurrentUser((prev) => (prev.type === 'admin' ? CORPORATE_USER : ADMIN_USER));
  };

  const handleUploadFiles = async (files: File[]) => {
    if (processingRef.current) return;

    const candidates = files.filter((file) => !isNoiseFile(file.name));
    if (!candidates.length) {
      pushNotification({
        title: 'No files to count',
        desc: 'That folder had no usable files. Choose the 2024, 2025, or 2026 folder — or the parent that contains all three.',
        type: 'info',
      });
      return;
    }

    processingRef.current = true;
    cancelRef.current = false;
    setActiveTab('upload');
    setBatch({
      total: candidates.length,
      completed: 0,
      currentFile: candidates[0].name,
      succeeded: 0,
      skipped: 0,
      replaced: 0,
    });

    const nextDays = new Map<string, DailySmsRecord>(days.map((day) => [day.date, day]));
    const nextFailures: FailedUpload[] = [...failures];
    let succeeded = 0;
    let skipped = 0;
    let replaced = 0;

    try {
      for (let i = 0; i < candidates.length; i++) {
        if (cancelRef.current) break;
        const file = candidates[i];
        const uploadedAt = new Date().toISOString();

        setBatch({
          total: candidates.length,
          completed: i,
          currentFile: file.name,
          succeeded,
          skipped,
          replaced,
        });

        try {
          const reason = skipReason(file);
          if (reason) {
            skipped += 1;
            if (!isNoiseFile(file.name)) {
              nextFailures.unshift({
                id: `skip-${Date.now()}-${i}`,
                fileName: file.webkitRelativePath || file.name,
                uploadedAt,
                errorDetails: reason,
              });
            }
            continue;
          }

          const parsed = await parseSmsFile(file, settings.skipHeaderRow);
          if (nextDays.has(parsed.date)) replaced += 1;
          nextDays.set(parsed.date, {
            id: `day-${parsed.date}`,
            date: parsed.date,
            fileName: parsed.fileName,
            smsCount: parsed.smsCount,
            uploadedAt,
          });
          succeeded += 1;
        } catch (error) {
          skipped += 1;
          nextFailures.unshift({
            id: `skip-${Date.now()}-${i}`,
            fileName: file.webkitRelativePath || file.name,
            uploadedAt,
            errorDetails: error instanceof Error ? error.message : 'Invalid file format — skipped',
          });
        }

        if (i % 3 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }

      const sortedDays = [...nextDays.values()].sort((a, b) => b.date.localeCompare(a.date));
      setDays(sortedDays);
      setFailures(nextFailures.slice(0, 300));

      if (cancelRef.current) {
        pushNotification({
          title: 'Upload cancelled',
          desc: `Saved ${succeeded} day file${succeeded === 1 ? '' : 's'} before cancel.`,
          type: 'info',
        });
        return;
      }

      pushNotification({
        title: `Counted ${succeeded} daily file${succeeded === 1 ? '' : 's'}`,
        desc:
          skipped > 0
            ? `Skipped ${skipped} invalid or non-Excel file${skipped === 1 ? '' : 's'}. The rest of the folder finished.`
            : `Spend updated at ${settings.currency} ${settings.smsRate.toFixed(2)} per SMS.`,
        type: succeeded > 0 ? 'success' : 'info',
      });
    } catch {
      setDays([...nextDays.values()].sort((a, b) => b.date.localeCompare(a.date)));
      setFailures(nextFailures.slice(0, 300));
      pushNotification({
        title: 'Folder upload finished with skips',
        desc: `Saved ${succeeded} valid day file${succeeded === 1 ? '' : 's'}. Invalid files were skipped and did not stop the batch.`,
        type: 'info',
      });
    } finally {
      setBatch(null);
      processingRef.current = false;
    }
  };

  const handleCancelProcessing = () => {
    cancelRef.current = true;
  };

  const handleDeleteDay = (id: string) => {
    setDays((prev) => prev.filter((day) => day.id !== id));
    setFailures((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    setDays([]);
    setFailures([]);
    clearStoredData();
    pushNotification({
      title: 'All daily files cleared',
      desc: 'Totals are back at zero. Upload Excel files to rebuild spend.',
      type: 'info',
    });
  };

  const handleOpenExport = (format: 'excel' | 'csv' | 'pdf' = 'excel', scope: 'monthly' | 'daily' = 'monthly') => {
    setExportFormat(format);
    setExportScope(scope);
    setShowExportModal(true);
  };

  const handleExport = (format: 'excel' | 'csv' | 'pdf') => {
    const allReports = buildMonthlyReports(days, settings.smsRate);
    if (format === 'csv') {
      exportMonthlyCsv(allReports, settings.currency);
      return;
    }
    if (format === 'pdf') {
      exportSummaryText(allReports, settings.currency);
      return;
    }
    if (exportScope === 'daily') {
      exportDailyExcel(days, settings.smsRate, settings.currency);
      return;
    }
    exportMonthlyExcel(allReports, settings.currency);
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-slate-800">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onToggleUser={handleToggleUser}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentUser={currentUser}
          onOpenHelp={() => setShowHelpModal(true)}
          notifications={notifications}
        />

        <main className="flex-1 pb-12">
          {activeTab === 'dashboard' && (
            <DashboardView
              metrics={metrics}
              recentUploads={recentUploads}
              coverage={coverage}
              trend={dashboardTrend}
              yearly={dashboardYearly}
              timeRange={timeRange}
              setTimeRange={setTimeRange}
              currency={settings.currency}
              hasData={days.length > 0}
              setActiveTab={setActiveTab}
              onExport={() => handleOpenExport('excel', 'monthly')}
              onSelectFiles={handleUploadFiles}
            />
          )}

          {activeTab === 'upload' && (
            <FileUploadView
              history={history}
              searchQuery={searchQuery}
              batch={batch}
              onUploadFiles={handleUploadFiles}
              onOpenDetails={(item) => {
                setErrorModalFile(item);
                setShowErrorModal(true);
              }}
              onCancelProcessing={handleCancelProcessing}
              onDeleteItem={handleDeleteDay}
              onClearAll={handleClearAll}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              yearly={yearly}
              highestDays={peakDays}
              trend={trend}
              years={years}
              currency={settings.currency}
              rate={settings.smsRate}
              hasData={days.length > 0}
              onExport={() => handleOpenExport('csv', 'monthly')}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              reports={reports}
              searchQuery={searchQuery}
              currency={settings.currency}
              hasData={days.length > 0}
              onExport={(format) => handleOpenExport(format, 'monthly')}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={(next) => setSettings(next)}
              currentUser={currentUser}
              onToggleUser={handleToggleUser}
              dayCount={days.length}
              totalSms={days.reduce((sum, day) => sum + day.smsCount, 0)}
            />
          )}
        </main>
      </div>

      <ValidationErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        fileName={errorModalFile?.name}
        errorDetails={errorModalFile?.errorDetails}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        defaultFormat={exportFormat}
        hasData={days.length > 0}
        onDownload={handleExport}
      />

      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        currency={settings.currency}
        rate={settings.smsRate}
      />
    </div>
  );
}
