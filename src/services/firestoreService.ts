import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  getDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Teacher, IndicatorProgress, Indicator, ProgressStatus, TeacherSubject } from '../types';
import { INITIAL_TEACHERS, INITIAL_PROGRESS, INITIAL_GROUPS, getDefaultIndicatorsForSubject } from '../data/initialData';
import { getProgressKey } from '../utils/storage';

const TEACHERS_COLLECTION = 'teachers';
const PROGRESS_COLLECTION = 'progress';
const METADATA_COLLECTION = 'system_metadata';
const GROUPS_DOC_ID = 'groups_config';

/**
 * Initialize Firestore with initial data if database collections are empty
 */
export async function seedFirestoreIfEmpty(): Promise<boolean> {
  try {
    const teachersSnapshot = await getDocs(collection(db, TEACHERS_COLLECTION));
    if (teachersSnapshot.empty) {
      console.log('Firestore is empty. Seeding initial teachers, progress, and groups...');
      const batch = writeBatch(db);

      // Seed Teachers
      for (const teacher of INITIAL_TEACHERS) {
        const teacherDocRef = doc(db, TEACHERS_COLLECTION, teacher.id);
        batch.set(teacherDocRef, teacher);
      }

      // Seed Groups Metadata
      const groupsDocRef = doc(db, METADATA_COLLECTION, GROUPS_DOC_ID);
      batch.set(groupsDocRef, {
        list: INITIAL_GROUPS,
        updatedAt: new Date().toISOString(),
      });

      // Commit batch
      await batch.commit();

      // Seed initial progress records in chunks to prevent batch size limits (max 500)
      const progressEntries = Object.values(INITIAL_PROGRESS);
      const chunkSize = 400;
      for (let i = 0; i < progressEntries.length; i += chunkSize) {
        const chunk = progressEntries.slice(i, i + chunkSize);
        const progressBatch = writeBatch(db);
        for (const prog of chunk) {
          const docKey = getProgressKey(prog.teacherId, prog.subjectId, prog.indicatorId);
          const progDocRef = doc(db, PROGRESS_COLLECTION, docKey);
          progressBatch.set(progDocRef, prog);
        }
        await progressBatch.commit();
      }

      console.log('Firestore successfully seeded with initial dataset.');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error seeding initial Firestore database:', error);
    return false;
  }
}

/**
 * Real-time listener for Teachers collection
 */
export function subscribeToTeachers(
  onUpdate: (teachers: Teacher[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const teachersRef = collection(db, TEACHERS_COLLECTION);
  return onSnapshot(
    teachersRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const list: Teacher[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Teacher;
          list.push({
            ...data,
            id: docSnap.id,
            subjects: (data.subjects || []).map((sub) => ({
              ...sub,
              indicators: Array.isArray(sub.indicators) && sub.indicators.length > 0
                ? sub.indicators
                : getDefaultIndicatorsForSubject(sub.name, sub.grade),
            })),
          });
        });
        onUpdate(list);
      } else {
        onUpdate(INITIAL_TEACHERS);
        seedFirestoreIfEmpty().catch(() => {});
      }
    },
    (err) => {
      console.warn('Firestore Teachers subscription offline/notice:', err.message);
      onUpdate(INITIAL_TEACHERS);
      if (onError) onError(err);
    }
  );
}

/**
 * Real-time listener for Progress collection
 */
export function subscribeToProgress(
  onUpdate: (progressMap: Record<string, IndicatorProgress>) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const progressRef = collection(db, PROGRESS_COLLECTION);
  return onSnapshot(
    progressRef,
    (snapshot) => {
      const map: Record<string, IndicatorProgress> = {};
      if (!snapshot.empty) {
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as IndicatorProgress;
          const key = getProgressKey(data.teacherId, data.subjectId, data.indicatorId);
          map[key] = data;
        });
        onUpdate(map);
      } else {
        onUpdate(INITIAL_PROGRESS);
      }
    },
    (err) => {
      console.warn('Firestore Progress subscription offline/notice:', err.message);
      onUpdate(INITIAL_PROGRESS);
      if (onError) onError(err);
    }
  );
}

/**
 * Real-time listener for Groups metadata
 */
export function subscribeToGroups(
  onUpdate: (groups: string[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const groupsDocRef = doc(db, METADATA_COLLECTION, GROUPS_DOC_ID);
  return onSnapshot(
    groupsDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (Array.isArray(data?.list) && data.list.length > 0) {
          onUpdate(data.list);
          return;
        }
      }
      onUpdate(INITIAL_GROUPS);
    },
    (err) => {
      console.warn('Firestore Groups subscription offline/notice:', err.message);
      onUpdate(INITIAL_GROUPS);
      if (onError) onError(err);
    }
  );
}

