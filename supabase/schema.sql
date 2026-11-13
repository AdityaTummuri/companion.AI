-- ============================================================================
-- Supabase PostgreSQL Migration Script
-- Personal AI Student Companion (Phase 1 & Phase 2 Core + Phase 3/4 Schema)
-- Idempotent, robust, RLS-ready migration
-- ============================================================================

-- 1. ENUMS (Created safely if not already existing)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status') THEN
        CREATE TYPE attendance_status AS ENUM (
            'PRESENT',
            'ABSENT',
            'CANCELLED',
            'RESCHEDULED',
            'PENDING',
            'NOT_APPLICABLE'
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'class_type') THEN
        CREATE TYPE class_type AS ENUM (
            'LECTURE',
            'LAB',
            'TUTORIAL',
            'EXTRA'
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
        CREATE TYPE task_priority AS ENUM (
            'LOW',
            'MEDIUM',
            'HIGH',
            'CRITICAL'
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
        CREATE TYPE task_status AS ENUM (
            'TODO',
            'IN_PROGRESS',
            'COMPLETED'
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'storage_provider') THEN
        CREATE TYPE storage_provider AS ENUM (
            'LOCAL',
            'GOOGLE_DRIVE',
            'SUPABASE'
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_category') THEN
        CREATE TYPE document_category AS ENUM (
            'SYLLABUS',
            'TIMETABLE',
            'NOTES',
            'ASSIGNMENT',
            'OTHER'
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'processing_status') THEN
        CREATE TYPE processing_status AS ENUM (
            'PENDING',
            'PROCESSED',
            'FAILED'
        );
    END IF;
END $$;

-- 2. TABLES

-- Profiles Table (Single user private settings)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name TEXT NOT NULL DEFAULT 'Student',
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    default_min_attendance NUMERIC(5, 2) NOT NULL DEFAULT 80.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subject_code TEXT NOT NULL,
    semester TEXT NOT NULL DEFAULT '1',
    minimum_attendance_percentage NUMERIC(5, 2) NOT NULL DEFAULT 80.00,
    warning_margin NUMERIC(5, 2) NOT NULL DEFAULT 3.00,
    attendance_policy JSONB NOT NULL DEFAULT '{"count_cancelled": false, "period_weight": 1.0}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Timetable Versions
CREATE TABLE IF NOT EXISTS timetable_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    version_name TEXT NOT NULL,
    source_document_id UUID NULL,
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_until DATE NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    approved_at TIMESTAMPTZ NULL
);

-- Timetable Entries (Recurring template)
CREATE TABLE IF NOT EXISTS timetable_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timetable_version_id UUID NOT NULL REFERENCES timetable_versions(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 1=Monday... 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    class_type class_type NOT NULL DEFAULT 'LECTURE',
    room TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Class Occurrences (Actual scheduled occurrence on a specific date)
CREATE TABLE IF NOT EXISTS class_occurrences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    timetable_entry_id UUID NULL REFERENCES timetable_entries(id) ON DELETE SET NULL,
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status attendance_status NOT NULL DEFAULT 'PENDING',
    notes TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Prevent duplicate occurrence generation for the same recurring slot on the same day
CREATE UNIQUE INDEX IF NOT EXISTS uq_occurrence_entry_date 
ON class_occurrences (timetable_entry_id, scheduled_date) 
WHERE timetable_entry_id IS NOT NULL;

-- Attendance Records (Audit trail of marked attendance)
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_occurrence_id UUID NOT NULL UNIQUE REFERENCES class_occurrences(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    attendance_status attendance_status NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    correction_reason TEXT NULL
);

-- Tasks & Deadlines
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    subject_id UUID NULL REFERENCES subjects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NULL,
    category TEXT NOT NULL DEFAULT 'ACADEMIC',
    priority task_priority NOT NULL DEFAULT 'MEDIUM',
    due_at TIMESTAMPTZ NULL,
    estimated_minutes INTEGER NULL,
    status task_status NOT NULL DEFAULT 'TODO',
    completed_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Academic Documents (Phase 4 knowledge base)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    storage_provider storage_provider NOT NULL DEFAULT 'LOCAL',
    storage_reference TEXT NULL,
    document_category document_category NOT NULL DEFAULT 'OTHER',
    processing_status processing_status NOT NULL DEFAULT 'PENDING',
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Reminder Settings
CREATE TABLE IF NOT EXISTS reminder_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    attendance_reminder_time TIME NOT NULL DEFAULT '17:30',
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    push_enabled BOOLEAN NOT NULL DEFAULT true,
    follow_up_enabled BOOLEAN NOT NULL DEFAULT true
);

-- AI Provider Configs (BYOK API keys reference)
CREATE TABLE IF NOT EXISTS ai_provider_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    encrypted_key_reference TEXT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    is_primary BOOLEAN NOT NULL DEFAULT false
);

-- Audit Log (Immutable record of changes & corrections)
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action TEXT NOT NULL,
    old_value JSONB NULL,
    new_value JSONB NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_class_occurrences_date_subject ON class_occurrences (scheduled_date, subject_id);
CREATE INDEX IF NOT EXISTS idx_class_occurrences_status ON class_occurrences (status);
CREATE INDEX IF NOT EXISTS idx_attendance_records_subject ON attendance_records (subject_id);
CREATE INDEX IF NOT EXISTS idx_timetable_entries_version ON timetable_entries (timetable_version_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks (user_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log (entity_type, entity_id);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_occurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_provider_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Allow users to manage only their own records
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can access own profile') THEN
        CREATE POLICY "Users can access own profile" ON profiles FOR ALL USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can access own subjects') THEN
        CREATE POLICY "Users can access own subjects" ON subjects FOR ALL USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can access own timetable versions') THEN
        CREATE POLICY "Users can access own timetable versions" ON timetable_versions FOR ALL USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can access own tasks') THEN
        CREATE POLICY "Users can access own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can access own documents') THEN
        CREATE POLICY "Users can access own documents" ON documents FOR ALL USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can access own reminder settings') THEN
        CREATE POLICY "Users can access own reminder settings" ON reminder_settings FOR ALL USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can access own ai configs') THEN
        CREATE POLICY "Users can access own ai configs" ON ai_provider_configs FOR ALL USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can access own audit logs') THEN
        CREATE POLICY "Users can access own audit logs" ON audit_log FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;
