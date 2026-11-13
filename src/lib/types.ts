// ============================================================================
// Types for Personal AI Student Companion
// Strictly mirrors PostgreSQL schema & deterministic calculation interfaces
// ============================================================================

export type AttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'CANCELLED'
  | 'RESCHEDULED'
  | 'PENDING'
  | 'NOT_APPLICABLE';

export type ClassType = 'LECTURE' | 'LAB' | 'TUTORIAL' | 'EXTRA';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';

export type AttendanceHealthStatus =
  | 'SAFE'
  | 'NEAR_THRESHOLD'
  | 'BELOW_THRESHOLD'
  | 'INSUFFICIENT_DATA';

// Database Models

export interface Profile {
  id: string;
  display_name: string;
  timezone: string;
  default_min_attendance: number;
  created_at: string;
  updated_at: string;
}

export interface AttendancePolicy {
  count_cancelled?: boolean;
  period_weight?: number;
  [key: string]: unknown;
}

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  subject_code: string;
  semester: string;
  minimum_attendance_percentage: number; // e.g. 80.0
  warning_margin: number; // e.g. 3.0 -> triggers NEAR_THRESHOLD if within [min, min+margin)
  attendance_policy?: AttendancePolicy;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TimetableVersion {
  id: string;
  user_id: string;
  version_name: string;
  source_document_id?: string | null;
  effective_from: string; // YYYY-MM-DD
  effective_until?: string | null; // YYYY-MM-DD
  is_active: boolean;
  created_at?: string;
  approved_at?: string | null;
}

export interface TimetableEntry {
  id: string;
  timetable_version_id: string;
  subject_id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  start_time: string; // HH:MM or HH:MM:SS
  end_time: string; // HH:MM or HH:MM:SS
  class_type: ClassType;
  room?: string | null;
  is_active: boolean;
  created_at?: string;
  // Joined relation helper
  subject?: Subject;
}

export interface ClassOccurrence {
  id: string;
  subject_id: string;
  timetable_entry_id?: string | null;
  scheduled_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  status: AttendanceStatus;
  notes?: string | null;
  created_at?: string;
  // Joined relation helper
  subject?: Subject;
  attendance_record?: AttendanceRecord | null;
}

export interface AttendanceRecord {
  id: string;
  class_occurrence_id: string;
  subject_id: string;
  attendance_status: AttendanceStatus;
  recorded_at: string;
  updated_at: string;
  correction_reason?: string | null;
}

export interface Task {
  id: string;
  user_id: string;
  subject_id?: string | null;
  title: string;
  description?: string | null;
  category: 'ACADEMIC' | 'PERSONAL' | 'EXAM' | 'ASSIGNMENT';
  priority: TaskPriority;
  due_at?: string | null;
  estimated_minutes?: number | null;
  status: TaskStatus;
  completed_at?: string | null;
  created_at?: string;
  // Joined relation helper
  subject?: Subject;
}

export interface AuditLogEntry {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'CORRECTION';
  old_value?: Record<string, unknown> | null;
  new_value?: Record<string, unknown> | null;
  created_at: string;
}

export interface DocumentItem {
  id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  storage_provider: 'LOCAL' | 'GOOGLE_DRIVE' | 'SUPABASE';
  storage_reference?: string | null;
  document_category: 'SYLLABUS' | 'TIMETABLE' | 'NOTES' | 'ASSIGNMENT' | 'OTHER';
  processing_status: 'PENDING' | 'PROCESSED' | 'FAILED';
  uploaded_at: string;
}

export interface ReminderSettings {
  id: string;
  user_id: string;
  attendance_reminder_time: string; // HH:MM default "17:30"
  timezone: string;
  push_enabled: boolean;
  follow_up_enabled: boolean;
}

export interface AIProviderConfig {
  id: string;
  user_id: string;
  provider: 'OPENAI' | 'ANTHROPIC' | 'GEMINI' | 'GROQ' | 'OLLAMA';
  model: string;
  encrypted_key_reference?: string | null;
  is_enabled: boolean;
  is_primary: boolean;
}

// Deterministic Attendance Engine Types

export interface SubjectStats {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  totalConducted: number; // T: only PRESENT + ABSENT
  totalAttended: number; // A: only PRESENT
  totalCancelled: number; // CANCELLED
  totalPending: number; // PENDING
  percentage: number; // (A / T) * 100 or 0
  minimumRequired: number; // M (default 80.0)
  warningMargin: number; // W (default 3.0)
  healthStatus: AttendanceHealthStatus;
  maxConsecutiveSkips: number; // safe to skip without dipping below M
  classesNeededToRecover: number; // required consecutive attendances to reach M
}

export interface AttendanceSimulationInput {
  attended: number; // Current A
  conducted: number; // Current T
  attendNext: number; // x classes to attend
  missNext: number; // y classes to miss
  minimumRequired: number; // M
  warningMargin?: number; // W
}

export interface AttendanceSimulationResult {
  currentPercentage: number;
  projectedPercentage: number;
  delta: number; // projected - current
  conductedAfter: number;
  attendedAfter: number;
  statusAfterSimulation: AttendanceHealthStatus;
  maxSkipsAfterSimulation: number;
  classesToRecoverIfBelow: number;
  assumptions: string[];
}
