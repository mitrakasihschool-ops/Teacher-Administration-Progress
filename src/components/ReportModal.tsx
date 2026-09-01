import React, { useState } from 'react';
import { X, Printer, Download, CheckCircle2, AlertTriangle, FileText, UserCheck } from 'lucide-react';
import { Teacher, IndicatorProgress } from '../types';
import { getProgressKey, calculateSubjectProgress, getSubjectIndicators } from '../utils/storage';
import { exportProgressToCSV } from '../utils/export';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: Teacher[];
  progressMap: Record<string, IndicatorProgress>;
  selectedTeacherId: string | null;
  selectedSubjectId: string | null;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  teachers,
  progressMap,
  selectedTeacherId,
}) => {
  const [reportTeacherId, setReportTeacherId] = useState<string>(
    selectedTeacherId || (teachers[0]?.id || '')
  );

  const teacher = teachers.find((t) => t.id === reportTeacherId) || teachers[0];

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen || !teacher) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-3 bg-slate-50/70 print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-slate-700" />
              <label className="text-xs font-semibold text-slate-700">Teacher Report:</label>
            </div>
            <select
              value={reportTeacherId}
              onChange={(e) => setReportTeacherId(e.target.value)}
              className="text-xs font-medium bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.group})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => exportProgressToCSV(teachers, progressMap)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Report Document */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white print:p-0 print:overflow-visible" id="printable-report">
          {/* Formal School Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                Teacher Administration Progress Audit Report
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                Academic Year 2026/2027 • Primary & Specialist Subject Administration Audit
              </p>
            </div>
            <div className="text-right text-xs text-slate-500 font-mono">
              <p>Generated: {new Date().toLocaleDateString()}</p>
              <p>Status: Official School Audit Record</p>
            </div>
          </div>

          {/* Teacher Summary Details Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6 text-xs">
            <div>
              <p className="text-slate-400 font-medium uppercase text-[10px]">Teacher Name</p>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{teacher.name}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium uppercase text-[10px]">Group / Department</p>
              <p className="font-bold text-slate-900 mt-0.5">{teacher.group}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium uppercase text-[10px]">NIP / Staff ID</p>
              <p className="font-bold text-slate-900 mt-0.5">{teacher.nip || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium uppercase text-[10px]">Email</p>
              <p className="font-bold text-slate-900 mt-0.5 truncate">{teacher.email}</p>
            </div>
          </div>

          {/* Subjects Progress Breakdown */}
          <div className="space-y-6">
            {teacher.subjects.map((subject) => {
              const subjectIndicators = getSubjectIndicators(subject);
              const stats = calculateSubjectProgress(teacher.id, subject, progressMap);

              return (
                <div key={subject.id} className="border border-slate-200 rounded-xl overflow-hidden">
                  {/* Subject Header */}
                  <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-white flex items-center gap-2">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/20">{subject.code}</span>
                        <span>{subject.name}</span>
                        <span className="text-xs text-slate-300 font-normal">
                          ({subject.grade} • {subject.department})
                        </span>
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-bold text-emerald-400 text-sm">
                        {stats.percentage}% Completed
                      </span>
                      <span className="text-slate-300">
                        ({stats.completedCount}/{stats.total} Indicators verified)
                      </span>
                    </div>
                  </div>

                  {/* Indicator Details Table */}
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-700">
                      <tr>
                        <th className="py-2.5 px-3 w-20">Code</th>
                        <th className="py-2.5 px-3 w-60">Subject-Specific Indicator</th>
                        <th className="py-2.5 px-3 w-28">Status</th>
                        <th className="py-2.5 px-2 w-16 text-center">%</th>
                        <th className="py-2.5 px-3">Typed Progress Notes & Remarks</th>
                        <th className="py-2.5 px-3 w-32">Evidence Ref</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {subjectIndicators.map((ind) => {
                        const key = getProgressKey(teacher.id, subject.id, ind.id);
                        const rec = progressMap[key];
                        const status = rec ? rec.status : 'not_started';
                        const pct = rec ? rec.percentage : 0;
                        const notes = rec?.progressText || '-';

                        return (
                          <tr key={ind.id} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 font-mono font-semibold text-slate-800 align-top">
                              {ind.code}
                            </td>
                            <td className="py-2 px-3 align-top">
                              <p className="font-semibold text-slate-900">{ind.title}</p>
                            </td>
                            <td className="py-2 px-3 align-top">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                  status === 'completed' || status === 'verified'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : status === 'needs_revision'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : status === 'in_progress'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}
                              >
                                {status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-center font-bold text-slate-800 align-top font-mono">
                              {pct}%
                            </td>
                            <td className="py-2 px-3 text-slate-700 align-top whitespace-pre-wrap">
                              {notes}
                            </td>
                            <td className="py-2 px-3 text-slate-500 font-mono text-[10px] align-top">
                              {rec?.documentRef || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>

          {/* Formal Signature Lines */}
          <div className="mt-12 pt-8 border-t border-slate-300 grid grid-cols-3 gap-8 text-center text-xs">
            <div>
              <p className="font-semibold text-slate-600 mb-16">Subject Teacher</p>
              <div className="border-b border-slate-400 w-40 mx-auto mb-1"></div>
              <p className="font-bold text-slate-900">{teacher.name}</p>
              <p className="text-[10px] text-slate-500">{teacher.nip || 'Staff ID'}</p>
            </div>

            <div>
              <p className="font-semibold text-slate-600 mb-16">Curriculum Coordinator</p>
              <div className="border-b border-slate-400 w-40 mx-auto mb-1"></div>
              <p className="font-bold text-slate-900">Dr. Robert Henderson</p>
              <p className="text-[10px] text-slate-500">Head of Academics</p>
            </div>

            <div>
              <p className="font-semibold text-slate-600 mb-16">School Principal</p>
              <div className="border-b border-slate-400 w-40 mx-auto mb-1"></div>
              <p className="font-bold text-slate-900">Elizabeth Warren, M.Ed.</p>
              <p className="text-[10px] text-slate-500">School Principal</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