/**
 * Save or update single teacher in Firestore
 */
export async function saveTeacherToFirestore(teacher: Teacher): Promise<void> {
  const teacherDocRef = doc(db, TEACHERS_COLLECTION, teacher.id);
  await setDoc(teacherDocRef, teacher, { merge: true });
}

/**
 * Save all teachers (e.g. from Manage Teachers modal)
 */
export async function saveAllTeachersToFirestore(
  updatedTeachers: Teacher[],
  previousTeachers: Teacher[]
): Promise<void> {
  const batch = writeBatch(db);

  // 1. Identify deleted teachers
  const updatedIds = new Set(updatedTeachers.map((t) => t.id));
  for (const prev of previousTeachers) {
    if (!updatedIds.has(prev.id)) {
      const ref = doc(db, TEACHERS_COLLECTION, prev.id);
      batch.delete(ref);
    }
  }

  // 2. Set updated teachers
  for (const teacher of updatedTeachers) {
    const ref = doc(db, TEACHERS_COLLECTION, teacher.id);
    batch.set(ref, teacher);
  }

  await batch.commit();
}

/**
 * Delete a teacher from Firestore
 */
export async function deleteTeacherFromFirestore(teacherId: string): Promise<void> {
  const ref = doc(db, TEACHERS_COLLECTION, teacherId);
  await deleteDoc(ref);
}

/**
 * Save progress update for a single indicator to Firestore
 */
export async function saveProgressToFirestore(
  teacherId: string,
  subjectId: string,
  indicatorId: string,
  updates: Partial<IndicatorProgress>
): Promise<void> {
  const docKey = getProgressKey(teacherId, subjectId, indicatorId);
  const progDocRef = doc(db, PROGRESS_COLLECTION, docKey);

  const fullData: IndicatorProgress = {
    teacherId,
    subjectId,
    indicatorId,
    status: (updates.status as ProgressStatus) || 'not_started',
    progressText: updates.progressText || '',
    percentage: updates.percentage !== undefined ? updates.percentage : 0,
    documentRef: updates.documentRef || '',
    lastUpdated: updates.lastUpdated || new Date().toISOString(),
    verifiedBy: updates.verifiedBy,
    ...updates,
  };

  await setDoc(progDocRef, fullData, { merge: true });
}

/**
 * Bulk update all indicator progress in a subject (e.g., Mark All Completed or Reset)
 */
export async function bulkUpdateSubjectProgressInFirestore(
  teacherId: string,
  subject: TeacherSubject,
  status: ProgressStatus,
  percentage: number,
  note?: string
): Promise<void> {
  const indicators = Array.isArray(subject.indicators) && subject.indicators.length > 0
    ? subject.indicators
    : getDefaultIndicatorsForSubject(subject.name, subject.grade);

  const batch = writeBatch(db);
  const now = new Date().toISOString();

  const defaultNote =
    status === 'completed'
      ? note || 'Verified complete during department audit.'
      : status === 'not_started'
      ? ''
      : note || '';

  for (const ind of indicators) {
    const docKey = getProgressKey(teacherId, subject.id, ind.id);
    const progDocRef = doc(db, PROGRESS_COLLECTION, docKey);

    const record: IndicatorProgress = {
      teacherId,
      subjectId: subject.id,
      indicatorId: ind.id,
      status,
      percentage,
      progressText: defaultNote,
      documentRef: status === 'not_started' ? '' : undefined,
      verifiedBy: status === 'completed' || status === 'verified' ? 'Department Lead' : undefined,
      lastUpdated: now,
    };

    batch.set(progDocRef, record, { merge: true });
  }

  await batch.commit();
}

/**
 * Update indicators array for a specific subject of a teacher in Firestore
 */
export async function updateSubjectIndicatorsInFirestore(
  teacher: Teacher,
  subjectId: string,
  indicators: Indicator[]
): Promise<void> {
  const updatedSubjects = (teacher.subjects || []).map((sub) => {
    if (sub.id === subjectId) {
      return {
        ...sub,
        indicators,
      };
    }
    return sub;
  });

  const updatedTeacher: Teacher = {
    ...teacher,
    subjects: updatedSubjects,
  };

  await saveTeacherToFirestore(updatedTeacher);
}

/**
 * Save groups list to Firestore
 */
export async function saveGroupsToFirestore(groups: string[]): Promise<void> {
  const groupsDocRef = doc(db, METADATA_COLLECTION, GROUPS_DOC_ID);
  await setDoc(
    groupsDocRef,
    {
      list: groups,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}
