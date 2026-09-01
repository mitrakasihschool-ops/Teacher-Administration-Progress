import React from 'react';
import { 
  GraduationCap, 
  LayoutGrid, 
  TableProperties, 
  Users, 
  Sliders, 
  Download, 
  FileText,
  Plus,
  Cloud,
  CloudCheck,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { ViewMode } from '../types';

interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenManageTeachers: () => void;
  onOpenManageIndicators: () => void;
  onOpenReport: () => void;
  onExportCSV: () => void;
  onAddNewTeacher: () => void;
  academicYear: string;
  onAcademicYearChange: (year: string) => void;
  syncStatus?: 'synced' | 'syncing' | 'offline' | 'error';
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onViewModeChange,
  onOpenManageTeachers,
  onOpenManageIndicators,
  onOpenReport,
  onExportCSV,
  onAddNewTeacher,
  academicYear,
  onAcademicYearChange,
  syncStatus = 'synced',
}) => {
  return (
    <header className="bg-white/95 backdrop-blur-xs border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-4">
          
          {/* Brand & App Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white shrink-0">
              <GraduationCap className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">
                  Teacher Administration Progress
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  AY {academicYear}
                </span>

                {/* Firebase Cloud Sync Badge */}
                <div 
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                    syncStatus === 'synced'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : syncStatus === 'syncing'
                      ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse'
                      : syncStatus === 'offline'
                      ? 'bg-slate-100 text-slate-600 border-slate-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                  title="Firebase Firestore Cloud Database"
                >
                  {syncStatus === 'synced' && (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <span>Firebase Live</span>
                    </>
                  )}
                  {syncStatus === 'syncing' && (
                    <>
                      <RefreshCw className="w-2.5 h-2.5 animate-spin shrink-0 text-blue-600" />
                      <span>Syncing...</span>
                    </>
                  )}
                  {syncStatus === 'offline' && (
                    <>
                      <Cloud className="w-2.5 h-2.5 shrink-0 text-slate-500" />
                      <span>Local Cache</span>
                    </>
                  )}
                  {syncStatus === 'error' && (
                    <>
                      <AlertCircle className="w-2.5 h-2.5 shrink-0 text-rose-500" />
                      <span>Sync Retry</span>
                    </>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500">
                School administration audit, subject assignments & indicator progress tracking
              </p>
            </div>
          </div>

          {/* Center: View Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/70 self-start md:self-auto">
            <button
              id="view-mode-tracker-btn"
              type="button"
              onClick={() => onViewModeChange('tracker')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
                viewMode === 'tracker'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Teacher Workspace</span>
            </button>
            <button
              id="view-mode-matrix-btn"
              type="button"
              onClick={() => onViewModeChange('group_matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
                viewMode === 'group_matrix'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium'
              }`}
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span>Group Overview Matrix</span>
            </button>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              id="btn-add-teacher-quick"
              type="button"
              onClick={onAddNewTeacher}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Teacher</span>
            </button>

            <button
              id="btn-manage-teachers"
              type="button"
              onClick={onOpenManageTeachers}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Teachers</span>
            </button>

            <button
              id="btn-manage-indicators"
              type="button"
              onClick={onOpenManageIndicators}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Indicators</span>
            </button>

            <div className="h-4 w-px bg-slate-200 mx-0.5" />

            <button
              id="btn-report-preview"
              type="button"
              onClick={onOpenReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>Audit Report</span>
            </button>

            <button
              id="btn-export-csv"
              type="button"
              onClick={onExportCSV}
              title="Export all records to CSV"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">CSV</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
