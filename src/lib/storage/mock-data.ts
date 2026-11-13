import {
  AuditLogEntry,
  ClassOccurrence,
  Profile,
  Subject,
  Task,
  TimetableEntry,
  TimetableVersion,
} from '../types';

export const INITIAL_PROFILE: Profile = {
  id: 'usr-default-001',
  display_name: 'Aditya (CS Major)',
  timezone: 'Asia/Kolkata',
  default_min_attendance: 80.0,
  created_at: '2026-08-01T00:00:00Z',
  updated_at: '2026-11-13T00:00:00Z',
};

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-dsa-101',
    user_id: 'usr-default-001',
    name: 'Data Structures & Algorithms',
    subject_code: 'CS301',
    semester: 'Semester 3',
    minimum_attendance_percentage: 80.0,
    warning_margin: 3.0,
    attendance_policy: { count_cancelled: false, period_weight: 1.0 },
    is_active: true,
  },
  {
    id: 'sub-os-102',
    user_id: 'usr-default-001',
    name: 'Operating Systems',
    subject_code: 'CS303',
    semester: 'Semester 3',
    minimum_attendance_percentage: 80.0,
    warning_margin: 3.0,
    attendance_policy: { count_cancelled: false, period_weight: 1.0 },
    is_active: true,
  },
  {
    id: 'sub-dbms-103',
    user_id: 'usr-default-001',
    name: 'Database Management Systems',
    subject_code: 'CS304',
    semester: 'Semester 3',
    minimum_attendance_percentage: 80.0,
    warning_margin: 3.0,
    attendance_policy: { count_cancelled: false, period_weight: 1.0 },
    is_active: true,
  },
  {
    id: 'sub-coa-104',
    user_id: 'usr-default-001',
    name: 'Computer Organization & Architecture',
    subject_code: 'CS302',
    semester: 'Semester 3',
    minimum_attendance_percentage: 80.0,
    warning_margin: 3.0,
    attendance_policy: { count_cancelled: false, period_weight: 1.0 },
    is_active: true,
  },
  {
    id: 'sub-math-105',
    user_id: 'usr-default-001',
    name: 'Discrete Mathematics',
    subject_code: 'MA301',
    semester: 'Semester 3',
    minimum_attendance_percentage: 80.0,
    warning_margin: 3.0,
    attendance_policy: { count_cancelled: false, period_weight: 1.0 },
    is_active: true,
  },
];

export const INITIAL_TIMETABLE_VERSION: TimetableVersion = {
  id: 'ttv-fall-2026',
  user_id: 'usr-default-001',
  version_name: 'Fall 2026 Engineering Schedule v1.2',
  effective_from: '2026-08-01',
  effective_until: '2026-12-20',
  is_active: true,
  created_at: '2026-08-01T09:00:00Z',
  approved_at: '2026-08-01T10:00:00Z',
};

