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
    <header className="bg-white border-b border-slate-200/90 shadow-xs sticky top-0 z-30">
      {/* Top Gradient accent line */}
      <div className="h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          
          {/* Left: Brand & App Title */}
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white shrink-0 shadow-sm shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  Teacher Administration Progress
                </h1>
                
                {/* Academic Year Badge */}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                  AY {academicYear}
                </span>

                {/* Firebase Cloud Sync Badge */}
                <div 
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-semibold border shadow-xs ${
                    syncStatus === 'synced'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : syncStatus === 'syncing'
                      ? 'bg-blue-50 text-blue-700 border-blue-300 animate-pulse'
                      : syncStatus === 'offline'
                      ? 'bg-slate-100 text-slate-600 border-slate-300'
                      : 'bg-rose-50 text-rose-700 border-rose-300'
                  }`}
                  title="Firebase Firestore Cloud Database"
                >
                  {syncStatus === 'synced' && (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <span>Firestore Live</span>
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
                      <span>Cloud Offline</span>
                    </>
                  )}
                  {syncStatus === 'error' && (
                    <>
                      <AlertCircle className="w-2.5 h-2.5 shrink-0 text-rose-500" />
                      <span>Sync Error</span>
                    </>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                School administration audit, subject assignments & indicator progress tracking
              </p>
            </div>
          </div>

          {/* Center & Right Controls Wrapper for responsiveness */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between xl:justify-end gap-3 pt-2 xl:pt-0 border-t xl:border-t-0 border-slate-100">
            
            {/* View Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 shadow-inner">
              <button
                id="view-mode-tracker-btn"
                type="button"
                onClick={() => onViewModeChange('tracker')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  viewMode === 'tracker'
                    ? 'bg-white text-indigo-900 shadow-sm font-bold border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 text-indigo-600" />
                <span>Workspace</span>
              </button>
              <button
                id="view-mode-matrix-btn"
                type="button"
                onClick={() => onViewModeChange('group_matrix')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  viewMode === 'group_matrix'
                    ? 'bg-white text-indigo-900 shadow-sm font-bold border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium'
                }`}
              >
                <TableProperties className="w-3.5 h-3.5 text-teal-600" />
                <span>Matrix Overview</span>
              </button>
            </div>

            {/* Action Tools */}
            <div className="flex items-center flex-wrap gap-2">
              <button
                id="btn-add-teacher-quick"
                type="button"
                onClick={onAddNewTeacher}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Teacher</span>
              </button>

              <button
                id="btn-manage-teachers"
                type="button"
                onClick={onOpenManageTeachers}
                title="Manage Teachers"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Teachers</span>
              </button>

              <button
                id="btn-manage-indicators"
                type="button"
                onClick={onOpenManageIndicators}
                title="Manage Indicators"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-purple-600" />
                <span className="hidden sm:inline">Indicators</span>
              </button>

              <button
                id="btn-report-preview"
                type="button"
                onClick={onOpenReport}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer shadow-xs"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>Report</span>
              </button>

              <button
                id="btn-export-csv"
                type="button"
                onClick={onExportCSV}
                title="Export to CSV"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden md:inline">CSV</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};

