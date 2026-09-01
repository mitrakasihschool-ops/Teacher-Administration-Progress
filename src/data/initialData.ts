import { Teacher, Indicator, TeacherSubject, IndicatorProgress } from '../types';

export const INITIAL_GROUPS = [
  'Primary 1',
  'Primary 2',
  'Primary 3',
  'Primary 4',
  'Primary 5',
  'Primary 6',
  'Specialist Teachers',
  'NK Teachers',
];

// Reusable Subject Indicator Templates by Domain
export const SUBJECT_INDICATOR_TEMPLATES: Record<string, { label: string; indicators: { code: string; title: string }[] }> = {
  mathematics: {
    label: 'Mathematics Template',
    indicators: [
      { code: 'MTH-01', title: 'Annual Program (Prota) & Scope Mastery Milestones (Numbers, Geometry, Data)' },
      { code: 'MTH-02', title: 'Concrete-Pictorial-Abstract (CPA) Teaching Modules & Manipulative Guides' },
      { code: 'MTH-03', title: 'Problem Solving Heuristics & Formative Quiz Rubrics' },
      { code: 'MTH-04', title: 'Remedial Clinic Diagnostic Log & Olympiad Enrichment Tasks' },
      { code: 'MTH-05', title: 'Digital Math Gradebook & Weekly Practice Homework Ledger' },
    ],
  },
  science: {
    label: 'Science & Laboratory Template',
    indicators: [
      { code: 'SCI-01', title: 'Science Scope & Annual Plan with Laboratory Schedule' },
      { code: 'SCI-02', title: 'Inquiry-Based Science Investigation Worksheets & Lab Safety Protocols' },
      { code: 'SCI-03', title: 'Science Practical Assessments, Experiment Rubrics & Term Project Blueprint' },
      { code: 'SCI-04', title: 'Apparatus & Material Inventory Logbook with STEM Journaling' },
      { code: 'SCI-05', title: 'Student Scientific Observation Portfolios & Performance Ledger' },
    ],
  },
  language: {
    label: 'Language & Literacy Template',
    indicators: [
      { code: 'LNG-01', title: 'Language Skills Scope (Listening, Speaking, Reading, Writing & Grammar)' },
      { code: 'LNG-02', title: 'Guided Reading Pacing, Leveled Texts & Phonics Worksheets' },
      { code: 'LNG-03', title: 'Creative Writing Rubrics, Essay Drafting & Fluency Checklists' },
      { code: 'LNG-04', title: 'Vocabulary & Spelling Weekly Progress Ledger' },
      { code: 'LNG-05', title: 'Remedial Literacy Logbook & Independent Reading Trackers' },
    ],
  },
  ict: {
    label: 'ICT & Coding Specialist Template',
    indicators: [
      { code: 'ICT-01', title: 'Computational Thinking Roadmap & Scratch / Block Coding Project Modules' },
      { code: 'ICT-02', title: 'Computer Lab Safety Guidelines, Hardware Log & Student Cloud Accounts' },
      { code: 'ICT-03', title: 'Coding Project Rubrics & Digital Citizenship Verification' },
      { code: 'ICT-04', title: 'Student Digital Portfolio Repository & Class Code Submissions' },
    ],
  },
  thematic: {
    label: 'Primary Homeroom & Thematic Core Template',
    indicators: [
      { code: 'THM-01', title: 'Thematic Unit Integration Matrix & School Readiness Milestones' },
      { code: 'THM-02', title: 'Sensory & Fine-Motor Activity Sheets & Learning Workstations' },
      { code: 'THM-03', title: 'Daily Character Building, Habituation & Classroom Logbook' },
      { code: 'THM-04', title: 'Parent-Teacher Daily Communication Booklet & Advisory Notes' },
    ],
  },
  nk: {
    label: 'Nursery & Kindergarten (NK) Template',
    indicators: [
      { code: 'NK-01', title: 'Early Childhood Developmental Milestone & Thematic Schedule' },
      { code: 'NK-02', title: 'Sensory, Fine-Motor & Gross-Motor Manipulative Workstation Plans' },
      { code: 'NK-03', title: 'Social-Emotional Behavior Observation Records & Anecdotal Notes' },
      { code: 'NK-04', title: 'Daily Nutrition, Rest & Hygiene Care Logbook' },
    ],
  },
  general: {
    label: 'General Administration Template',
    indicators: [
      { code: 'ADM-01', title: 'Annual Program (Prota) & Semester Program (Promes)' },
      { code: 'ADM-02', title: 'Curriculum Flow / Syllabus (Alur Tujuan Pembelajaran - ATP)' },
      { code: 'ADM-03', title: 'Lesson Plans & Teaching Modules (Modul Ajar / RPP)' },
      { code: 'ADM-04', title: 'Learning Media, Slide Decks & Student Worksheets (LKPD)' },
      { code: 'ADM-05', title: 'Formative & Summative Assessment Instruments & Rubrics' },
      { code: 'ADM-06', title: 'Digital Gradebook & Student Attendance Ledger' },
    ],
  },
};