// Weekly recurring schedule (Monday = 1, Tuesday = 2, Wednesday = 3, Thursday = 4, Friday = 5)
export const INITIAL_TIMETABLE_ENTRIES: TimetableEntry[] = [
  // Monday (1)
  {
    id: 'tte-mon-1',
    timetable_version_id: 'ttv-fall-2026',
    subject_id: 'sub-dsa-101',
    day_of_week: 1,
    start_time: '09:00',
    end_time: '10:00',
    class_type: 'LECTURE',
    room: 'Hall 302',
    is_active: true,
  },
  {
    id: 'tte-mon-2',
    timetable_version_id: 'ttv-fall-2026',
    subject_id: 'sub-os-102',
    day_of_week: 1,
    start_time: '10:15',
    end_time: '11:15',
    class_type: 'LECTURE',
    room: 'Hall 302',
    is_active: true,
  },
  {
    id: 'tte-mon-3',
    timetable_version_id: 'ttv-fall-2026',
    subject_id: 'sub-dbms-103',
    day_of_week: 1,
    start_time: '11:30',
    end_time: '12:30',
    class_type: 'LECTURE',
    room: 'Hall 205',
    is_active: true,
  },
  {
    id: 'tte-mon-4',
    timetable_version_id: 'ttv-fall-2026',
    subject_id: 'sub-dsa-101',
    day_of_week: 1,
    start_time: '14:00',
    end_time: '16:00',
    class_type: 'LAB',
    room: 'Software Lab 2',
    is_active: true,
  },

  // Tuesday (2)
  {
    id: 'tte-tue-1',
    timetable_version_id: 'ttv-fall-2026',
    subject_id: 'sub-coa-104',
    day_of_week: 2,
    start_time: '09:00',
    end_time: '10:00',
    class_type: 'LECTURE',
    room: 'Hall 104',
    is_active: true,
  },
  {
    id: 'tte-tue-2',
    timetable_version_id: 'ttv-fall-2026',
    subject_id: 'sub-math-105',
    day_of_week: 2,
    start_time: '10:15',
    end_time: '11:15',
    class_type: 'LECTURE',
    room: 'Hall 104',
    is_active: true,
  },
  {
    id: 'tte-tue-3',
    timetable_version_id: 'ttv-fall-2026',
    subject_id: 'sub-os-102',
    day_of_week: 2,
    start_time: '11:30',
    end_time: '12:30',
    class_type: 'LECTURE',
    room: 'Hall 302',
    is_active: true,
  },

  // Wednesday (3)
  {
    id: 'tte-wed-1',
    timetable_version_id: 'ttv-fall-2026',
    subject_id: 'sub-dbms-103',
    day_of_week: 3,
    start_time: '09:00',
    end_time: '10:00',
    class_type: 'LECTURE',
    room: 'Hall 205',
    is_active: true,
  },
  {
    id: 'tte-wed-2',
    timetable_version_id: 'ttv-fall-2026',
    subject_id: 'sub-dsa-101',
    day_of_week: 3,
    start_time: '10:15',
    end_time: '11:15',
    class_type: 'LECTURE',
    room: 'Hall 302',
    is_active: true,
  },
  {
    id: 'tte-wed-3',
    timetable_version_id: 'ttv-fall-2026',
    subject_id: 'sub-math-105',
    day_of_week: 3,
    start_time: '11:30',
    end_time: '12:30',
    class_type: 'LECTURE',
    room: 'Hall 104',
    is_active: true,
  },
  {
    id: 'tte-wed-4',
    timetable_version_id: 'ttv-fall-2026',
    subject_id: 'sub-dbms-103',
    day_of_week: 3,
    start_time: '14:00',
    end_time: '16:00',
    class_type: 'LAB',
    room: 'Database Lab 1',
    is_active: true,
  },

  // Thursday (4)
  {
    id: 'tte-thu-1',
    timetable_version_id: 'ttv-fall-2026',
    subject_id: 'sub-os-102',
    day_of_week: 4,
    start_time: '09:00',
    end_time: '10:00',
    class_type: 'LECTURE',
    room: 'Hall 302',
    is_active: true,
  },
  {
    id: 'tte-thu-2',
    timetable_version_id: 'ttv-fall-2026',
    subject_id: 'sub-coa-104',
    day_of_week: 4,
    start_time: '10:15',
    end_time: '11:15',
    class_type: 'LECTURE',
    room: 'Hall 104',
    is_active: true,
  },
  {
    id: 'tte-thu-3',
    timetable_version_id: 'ttv-fall-2026',
    subject_id: 'sub-dsa-101',
    day_of_week: 4,
    start_time: '11:30',
    end_time: '12:30',
    class_type: 'TUTORIAL',
    room: 'Hall 302',
    is_active: true,
  },

  // Friday (5)
  {
    id: 'tte-fri-1',
    timetable_version_id: 'ttv-fall-2026',
    subject_id: 'sub-math-105',
    day_of_week: 5,
    start_time: '09:00',
    end_time: '10:00',
    class_type: 'LECTURE',
    room: 'Hall 104',
    is_active: true,
  },
  {
    id: 'tte-fri-2',
    timetable_version_id: 'ttv-fall-2026',
    subject_id: 'sub-os-102',
    day_of_week: 5,
    start_time: '10:15',
    end_time: '11:15',
    class_type: 'LECTURE',
    room: 'Hall 302',
    is_active: true,
  },
  {
    id: 'tte-fri-3',
    timetable_version_id: 'ttv-fall-2026',
    subject_id: 'sub-dbms-103',
    day_of_week: 5,
    start_time: '11:30',
    end_time: '12:30',
    class_type: 'LECTURE',
    room: 'Hall 205',
    is_active: true,
  },
  {
    id: 'tte-fri-4',
    timetable_version_id: 'ttv-fall-2026',
    subject_id: 'sub-coa-104',
    day_of_week: 5,
    start_time: '14:00',
    end_time: '16:00',
    class_type: 'LAB',
    room: 'Hardware Lab',
    is_active: true,
  },
];

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generates initial realistic class occurrences across subjects,
 * including historical records and today's schedule.
 */
