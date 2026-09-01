/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Teacher, 
  Indicator, 
  IndicatorProgress, 
  ViewMode, 
  ProgressStatus 
} from './types';
import { 
  loadTeachers, 
  saveTeachers, 
  loadProgress, 
  saveProgress, 
  loadGroups, 
  saveGroups,
  getProgressKey,
  getSubjectIndicators
} from './utils/storage';
import {
  seedFirestoreIfEmpty,
  subscribeToTeachers,
  subscribeToProgress,
  subscribeToGroups,
  saveProgressToFirestore,
  bulkUpdateSubjectProgressInFirestore,
  saveTeacherToFirestore,
  deleteTeacherFromFirestore,
  saveAllTeachersToFirestore,
  updateSubjectIndicatorsInFirestore,
  saveGroupsToFirestore,
} from './services/firestoreService';
import { exportProgressToCSV } from './utils/export';
import { Header } from './components/Header';
import { StatsBanner } from './components/StatsBanner';
import { TeacherSelector } from './components/TeacherSelector';
import { SubjectSelector } from './components/SubjectSelector';
import { AdministrationSheet } from './components/AdministrationSheet';
import { GroupMatrixView } from './components/GroupMatrixView';
import { ManageTeachersModal } from './components/ManageTeachersModal';
import { ManageIndicatorsModal } from './components/ManageIndicatorsModal';
import { ReportModal } from './components/ReportModal';

