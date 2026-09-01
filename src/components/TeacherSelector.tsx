import React, { useState } from 'react';
import { Search, UserCheck, ChevronRight, BookOpen, Filter, UserPlus } from 'lucide-react';
import { Teacher, IndicatorProgress } from '../types';
import { calculateTeacherOverallProgress, getSubjectIndicators } from '../utils/storage';

interface TeacherSelectorProps {
  teachers: Teacher[];
  selectedTeacherId: string | null;
  onSelectTeacher: (teacherId: string) => void;
  selectedGroup: string;
  onSelectGroup: (group: string) => void;
  groups: string[];
  progressMap: Record<string, IndicatorProgress>;
  onAddNewTeacher: () => void;
}

export const TeacherSelector: React.FC<TeacherSelectorProps> = ({
  teachers,
  selectedTeacherId,
  onSelectTeacher,
  selectedGroup,
  onSelectGroup,
  groups,
  progressMap,
  onAddNewTeacher,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter teachers by group and search query
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesGroup = selectedGroup === 'ALL' || teacher.group === selectedGroup;
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (teacher.nip && teacher.nip.toLowerCase().includes(searchQuery.toLowerCase())) ||
      teacher.subjects.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesGroup && matchesSearch;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Header & Group Filter */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Teachers Directory</h2>
          </div>
          <button
            id="btn-add-teacher-sidebar"
            type="button"
            onClick={onAddNewTeacher}
            className="text-xs text-slate-700 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        {/* Group Selector Dropdown */}
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" />
            Teacher Group / Department:
          </label>
          <select
            id="teacher-group-select"
            value={selectedGroup}
            onChange={(e) => onSelectGroup(e.target.value)}
            className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-colors"
          >
            <option value="ALL">All Teacher Groups ({teachers.length})</option>
            {groups.map((grp) => {
              const count = teachers.filter((t) => t.group === grp).length;
              return (
                <option key={grp} value={grp}>
                  {grp} ({count})
                </option>
              );
            })}
          </select>
        </div>

        {/* Search Box */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-teacher-input"
            type="text"
            placeholder="Search teacher or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Teachers List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 max-h-[calc(100vh-320px)] min-h-[300px]">
        {filteredTeachers.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs space-y-2">
            <p>No teachers found matching criteria.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                onSelectGroup('ALL');
              }}
              className="text-slate-800 underline font-medium cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        ) : (
          filteredTeachers.map((teacher) => {
            const isSelected = teacher.id === selectedTeacherId;
            const progress = calculateTeacherOverallProgress(teacher, progressMap);

            return (
              <button
                key={teacher.id}
                id={`teacher-item-${teacher.id}`}
                type="button"
                onClick={() => onSelectTeacher(teacher.id)}
                className={`w-full text-left p-2.5 rounded-lg transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white border-slate-200/70 hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    {/* Avatar Initials */}
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-white'
                      }`}
                      style={{ backgroundColor: teacher.avatarColor || undefined }}
                    >
                      {teacher.name.charAt(0)}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {teacher.name}
                        </p>
                      </div>
                      
                      <p className={`text-[11px] truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {teacher.group}
                      </p>

                      {/* Subject tags with indicators count */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {teacher.subjects.map((sub) => {
                          const inds = getSubjectIndicators(sub);
                          return (
                            <span
                              key={sub.id}
                              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                isSelected
                                  ? 'bg-white/15 text-slate-100'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              <BookOpen className="w-2.5 h-2.5 opacity-70" />
                              {sub.name} ({inds.length})
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Progress Ring / Bar & Arrow */}
                  <div className="flex flex-col items-end shrink-0 pl-1">
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[11px] font-bold ${
                          isSelected
                            ? 'text-white'
                            : progress === 100
                            ? 'text-emerald-600'
                            : progress >= 60
                            ? 'text-slate-800'
                            : progress > 0
                            ? 'text-amber-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {progress}%
                      </span>
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform ${
                          isSelected ? 'text-white translate-x-0.5' : 'text-slate-400'
                        }`}
                      />
                    </div>
                    
                    {/* Micro Progress Bar */}
                    <div className={`w-12 rounded-full h-1 mt-1 overflow-hidden ${isSelected ? 'bg-white/20' : 'bg-slate-100'}`}>
                      <div
                        className={`h-1 rounded-full transition-all duration-300 ${
                          isSelected ? 'bg-emerald-400' : progress === 100 ? 'bg-emerald-500' : 'bg-slate-700'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer Count */}
      <div className="p-2.5 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Showing {filteredTeachers.length} of {teachers.length} teachers</span>
        <span className="font-medium">{selectedGroup === 'ALL' ? 'All Groups' : selectedGroup}</span>
      </div>
    </div>
  );
};
