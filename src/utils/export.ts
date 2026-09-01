import { Teacher, IndicatorProgress } from '../types';
import { getProgressKey, getSubjectIndicators } from './storage';

export function exportProgressToCSV(
  teachers: Teacher[],
  progressMap: Record<string, IndicatorProgress>
): void {
  const headers = [
    'Teacher Name',
    'NIP / Staff ID',
    'Department / Group',
    'Subject Code',
    'Subject Name',
    'Grade',
    'Indicator Code',
    'Indicator Title',
    'Status',
    'Progress %',
    'Progress Notes / Remarks',
    'Evidence Reference',
    'Last Updated',
  ];

  const rows: string[][] = [headers];

  for (const teacher of teachers) {
    for (const sub of teacher.subjects) {
      const subjectIndicators = getSubjectIndicators(sub);
      for (const ind of subjectIndicators) {
        const key = getProgressKey(teacher.id, sub.id, ind.id);
        const record = progressMap[key];

        rows.push([
          `"${teacher.name.replace(/"/g, '""')}"`,
          `"${(teacher.nip || '').replace(/"/g, '""')}"`,
          `"${teacher.group.replace(/"/g, '""')}"`,
          `"${sub.code}"`,
          `"${sub.name.replace(/"/g, '""')}"`,
          `"${sub.grade}"`,
          `"${ind.code}"`,
          `"${ind.title.replace(/"/g, '""')}"`,
          `"${record ? record.status : 'not_started'}"`,
          `"${record ? record.percentage : 0}%"`,
          `"${(record?.progressText || '').replace(/"/g, '""')}"`,
          `"${(record?.documentRef || '').replace(/"/g, '""')}"`,
          `"${record?.lastUpdated ? new Date(record.lastUpdated).toLocaleDateString() : '-'}"`,
        ]);
      }
    }
  }

  const csvContent = rows.map((e) => e.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Teacher_Administration_Progress_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
