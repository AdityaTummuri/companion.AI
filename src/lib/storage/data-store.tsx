'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import {
  AttendanceRecord,
  AttendanceStatus,
  AuditLogEntry,
  ClassOccurrence,
  ClassType,
  Profile,
  Subject,
  SubjectStats,
  Task,
  TimetableEntry,
  TimetableVersion,
} from '../types';
import {
  INITIAL_AUDIT_LOG,
  INITIAL_PROFILE,
  INITIAL_SUBJECTS,
  INITIAL_TASKS,
  INITIAL_TIMETABLE_ENTRIES,
  INITIAL_TIMETABLE_VERSION,
  generateInitialOccurrences,
  getTodayDateString,
} from './mock-data';
import { computeSubjectStats } from '../attendance-engine';
import { createClient } from '../supabase/client';

interface StudentDataContextType {
  profile: Profile;
  subjects: Subject[];
  timetableVersion: TimetableVersion | null;
  timetableEntries: TimetableEntry[];
  occurrences: ClassOccurrence[];
  tasks: Task[];
  auditLogs: AuditLogEntry[];
  isLoaded: boolean;
  isUsingSupabase: boolean;
  todayDate: string;
  todayOccurrences: ClassOccurrence[];
  subjectStats: Record<string, SubjectStats>;
  overallStats: {
    totalAttended: number;
    totalConducted: number;
    overallPercentage: number;
  };
  markAttendance: (
    occurrenceId: string,
    status: AttendanceStatus,
    correctionReason?: string
  ) => Promise<void>;
  addExtraClass: (params: {
    subjectId: string;
    date: string;
    startTime: string;
    endTime: string;
    classType: ClassType;
    notes?: string;
  }) => Promise<ClassOccurrence>;
  updateProfileThreshold: (minAttendance: number, displayName?: string) => Promise<void>;
  addSubject: (params: {
    name: string;
    subject_code: string;
    semester: string;
    minimum_attendance_percentage: number;
    warning_margin?: number;
  }) => Promise<Subject>;
  addTask: (params: {
    title: string;
    description?: string;
    subject_id?: string | null;
    priority: Task['priority'];
    category: Task['category'];
    due_at?: string | null;
    estimated_minutes?: number;
  }) => Promise<Task>;
  toggleTask: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addTimetableEntry: (
    entry: Omit<TimetableEntry, 'id' | 'timetable_version_id'>
  ) => Promise<TimetableEntry>;
  deleteTimetableEntry: (entryId: string) => Promise<void>;
  exportDataJson: () => string;
  resetToDefaults: () => void;
}

const StudentDataContext = createContext<StudentDataContextType | null>(null);

const STORAGE_KEY_PREFIX = 'companion_data_v1_';

