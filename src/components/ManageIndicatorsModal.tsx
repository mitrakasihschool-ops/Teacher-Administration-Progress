import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Sliders, 
  BookOpen, 
  ArrowUpDown, 
  Layers, 
  Check, 
  Info 
} from 'lucide-react';
import { Teacher, TeacherSubject, Indicator } from '../types';
import { getSubjectIndicators } from '../utils/storage';

interface ManageIndicatorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: Teacher[];
  selectedTeacherId?: string;
  selectedSubjectId?: string;
  onSaveSubjectIndicators: (teacherId: string, subjectId: string, indicators: Indicator[]) => void;
}

export const ManageIndicatorsModal: React.FC<ManageIndicatorsModalProps> = ({
  isOpen,
  onClose,
  teachers,
  selectedTeacherId,
  selectedSubjectId,
  onSaveSubjectIndicators,
}) => {
  // Current active teacher & subject selection inside the modal
  const [activeTeacherId, setActiveTeacherId] = useState<string>(selectedTeacherId || teachers[0]?.id || '');
  const [activeSubjectId, setActiveSubjectId] = useState<string>(selectedSubjectId || '');

  // Active teacher & subject
  const currentTeacher = teachers.find((t) => t.id === activeTeacherId) || teachers[0];
  const currentSubject = currentTeacher?.subjects.find((s) => s.id === activeSubjectId) || currentTeacher?.subjects[0];

  // Indicator edit form state
  const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [indicatorToDelete, setIndicatorToDelete] = useState<Indicator | null>(null);

  // Sync selection when opened or props change
  useEffect(() => {
    if (selectedTeacherId) {
      setActiveTeacherId(selectedTeacherId);
    }
  }, [selectedTeacherId]);

  useEffect(() => {
    if (selectedSubjectId) {
      setActiveSubjectId(selectedSubjectId);
    } else if (currentTeacher && currentTeacher.subjects.length > 0) {
      setActiveSubjectId(currentTeacher.subjects[0].id);
    }
  }, [selectedSubjectId, currentTeacher]);

  const subjectIndicators = currentSubject ? getSubjectIndicators(currentSubject) : [];

  const startEdit = (ind: Indicator) => {
    setEditingIndicator(ind);
    setIsCreatingNew(false);
    setCode(ind.code);
    setTitle(ind.title);
  };

  const startNew = () => {
    setEditingIndicator(null);
    setIsCreatingNew(true);
    const prefix = currentSubject ? currentSubject.code.split('-')[0] || 'IND' : 'ADM';
    const nextNum = subjectIndicators.length + 1;
    setCode(`${prefix}-${nextNum < 10 ? '0' + nextNum : nextNum}`);
    setTitle('');
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !currentTeacher || !currentSubject) return;

    const data: Indicator = {
      id: editingIndicator ? editingIndicator.id : `ind-${currentSubject.id}-${Date.now()}`,
      code: code.trim() || `IND-${subjectIndicators.length + 1}`,
      title: title.trim(),
      requiredFor: ['all'],
    };

    let updated: Indicator[] = [];
    if (editingIndicator) {
      updated = subjectIndicators.map((ind) => (ind.id === editingIndicator.id ? data : ind));
    } else {
      updated = [...subjectIndicators, data];
    }

    onSaveSubjectIndicators(currentTeacher.id, currentSubject.id, updated);
    setEditingIndicator(null);
    setIsCreatingNew(false);
  };

  const handleConfirmDelete = () => {
    if (!currentTeacher || !currentSubject || !indicatorToDelete) return;
    const updated = subjectIndicators.filter((ind) => ind.id !== indicatorToDelete.id);
    onSaveSubjectIndicators(currentTeacher.id, currentSubject.id, updated);
    setIndicatorToDelete(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* 1. Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Subject Indicators Table
              </h2>
              <p className="text-xs text-slate-500">
                Configure customized administrative indicators suited specifically for each subject & class
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Parent Subject Selector Bar */}
        <div className="p-4 bg-slate-100/70 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Teacher Parent Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Select Teacher (Parent)
            </label>
            <select
              value={activeTeacherId}
              onChange={(e) => {
                const tId = e.target.value;
                setActiveTeacherId(tId);
                const t = teachers.find((x) => x.id === tId);
                if (t && t.subjects.length > 0) {
                  setActiveSubjectId(t.subjects[0].id);
                }
              }}
              className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.group})
                </option>
              ))}
            </select>
          </div>

          {/* Subject Parent Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Select Subject (Parent Table)
            </label>
            <select
              value={activeSubjectId}
              onChange={(e) => setActiveSubjectId(e.target.value)}
              className="w-full text-xs font-bold bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              {currentTeacher?.subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({sub.code} • {sub.grade}) - {getSubjectIndicators(sub).length} indicators
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Active Subject Context Box */}
          {currentSubject && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                    {currentSubject.code}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900">{currentSubject.name}</h3>
                  <span className="text-xs text-slate-500 font-medium">
                    ({currentSubject.grade} • {currentSubject.department})
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Currently configuring <strong className="text-slate-800">{subjectIndicators.length} indicators</strong> for this subject.
                </p>
              </div>
            </div>
          )}

          {/* Form: Add or Edit Indicator */}
          {isCreatingNew || editingIndicator ? (
            <form onSubmit={handleSaveForm} className="space-y-4 p-4 border border-slate-200 rounded-lg bg-white shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-900">
                  {isCreatingNew ? `Add Indicator to ${currentSubject?.name}` : `Edit Indicator: ${editingIndicator?.code}`}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setEditingIndicator(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Indicator Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. MTH-01"
                    className="w-full text-xs font-mono font-bold px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Indicator Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={`e.g. Annual Lesson Program & Mastery Milestones for ${currentSubject?.name}`}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setEditingIndicator(null);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  {isCreatingNew ? 'Add to Subject' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            /* Indicators List Table for Current Subject */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Indicators for {currentSubject?.name} ({subjectIndicators.length})
                </h3>

                <button
                  type="button"
                  onClick={startNew}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Indicator</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                {subjectIndicators.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <p className="text-xs font-medium">No indicators configured for this subject yet.</p>
                    <button
                      type="button"
                      onClick={startNew}
                      className="mt-2 text-xs font-bold text-slate-800 underline cursor-pointer"
                    >
                      + Add the first indicator
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {subjectIndicators.map((ind, idx) => (
                      <div
                        key={ind.id}
                        className="p-3.5 hover:bg-slate-50/80 flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-slate-400 font-mono text-[11px] w-4 text-right shrink-0">
                            {idx + 1}.
                          </span>
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 shrink-0">
                            {ind.code}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{ind.title}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEdit(ind)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="Edit indicator"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setIndicatorToDelete(ind)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Delete indicator from this subject"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 4. Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Indicators are automatically saved to each respective subject.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>

      {/* In-app Delete Confirmation Modal */}
      {indicatorToDelete && (
        <div className="fixed inset-0 z-60 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  Remove Indicator
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Are you sure you want to remove <strong className="text-slate-900">{indicatorToDelete.code}</strong> from <strong className="text-slate-900">{currentSubject?.name}</strong>?
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
                onClick={handleConfirmDelete}
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
