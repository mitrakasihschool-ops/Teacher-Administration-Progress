import React, { useState } from 'react';
import { X, Plus, Trash2, Edit3, UserCheck, BookOpen, Layers } from 'lucide-react';
import { Teacher, TeacherSubject } from '../types';
import { getDefaultIndicatorsForSubject } from '../data/initialData';

interface ManageTeachersModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: Teacher[];
  groups: string[];
  onSaveTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (teacherId: string) => void;
  initialTeacherToEdit?: Teacher | null;
}

const AVATAR_COLORS = [
  '#2563eb', // blue
  '#059669', // emerald
  '#7c3aed', // purple
  '#d97706', // amber
  '#db2777', // pink
  '#0891b2', // cyan
  '#4f46e5', // indigo
  '#e11d48', // rose
];

export const ManageTeachersModal: React.FC<ManageTeachersModalProps> = ({
  isOpen,
  onClose,
  teachers,
  groups,
  onSaveTeacher,
  onDeleteTeacher,
  initialTeacherToEdit,
}) => {
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(
    initialTeacherToEdit || null
  );
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [nip, setNip] = useState('');
  const [group, setGroup] = useState(groups[0] || 'Primary 1');
  const [email, setEmail] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [subjects, setSubjects] = useState<TeacherSubject[]>([]);

  // New subject draft input
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectGrade, setNewSubjectGrade] = useState('Primary 1');
  const [newSubjectDept, setNewSubjectDept] = useState('General');

  const startEditTeacher = (t: Teacher) => {
    setEditingTeacher(t);
    setIsCreatingNew(false);
    setName(t.name);
    setNip(t.nip || '');
    setGroup(t.group);
    setEmail(t.email);
    setAvatarColor(t.avatarColor || AVATAR_COLORS[0]);
    setSubjects([...t.subjects]);
  };

  const startNewTeacher = () => {
    setEditingTeacher(null);
    setIsCreatingNew(true);
    setName('');
    setNip(`NIP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
    setGroup(groups[0] || 'Primary 1');
    setEmail('');
    setAvatarColor(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
    setSubjects([
      {
        id: `sub-${Date.now()}-1`,
        name: 'Math P4',
        code: 'MTH-P4',
        grade: 'Primary 4',
        department: 'Mathematics',
        academicYear: '2026/2027',
        indicators: getDefaultIndicatorsForSubject('Math P4', 'Primary 4'),
      },
    ]);
  };

  const handleAddSubjectToDraft = () => {
    if (!newSubjectName.trim()) return;
    const subName = newSubjectName.trim();
    const sub: TeacherSubject = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: subName,
      code: subName.replace(/\s+/g, '-').toUpperCase(),
      grade: newSubjectGrade,
      department: newSubjectDept,
      academicYear: '2026/2027',
      indicators: getDefaultIndicatorsForSubject(subName, newSubjectGrade),
    };
    setSubjects([...subjects, sub]);
    setNewSubjectName('');
  };

  const handleRemoveSubjectFromDraft = (subId: string) => {
    if (subjects.length <= 1) {
      alert('A teacher must have at least one assigned subject.');
      return;
    }
    setSubjects(subjects.filter((s) => s.id !== subId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter teacher name.');
      return;
    }
    if (subjects.length === 0) {
      alert('Please assign at least one subject to this teacher.');
      return;
    }

    const teacherData: Teacher = {
      id: editingTeacher ? editingTeacher.id : `t-${Date.now()}`,
      name: name.trim(),
      nip: nip.trim(),
      group,
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@school.edu`,
      avatarColor,
      subjects,
    };

    onSaveTeacher(teacherData);
    setEditingTeacher(null);
    setIsCreatingNew(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Manage Teachers & Assigned Subjects</h2>
              <p className="text-xs text-slate-500">
                Add, edit teacher details, assign department groups, and manage subject loads
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isCreatingNew || editingTeacher ? (
            /* Form view */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  {isCreatingNew ? 'Add New Teacher' : `Edit Teacher: ${editingTeacher?.name}`}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setEditingTeacher(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Cancel & back to list
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Teacher Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah Wijaya, M.Ed."
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Teacher Group / Department *
                  </label>
                  <select
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white"
                  >
                    {groups.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    NIP / Staff ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="e.g. NIP-19880315-01"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. sarah.wijaya@school.edu"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
              </div>

              {/* Avatar Color Picker */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Badge Color
                </label>
                <div className="flex items-center gap-2">
                  {AVATAR_COLORS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setAvatarColor(col)}
                      className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                        avatarColor === col ? 'scale-110 ring-2 ring-offset-2 ring-slate-800' : ''
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              {/* Assigned Subjects Section */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-slate-700" />
                      Assigned Subjects ({subjects.length})
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Subjects assigned to this teacher for administration checking (e.g. Math P4)
                    </p>
                  </div>
                </div>

                {/* Subject Pills list */}
                <div className="flex flex-wrap gap-2">
                  {subjects.map((sub) => (
                    <div
                      key={sub.id}
                      className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs shadow-2xs"
                    >
                      <span className="font-bold text-slate-900">{sub.name}</span>
                      <span className="text-[10px] text-slate-400">({sub.grade})</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {sub.indicators?.length || 0} indicators
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubjectFromDraft(sub.id)}
                        className="text-slate-400 hover:text-red-600 p-0.5 rounded cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Subject mini form */}
                <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Math P4, Science P4, English P4"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                  <select
                    value={newSubjectGrade}
                    onChange={(e) => setNewSubjectGrade(e.target.value)}
                    className="text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  >
                    <option value="Primary 1">Primary 1</option>
                    <option value="Primary 2">Primary 2</option>
                    <option value="Primary 3">Primary 3</option>
                    <option value="Primary 4">Primary 4</option>
                    <option value="Primary 5">Primary 5</option>
                    <option value="Primary 6">Primary 6</option>
                    <option value="NK">NK (Nursery / KG)</option>
                    <option value="Specialist">Specialist</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddSubjectToDraft}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Subject</span>
                  </button>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setEditingTeacher(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  {isCreatingNew ? 'Create Teacher' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            /* List of existing teachers */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 font-medium">
                  {teachers.length} Teachers in registry
                </p>
                <button
                  type="button"
                  onClick={startNewTeacher}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Teacher</span>
                </button>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {teachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: teacher.avatarColor }}
                      >
                        {teacher.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{teacher.name}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span>{teacher.group}</span>
                          <span>•</span>
                          <span>{teacher.nip || 'No NIP'}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {teacher.subjects.map((sub) => (
                            <span
                              key={sub.id}
                              className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium"
                            >
                              {sub.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => startEditTeacher(teacher)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTeacherToDelete(teacher)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs cursor-pointer"
                        title="Delete teacher"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* In-app Teacher Deletion Confirmation Modal */}
      {teacherToDelete && (
        <div className="fixed inset-0 z-60 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  Delete Teacher
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Are you sure you want to delete <strong className="text-slate-900 font-bold">{teacherToDelete.name}</strong>? All assigned subject progress will be permanently removed.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTeacherToDelete(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteTeacher(teacherToDelete.id);
                  setTeacherToDelete(null);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Delete Teacher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