export function createIndicatorsFromTemplate(templateKey: string, subjectCodePrefix: string): Indicator[] {
  const tpl = SUBJECT_INDICATOR_TEMPLATES[templateKey] || SUBJECT_INDICATOR_TEMPLATES.general;
  return tpl.indicators.map((ind, idx) => ({
    id: `ind-${subjectCodePrefix.toLowerCase()}-${idx + 1}-${Date.now().toString(36).slice(-4)}`,
    code: ind.code,
    title: ind.title,
    requiredFor: ['all'],
  }));
}

export function getDefaultIndicatorsForSubject(subjectName: string, grade: string = ''): Indicator[] {
  const name = subjectName.toLowerCase();
  const grd = grade.toLowerCase();

  if (name.includes('math') || name.includes('matematika')) {
    return SUBJECT_INDICATOR_TEMPLATES.mathematics.indicators.map((i, idx) => ({
      id: `ind-mth-${idx + 1}`,
      code: i.code,
      title: i.title,
    }));
  }
  if (name.includes('sci') || name.includes('ipa') || name.includes('biolog') || name.includes('fisik')) {
    return SUBJECT_INDICATOR_TEMPLATES.science.indicators.map((i, idx) => ({
      id: `ind-sci-${idx + 1}`,
      code: i.code,
      title: i.title,
    }));
  }
  if (name.includes('eng') || name.includes('bahasa') || name.includes('indonesia') || name.includes('mandarin')) {
    return SUBJECT_INDICATOR_TEMPLATES.language.indicators.map((i, idx) => ({
      id: `ind-lng-${idx + 1}`,
      code: i.code,
      title: i.title,
    }));
  }
  if (name.includes('ict') || name.includes('comput') || name.includes('cod') || name.includes('robot')) {
    return SUBJECT_INDICATOR_TEMPLATES.ict.indicators.map((i, idx) => ({
      id: `ind-ict-${idx + 1}`,
      code: i.code,
      title: i.title,
    }));
  }
  if (name.includes('nk') || name.includes('nursery') || name.includes('kindergarten') || grd.includes('nk')) {
    return SUBJECT_INDICATOR_TEMPLATES.nk.indicators.map((i, idx) => ({
      id: `ind-nk-${idx + 1}`,
      code: i.code,
      title: i.title,
    }));
  }
  if (name.includes('thematic') || name.includes('tematik') || grd.includes('primary 1') || grd.includes('p1')) {
    return SUBJECT_INDICATOR_TEMPLATES.thematic.indicators.map((i, idx) => ({
      id: `ind-thm-${idx + 1}`,
      code: i.code,
      title: i.title,
    }));
  }

  return SUBJECT_INDICATOR_TEMPLATES.general.indicators.map((i, idx) => ({
    id: `ind-gen-${idx + 1}`,
    code: i.code,
    title: i.title,
  }));
}

