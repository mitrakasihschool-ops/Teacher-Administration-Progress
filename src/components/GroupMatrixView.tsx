import React, { useState } from 'react';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Circle, 
  ExternalLink,
  Search,
  Filter,
  Layers,
  ChevronDown,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { Teacher, TeacherSubject, Indicator, IndicatorProgress } from '../types';
import { getProgressKey, calculateSubjectProgress, getSubjectIndicators } from '../utils/storage';

interface GroupMatrixViewProps {
  teachers: Teacher[];
  progressMap: Record<string, IndicatorProgress>;
  selectedGroup: string;
  onSelectGroup: (group: string) => void;
  groups: string[];
  onOpenTeacherSubject: (teacherId: string, subjectId: string) => void;
}

export const GroupMatrixView: React.FC<GroupMatrixViewProps> = ({
  teachers,
  progressMap,
  selectedGroup,
  onSelectGroup,
  groups,
  onOpenTeacherSubject,
}) => {
  const [search, setSearch] = useState('');
  const [expandedSubjectIds, setExpandedSubjectIds] = useState<Record<string, boolean>>({});

  const toggleSubjectExpand = (key: string) => {
    setExpandedSubjectIds((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    filteredTeachers.forEach((t) => {
      t.subjects.forEach((s) => {
        all[`${t.id}_${s.id}`] = true;
      });
    });
    setExpandedSubjectIds(all);
  };

  const collapseAll = () => {
    setExpandedSubjectIds({});
  };

  const filteredTeachers = teachers.filter((t) => {
    const matchesGroup = selectedGroup === 'ALL' || t.group === selectedGroup;
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subjects.some((s) => {
        const inds = getSubjectIndicators(s);
        return (
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          inds.some((ind) => ind.title.toLowerCase().includes(search.toLowerCase()) || ind.code.toLowerCase().includes(search.toLowerCase()))
        );
      });
    return matchesGroup && matchesSearch;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Matrix Controls */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Group Progress & Subject Indicators Matrix</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit administration indicators tailored for each subject across all teacher groups
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Group Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500">Group:</span>
            <select
              value={selectedGroup}
              onChange={(e) => onSelectGroup(e.target.value)}
              className="text-xs font-medium bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              <option value="ALL">All Groups ({teachers.length} teachers)</option>
              {groups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search teacher, subject, indicator..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          {/* Expand / Collapse buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={expandAll}
              className="text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded px-2 py-1 cursor-pointer"
            >
              Expand All
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded px-2 py-1 cursor-pointer"
            >
              Collapse
            </button>
          </div>
        </div>
      </div>

      {/* The Matrix / Indicators Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase text-[11px] tracking-wider">
            <tr>
              <th className="py-3 px-4 w-60">Teacher & Group</th>
              <th className="py-3 px-3 w-52">Subject (Parent Table)</th>
              <th className="py-3 px-3 w-28 text-center">Progress %</th>
              <th className="py-3 px-4">Subject-Specific Indicators Breakdown</th>
              <th className="py-3 px-3 w-28 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70">
            {filteredTeachers.map((teacher) => {
              return teacher.subjects.map((sub, sIdx) => {
                const subKey = `${teacher.id}_${sub.id}`;
                const isExpanded = !!expandedSubjectIds[subKey];
                const subjectIndicators = getSubjectIndicators(sub);
                const stats = calculateSubjectProgress(teacher.id, sub, progressMap);

                return (
                  <React.Fragment key={subKey}>
                    <tr className="hover:bg-slate-50/70 transition-colors">
                      {/* Teacher Column */}
                      <td className="py-3.5 px-4 align-top border-r border-slate-100 font-medium">
                        {sIdx === 0 ? (
                          <div>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                                style={{ backgroundColor: teacher.avatarColor || '#334155' }}
                              >
                                {teacher.name.charAt(0)}
                              </div>
                              <span className="font-bold text-slate-900 truncate">{teacher.name}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5 ml-8">{teacher.group}</p>
                          </div>
                        ) : (
                          <div className="text-slate-400 ml-8 text-[11px]">↳ {teacher.name.split(' ')[0]}</div>
                        )}
                      </td>

                      {/* Subject Column (Parent Table) */}
                      <td className="py-3.5 px-3 align-top border-r border-slate-100">
                        <div className="space-y-1">
                          <button
                            type="button"
                            onClick={() => onOpenTeacherSubject(teacher.id, sub.id)}
                            className="text-left font-bold text-slate-900 hover:text-slate-700 hover:underline flex items-center gap-1.5 cursor-pointer"
                          >
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white">
                              {sub.code}
                            </span>
                            <span>{sub.name}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60 text-slate-400" />
                          </button>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span>{sub.grade}</span>
                            <span>•</span>
                            <span className="font-semibold text-slate-700">
                              {subjectIndicators.length} indicators
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Total % & Visual Bar */}
                      <td className="py-3.5 px-3 align-top text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                              stats.percentage === 100
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : stats.percentage >= 50
                                ? 'bg-slate-100 text-slate-800 border border-slate-200'
                                : stats.percentage > 0
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-slate-50 text-slate-500 border border-slate-200'
                            }`}
                          >
                            {stats.percentage}%
                          </span>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                stats.percentage === 100
                                ? 'bg-emerald-500'
                                : stats.percentage > 0
                                ? 'bg-slate-800'
                                : 'bg-slate-300'
                              }`}
                              style={{ width: `${stats.percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Indicators Summary Chips */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {subjectIndicators.map((ind) => {
                              const key = getProgressKey(teacher.id, sub.id, ind.id);
                              const rec = progressMap[key];
                              const status = rec ? rec.status : 'not_started';
                              const pct = rec ? rec.percentage : 0;

                              const badgeStyle =
                                status === 'completed' || status === 'verified'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                                  : status === 'needs_revision'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200 font-semibold'
                                  : status === 'in_progress'
                                  ? 'bg-slate-100 text-slate-800 border-slate-300 font-medium'
                                  : 'bg-slate-50 text-slate-400 border-slate-200';

                              return (
                                <button
                                  key={ind.id}
                                  type="button"
                                  onClick={() => onOpenTeacherSubject(teacher.id, sub.id)}
                                  title={`${ind.code}: ${ind.title}\nStatus: ${status} (${pct}%)\nNotes: ${rec?.progressText || 'No notes'}`}
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] border transition-transform hover:scale-105 cursor-pointer ${badgeStyle}`}
                                >
                                  <span className="font-mono text-[10px] font-bold">{ind.code}</span>
                                  <span>{pct}%</span>
                                  {status === 'completed' || status === 'verified' ? (
                                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                  ) : status === 'needs_revision' ? (
                                    <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                                  ) : status === 'in_progress' ? (
                                    <Clock className="w-2.5 h-2.5 text-slate-500" />
                                  ) : (
                                    <Circle className="w-2 h-2 text-slate-300" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span className="text-[10px]">
                              {stats.completedCount} / {stats.total} indicators complete
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleSubjectExpand(subKey)}
                              className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 inline-flex items-center gap-0.5 cursor-pointer"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronDown className="w-3 h-3" /> Hide Details
                                </>
                              ) : (
                                <>
                                  <ChevronRight className="w-3 h-3" /> View Indicators ({subjectIndicators.length})
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Action Column */}
                      <td className="py-3.5 px-3 align-top text-center">
                        <button
                          type="button"
                          onClick={() => onOpenTeacherSubject(teacher.id, sub.id)}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                        >
                          <span>Audit</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Table View for this Subject */}
                    {isExpanded && (
                      <tr className="bg-slate-50/90 border-b border-slate-200">
                        <td colSpan={5} className="py-3 px-6">
                          <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                                Indicators for {sub.name} ({teacher.name})
                              </h4>
                              <button
                                type="button"
                                onClick={() => onOpenTeacherSubject(teacher.id, sub.id)}
                                className="text-xs text-slate-700 font-semibold hover:underline"
                              >
                                Edit in Administration Sheet →
                              </button>
                            </div>

                            <div className="divide-y divide-slate-100 text-xs">
                              {subjectIndicators.map((ind) => {
                                const key = getProgressKey(teacher.id, sub.id, ind.id);
                                const rec = progressMap[key];
                                const status = rec ? rec.status : 'not_started';
                                const pct = rec ? rec.percentage : 0;

                                return (
                                  <div
                                    key={ind.id}
                                    className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 shrink-0">
                                        {ind.code}
                                      </span>
                                      <span className="font-medium text-slate-800 truncate">{ind.title}</span>
                                    </div>

                                    <div className="flex items-center gap-4 shrink-0 text-xs">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[11px] font-semibold text-slate-600">
                                          {status.replace('_', ' ').toUpperCase()}
                                        </span>
                                        <span className="font-mono font-bold text-slate-900">({pct}%)</span>
                                      </div>

                                      {rec?.progressText && (
                                        <span className="text-[11px] text-slate-500 italic max-w-xs truncate">
                                          &quot;{rec.progressText}&quot;
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              });
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
