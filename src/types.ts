export type ProgressStatus = 'not_started' | 'in_progress' | 'needs_revision' | 'completed' | 'verified';

export interface Indicator {
  id: string;
  code: string;
  title: string;
  category?: string;
  description?: string;
  requiredFor?: string[]; // e.g. ['all'] or ['Math', 'Science']
}

export interface TeacherSubject {
  id: string;
  name: string; // e.g. "Math P4", "Science P5"
  code: string; // e.g. "MTH-P4"
  grade: string; // e.g. "P4", "Primary 4"
  department: string; // e.g. "Mathematics", "Science"
  academicYear?: string;
  semester?: string;
  indicators: Indicator[]; // Indicators specific to this subject
}

export interface Teacher {
  id: string;
  name: string;
  nip?: string;
  group: string; // e.g. "Primary 4 Team", "Mathematics Department"
  email: string;
  avatarColor: string;
  subjects: TeacherSubject[];
}

export interface IndicatorProgress {
  teacherId: string;
  subjectId: string;
  indicatorId: string;
  status: ProgressStatus;
  progressText: string; // The typed progress notes from supervisor/user
  percentage: number; // 0 - 100
  documentRef?: string; // Link or reference note
  lastUpdated: string; // ISO date string
  verifiedBy?: string;
}

export interface TeacherGroup {
  id: string;
  name: string;
  description?: string;
}

export type ViewMode = 'tracker' | 'group_matrix' | 'analytics';