export function StudentDataProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>(INITIAL_PROFILE);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [timetableVersion, setTimetableVersion] = useState<TimetableVersion | null>(
    INITIAL_TIMETABLE_VERSION
  );
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>(
    INITIAL_TIMETABLE_ENTRIES
  );
  const [occurrences, setOccurrences] = useState<ClassOccurrence[]>([]);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOG);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isUsingSupabase, setIsUsingSupabase] = useState(false);

  const todayDate = useMemo(() => getTodayDateString(), []);

  // Initialize data: Check Supabase connection or load from localStorage
  useEffect(() => {
    let mounted = true;

    async function init() {
      const supabase = createClient();
      if (supabase) {
        try {
          const { data: profileData } = await supabase.from('profiles').select('*').limit(1).single();
          if (profileData && mounted) {
            setIsUsingSupabase(true);
            setProfile(profileData);
            // Fetch subjects
            const { data: subs } = await supabase.from('subjects').select('*');
            if (subs) setSubjects(subs);
            setIsLoaded(true);
            return;
          }
        } catch {
          // Supabase not reachable or unauthenticated, fall back to localStorage
        }
      }

      // LocalStorage mode (offline / initial demo)
      try {
        const storedProfile = localStorage.getItem(`${STORAGE_KEY_PREFIX}profile`);
        const storedSubjects = localStorage.getItem(`${STORAGE_KEY_PREFIX}subjects`);
        const storedTimetableVersion = localStorage.getItem(`${STORAGE_KEY_PREFIX}tt_version`);
        const storedTimetableEntries = localStorage.getItem(`${STORAGE_KEY_PREFIX}tt_entries`);
        const storedOccurrences = localStorage.getItem(`${STORAGE_KEY_PREFIX}occurrences`);
        const storedTasks = localStorage.getItem(`${STORAGE_KEY_PREFIX}tasks`);
        const storedAuditLogs = localStorage.getItem(`${STORAGE_KEY_PREFIX}audit_logs`);

        if (storedProfile) setProfile(JSON.parse(storedProfile));
        if (storedSubjects) setSubjects(JSON.parse(storedSubjects));
        if (storedTimetableVersion) setTimetableVersion(JSON.parse(storedTimetableVersion));
        if (storedTimetableEntries) setTimetableEntries(JSON.parse(storedTimetableEntries));
        if (storedTasks) setTasks(JSON.parse(storedTasks));
        if (storedAuditLogs) setAuditLogs(JSON.parse(storedAuditLogs));

        if (storedOccurrences) {
          const parsed = JSON.parse(storedOccurrences) as ClassOccurrence[];
          // Make sure today's occurrences exist
          const hasToday = parsed.some((o) => o.scheduled_date === todayDate);
          if (!hasToday) {
            const initialToday = generateInitialOccurrences().filter(
              (o) => o.scheduled_date === todayDate
            );
            const combined = [...parsed, ...initialToday];
            setOccurrences(combined);
            localStorage.setItem(`${STORAGE_KEY_PREFIX}occurrences`, JSON.stringify(combined));
          } else {
            setOccurrences(parsed);
          }
        } else {
          const initialOccs = generateInitialOccurrences();
          setOccurrences(initialOccs);
          localStorage.setItem(`${STORAGE_KEY_PREFIX}occurrences`, JSON.stringify(initialOccs));
        }
      } catch (err) {
        console.warn('LocalStorage unavailable, using in-memory state', err);
        setOccurrences(generateInitialOccurrences());
      }

      if (mounted) {
        setIsLoaded(true);
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [todayDate]);

  // Persist to localStorage whenever state changes in local mode
  const saveLocalState = useCallback(
    (
      newProfile = profile,
      newSubjects = subjects,
      newTtVersion = timetableVersion,
      newTtEntries = timetableEntries,
      newOccurrences = occurrences,
      newTasks = tasks,
      newAuditLogs = auditLogs
    ) => {
      if (typeof window === 'undefined') return;
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}profile`, JSON.stringify(newProfile));
        localStorage.setItem(`${STORAGE_KEY_PREFIX}subjects`, JSON.stringify(newSubjects));
        localStorage.setItem(`${STORAGE_KEY_PREFIX}tt_version`, JSON.stringify(newTtVersion));
        localStorage.setItem(`${STORAGE_KEY_PREFIX}tt_entries`, JSON.stringify(newTtEntries));
        localStorage.setItem(`${STORAGE_KEY_PREFIX}occurrences`, JSON.stringify(newOccurrences));
        localStorage.setItem(`${STORAGE_KEY_PREFIX}tasks`, JSON.stringify(newTasks));
        localStorage.setItem(`${STORAGE_KEY_PREFIX}audit_logs`, JSON.stringify(newAuditLogs));
      } catch (e) {
        console.error('Failed to save to localStorage:', e);
      }
    },
    [profile, subjects, timetableVersion, timetableEntries, occurrences, tasks, auditLogs]
  );

  // Compute Deterministic Stats for each subject
  const subjectStats = useMemo(() => {
    const statsMap: Record<string, SubjectStats> = {};

    for (const subject of subjects) {
      const subjectOccurrences = occurrences.filter((o) => o.subject_id === subject.id);
      statsMap[subject.id] = computeSubjectStats(subject, subjectOccurrences);
    }

    return statsMap;
  }, [subjects, occurrences]);

  // Compute overall attendance across all subjects
  const overallStats = useMemo(() => {
    let totalAttended = 0;
    let totalConducted = 0;

    for (const stats of Object.values(subjectStats)) {
      totalAttended += stats.totalAttended;
      totalConducted += stats.totalConducted;
    }

    const overallPercentage =
      totalConducted > 0 ? Math.round((totalAttended / totalConducted) * 10000) / 100 : 0;

    return {
      totalAttended,
      totalConducted,
      overallPercentage,
    };
  }, [subjectStats]);

  // Occurrences scheduled for today
  const todayOccurrences = useMemo(() => {
    return occurrences
      .filter((o) => o.scheduled_date === todayDate)
      .map((o) => {
        const sub = subjects.find((s) => s.id === o.subject_id);
        return { ...o, subject: sub };
      })
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [occurrences, todayDate, subjects]);

  // Action: Mark Attendance
  const markAttendance = useCallback(
    async (
      occurrenceId: string,
      newStatus: AttendanceStatus,
      correctionReason?: string
    ) => {
      const targetOcc = occurrences.find((o) => o.id === occurrenceId);
      if (!targetOcc) return;

      const oldStatus = targetOcc.status;
      const isCorrection = oldStatus !== 'PENDING' && oldStatus !== newStatus;

      const updatedOccurrences = occurrences.map((occ) => {
        if (occ.id === occurrenceId) {
          return {
            ...occ,
            status: newStatus,
            notes: correctionReason ? `${occ.notes ? occ.notes + ' | ' : ''}Correction: ${correctionReason}` : occ.notes,
          };
        }
        return occ;
      });

      const newAuditLog: AuditLogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        user_id: profile.id,
        entity_type: 'class_occurrence',
        entity_id: occurrenceId,
        action: isCorrection ? 'CORRECTION' : 'UPDATE',
        old_value: { status: oldStatus },
        new_value: { status: newStatus, correction_reason: correctionReason || null },
        created_at: new Date().toISOString(),
      };

      const updatedLogs = [newAuditLog, ...auditLogs];

      setOccurrences(updatedOccurrences);
      setAuditLogs(updatedLogs);
      saveLocalState(profile, subjects, timetableVersion, timetableEntries, updatedOccurrences, tasks, updatedLogs);
    },
    [occurrences, auditLogs, profile, subjects, timetableVersion, timetableEntries, tasks, saveLocalState]
  );

  // Action: Add Extra / Unscheduled Class
  const addExtraClass = useCallback(
    async (params: {
      subjectId: string;
      date: string;
      startTime: string;
      endTime: string;
      classType: ClassType;
      notes?: string;
    }): Promise<ClassOccurrence> => {
      const newOcc: ClassOccurrence = {
        id: `occ-extra-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        subject_id: params.subjectId,
        timetable_entry_id: null,
        scheduled_date: params.date,
        start_time: params.startTime,
        end_time: params.endTime,
        status: 'PENDING',
        notes: `[${params.classType}] ${params.notes || 'Unscheduled extra class'}`,
        created_at: new Date().toISOString(),
      };

      const updatedOccs = [newOcc, ...occurrences];
      const newAuditLog: AuditLogEntry = {
        id: `log-${Date.now()}`,
        user_id: profile.id,
        entity_type: 'class_occurrence',
        entity_id: newOcc.id,
        action: 'CREATE',
        old_value: null,
        new_value: { extra_class: true, subjectId: params.subjectId, date: params.date },
        created_at: new Date().toISOString(),
      };

      const updatedLogs = [newAuditLog, ...auditLogs];
      setOccurrences(updatedOccs);
      setAuditLogs(updatedLogs);
      saveLocalState(profile, subjects, timetableVersion, timetableEntries, updatedOccs, tasks, updatedLogs);
      return newOcc;
    },
    [occurrences, auditLogs, profile, subjects, timetableVersion, timetableEntries, tasks, saveLocalState]
  );

  // Action: Update Thresholds & Profile
  const updateProfileThreshold = useCallback(
    async (minAttendance: number, displayName?: string) => {
      const updatedProfile: Profile = {
        ...profile,
        default_min_attendance: minAttendance,
        display_name: displayName || profile.display_name,
        updated_at: new Date().toISOString(),
      };

      const updatedSubjects = subjects.map((sub) => ({
        ...sub,
        minimum_attendance_percentage: minAttendance,
      }));

      setProfile(updatedProfile);
      setSubjects(updatedSubjects);
      saveLocalState(updatedProfile, updatedSubjects, timetableVersion, timetableEntries, occurrences, tasks, auditLogs);
    },
    [profile, subjects, timetableVersion, timetableEntries, occurrences, tasks, auditLogs, saveLocalState]
  );

  // Action: Add Subject
  const addSubject = useCallback(
    async (params: {
      name: string;
      subject_code: string;
      semester: string;
      minimum_attendance_percentage: number;
      warning_margin?: number;
    }): Promise<Subject> => {
      const newSubject: Subject = {
        id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        user_id: profile.id,
        name: params.name,
        subject_code: params.subject_code.toUpperCase(),
        semester: params.semester,
        minimum_attendance_percentage: params.minimum_attendance_percentage,
        warning_margin: params.warning_margin ?? 3.0,
        is_active: true,
      };

      const updated = [...subjects, newSubject];
      setSubjects(updated);
      saveLocalState(profile, updated, timetableVersion, timetableEntries, occurrences, tasks, auditLogs);
      return newSubject;
    },
    [profile, subjects, timetableVersion, timetableEntries, occurrences, tasks, auditLogs, saveLocalState]
  );

  // Action: Task Management
  const addTask = useCallback(
    async (params: {
      title: string;
      description?: string;
      subject_id?: string | null;
      priority: Task['priority'];
      category: Task['category'];
      due_at?: string | null;
      estimated_minutes?: number;
    }): Promise<Task> => {
      const newTask: Task = {
        id: `tsk-${Date.now()}`,
        user_id: profile.id,
        title: params.title,
        description: params.description,
        subject_id: params.subject_id,
        priority: params.priority,
        category: params.category,
        due_at: params.due_at,
        estimated_minutes: params.estimated_minutes,
        status: 'TODO',
        created_at: new Date().toISOString(),
      };

      const updated = [newTask, ...tasks];
      setTasks(updated);
      saveLocalState(profile, subjects, timetableVersion, timetableEntries, occurrences, updated, auditLogs);
      return newTask;
    },
    [profile, subjects, timetableVersion, timetableEntries, occurrences, tasks, auditLogs, saveLocalState]
  );

  const toggleTask = useCallback(
    async (taskId: string) => {
      const updated = tasks.map((t) => {
        if (t.id === taskId) {
          const nextStatus = t.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
          return {
            ...t,
            status: nextStatus as Task['status'],
            completed_at: nextStatus === 'COMPLETED' ? new Date().toISOString() : null,
          };
        }
        return t;
      });
      setTasks(updated);
      saveLocalState(profile, subjects, timetableVersion, timetableEntries, occurrences, updated, auditLogs);
    },
    [tasks, profile, subjects, timetableVersion, timetableEntries, occurrences, auditLogs, saveLocalState]
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      const updated = tasks.filter((t) => t.id !== taskId);
      setTasks(updated);
      saveLocalState(profile, subjects, timetableVersion, timetableEntries, occurrences, updated, auditLogs);
    },
    [tasks, profile, subjects, timetableVersion, timetableEntries, occurrences, auditLogs, saveLocalState]
  );

  // Action: Timetable Entry Management
  const addTimetableEntry = useCallback(
    async (
      entry: Omit<TimetableEntry, 'id' | 'timetable_version_id'>
    ): Promise<TimetableEntry> => {
      const newEntry: TimetableEntry = {
        ...entry,
        id: `tte-${Date.now()}`,
        timetable_version_id: timetableVersion?.id || 'ttv-default',
      };
      const updated = [...timetableEntries, newEntry];
      setTimetableEntries(updated);
      saveLocalState(profile, subjects, timetableVersion, updated, occurrences, tasks, auditLogs);
      return newEntry;
    },
    [timetableEntries, timetableVersion, profile, subjects, occurrences, tasks, auditLogs, saveLocalState]
  );

  const deleteTimetableEntry = useCallback(
    async (entryId: string) => {
      const updated = timetableEntries.filter((e) => e.id !== entryId);
      setTimetableEntries(updated);
      saveLocalState(profile, subjects, timetableVersion, updated, occurrences, tasks, auditLogs);
    },
    [timetableEntries, profile, subjects, timetableVersion, occurrences, tasks, auditLogs, saveLocalState]
  );

  // Action: Export JSON
  const exportDataJson = useCallback(() => {
    const backup = {
      profile,
      subjects,
      timetableVersion,
      timetableEntries,
      occurrences,
      tasks,
      auditLogs,
      exportedAt: new Date().toISOString(),
      schemaVersion: '1.0.0',
    };
    return JSON.stringify(backup, null, 2);
  }, [profile, subjects, timetableVersion, timetableEntries, occurrences, tasks, auditLogs]);

  // Action: Reset Data
  const resetToDefaults = useCallback(() => {
    localStorage.clear();
    setProfile(INITIAL_PROFILE);
    setSubjects(INITIAL_SUBJECTS);
    setTimetableVersion(INITIAL_TIMETABLE_VERSION);
    setTimetableEntries(INITIAL_TIMETABLE_ENTRIES);
    const occs = generateInitialOccurrences();
    setOccurrences(occs);
    setTasks(INITIAL_TASKS);
    setAuditLogs(INITIAL_AUDIT_LOG);
  }, []);

  const value = useMemo(
    () => ({
      profile,
      subjects,
      timetableVersion,
      timetableEntries,
      occurrences,
      tasks,
      auditLogs,
      isLoaded,
      isUsingSupabase,
      todayDate,
      todayOccurrences,
      subjectStats,
      overallStats,
      markAttendance,
      addExtraClass,
      updateProfileThreshold,
      addSubject,
      addTask,
      toggleTask,
      deleteTask,
      addTimetableEntry,
      deleteTimetableEntry,
      exportDataJson,
      resetToDefaults,
    }),
    [
      profile,
      subjects,
      timetableVersion,
      timetableEntries,
      occurrences,
      tasks,
      auditLogs,
      isLoaded,
      isUsingSupabase,
      todayDate,
      todayOccurrences,
      subjectStats,
      overallStats,
      markAttendance,
      addExtraClass,
      updateProfileThreshold,
      addSubject,
      addTask,
      toggleTask,
      deleteTask,
      addTimetableEntry,
      deleteTimetableEntry,
      exportDataJson,
      resetToDefaults,
    ]
  );

  return (
    <StudentDataContext.Provider value={value}>
      {children}
    </StudentDataContext.Provider>
  );
}

export function useStudentData() {
  const context = useContext(StudentDataContext);
  if (!context) {
    throw new Error('useStudentData must be used within a StudentDataProvider');
  }
  return context;
}
