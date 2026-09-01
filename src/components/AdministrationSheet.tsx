import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Circle, 
  CheckCheck, 
  RotateCcw, 
  Save, 
  FileText,
  Search,
  Plus,
  Trash2,
  Edit2,
  SlidersHorizontal,
  X,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { Teacher, TeacherSubject, Indicator, IndicatorProgress, ProgressStatus } from '../types';
import { getProgressKey, calculateSubjectProgress, getSubjectIndicators } from '../utils/storage';

interface AdministrationSheetProps {
  teacher: Teacher;
  subject: TeacherSubject;
  progressMap: Record<string, IndicatorProgress>;
  onUpdateProgress: (
    teacherId: string,
    subjectId: string,
    indicatorId: string,
    updates: Partial<IndicatorProgress>
  ) => void;
  onBulkUpdateStatus: (
    teacherId: string,
    subjectId: string,
    status: ProgressStatus,
    percentage: number,
    note?: string
  ) => void;
  onUpdateSubjectIndicators: (teacherId: string, subjectId: string, indicators: Indicator[]) => void;
  onOpenManageIndicators: () => void;
}

const STATUS_CONFIG: Record<
  ProgressStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  not_started: {
    label: 'Not Started',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
    icon: <Circle className="w-3 h-3 text-slate-400" />,
  },
  in_progress: {
    label: 'In Progress',
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    border: 'border-slate-300',
    icon: <Clock className="w-3 h-3 text-slate-600" />,
  },
  needs_revision: {
    label: 'Needs Revision',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    icon: <AlertTriangle className="w-3 h-3 text-amber-600" />,
  },
  completed: {
    label: 'Completed',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: <CheckCircle2 className="w-3 h-3 text-emerald-600" />,
  },
  verified: {
    label: 'Verified & Signed',
    bg: 'bg-slate-900',
    text: 'text-white',
    border: 'border-slate-900',
    icon: <CheckCheck className="w-3 h-3 text-emerald-400" />,
  },
};