export function generateInitialOccurrences(): ClassOccurrence[] {
  const todayStr = getTodayDateString();
  const occurrences: ClassOccurrence[] = [];

  // 1. Generate Historical Occurrences to simulate real attendance health
  // Subject 1: DSA (18 conducted, 16 present, 2 absent) -> 88.89% (SAFE)
  for (let i = 1; i <= 18; i++) {
    const isAbsent = i === 4 || i === 11;
    occurrences.push({
      id: `occ-hist-dsa-${i}`,
      subject_id: 'sub-dsa-101',
      timetable_entry_id: 'tte-mon-1',
      scheduled_date: `2026-10-${String(i).padStart(2, '0')}`,
      start_time: '09:00',
      end_time: '10:00',
      status: isAbsent ? 'ABSENT' : 'PRESENT',
      notes: isAbsent ? 'Medical leave' : undefined,
    });
  }

  // Subject 2: OS (20 conducted, 16 present, 4 absent) -> 80.00% (NEAR_THRESHOLD)
  for (let i = 1; i <= 20; i++) {
    const isAbsent = i === 3 || i === 7 || i === 12 || i === 18;
    occurrences.push({
      id: `occ-hist-os-${i}`,
      subject_id: 'sub-os-102',
      timetable_entry_id: 'tte-mon-2',
      scheduled_date: `2026-10-${String(i).padStart(2, '0')}`,
      start_time: '10:15',
      end_time: '11:15',
      status: isAbsent ? 'ABSENT' : 'PRESENT',
    });
  }

  // Subject 3: DBMS (15 conducted, 11 present, 4 absent) -> 73.33% (BELOW_THRESHOLD)
  for (let i = 1; i <= 15; i++) {
    const isAbsent = i === 2 || i === 6 || i === 9 || i === 13;
    occurrences.push({
      id: `occ-hist-dbms-${i}`,
      subject_id: 'sub-dbms-103',
      timetable_entry_id: 'tte-mon-3',
      scheduled_date: `2026-10-${String(i).padStart(2, '0')}`,
      start_time: '11:30',
      end_time: '12:30',
      status: isAbsent ? 'ABSENT' : 'PRESENT',
      notes: isAbsent ? 'Missed bus' : undefined,
    });
  }

  // Subject 4: COA (16 conducted, 14 present, 2 absent) -> 87.50% (SAFE)
  for (let i = 1; i <= 16; i++) {
    const isAbsent = i === 5 || i === 14;
    occurrences.push({
      id: `occ-hist-coa-${i}`,
      subject_id: 'sub-coa-104',
      timetable_entry_id: 'tte-tue-1',
      scheduled_date: `2026-10-${String(i).padStart(2, '0')}`,
      start_time: '09:00',
      end_time: '10:00',
      status: isAbsent ? 'ABSENT' : 'PRESENT',
    });
  }

  // Subject 5: Discrete Math (14 conducted, 12 present, 2 absent) -> 85.71% (SAFE)
  for (let i = 1; i <= 14; i++) {
    const isAbsent = i === 3 || i === 10;
    occurrences.push({
      id: `occ-hist-math-${i}`,
      subject_id: 'sub-math-105',
      timetable_entry_id: 'tte-tue-2',
      scheduled_date: `2026-10-${String(i).padStart(2, '0')}`,
      start_time: '10:15',
      end_time: '11:15',
      status: isAbsent ? 'ABSENT' : 'PRESENT',
    });
  }

  // 2. Generate Today's Occurrences from timetable slots corresponding to today's day of week
  const todayDayOfWeek = new Date().getDay(); // 0-6
  const matchingEntries = INITIAL_TIMETABLE_ENTRIES.filter(
    (e) => e.day_of_week === todayDayOfWeek
  );

  // If today is weekend (0=Sun, 6=Sat) or no classes, also provide Friday classes as default preview
  const activeEntriesForToday =
    matchingEntries.length > 0
      ? matchingEntries
      : INITIAL_TIMETABLE_ENTRIES.filter((e) => e.day_of_week === 5);

  activeEntriesForToday.forEach((entry, idx) => {
    occurrences.push({
      id: `occ-today-${idx + 1}`,
      subject_id: entry.subject_id,
      timetable_entry_id: entry.id,
      scheduled_date: todayStr,
      start_time: entry.start_time,
      end_time: entry.end_time,
      status: 'PENDING',
      notes: entry.room ? `Room: ${entry.room}` : undefined,
    });
  });

  return occurrences;
}

