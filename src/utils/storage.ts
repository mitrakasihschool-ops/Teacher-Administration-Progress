import { Teacher, Indicator, IndicatorProgress, TeacherSubject } from '../types';
import { INITIAL_TEACHERS, INITIAL_PROGRESS, INITIAL_GROUPS, getDefaultIndicatorsForSubject } from '../data/initialData';

export function loadTeachers(): Teacher[] {
  return INITIAL_TEACHERS;
}

export function saveTeachers(teachers: Teacher[]): void {
  // No-op: Local storage removed, data stored directly in Firestore
}

export function loadProgress(): Record<string, IndicatorProgress> {
  return INITIAL_PROGRESS;
}

export function saveProgress(progress: Record<string, IndicatorProgress>): void {
  // No-op: Local storage removed, data stored directly in Firestore
}

export function loadGroups(): string[] {
  return INITIAL_GROUPS;
}

export function saveGroups(groups: string[]): void {
  // No-op: Local storage removed, data stored directly in Firestore
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
    if (status === 'completed' || status === 'verified') {
      completedCount++;
    } else if (status === 'needs_revision') {
      revisionCount++;
    } else if (status === 'in_progress') {
      inProgressCount++;
    } else if (pct === 100) {
      completedCount++;
    } else if (pct > 0) {
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
