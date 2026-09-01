import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, BookOpen, Users } from 'lucide-react';
import { Teacher, IndicatorProgress } from '../types';
import { calculateSubjectProgress } from '../utils/storage';

interface StatsBannerProps {
  teachers: Teacher[];
  progressMap: Record<string, IndicatorProgress>;
  selectedGroup: string;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({
  teachers,
  progressMap,
  selectedGroup,
}) => {
  const filteredTeachers = selectedGroup === 'ALL' 
    ? teachers 
    : teachers.filter((t) => t.group === selectedGroup);

  let totalSubjects = 0;
  let totalScoreSum = 0;
  let fullyCompletedSubjects = 0;
  let itemsNeedingRevision = 0;
  let totalIndicatorChecks = 0;
  let completedIndicatorChecks = 0;

  for (const t of filteredTeachers) {
    for (const sub of t.subjects) {
      totalSubjects++;
      const stat = calculateSubjectProgress(t.id, sub, progressMap);
      totalScoreSum += stat.percentage;
      if (stat.percentage === 100) {
        fullyCompletedSubjects++;
      }
      itemsNeedingRevision += stat.revisionCount;
      completedIndicatorChecks += stat.completedCount;
      totalIndicatorChecks += stat.total;
    }
  }

  const overallAverage = totalSubjects > 0 ? Math.round(totalScoreSum / totalSubjects) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
      {/* 1. Teachers Count */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
          <Users className="w-4.5 h-4.5" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Teachers in Scope</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-slate-900">{filteredTeachers.length}</span>
            <span className="text-[11px] text-slate-400">({totalSubjects} subjects)</span>
          </div>
        </div>
      </div>

      {/* 2. Overall Progress */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4.5 h-4.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Overall Progress</p>
            <span className="text-xs font-bold text-emerald-700">{overallAverage}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${overallAverage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Indicators Completed */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
          <BookOpen className="w-4.5 h-4.5" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Completed Checks</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-slate-900">{completedIndicatorChecks}</span>
            <span className="text-[11px] text-slate-400">/ {totalIndicatorChecks}</span>
          </div>
        </div>
      </div>

      {/* 4. Complete Subjects */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
          <Clock className="w-4.5 h-4.5" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">100% Ready Subjects</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-teal-900">{fullyCompletedSubjects}</span>
            <span className="text-[11px] text-slate-400">of {totalSubjects}</span>
          </div>
        </div>
      </div>

      {/* 5. Revisions Needed */}
      <div className="col-span-2 lg:col-span-1 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
          itemsNeedingRevision > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400'
        }`}>
          <AlertTriangle className="w-4.5 h-4.5" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Revisions Requested</p>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-lg font-bold ${itemsNeedingRevision > 0 ? 'text-amber-900' : 'text-slate-700'}`}>
              {itemsNeedingRevision}
            </span>
            <span className="text-[11px] text-slate-400">items</span>
          </div>
        </div>
      </div>
    </div>
  );
};