export default function App() {
  // Core state initialized from local cache for instant UI rendering
  const [teachers, setTeachers] = useState<Teacher[]>(() => loadTeachers());
  const [progressMap, setProgressMap] = useState<Record<string, IndicatorProgress>>(() => loadProgress());
  const [groups, setGroups] = useState<string[]>(() => loadGroups());

  // Firestore Sync State
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('syncing');
  const isInitialLoadRef = useRef(true);

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('tracker');
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(() => {
    const list = loadTeachers();
    return list[0]?.id || '';
  });
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => {
    const list = loadTeachers();
    return list[0]?.subjects[0]?.id || '';
  });
  const [academicYear, setAcademicYear] = useState<string>('2026/2027');

  // Modals
  const [isManageTeachersOpen, setIsManageTeachersOpen] = useState(false);
  const [isManageIndicatorsOpen, setIsManageIndicatorsOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // 1. Firebase Firestore Subscriptions & Auto-seed
  useEffect(() => {
    setSyncStatus('syncing');

    // Attempt to seed if database is completely fresh
    seedFirestoreIfEmpty().catch((err) => {
      console.warn('Firestore seed check notice:', err);
    });

    // Listen to real-time Teachers collection
    const unsubscribeTeachers = subscribeToTeachers(
      (remoteTeachers) => {
        if (remoteTeachers && remoteTeachers.length > 0) {
          setTeachers(remoteTeachers);
          saveTeachers(remoteTeachers);

          // If no selected teacher or current selected is not found, select first
          setSelectedTeacherId((currId) => {
            const exists = remoteTeachers.some((t) => t.id === currId);
            return exists ? currId : remoteTeachers[0].id;
          });
        }
        setSyncStatus('synced');
      },
      (err) => {
        console.error('Firestore teachers subscription error:', err);
        setSyncStatus('offline');
      }
    );

    // Listen to real-time Progress collection
    const unsubscribeProgress = subscribeToProgress(
      (remoteProgressMap) => {
        if (remoteProgressMap && Object.keys(remoteProgressMap).length > 0) {
          setProgressMap(remoteProgressMap);
          saveProgress(remoteProgressMap);
        }
        setSyncStatus('synced');
      },
      (err) => {
        console.error('Firestore progress subscription error:', err);
        setSyncStatus('offline');
      }
    );

    // Listen to real-time Groups collection
    const unsubscribeGroups = subscribeToGroups(
      (remoteGroups) => {
        if (remoteGroups && remoteGroups.length > 0) {
          setGroups(remoteGroups);
          saveGroups(remoteGroups);
        }
        setSyncStatus('synced');
      },
      (err) => {
        console.error('Firestore groups subscription error:', err);
      }
    );

    isInitialLoadRef.current = false;

    return () => {
      unsubscribeTeachers();
      unsubscribeProgress();
      unsubscribeGroups();
    };
  }, []);

  // Sync to localStorage as offline fallback
  useEffect(() => {
    saveTeachers(teachers);
  }, [teachers]);

  useEffect(() => {
    saveProgress(progressMap);
  }, [progressMap]);

  useEffect(() => {
    saveGroups(groups);
  }, [groups]);

  // Current selected teacher and subject
  const currentTeacher = teachers.find((t) => t.id === selectedTeacherId) || teachers[0];
  
  // Ensure valid selected subject when teacher changes
  useEffect(() => {
    if (currentTeacher && currentTeacher.subjects.length > 0) {
      const exists = currentTeacher.subjects.some((s) => s.id === selectedSubjectId);
      if (!exists) {
        setSelectedSubjectId(currentTeacher.subjects[0].id);
      }
    }
  }, [selectedTeacherId, currentTeacher, selectedSubjectId]);

  const currentSubject = currentTeacher?.subjects.find((s) => s.id === selectedSubjectId) || currentTeacher?.subjects[0];

  // Select teacher handler
  const handleSelectTeacher = (teacherId: string) => {
    setSelectedTeacherId(teacherId);
    const teacher = teachers.find((t) => t.id === teacherId);
    if (teacher && teacher.subjects.length > 0) {
      setSelectedSubjectId(teacher.subjects[0].id);
    }
  };

  // Update progress handler for a specific indicator (Firestore + Optimistic Local)
  const handleUpdateProgress = async (
    teacherId: string,
    subjectId: string,
    indicatorId: string,
    updates: Partial<IndicatorProgress>
  ) => {
    const key = getProgressKey(teacherId, subjectId, indicatorId);
    const now = new Date().toISOString();

    // 1. Optimistic UI update
    setProgressMap((prev) => {
      const existing = prev[key] || {
        teacherId,
        subjectId,
        indicatorId,
        status: 'not_started',
        progressText: '',
        percentage: 0,
        lastUpdated: now,
      };
      return {
        ...prev,
        [key]: {
          ...existing,
          ...updates,
          lastUpdated: updates.lastUpdated || now,
        },
      };
    });

    // 2. Persist to Firebase Firestore
    try {
      setSyncStatus('syncing');
      await saveProgressToFirestore(teacherId, subjectId, indicatorId, updates);
      setSyncStatus('synced');
    } catch (error) {
      console.error('Error saving progress to Firestore:', error);
      setSyncStatus('error');
    }
  };

  // Bulk update status for all indicators in a subject (Firestore + Optimistic Local)
  const handleBulkUpdateStatus = async (
    teacherId: string,
    subjectId: string,
    status: ProgressStatus,
    percentage: number,
    note?: string
  ) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    const sub = teacher?.subjects.find((s) => s.id === subjectId);
    const indicators = sub ? getSubjectIndicators(sub) : [];
    const now = new Date().toISOString();

    // 1. Optimistic update
    setProgressMap((prev) => {
      const next = { ...prev };
      for (const ind of indicators) {
        const key = getProgressKey(teacherId, subjectId, ind.id);
        const existing = next[key] || {
          teacherId,
          subjectId,
          indicatorId: ind.id,
          status: 'not_started',
          progressText: '',
          percentage: 0,
          lastUpdated: now,
        };

        const defaultNote =
          status === 'completed'
            ? 'Verified complete during department audit.'
            : status === 'not_started'
            ? ''
            : existing.progressText;

        next[key] = {
          ...existing,
          status,
          percentage,
          progressText: note !== undefined ? note : defaultNote,
          documentRef: status === 'not_started' ? '' : existing.documentRef,
          verifiedBy:
            status === 'completed' || status === 'verified'
              ? 'Department Lead'
              : status === 'not_started'
              ? undefined
              : existing.verifiedBy,
          lastUpdated: now,
        };
      }
      return next;
    });

    // 2. Persist to Firebase Firestore
    if (sub) {
      try {
        setSyncStatus('syncing');
        await bulkUpdateSubjectProgressInFirestore(teacherId, sub, status, percentage, note);
        setSyncStatus('synced');
      } catch (error) {
        console.error('Error in bulk Firestore update:', error);
        setSyncStatus('error');
      }
    }
  };

  // Update indicators specifically for a subject (Firestore + Optimistic Local)
  const handleUpdateSubjectIndicators = async (
    teacherId: string,
    subjectId: string,
    updatedIndicators: Indicator[]
  ) => {
    const targetTeacher = teachers.find((t) => t.id === teacherId);

    // 1. Optimistic update
    setTeachers((prevTeachers) => {
      return prevTeachers.map((t) => {
        if (t.id !== teacherId) return t;
        return {
          ...t,
          subjects: t.subjects.map((s) => {
            if (s.id !== subjectId) return s;
            return {
              ...s,
              indicators: updatedIndicators,
            };
          }),
        };
      });
    });

    // 2. Persist to Firebase Firestore
    if (targetTeacher) {
      try {
        setSyncStatus('syncing');
        await updateSubjectIndicatorsInFirestore(targetTeacher, subjectId, updatedIndicators);
        setSyncStatus('synced');
      } catch (error) {
        console.error('Error updating indicators in Firestore:', error);
        setSyncStatus('error');
      }
    }
  };

  // Save / Add / Edit teacher (Firestore + Optimistic Local)
  const handleSaveTeacher = async (updatedTeacher: Teacher) => {
    // 1. Optimistic update
    setTeachers((prev) => {
      const index = prev.findIndex((t) => t.id === updatedTeacher.id);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = updatedTeacher;
        return copy;
      }
      return [updatedTeacher, ...prev];
    });

    if (updatedTeacher.group && !groups.includes(updatedTeacher.group)) {
      const updatedGroups = [...groups, updatedTeacher.group];
      setGroups(updatedGroups);
      saveGroupsToFirestore(updatedGroups).catch(console.error);
    }

    setSelectedTeacherId(updatedTeacher.id);
    if (updatedTeacher.subjects.length > 0) {
      setSelectedSubjectId(updatedTeacher.subjects[0].id);
    }

    // 2. Persist to Firebase Firestore
    try {
      setSyncStatus('syncing');
      await saveTeacherToFirestore(updatedTeacher);
      setSyncStatus('synced');
    } catch (error) {
      console.error('Error saving teacher to Firestore:', error);
      setSyncStatus('error');
    }
  };

  // Delete teacher (Firestore + Optimistic Local)
  const handleDeleteTeacher = async (teacherId: string) => {
    // 1. Optimistic update
    setTeachers((prev) => prev.filter((t) => t.id !== teacherId));
    if (selectedTeacherId === teacherId) {
      const remaining = teachers.filter((t) => t.id !== teacherId);
      if (remaining.length > 0) {
        setSelectedTeacherId(remaining[0].id);
        if (remaining[0].subjects.length > 0) {
          setSelectedSubjectId(remaining[0].subjects[0].id);
        }
      }
    }

    // 2. Delete from Firebase Firestore
    try {
      setSyncStatus('syncing');
      await deleteTeacherFromFirestore(teacherId);
      setSyncStatus('synced');
    } catch (error) {
      console.error('Error deleting teacher from Firestore:', error);
      setSyncStatus('error');
    }
  };

  // Open teacher & subject from matrix view
  const handleOpenFromMatrix = (teacherId: string, subjectId: string) => {
    setSelectedTeacherId(teacherId);
    setSelectedSubjectId(subjectId);
    setViewMode('tracker');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex flex-col antialiased">
      {/* 1. Header Navigation Bar with Firebase status */}
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenManageTeachers={() => setIsManageTeachersOpen(true)}
        onOpenManageIndicators={() => setIsManageIndicatorsOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onExportCSV={() => exportProgressToCSV(teachers, progressMap)}
        onAddNewTeacher={() => setIsManageTeachersOpen(true)}
        academicYear={academicYear}
        onAcademicYearChange={setAcademicYear}
        syncStatus={syncStatus}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 2. School-wide Analytics Banner */}
        <StatsBanner
          teachers={teachers}
          progressMap={progressMap}
          selectedGroup={selectedGroup}
        />

        {/* 3. Primary Content Area */}
        {viewMode === 'tracker' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Teacher Selection Directory */}
            <div className="lg:col-span-4 xl:col-span-3 h-full">
              <TeacherSelector
                teachers={teachers}
                selectedTeacherId={selectedTeacherId}
                onSelectTeacher={handleSelectTeacher}
                selectedGroup={selectedGroup}
                onSelectGroup={setSelectedGroup}
                groups={groups}
                progressMap={progressMap}
                onAddNewTeacher={() => setIsManageTeachersOpen(true)}
              />
            </div>

            {/* Right Column: Assigned Subject & Administration Indicators Progress Sheet */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-4">
              {currentTeacher && (
                <>
                  {/* Subject Assignment Tabs (Parent Table Selector) */}
                  <SubjectSelector
                    teacher={currentTeacher}
                    selectedSubjectId={selectedSubjectId}
                    onSelectSubject={setSelectedSubjectId}
                    progressMap={progressMap}
                  />

                  {/* Indicators Table & Live Progress Sheet */}
                  {currentSubject ? (
                    <AdministrationSheet
                      teacher={currentTeacher}
                      subject={currentSubject}
                      progressMap={progressMap}
                      onUpdateProgress={handleUpdateProgress}
                      onBulkUpdateStatus={handleBulkUpdateStatus}
                      onUpdateSubjectIndicators={handleUpdateSubjectIndicators}
                      onOpenManageIndicators={() => setIsManageIndicatorsOpen(true)}
                    />
                  ) : (
                    <div className="bg-white rounded-xl p-8 text-center text-slate-500 border border-slate-200/80 shadow-xs">
                      <p className="text-xs font-medium">No subjects assigned to this teacher yet.</p>
                      <button
                        type="button"
                        onClick={() => setIsManageTeachersOpen(true)}
                        className="mt-3 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Manage Teachers & Subjects
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          /* Group Matrix Overview with Indicators Breakdown */
          <GroupMatrixView
            teachers={teachers}
            progressMap={progressMap}
            selectedGroup={selectedGroup}
            onSelectGroup={setSelectedGroup}
            groups={groups}
            onOpenTeacherSubject={handleOpenFromMatrix}
          />
        )}
      </main>

      {/* Modals */}
      <ManageTeachersModal
        isOpen={isManageTeachersOpen}
        onClose={() => setIsManageTeachersOpen(false)}
        teachers={teachers}
        groups={groups}
        onSaveTeacher={handleSaveTeacher}
        onDeleteTeacher={handleDeleteTeacher}
      />

      <ManageIndicatorsModal
        isOpen={isManageIndicatorsOpen}
        onClose={() => setIsManageIndicatorsOpen(false)}
        teachers={teachers}
        selectedTeacherId={selectedTeacherId}
        selectedSubjectId={selectedSubjectId}
        onSaveSubjectIndicators={handleUpdateSubjectIndicators}
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        teachers={teachers}
        progressMap={progressMap}
        selectedTeacherId={selectedTeacherId}
        selectedSubjectId={selectedSubjectId}
      />
    </div>
  );
}