export const INITIAL_INDICATORS: Indicator[] = SUBJECT_INDICATOR_TEMPLATES.general.indicators.map((i, idx) => ({
  id: `ind-gen-${idx + 1}`,
  code: i.code,
  title: i.title,
}));

// Initial Teachers Structure: Each Subject contains its own Indicators!
export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 't-01',
    name: 'Sarah Wijaya, M.Ed.',
    nip: 'NIP-19880315-01',
    group: 'Primary 4',
    email: 'sarah.wijaya@school.edu',
    avatarColor: '#2563eb', // blue
    subjects: [
      {
        id: 'sub-01',
        name: 'Math P4',
        code: 'MTH-P4',
        grade: 'Primary 4',
        department: 'Mathematics',
        academicYear: '2026/2027',
        semester: 'Semester 1',
        indicators: [
          { id: 'ind-mth4-01', code: 'MTH-01', title: 'Annual Program (Prota) & Scope Mastery Milestones (Numbers, Geometry, Data)' },
          { id: 'ind-mth4-02', code: 'MTH-02', title: 'Concrete-Pictorial-Abstract (CPA) Teaching Modules & Manipulative Guides' },
          { id: 'ind-mth4-03', code: 'MTH-03', title: 'Problem Solving Heuristics & Formative Quiz Rubrics' },
          { id: 'ind-mth4-04', code: 'MTH-04', title: 'Remedial Clinic Diagnostic Log & Olympiad Enrichment Tasks' },
          { id: 'ind-mth4-05', code: 'MTH-05', title: 'Digital Math Gradebook & Weekly Practice Homework Ledger' },
        ],
      },
      {
        id: 'sub-02',
        name: 'Science P4',
        code: 'SCI-P4',
        grade: 'Primary 4',
        department: 'Science',
        academicYear: '2026/2027',
        semester: 'Semester 1',
        indicators: [
          { id: 'ind-sci4-01', code: 'SCI-01', title: 'Science Scope & Annual Plan with Laboratory Schedule' },
          { id: 'ind-sci4-02', code: 'SCI-02', title: 'Inquiry-Based Science Investigation Worksheets & Lab Safety Protocols' },
          { id: 'ind-sci4-03', code: 'SCI-03', title: 'Science Practical Assessments, Experiment Rubrics & Term Project Blueprint' },
          { id: 'ind-sci4-04', code: 'SCI-04', title: 'Apparatus & Material Inventory Logbook with STEM Journaling' },
          { id: 'ind-sci4-05', code: 'SCI-05', title: 'Student Scientific Observation Portfolios & Performance Ledger' },
        ],
      },
    ],
  },
  {
    id: 't-02',
    name: 'David Pratama, S.Pd.',
    nip: 'NIP-19910722-02',
    group: 'Primary 4',
    email: 'david.pratama@school.edu',
    avatarColor: '#059669', // emerald
    subjects: [
      {
        id: 'sub-03',
        name: 'English P4',
        code: 'ENG-P4',
        grade: 'Primary 4',
        department: 'Languages',
        academicYear: '2026/2027',
        semester: 'Semester 1',
        indicators: [
          { id: 'ind-eng4-01', code: 'ENG-01', title: 'Language Skills Scope (Listening, Speaking, Reading, Writing & Grammar)' },
          { id: 'ind-eng4-02', code: 'ENG-02', title: 'Guided Reading Pacing, Leveled Texts & Phonics Worksheets' },
          { id: 'ind-eng4-03', code: 'ENG-03', title: 'Creative Writing Rubrics, Essay Drafting & Fluency Checklists' },
          { id: 'ind-eng4-04', code: 'ENG-04', title: 'Vocabulary & Spelling Weekly Progress Ledger' },
          { id: 'ind-eng4-05', code: 'ENG-05', title: 'Remedial Literacy Logbook & Independent Reading Trackers' },
        ],
      },
      {
        id: 'sub-04',
        name: 'Social Studies P4',
        code: 'SOC-P4',
        grade: 'Primary 4',
        department: 'Humanities',
        academicYear: '2026/2027',
        semester: 'Semester 1',
        indicators: [
          { id: 'ind-soc4-01', code: 'SOC-01', title: 'Annual Social Studies Scope & Cultural Geography Matrix' },
          { id: 'ind-soc4-02', code: 'SOC-02', title: 'Field Study & Historical Diorama Project Worksheets' },
          { id: 'ind-soc4-03', code: 'SOC-03', title: 'Civics Assessment Instruments & Group Presentation Rubrics' },
          { id: 'ind-soc4-04', code: 'SOC-04', title: 'Daily Humanities Journal & Student Participation Registry' },
        ],
      },
    ],
  },
  {
    id: 't-03',
    name: 'Maria Angelina, M.Sc.',
    nip: 'NIP-19851104-03',
    group: 'Primary 5',
    email: 'maria.angelina@school.edu',
    avatarColor: '#7c3aed', // purple
    subjects: [
      {
        id: 'sub-05',
        name: 'Math P5',
        code: 'MTH-P5',
        grade: 'Primary 5',
        department: 'Mathematics',
        academicYear: '2026/2027',
        semester: 'Semester 1',
        indicators: [
          { id: 'ind-mth5-01', code: 'MTH-01', title: 'Advanced Fractions, Ratios & Percentages Annual Milestone Guide' },
          { id: 'ind-mth5-02', code: 'MTH-02', title: 'Algebraic Thinking Teaching Modules & Word Problem Strategy Handouts' },
          { id: 'ind-mth5-03', code: 'MTH-03', title: 'Midterm & Final Examination Blueprints with Higher-Order Thinking Rubrics' },
          { id: 'ind-mth5-04', code: 'MTH-04', title: 'Digital Gradebook with Weighted Skill Domains & Remedial Schedules' },
        ],
      },
      {
        id: 'sub-06',
        name: 'Science P5',
        code: 'SCI-P5',
        grade: 'Primary 5',
        department: 'Science',
        academicYear: '2026/2027',
        semester: 'Semester 1',
        indicators: [
          { id: 'ind-sci5-01', code: 'SCI-01', title: 'Human Body Systems & Electrical Circuits Annual Laboratory Plan' },
          { id: 'ind-sci5-02', code: 'SCI-02', title: 'Experimental Design Worksheets & Laboratory Safety Contracts' },
          { id: 'ind-sci5-03', code: 'SCI-03', title: 'Science Fair Group Project Rubrics & Scientific Method Logs' },
          { id: 'ind-sci5-04', code: 'SCI-04', title: 'Apparatus Safety Registry & Daily Science Journal' },
        ],
      },
    ],
  },
  {
    id: 't-04',
    name: 'Budi Santoso, S.Kom.',
    nip: 'NIP-19930419-04',
    group: 'Specialist Teachers',
    email: 'budi.santoso@school.edu',
    avatarColor: '#d97706', // amber
    subjects: [
      {
        id: 'sub-07',
        name: 'ICT & Coding P4',
        code: 'ICT-P4',
        grade: 'Primary 4',
        department: 'Specialist ICT',
        academicYear: '2026/2027',
        semester: 'Semester 1',
        indicators: [
          { id: 'ind-ict4-01', code: 'ICT-01', title: 'Computational Thinking Roadmap & Scratch Block Coding Modules' },
          { id: 'ind-ict4-02', code: 'ICT-02', title: 'Computer Lab Safety Guidelines, Hardware Log & Student Accounts' },
          { id: 'ind-ict4-03', code: 'ICT-03', title: 'Game Development Project Rubrics & Digital Citizenship Verification' },
          { id: 'ind-ict4-04', code: 'ICT-04', title: 'Student Digital Portfolio Cloud Repository' },
        ],
      },
      {
        id: 'sub-08',
        name: 'ICT & Coding P5',
        code: 'ICT-P5',
        grade: 'Primary 5',
        department: 'Specialist ICT',
        academicYear: '2026/2027',
        semester: 'Semester 1',
        indicators: [
          { id: 'ind-ict5-01', code: 'ICT-01', title: 'Web Basics & Python Turtle Graphic Scripting Syllabus' },
          { id: 'ind-ict5-02', code: 'ICT-02', title: 'Lab Workstation Maintenance & Network Security Protocols' },
          { id: 'ind-ict5-03', code: 'ICT-03', title: 'Algorithm Assessment Blueprint & Interactive Quiz Keys' },
          { id: 'ind-ict5-04', code: 'ICT-04', title: 'GitHub / Replit Student Code Repository Tracker' },
        ],
      },
    ],
  },
  {
    id: 't-05',
    name: 'Clara Setiawan, S.Pd.',
    nip: 'NIP-19900912-05',
    group: 'Primary 3',
    email: 'clara.setiawan@school.edu',
    avatarColor: '#db2777', // pink
    subjects: [
      {
        id: 'sub-09',
        name: 'Bahasa Indonesia P3',
        code: 'IND-P3',
        grade: 'Primary 3',
        department: 'Languages',
        academicYear: '2026/2027',
        semester: 'Semester 1',
        indicators: [
          { id: 'ind-ind3-01', code: 'IND-01', title: 'Alur Tujuan Pembelajaran (ATP) Bahasa Indonesia & Pemetaan Literasi' },
          { id: 'ind-ind3-02', code: 'IND-02', title: 'Modul Ajar Membaca Intensif, Menulis Paragraf & Lembar Kerja Siswa' },
          { id: 'ind-ind3-03', code: 'IND-03', title: 'Rubrik Penilaian Menceritakan Kembali & Tes Pemahaman Bacaan' },
          { id: 'ind-ind3-04', code: 'IND-04', title: 'Buku Jurnal Membaca Mandiri & Buku Nilai Digital' },
        ],
      },
      {
        id: 'sub-10',
        name: 'Math P3',
        code: 'MTH-P3',
        grade: 'Primary 3',
        department: 'Mathematics',
        academicYear: '2026/2027',
        semester: 'Semester 1',
        indicators: [
          { id: 'ind-mth3-01', code: 'MTH-01', title: 'Multiplication & Division Fluency Milestone Planning' },
          { id: 'ind-mth3-02', code: 'MTH-02', title: 'Visual Fractions & Measurement Tools Worksheet Kit' },
          { id: 'ind-mth3-03', code: 'MTH-03', title: 'Weekly Speed Math Quizzes & Word Problem Rubrics' },
          { id: 'ind-mth3-04', code: 'MTH-04', title: 'Remedial Math Clinic Log & Homework Ledger' },
        ],
      },
    ],
  },
  {
    id: 't-06',
    name: 'Hendro Gunawan, M.Pd.',
    nip: 'NIP-19820516-06',
    group: 'Primary 6',
    email: 'hendro.gunawan@school.edu',
    avatarColor: '#4f46e5', // indigo
    subjects: [
      {
        id: 'sub-11',
        name: 'Math P6',
        code: 'MTH-P6',
        grade: 'Primary 6',
        department: 'Mathematics',
        academicYear: '2026/2027',
        semester: 'Semester 1',
        indicators: [
          { id: 'ind-mth6-01', code: 'MTH-01', title: 'Primary Graduation Standards & National Exam Preparation Matrix' },
          { id: 'ind-mth6-02', code: 'MTH-02', title: 'Complex Word Problem & Algebraic Foundation Teaching Modules' },
          { id: 'ind-mth6-03', code: 'MTH-03', title: 'Standardized Diagnostic Mock Tests & Analytical Scoring Keys' },
          { id: 'ind-mth6-04', code: 'MTH-04', title: 'Targeted Student Clinic Log & High School Readiness Portfolio' },
        ],
      },
    ],
  },
  {
    id: 't-07',
    name: 'Amanda Putri, S.Pd.',
    nip: 'NIP-19940810-07',
    group: 'Primary 2',
    email: 'amanda.putri@school.edu',
    avatarColor: '#0891b2', // cyan
    subjects: [
      {
        id: 'sub-12',
        name: 'Math P2',
        code: 'MTH-P2',
        grade: 'Primary 2',
        department: 'Mathematics',
        academicYear: '2026/2027',
        semester: 'Semester 1',
        indicators: [
          { id: 'ind-mth2-01', code: 'MTH-01', title: 'Numbers up to 1000 & Basic Operations Annual Scope' },
          { id: 'ind-mth2-02', code: 'MTH-02', title: 'Base-10 Blocks & Story Sums Illustrated Worksheets' },
          { id: 'ind-mth2-03', code: 'MTH-03', title: 'Observational Math Checklists & Practical Measurement Rubrics' },
          { id: 'ind-mth2-04', code: 'MTH-04', title: 'Daily Math Activity Log & Student Score Ledger' },
        ],
      },
      {
        id: 'sub-13',
        name: 'English P2',
        code: 'ENG-P2',
        grade: 'Primary 2',
        department: 'Languages',
        academicYear: '2026/2027',
        semester: 'Semester 1',
        indicators: [
          { id: 'ind-eng2-01', code: 'ENG-01', title: 'Phonics Blends & High-Frequency Sight Words Schedule' },
          { id: 'ind-eng2-02', code: 'ENG-02', title: 'Decodable Story Books & Picture-Prompted Sentence Writing' },
          { id: 'ind-eng2-03', code: 'ENG-03', title: 'Oral Reading Fluency & Show-and-Tell Evaluation Rubrics' },
          { id: 'ind-eng2-04', code: 'ENG-04', title: 'Spelling Progress Tracker & Parent Reading Logbook' },
        ],
      },
    ],
  },
  {
    id: 't-08',
    name: 'Ryan Santoso, S.Pd.',
    nip: 'NIP-19950125-08',
    group: 'Primary 1',
    email: 'ryan.santoso@school.edu',
    avatarColor: '#10b981', // emerald
    subjects: [
      {
        id: 'sub-14',
        name: 'Thematic Core P1',
        code: 'THM-P1',
        grade: 'Primary 1',
        department: 'Primary Homeroom',
        academicYear: '2026/2027',
        semester: 'Semester 1',
        indicators: [
          { id: 'ind-thm1-01', code: 'THM-01', title: 'Thematic Unit Integration Matrix & School Readiness Milestones' },
          { id: 'ind-thm1-02', code: 'THM-02', title: 'Sensory & Fine-Motor Activity Sheets & Learning Workstations' },
          { id: 'ind-thm1-03', code: 'THM-03', title: 'Daily Character Building, Habituation & Classroom Logbook' },
          { id: 'ind-thm1-04', code: 'THM-04', title: 'Parent-Teacher Daily Communication Booklet & Advisory Notes' },
        ],
      },
    ],
  },
  {
    id: 't-09',
    name: 'Jessica Tan, B.Ed.',
    nip: 'NIP-19960312-09',
    group: 'NK Teachers',
    email: 'jessica.tan@school.edu',
    avatarColor: '#ec4899', // pink
    subjects: [
      {
        id: 'sub-15',
        name: 'Early Literacy & Phonics (K2)',
        code: 'NK-PHN',
        grade: 'NK',
        department: 'Early Childhood',
        academicYear: '2026/2027',
        semester: 'Semester 1',
        indicators: [
          { id: 'ind-nk1-01', code: 'NK-01', title: 'Early Childhood Developmental Milestone & Thematic Phonics Schedule' },
          { id: 'ind-nk1-02', code: 'NK-02', title: 'Jolly Phonics Story Trays & Sandpaper Letter Tactile Station Plans' },
          { id: 'ind-nk1-03', code: 'NK-03', title: 'Social-Emotional Behavior Observation Records & Anecdotal Notes' },
          { id: 'ind-nk1-04', code: 'NK-04', title: 'Daily Nutrition, Rest & Hygiene Care Logbook' },
        ],
      },
      {
        id: 'sub-16',
        name: 'Foundational Numbers & Play (K1)',
        code: 'NK-NUM',
        grade: 'NK',
        department: 'Early Childhood',
        academicYear: '2026/2027',
        semester: 'Semester 1',
        indicators: [
          { id: 'ind-nk2-01', code: 'NK-01', title: 'Counting & Sorting Concrete Manipulative Activity Roadmap' },
          { id: 'ind-nk2-02', code: 'NK-02', title: 'Sensory Play Stations, Play-Doh Numbers & Gross-Motor Geometry' },
          { id: 'ind-nk2-03', code: 'NK-03', title: 'Individual Student Portfolio with Photo Evidence Records' },
          { id: 'ind-nk2-04', code: 'NK-04', title: 'Parent Communication Diary & Weekly Milestone Reports' },
        ],
      },
    ],
  },
];

