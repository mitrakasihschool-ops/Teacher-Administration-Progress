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
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Assigned Subjects for:
            </span>
            <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              {teacher.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a subject to view and record its custom administrative indicators & progress
          </p>
        </div>
      </div>

      {/* Subject Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {teacher.subjects.map((subject) => {
          const isSelected = subject.id === selectedSubjectId;
          const subjectIndicators = getSubjectIndicators(subject);
          const stats = calculateSubjectProgress(teacher.id, subject, progressMap);

          return (
            <button
              key={subject.id}
              id={`subject-tab-${subject.id}`}
              type="button"
              onClick={() => onSelectSubject(subject.id)}
              className={`p-3 rounded-lg border text-left transition-all relative overflow-hidden cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`} />
                    <h3 className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {subject.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[11px] ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                      {subject.grade}
                    </span>
                    <span className={`text-[10px] ${isSelected ? 'text-slate-500' : 'text-slate-300'}`}>•</span>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                        isSelected
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-slate-100 text-slate-600'
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
                          ? 'text-emerald-400'
                          : 'text-emerald-600'
                        : isSelected
                        ? 'text-slate-200'
                        : 'text-slate-700'
                    }`}
                  >
                    {stats.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress mini indicator */}
              <div className="mt-2.5 flex items-center justify-between gap-2">
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${isSelected ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      stats.percentage === 100
                        ? 'bg-emerald-400'
                        : isSelected
                        ? 'bg-white'
                        : 'bg-slate-700'
                    }`}
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
                {stats.percentage === 100 ? (
                  <CheckCircle2 className={`w-3 h-3 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-emerald-600'}`} />
                ) : stats.revisionCount > 0 ? (
                  <AlertCircle className={`w-3 h-3 shrink-0 ${isSelected ? 'text-amber-400' : 'text-amber-500'}`} />
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
