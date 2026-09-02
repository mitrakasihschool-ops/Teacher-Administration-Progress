import React from 'react';
import { BookOpen, CheckCircle2, AlertCircle, Layers } from 'lucide-react';
import { Teacher, IndicatorProgress } from '../types';
import { calculateSubjectProgress, getSubjectIndicators } from '../utils/storage';

interface SubjectSelectorProps {
  teacher: Teacher;
  selectedSubjectId: string | null;
  onSelectSubject: (subjectId: string) => void;
  progressMap: Record<string, IndicatorProgress>;
}

export const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  teacher,
  selectedSubjectId,
  onSelectSubject,
  progressMap,
}) => {
  // Vibrant color palettes for subject cards
  const cardThemeStyles = [
    {
      selected: 'bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-indigo-700 shadow-md',
      unselected: 'bg-indigo-50/60 hover:bg-indigo-100/80 text-indigo-950 border-indigo-200/80 hover:border-indigo-300',
      iconBg: 'bg-indigo-100 text-indigo-700',
      selectedIconBg: 'bg-indigo-500/30 text-white',
      badge: 'bg-indigo-100 text-indigo-700',
      selectedBadge: 'bg-indigo-700/60 text-indigo-100',
      barBg: 'bg-indigo-200',
      selectedBarBg: 'bg-indigo-900/50',
      fill: 'bg-indigo-600',
      selectedFill: 'bg-white',
    },
    {
      selected: 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-teal-600 shadow-md',
      unselected: 'bg-emerald-50/60 hover:bg-emerald-100/80 text-emerald-950 border-emerald-200/80 hover:border-emerald-300',
      iconBg: 'bg-emerald-100 text-emerald-700',
      selectedIconBg: 'bg-emerald-500/30 text-white',
      badge: 'bg-emerald-100 text-emerald-700',
      selectedBadge: 'bg-teal-800/60 text-emerald-100',
      barBg: 'bg-emerald-200',
      selectedBarBg: 'bg-teal-900/50',
      fill: 'bg-emerald-600',
      selectedFill: 'bg-white',
    },
    {
      selected: 'bg-gradient-to-br from-violet-600 to-purple-700 text-white border-purple-600 shadow-md',
      unselected: 'bg-purple-50/60 hover:bg-purple-100/80 text-purple-950 border-purple-200/80 hover:border-purple-300',
      iconBg: 'bg-purple-100 text-purple-700',
      selectedIconBg: 'bg-purple-500/30 text-white',
      badge: 'bg-purple-100 text-purple-700',
      selectedBadge: 'bg-purple-800/60 text-purple-100',
      barBg: 'bg-purple-200',
      selectedBarBg: 'bg-purple-900/50',
      fill: 'bg-purple-600',
      selectedFill: 'bg-white',
    },
    {
      selected: 'bg-gradient-to-br from-amber-600 to-orange-700 text-white border-orange-600 shadow-md',
      unselected: 'bg-amber-50/60 hover:bg-amber-100/80 text-amber-950 border-amber-200/80 hover:border-amber-300',
      iconBg: 'bg-amber-100 text-amber-700',
      selectedIconBg: 'bg-amber-500/30 text-white',
      badge: 'bg-amber-100 text-amber-700',
      selectedBadge: 'bg-orange-800/60 text-amber-100',
      barBg: 'bg-amber-200',
      selectedBarBg: 'bg-orange-900/50',
      fill: 'bg-amber-600',
      selectedFill: 'bg-white',
    },
    {
      selected: 'bg-gradient-to-br from-sky-600 to-blue-700 text-white border-blue-600 shadow-md',
      unselected: 'bg-sky-50/60 hover:bg-sky-100/80 text-sky-950 border-sky-200/80 hover:border-sky-300',
      iconBg: 'bg-sky-100 text-sky-700',
      selectedIconBg: 'bg-sky-500/30 text-white',
      badge: 'bg-sky-100 text-sky-700',
      selectedBadge: 'bg-blue-800/60 text-sky-100',
      barBg: 'bg-sky-200',
      selectedBarBg: 'bg-blue-900/50',
      fill: 'bg-sky-600',
      selectedFill: 'bg-white',
    },
  ];

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-xl border border-indigo-900/50 p-5 shadow-sm text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-indigo-800/40 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300">
              Assigned Subjects for:
            </span>
            <span className="text-xs font-bold text-white bg-indigo-900/80 px-2.5 py-1 rounded-md border border-indigo-700/50 shadow-xs">
              {teacher.name}
            </span>
          </div>
          <p className="text-xs text-indigo-200/70 mt-1">
            Choose a subject card below to inspect and record its administrative indicators & progress
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs bg-indigo-900/60 px-3 py-1 rounded-lg border border-indigo-700/40 text-indigo-200 self-start sm:self-auto">
          <BookOpen className="w-3.5 h-3.5 text-indigo-300" />
          <span>{teacher.subjects.length} Subjects Total</span>
        </div>
      </div>

      {/* Subject Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {teacher.subjects.map((subject, index) => {
          const isSelected = subject.id === selectedSubjectId;
          const subjectIndicators = getSubjectIndicators(subject);
          const stats = calculateSubjectProgress(teacher.id, subject, progressMap);
          const theme = cardThemeStyles[index % cardThemeStyles.length];

          return (
            <button
              key={subject.id}
              id={`subject-tab-${subject.id}`}
              type="button"
              onClick={() => onSelectSubject(subject.id)}
              className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                isSelected
                  ? `${theme.selected} ring-2 ring-white/30 scale-[1.01]`
                  : `${theme.unselected}`
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded-lg ${isSelected ? theme.selectedIconBg : theme.iconBg}`}>
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <h3 className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {subject.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className={`text-[11px] font-medium ${isSelected ? 'text-indigo-100' : 'text-slate-600'}`}>
                      {subject.grade}
                    </span>
                    <span className={`text-[10px] ${isSelected ? 'text-indigo-300' : 'text-slate-400'}`}>•</span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                        isSelected
                          ? theme.selectedBadge
                          : theme.badge
                      }`}
                    >
                      {subjectIndicators.length} indicators
                    </span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span
                    className={`inline-block text-xs font-bold ${
                      stats.percentage === 100
                        ? isSelected
                          ? 'text-emerald-300'
                          : 'text-emerald-700 font-extrabold'
                        : isSelected
                        ? 'text-white'
                        : 'text-slate-900 font-semibold'
                    }`}
                  >
                    {stats.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress mini indicator */}
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className={`w-full h-2 rounded-full overflow-hidden ${isSelected ? theme.selectedBarBg : theme.barBg}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      stats.percentage === 100
                        ? 'bg-emerald-400'
                        : isSelected
                        ? theme.selectedFill
                        : theme.fill
                    }`}
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
                {stats.percentage === 100 ? (
                  <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-300' : 'text-emerald-600'}`} />
                ) : stats.revisionCount > 0 ? (
                  <AlertCircle className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-300' : 'text-amber-600'}`} />
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