export const INITIAL_TASKS: Task[] = [
  {
    id: 'tsk-001',
    user_id: 'usr-default-001',
    subject_id: 'sub-dsa-101',
    title: 'Implement AVL Tree Rotations & Balance Check',
    description: 'Complete coding assignment for Module 3 in C++',
    category: 'ASSIGNMENT',
    priority: 'HIGH',
    due_at: '2026-11-16T23:59:00Z',
    estimated_minutes: 120,
    status: 'TODO',
  },
  {
    id: 'tsk-002',
    user_id: 'usr-default-001',
    subject_id: 'sub-dbms-103',
    title: 'SQL Normalization Problem Set (BCNF & 3NF)',
    description: 'Solve tutorial sheet questions 1 through 10',
    category: 'ACADEMIC',
    priority: 'CRITICAL',
    due_at: '2026-11-14T17:00:00Z',
    estimated_minutes: 90,
    status: 'IN_PROGRESS',
  },
  {
    id: 'tsk-003',
    user_id: 'usr-default-001',
    subject_id: 'sub-os-102',
    title: 'Prepare Seminar on Linux CFS CPU Scheduler',
    description: 'Create 10 slides and test benchmark script',
    category: 'ACADEMIC',
    priority: 'MEDIUM',
    due_at: '2026-11-20T10:00:00Z',
    estimated_minutes: 180,
    status: 'TODO',
  },
  {
    id: 'tsk-004',
    user_id: 'usr-default-001',
    subject_id: 'sub-math-105',
    title: 'Review Graph Theory & Dijkstra shortest path',
    description: 'Midterm revision chapter 4',
    category: 'EXAM',
    priority: 'HIGH',
    due_at: '2026-11-18T18:00:00Z',
    estimated_minutes: 60,
    status: 'COMPLETED',
    completed_at: '2026-11-12T16:30:00Z',
  },
];

export const INITIAL_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: 'log-001',
    user_id: 'usr-default-001',
    entity_type: 'timetable_version',
    entity_id: 'ttv-fall-2026',
    action: 'CREATE',
    old_value: null,
    new_value: { version_name: 'Fall 2026 Engineering Schedule v1.2' },
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    id: 'log-002',
    user_id: 'usr-default-001',
    entity_type: 'attendance_record',
    entity_id: 'occ-hist-dsa-4',
    action: 'CORRECTION',
    old_value: { attendance_status: 'PRESENT' },
    new_value: {
      attendance_status: 'ABSENT',
      correction_reason: 'Rectified absence on 2026-10-04 (Medical leave)',
    },
    created_at: '2026-10-05T08:15:00Z',
  },
];