export const AdministrationSheet: React.FC<AdministrationSheetProps> = ({
  teacher,
  subject,
  progressMap,
  onUpdateProgress,
  onBulkUpdateStatus,
  onUpdateSubjectIndicators,
  onOpenManageIndicators,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lastSavedIndicatorId, setLastSavedIndicatorId] = useState<string | null>(null);

  // In-app Notification Banner
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'reset' } | null>(null);

  // In-app Confirmation Modals
  const [bulkConfirmModal, setBulkConfirmModal] = useState<'complete' | 'reset' | null>(null);
  const [customCompleteNote, setCustomCompleteNote] = useState('Verified complete during department audit.');
  const [indicatorToDelete, setIndicatorToDelete] = useState<Indicator | null>(null);

  // Quick Add Indicator inline state
  const [isAddingInline, setIsAddingInline] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');

  // Editing inline state
  const [editingIndicatorId, setEditingIndicatorId] = useState<string | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editTitle, setEditTitle] = useState('');

  const indicators = getSubjectIndicators(subject);
  const stats = calculateSubjectProgress(teacher.id, subject, progressMap);

  const showToast = (message: string, type: 'success' | 'info' | 'reset' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  // Filter indicators
  const filteredIndicators = indicators.filter((ind) => {
    const key = getProgressKey(teacher.id, subject.id, ind.id);
    const rec = progressMap[key];
    const status = rec ? rec.status : 'not_started';

    const matchesFilter =
      filterStatus === 'ALL' ||
      (filterStatus === 'completed' && (status === 'completed' || status === 'verified')) ||
      (filterStatus === 'in_progress' && status === 'in_progress') ||
      (filterStatus === 'needs_revision' && status === 'needs_revision') ||
      (filterStatus === 'not_started' && status === 'not_started');

    const matchesSearch =
      ind.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ind.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rec?.progressText || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleFieldChange = (
    indicatorId: string,
    field: keyof IndicatorProgress,
    value: any
  ) => {
    const updates: Partial<IndicatorProgress> = {
      [field]: value,
    };

    if (field === 'status') {
      if (value === 'completed' || value === 'verified') {
        updates.percentage = 100;
      } else if (value === 'not_started') {
        updates.percentage = 0;
      }
    } else if (field === 'percentage') {
      const pct = Number(value);
      if (pct === 100) {
        updates.status = 'completed';
      } else if (pct === 0) {
        updates.status = 'not_started';
      } else if (pct > 0) {
        updates.status = 'in_progress';
      }
    }

    onUpdateProgress(teacher.id, subject.id, indicatorId, updates);
    setLastSavedIndicatorId(indicatorId);
    setTimeout(() => {
      setLastSavedIndicatorId((curr) => (curr === indicatorId ? null : curr));
    }, 2000);
  };

  // Execute Mark All Complete
  const handleConfirmMarkAllComplete = () => {
    onBulkUpdateStatus(
      teacher.id,
      subject.id,
      'completed',
      100,
      customCompleteNote.trim() || 'Verified complete during department audit.'
    );
    setBulkConfirmModal(null);
    setFilterStatus('ALL');
    showToast(`✓ All ${indicators.length} indicators for ${subject.name} marked as Completed (100%).`, 'success');
  };

  // Execute Reset
  const handleConfirmReset = () => {
    onBulkUpdateStatus(teacher.id, subject.id, 'not_started', 0, '');
    setBulkConfirmModal(null);
    setFilterStatus('ALL');
    showToast(`↺ All progress for ${subject.name} has been reset to 0%.`, 'reset');
  };

  // Add indicator directly to this subject
  const handleAddInlineIndicator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const prefix = subject.code.split('-')[0] || 'ADM';
    const code = newCode.trim() || `${prefix}-0${indicators.length + 1}`;

    const newInd: Indicator = {
      id: `ind-${subject.id}-${Date.now()}`,
      code,
      title: newTitle.trim(),
    };

    const updated = [...indicators, newInd];
    onUpdateSubjectIndicators(teacher.id, subject.id, updated);
    setNewCode('');
    setNewTitle('');
    setIsAddingInline(false);
    showToast(`Added new indicator "${code}" to ${subject.name}`, 'info');
  };

  // Save inline edit
  const handleSaveInlineEdit = (indicatorId: string) => {
    if (!editTitle.trim()) return;
    const updated = indicators.map((ind) => {
      if (ind.id === indicatorId) {
        return {
          ...ind,
          code: editCode.trim() || ind.code,
          title: editTitle.trim(),
        };
      }
      return ind;
    });
    onUpdateSubjectIndicators(teacher.id, subject.id, updated);
    setEditingIndicatorId(null);
    showToast(`Saved indicator edits`, 'info');
  };

  // Confirm delete indicator
  const handleConfirmDeleteIndicator = () => {
    if (!indicatorToDelete) return;
    const updated = indicators.filter((ind) => ind.id !== indicatorToDelete.id);
    onUpdateSubjectIndicators(teacher.id, subject.id, updated);
    showToast(`Removed indicator ${indicatorToDelete.code}`, 'info');
    setIndicatorToDelete(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* 1. Subject Header Banner (Parent Identity) */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white shadow-2xs">
                {subject.code}
              </span>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {subject.name}
              </h2>
              <span className="text-xs text-slate-500 font-medium px-2 py-0.5 rounded bg-slate-200/70">
                {subject.grade}
              </span>
              <span className="text-xs text-slate-500 font-medium px-2 py-0.5 rounded bg-slate-200/70">
                {subject.department}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-add-subject-indicator"
              type="button"
              onClick={() => {
                const prefix = subject.code.split('-')[0] || 'ADM';
                setNewCode(`${prefix}-0${indicators.length + 1}`);
                setIsAddingInline(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Indicator</span>
            </button>

            <button
              id="btn-open-manage-indicators"
              type="button"
              onClick={onOpenManageIndicators}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              title="Open full subject indicators manager"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Manage All</span>
            </button>
          </div>
        </div>

        {/* Inline Add Indicator Form */}
        {isAddingInline && (
          <form
            onSubmit={handleAddInlineIndicator}
            className="mt-4 p-3 bg-white rounded-lg border border-slate-300 shadow-xs flex flex-col sm:flex-row items-center gap-2.5 animate-in fade-in duration-150"
          >
            <div className="w-full sm:w-28 shrink-0">
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="Code (e.g. MTH-06)"
                className="w-full text-xs font-mono font-bold px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
            <div className="w-full flex-1">
              <input
                type="text"
                required
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={`Type indicator title for ${subject.name}...`}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
              >
                Save to Subject
              </button>
              <button
                type="button"
                onClick={() => setIsAddingInline(false)}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Progress Metric & Bulk Triggers */}
        <div className="mt-4 pt-3.5 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-medium text-slate-500">Subject Completion:</span>
              <span className="text-sm font-bold font-mono text-slate-900">
                {stats.percentage}%
              </span>
            </div>

            <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {stats.completedCount} Complete
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-700 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" /> {stats.inProgressCount} In Progress
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-amber-700 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {stats.revisionCount} Revision
              </span>
            </div>
          </div>

          {/* Bulk Action Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              id="btn-mark-all-complete"
              type="button"
              onClick={() => {
                setCustomCompleteNote(`Verified complete for ${subject.name}. All documentation archived in subject portfolio.`);
                setBulkConfirmModal('complete');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 shadow-2xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mark All Completed</span>
            </button>

            <button
              id="btn-reset-subject-progress"
              type="button"
              onClick={() => setBulkConfirmModal('reset')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
              title="Reset progress to 0%"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification Toast / Banner */}
      {notification && (
        <div
          className={`px-4 py-2.5 text-xs font-medium flex items-center justify-between border-b animate-in fade-in duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : notification.type === 'reset'
              ? 'bg-slate-100 text-slate-800 border-slate-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            {notification.type === 'reset' && <RotateCcw className="w-4 h-4 text-slate-600 shrink-0" />}
            {notification.type === 'info' && <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Filter & Search Toolbar */}
      <div className="p-3 border-b border-slate-200 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Filter Chips */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilterStatus('ALL')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              filterStatus === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            All ({indicators.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('in_progress')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              filterStatus === 'in_progress'
                ? 'bg-slate-800 text-white font-semibold'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            In Progress ({stats.inProgressCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('needs_revision')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              filterStatus === 'needs_revision'
                ? 'bg-amber-600 text-white font-semibold'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            Revision ({stats.revisionCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('completed')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              filterStatus === 'completed'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            Completed ({stats.completedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('not_started')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              filterStatus === 'not_started'
                ? 'bg-slate-600 text-white font-semibold'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            Not Started ({stats.notStartedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search indicator or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>
      </div>

      {/* 3. The Core Administration Progress Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4 w-72">Indicator ({subject.name})</th>
              <th className="py-3 px-3 w-40">Status</th>
              <th className="py-3 px-3 w-36">Completion %</th>
              <th className="py-3 px-4 min-w-[300px]">
                Live Progress Notes & Verification
              </th>
              <th className="py-3 px-3 w-44">Evidence Reference</th>
              <th className="py-3 px-2 w-16 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredIndicators.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  <p className="text-xs font-medium">No indicators match your filter for this subject.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterStatus('ALL');
                      setSearchQuery('');
                    }}
                    className="mt-2 text-xs text-slate-800 underline font-semibold cursor-pointer"
                  >
                    Clear Filter
                  </button>
                </td>
              </tr>
            ) : (
              filteredIndicators.map((indicator) => {
                const key = getProgressKey(teacher.id, subject.id, indicator.id);
                const record = progressMap[key] || {
                  teacherId: teacher.id,
                  subjectId: subject.id,
                  indicatorId: indicator.id,
                  status: 'not_started' as ProgressStatus,
                  progressText: '',
                  percentage: 0,
                  lastUpdated: '',
                };

                const statusConfig = STATUS_CONFIG[record.status] || STATUS_CONFIG.not_started;
                const isJustSaved = lastSavedIndicatorId === indicator.id;
                const isEditingThis = editingIndicatorId === indicator.id;

                return (
                  <tr
                    key={indicator.id}
                    id={`row-indicator-${indicator.id}`}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      record.status === 'completed' || record.status === 'verified'
                        ? 'bg-emerald-50/10'
                        : record.status === 'needs_revision'
                        ? 'bg-amber-50/15'
                        : ''
                    }`}
                  >
                    {/* 1. Indicator Code & Title */}
                    <td className="py-3.5 px-4 align-top">
                      {isEditingThis ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editCode}
                            onChange={(e) => setEditCode(e.target.value)}
                            className="w-full text-xs font-mono font-bold px-2 py-1 border border-slate-300 rounded"
                          />
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full text-xs px-2 py-1 border border-slate-300 rounded"
                          />
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSaveInlineEdit(indicator.id)}
                              className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold rounded cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingIndicatorId(null)}
                              className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] rounded cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-start gap-2">
                            <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                              {indicator.code}
                            </span>
                            <h4 className="font-bold text-slate-900 text-xs leading-snug">
                              {indicator.title}
                            </h4>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* 2. Status Dropdown */}
                    <td className="py-3.5 px-3 align-top">
                      <div className="space-y-1.5">
                        <select
                          id={`select-status-${indicator.id}`}
                          value={record.status}
                          onChange={(e) =>
                            handleFieldChange(indicator.id, 'status', e.target.value as ProgressStatus)
                          }
                          className={`w-full text-xs font-medium rounded-md px-2 py-1.5 border focus:outline-none focus:ring-1 focus:ring-slate-400 ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} cursor-pointer`}
                        >
                          <option value="not_started">⚪ Not Started</option>
                          <option value="in_progress">🔵 In Progress</option>
                          <option value="needs_revision">🟠 Needs Revision</option>
                          <option value="completed">🟢 Completed</option>
                          <option value="verified">🟣 Verified & Signed</option>
                        </select>

                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          {statusConfig.icon}
                          <span>{statusConfig.label}</span>
                        </div>
                      </div>
                    </td>

                    {/* 3. Completion % Slider & Preset Buttons */}
                    <td className="py-3.5 px-3 align-top">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[11px] font-medium text-slate-500">Progress</span>
                          <span
                            className={`font-bold font-mono text-xs ${
                              record.percentage === 100
                                ? 'text-emerald-600'
                                : record.percentage > 0
                                ? 'text-slate-900'
                                : 'text-slate-400'
                            }`}
                          >
                            {record.percentage || 0}%
                          </span>
                        </div>

                        {/* Range slider */}
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={record.percentage || 0}
                          onChange={(e) =>
                            handleFieldChange(indicator.id, 'percentage', parseInt(e.target.value, 10))
                          }
                          className="w-full accent-slate-800 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                        />

                        {/* Quick Presets */}
                        <div className="grid grid-cols-4 gap-1 pt-0.5">
                          {[0, 50, 75, 100].map((pct) => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => handleFieldChange(indicator.id, 'percentage', pct)}
                              className={`text-[10px] font-medium py-0.5 rounded border transition-colors cursor-pointer ${
                                record.percentage === pct
                                  ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                                  : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {pct}%
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>

                    {/* 4. Typed Progress Column */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="space-y-1">
                        <div className="relative">
                          <textarea
                            id={`input-progress-${indicator.id}`}
                            rows={2}
                            value={record.progressText || ''}
                            onChange={(e) =>
                              handleFieldChange(indicator.id, 'progressText', e.target.value)
                            }
                            placeholder={`Type progress notes for ${teacher.name} (${subject.name})...`}
                            className="w-full text-xs font-normal p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-all resize-y min-h-[64px]"
                          />
                        </div>

                        {/* Status save note / timestamp */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <div className="flex items-center gap-1">
                            {isJustSaved ? (
                              <span className="text-emerald-600 font-medium flex items-center gap-0.5">
                                <Save className="w-2.5 h-2.5" /> Saved
                              </span>
                            ) : record.lastUpdated ? (
                              <span>
                                Updated: {new Date(record.lastUpdated).toLocaleDateString()} {new Date(record.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            ) : (
                              <span>No notes recorded yet</span>
                            )}
                          </div>

                          {/* Quick template triggers */}
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                handleFieldChange(
                                  indicator.id,
                                  'progressText',
                                  `Verified complete for ${subject.name}. All documentation archived in subject portfolio.`
                                )
                              }
                              className="text-[10px] text-slate-600 hover:text-slate-900 underline cursor-pointer"
                            >
                              + &quot;Verified complete&quot;
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              type="button"
                              onClick={() =>
                                handleFieldChange(
                                  indicator.id,
                                  'progressText',
                                  `In progress for ${subject.name}: Unit materials drafted, awaiting review.`
                                )
                              }
                              className="text-[10px] text-slate-600 hover:text-slate-900 underline cursor-pointer"
                            >
                              + &quot;In progress&quot;
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 5. Document / Evidence Ref Column */}
                    <td className="py-3.5 px-3 align-top">
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={record.documentRef || ''}
                          onChange={(e) =>
                            handleFieldChange(indicator.id, 'documentRef', e.target.value)
                          }
                          placeholder={`Ref / Drive link...`}
                          className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                        />
                        {record.documentRef && (
                          <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                            <FileText className="w-2.5 h-2.5" />
                            Ref: {record.documentRef}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* 6. Actions (Edit / Delete Indicator from this subject) */}
                    <td className="py-3.5 px-2 align-top text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingIndicatorId(indicator.id);
                            setEditCode(indicator.code);
                            setEditTitle(indicator.title);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          title="Edit indicator title/code for this subject"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setIndicatorToDelete(indicator)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Remove indicator from this subject"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal: Mark All Completed */}
      {bulkConfirmModal === 'complete' && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  Mark All Indicators Complete
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Are you sure you want to mark all <strong className="text-slate-900 font-bold">{indicators.length} indicators</strong> for <strong className="text-slate-900 font-bold">{subject.name}</strong> as <strong>Completed (100%)</strong>?
                </p>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="block text-[11px] font-semibold text-slate-700">
                Audit Note / Verification Text:
              </label>
              <textarea
                rows={2}
                value={customCompleteNote}
                onChange={(e) => setCustomCompleteNote(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setBulkConfirmModal(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmMarkAllComplete}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark All 100%</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Reset Subject Progress */}
      {bulkConfirmModal === 'reset' && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  Reset Subject Progress
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  This will reset all <strong className="text-slate-900 font-bold">{indicators.length} indicators</strong> for <strong className="text-slate-900 font-bold">{subject.name}</strong> back to <span className="font-semibold text-slate-800">Not Started (0%)</span> and clear notes.
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-800">
              This action will reset the completion percentage for this subject back to 0%.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setBulkConfirmModal(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Progress</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Single Indicator */}
      {indicatorToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  Remove Indicator
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Are you sure you want to remove <strong className="text-slate-900">{indicatorToDelete.code}: {indicatorToDelete.title}</strong> from <strong className="text-slate-900">{subject.name}</strong>?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIndicatorToDelete(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteIndicator}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
