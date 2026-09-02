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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {/* 1. Teachers Count (Indigo Theme) */}
      <div className="bg-gradient-to-br from-indigo-50/80 to-blue-50/50 p-4 rounded-xl border border-indigo-200/80 shadow-xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
          <Users className="w-5.5 h-5.5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-indigo-900/70 uppercase tracking-wide">Teachers in Scope</p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-extrabold text-indigo-950">{filteredTeachers.length}</span>
            <span className="text-xs font-medium text-indigo-700/80">({totalSubjects} subjects)</span>
          </div>
        </div>
      </div>

      {/* 2. Overall Progress (Emerald Theme) */}
      <div className="bg-gradient-to-br from-emerald-50/85 to-teal-50/50 p-4 rounded-xl border border-emerald-200/80 shadow-xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
          <CheckCircle2 className="w-5.5 h-5.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-emerald-900/70 uppercase tracking-wide">Overall Progress</p>
            <span className="text-sm font-extrabold text-emerald-800">{overallAverage}%</span>
          </div>
          <div className="w-full bg-emerald-200/60 rounded-full h-2.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${overallAverage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Indicators Completed (Purple / Violet Theme) */}
      <div className="bg-gradient-to-br from-purple-50/80 to-fuchsia-50/50 p-4 rounded-xl border border-purple-200/80 shadow-xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
          <BookOpen className="w-5.5 h-5.5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-purple-900/70 uppercase tracking-wide">Completed Checks</p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-extrabold text-purple-950">{completedIndicatorChecks}</span>
            <span className="text-xs font-medium text-purple-700/80">/ {totalIndicatorChecks} checks</span>
          </div>
        </div>
      </div>
    </div>
  );
};
