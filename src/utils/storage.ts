import { Teacher, Indicator, IndicatorProgress, TeacherSubject } from '../types';
import { INITIAL_TEACHERS, INITIAL_PROGRESS, INITIAL_GROUPS, getDefaultIndicatorsForSubject } from '../data/initialData';

const TEACHERS_STORAGE_KEY = 'tap_teachers_v5';
const PROGRESS_STORAGE_KEY = 'tap_progress_v5';
const GROUPS_STORAGE_KEY = 'tap_groups_v3';

export function loadTeachers(): Teacher[] {
  try {
    const saved = localStorage.getItem(TEACHERS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure every subject has valid indicators
        return parsed.map((t: Teacher) => ({
          ...t,
          subjects: (t.subjects || []).map((sub: TeacherSubject) => ({
            ...sub,
            indicators: Array.isArray(sub.indicators) && sub.indicators.length > 0
              ? sub.indicators
              : getDefaultIndicatorsForSubject(sub.name, sub.grade),
          })),
        }));
      }
    }
  } catch (e) {
    console.error('Failed to load teachers from storage:', e);
  }
  return INITIAL_TEACHERS;
}

export function saveTeachers(teachers: Teacher[]): void {
  try {
    localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(teachers));
  } catch (e) {
    console.error('Failed to save teachers to storage:', e);
  }
}

export function loadProgress(): Record<string, IndicatorProgress> {
  try {
    const saved = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (e) {
    console.error('Failed to load progress from storage:', e);
  }
  return INITIAL_PROGRESS;
}

export function saveProgress(progress: Record<string, IndicatorProgress>): void {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress to storage:', e);
  }
}

export function loadGroups(): string[] {
  try {
    const saved = localStorage.getItem(GROUPS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load groups from storage:', e);
  }
  return INITIAL_GROUPS;
}

export function saveGroups(groups: string[]): void {
  try {
    localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
  } catch (e) {
    console.error('Failed to save groups to storage:', e);
  }
}

export function getProgressKey(teacherId: string, subjectId: string, indicatorId: string): string {
  return `${teacherId}_${subjectId}_${indicatorId}`;
}

export function getSubjectIndicators(subject?: TeacherSubject | null): Indicator[] {
  if (!subject) return [];
  if (Array.isArray(subject.indicators) && subject.indicators.length > 0) {
    return subject.indicators;
  }
  return getDefaultIndicatorsForSubject(subject.name || '', subject.grade || '');
}

export function calculateSubjectProgress(
  teacherId: string,
  subjectOrSubjectId: TeacherSubject | string,
  indicatorsOrProgressMap: Indicator[] | Record<string, IndicatorProgress>,
  optionalProgressMap?: Record<string, IndicatorProgress>
): { percentage: number; completedCount: number; inProgressCount: number; revisionCount: number; notStartedCount: number; total: number } {
  let subjectId = '';
  let relevantIndicators: Indicator[] = [];
  let progressMap: Record<string, IndicatorProgress> = {};

  if (typeof subjectOrSubjectId === 'string') {
    subjectId = subjectOrSubjectId;
    if (Array.isArray(indicatorsOrProgressMap)) {
      relevantIndicators = indicatorsOrProgressMap;
      progressMap = optionalProgressMap || {};
    } else {
      progressMap = indicatorsOrProgressMap || {};
    }
  } else {
    subjectId = subjectOrSubjectId.id;
    relevantIndicators = getSubjectIndicators(subjectOrSubjectId);
    progressMap = (indicatorsOrProgressMap as Record<string, IndicatorProgress>) || {};
  }

  if (relevantIndicators.length === 0) {
    return { percentage: 0, completedCount: 0, inProgressCount: 0, revisionCount: 0, notStartedCount: 0, total: 0 };
  }

  let totalPercentageSum = 0;
  let completedCount = 0;
  let inProgressCount = 0;
  let revisionCount = 0;
  let notStartedCount = 0;

  for (const ind of relevantIndicators) {
    const key = getProgressKey(teacherId, subjectId, ind.id);
    const item = progressMap[key];
    const pct = item ? item.percentage || 0 : 0;
    const status = item ? item.status : 'not_started';

    totalPercentageSum += pct;
    if (status === 'completed' || status === 'verified' || pct === 100) {
      completedCount++;
    } else if (status === 'needs_revision') {
      revisionCount++;
    } else if (status === 'in_progress' || pct > 0) {
      inProgressCount++;
    } else {
      notStartedCount++;
    }
  }

  const avgPercentage = Math.round(totalPercentageSum / relevantIndicators.length);

  return {
    percentage: avgPercentage,
    completedCount,
    inProgressCount,
    revisionCount,
    notStartedCount,
    total: relevantIndicators.length,
  };
}

export function calculateTeacherOverallProgress(
  teacher: Teacher,
  progressMap: Record<string, IndicatorProgress>
): number {
  if (!teacher.subjects || teacher.subjects.length === 0) return 0;
  let sum = 0;
  for (const sub of teacher.subjects) {
    const stat = calculateSubjectProgress(teacher.id, sub, progressMap);
    sum += stat.percentage;
  }
  return Math.round(sum / teacher.subjects.length);
}