export const INITIAL_PROGRESS: Record<string, IndicatorProgress> = {
  // Sarah Wijaya - Math P4
  't-01_sub-01_ind-mth4-01': {
    teacherId: 't-01',
    subjectId: 'sub-01',
    indicatorId: 'ind-mth4-01',
    status: 'completed',
    percentage: 100,
    progressText: 'Math P4 Prota and Promes 2026/2027 fully verified. 36 effective instructional weeks allocated with 4 review periods.',
    documentRef: 'Drive/MathP4/Prota_Promes_Verified.pdf',
    lastUpdated: '2026-08-25T10:30:00Z',
    verifiedBy: 'Head of Academics',
  },
  't-01_sub-01_ind-mth4-02': {
    teacherId: 't-01',
    subjectId: 'sub-01',
    indicatorId: 'ind-mth4-02',
    status: 'in_progress',
    percentage: 75,
    progressText: 'CPA teaching modules for Fractions, Decimals, and Angles completed. Currently preparing 2D geometry shape blocks for Unit 4.',
    documentRef: 'Drive/MathP4/ModulAjar_CPA.pdf',
    lastUpdated: '2026-08-30T09:00:00Z',
  },
  't-01_sub-01_ind-mth4-03': {
    teacherId: 't-01',
    subjectId: 'sub-01',
    indicatorId: 'ind-mth4-03',
    status: 'needs_revision',
    percentage: 50,
    progressText: 'Summative 1 blueprint submitted. Feedback: Add higher-order thinking heuristics questions for word problems #7-10.',
    documentRef: 'Drive/Drafts/Summative1_Feedback.docx',
    lastUpdated: '2026-08-28T16:45:00Z',
  },
  't-01_sub-01_ind-mth4-04': {
    teacherId: 't-01',
    subjectId: 'sub-01',
    indicatorId: 'ind-mth4-04',
    status: 'in_progress',
    percentage: 60,
    progressText: 'Identified 4 students needing fraction addition remedial support. Friday clinic scheduled.',
    documentRef: 'Remedial Log Sheet P4-A',
    lastUpdated: '2026-08-27T15:10:00Z',
  },
  't-01_sub-01_ind-mth4-05': {
    teacherId: 't-01',
    subjectId: 'sub-01',
    indicatorId: 'ind-mth4-05',
    status: 'completed',
    percentage: 100,
    progressText: 'Digital gradebook configured in school LMS. Daily homework logs synced through week 4.',
    documentRef: 'LMS Gradebook Portal P4-Math',
    lastUpdated: '2026-08-31T08:00:00Z',
  },

  // Sarah Wijaya - Science P4
  't-01_sub-02_ind-sci4-01': {
    teacherId: 't-01',
    subjectId: 'sub-02',
    indicatorId: 'ind-sci4-01',
    status: 'completed',
    percentage: 100,
    progressText: 'Science annual plan aligned with laboratory experiment calendar and semester science fair project.',
    documentRef: 'Drive/ScienceP4/Scope_Signed.pdf',
    lastUpdated: '2026-08-24T11:00:00Z',
  },
  't-01_sub-02_ind-sci4-02': {
    teacherId: 't-01',
    subjectId: 'sub-02',
    indicatorId: 'ind-sci4-02',
    status: 'completed',
    percentage: 100,
    progressText: 'Inquiry lab safety protocols and student safety contracts signed by all 26 parents.',
    documentRef: 'Lab Binder #3 Room 204',
    lastUpdated: '2026-08-25T09:30:00Z',
  },
  't-01_sub-02_ind-sci4-03': {
    teacherId: 't-01',
    subjectId: 'sub-02',
    indicatorId: 'ind-sci4-03',
    status: 'in_progress',
    percentage: 60,
    progressText: 'Practical rubric for Plant Life Cycle observation completed. Designing Optics & Light kit rubric.',
    lastUpdated: '2026-08-30T10:00:00Z',
  },

  // David Pratama - English P4
  't-02_sub-03_ind-eng4-01': {
    teacherId: 't-02',
    subjectId: 'sub-03',
    indicatorId: 'ind-eng4-01',
    status: 'completed',
    percentage: 100,
    progressText: 'English P4 syllabus and reading journal milestones submitted and verified.',
    lastUpdated: '2026-08-25T11:00:00Z',
  },
  't-02_sub-03_ind-eng4-02': {
    teacherId: 't-02',
    subjectId: 'sub-03',
    indicatorId: 'ind-eng4-02',
    status: 'completed',
    percentage: 100,
    progressText: 'Leveled reader sets distributed to class library. Phonics diagnostic tests completed.',
    lastUpdated: '2026-08-26T09:00:00Z',
  },

  // Budi Santoso - ICT & Coding P4
  't-04_sub-07_ind-ict4-01': {
    teacherId: 't-04',
    subjectId: 'sub-07',
    indicatorId: 'ind-ict4-01',
    status: 'completed',
    percentage: 100,
    progressText: 'Scratch block coding roadmap and project milestones finalized for Semester 1.',
    lastUpdated: '2026-08-24T14:00:00Z',
  },
  't-04_sub-07_ind-ict4-02': {
    teacherId: 't-04',
    subjectId: 'sub-07',
    indicatorId: 'ind-ict4-02',
    status: 'completed',
    percentage: 100,
    progressText: 'All 30 lab workstations checked, Scratch 3.0 installed, student cloud accounts generated.',
    lastUpdated: '2026-08-26T15:00:00Z',
  },
  't-04_sub-07_ind-ict4-03': {
    teacherId: 't-04',
    subjectId: 'sub-07',
    indicatorId: 'ind-ict4-03',
    status: 'in_progress',
    percentage: 70,
    progressText: 'Game development rubrics uploaded to school learning portal.',
    lastUpdated: '2026-08-29T10:30:00Z',
  },

  // Amanda Putri - Math P2
  't-07_sub-12_ind-mth2-01': {
    teacherId: 't-07',
    subjectId: 'sub-12',
    indicatorId: 'ind-mth2-01',
    status: 'completed',
    percentage: 100,
    progressText: 'Primary 2 math pacing guide approved by Primary Head.',
    lastUpdated: '2026-08-26T10:00:00Z',
  },

  // Ryan Santoso - Primary 1
  't-08_sub-14_ind-thm1-01': {
    teacherId: 't-08',
    subjectId: 'sub-14',
    indicatorId: 'ind-thm1-01',
    status: 'completed',
    percentage: 100,
    progressText: 'Primary 1 transition and thematic orientation plan completed.',
    lastUpdated: '2026-08-27T08:30:00Z',
  },

  // Jessica Tan - NK Teachers
  't-09_sub-15_ind-nk1-01': {
    teacherId: 't-09',
    subjectId: 'sub-15',
    indicatorId: 'ind-nk1-01',
    status: 'completed',
    percentage: 100,
    progressText: 'Nursery & Kindergarten phonics progression and sensory play plan verified.',
    lastUpdated: '2026-08-28T09:15:00Z',
  },
};
