# Implementation Plan: Personal AI Student Companion (Phase 1 & 2 Core Structure)

**Target Agent:** Code Generation Model (Gemini)  
**Scope:** Phase 1 (Foundation) + Phase 2 (Deterministic Attendance MVP)  
**Primary Principle:** Build the reliable, deterministic student management system first. Do not build AI chat or Google Drive integration until the core attendance engine, timetable occurrences, and cross-device sync are 100% functional.

---

## 1. Tech Stack & Architecture Constraints

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS + Lucide React (icons)
- **Database & Auth:** Supabase (PostgreSQL + Supabase Auth for single-user private access)
- **App Type:** Progressive Web App (PWA) with `manifest.json` for mobile home-screen installation and responsive layout (Desktop sidebar / Mobile bottom navigation bar).
- **Core Rule:** All attendance percentages, safe-to-skip margins, and "What-If" projections **must** be calculated using deterministic TypeScript functions, never delegated to an LLM.

---

## 2. Directory Structure to Generate

```text
src/
├── app/
│   ├── layout.tsx                # Root layout with PWA metadata & responsive nav shell
│   ├── page.tsx                  # Dashboard (Today's classes, Check-in, Attendance health, Tasks)
│   ├── attendance/
│   │   └── page.tsx              # Subject cards, Attendance history, Audit log, What-If Simulator
│   ├── timetable/
│   │   └── page.tsx              # Weekly structured schedule editor & One-off/Extra class creator
│   ├── tasks/
│   │   └── page.tsx              # Academic & personal task manager
│   ├── documents/
│   │   └── page.tsx              # Placeholder shell for Phase 4 Academic Knowledge Base
│   ├── companion/
│   │   └── page.tsx              # Placeholder shell for Phase 4 BYOK AI Companion
│   ├── settings/
│   │   └── page.tsx              # Threshold config (default 80%), Timezone, Data Export/Backup
│   └── api/
│       ├── checkin/route.ts      # POST/PATCH attendance records with audit logging
│       └── occurrences/route.ts  # Idempotent daily class occurrence generator
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx           # Laptop navigation
│   │   └── BottomNav.tsx         # Phone PWA navigation
│   ├── attendance/
│   │   ├── CheckInCard.tsx       # Quick daily check-in (Present, Absent, Cancelled, Rescheduled)
│   │   ├── SubjectHealthCard.tsx # Subject card with status badge & safe-to-skip counter
│   │   └── WhatIfSimulator.tsx   # Interactive slider/input for projecting future absences/attendances
│   └── timetable/
│       └── WeeklyGrid.tsx        # Structured timetable viewer & manual slot editor
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   └── server.ts             # Server Supabase client
│   ├── attendance-engine.ts      # Deterministic math engine & What-If simulator
│   └── types.ts                  # Strict TypeScript interfaces matching PostgreSQL schema
└── supabase/
    └── schema.sql                # Complete PostgreSQL migration script
```

---

## 3. Database Schema (`supabase/schema.sql`)

Write a clean, idempotent SQL migration script with the following enums and tables:

### Enums
- `attendance_status`: `'PRESENT' | 'ABSENT' | 'CANCELLED' | 'RESCHEDULED' | 'PENDING' | 'NOT_APPLICABLE'`
- `class_type`: `'LECTURE' | 'LAB' | 'TUTORIAL' | 'EXTRA'`
- `task_priority`: `'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'`
- `task_status`: `'TODO' | 'IN_PROGRESS' | 'COMPLETED'`

### Tables
1. **`profiles`**: `id` (UUID, PK), `display_name`, `timezone` (default `'Asia/Kolkata'`), `default_min_attendance` (numeric, default `80.0`), `created_at`, `updated_at`.
2. **`subjects`**: `id` (UUID, PK), `user_id` (FK), `name`, `subject_code`, `semester`, `minimum_attendance_percentage` (numeric, default `80.0`), `warning_margin` (numeric, default `3.0`), `attendance_policy` (JSONB for period weightage), `is_active` (boolean).
3. **`timetable_versions`**: `id` (UUID, PK), `user_id` (FK), `version_name`, `effective_from` (date), `effective_until` (date, nullable), `is_active` (boolean), `created_at`, `approved_at`.
4. **`timetable_entries`**: `id` (UUID, PK), `timetable_version_id` (FK), `subject_id` (FK), `day_of_week` (int `0-6`), `start_time` (time), `end_time` (time), `class_type`, `room`, `is_active` (boolean).
5. **`class_occurrences`**: `id` (UUID, PK), `subject_id` (FK), `timetable_entry_id` (FK, nullable for extra/makeup classes), `scheduled_date` (date), `start_time` (time), `end_time` (time), `status` (`attendance_status`, default `'PENDING'`), `notes` (text).
   - *Constraint:* Unique constraint on `(timetable_entry_id, scheduled_date)` where `timetable_entry_id IS NOT NULL` to prevent duplicate generation.
6. **`attendance_records`**: `id` (UUID, PK), `class_occurrence_id` (FK, UNIQUE), `subject_id` (FK), `attendance_status`, `recorded_at`, `updated_at`, `correction_reason` (text, nullable).
7. **`tasks`**: `id` (UUID, PK), `user_id` (FK), `subject_id` (FK, nullable), `title`, `description`, `category`, `priority`, `due_at` (timestamptz), `estimated_minutes` (int), `status`, `completed_at`.
8. **`audit_log`**: `id` (UUID, PK), `user_id` (FK), `entity_type`, `entity_id`, `action`, `old_value` (JSONB), `new_value` (JSONB), `created_at`.

---

## 4. Deterministic Attendance Engine (`src/lib/attendance-engine.ts`)

Implement pure, unit-testable TypeScript functions for all attendance calculations:

1. **Core Calculation:**
   - Only `PRESENT` and `ABSENT` count toward `conducted` ($T$).
   - `PRESENT` counts toward `attended` ($A$).
   - `CANCELLED`, `RESCHEDULED`, `PENDING`, and `NOT_APPLICABLE` **do not** increment $T$ or $A$.
   - Formula:
     $$\text{Percentage} = \begin{cases} 0 & \text{if } T = 0 \\ \left(\frac{A}{T}\right) \times 100 & \text{if } T > 0 \end{cases}$$

2. **Status Classification:**
   - Given target threshold $M$ (e.g., $80\%$) and warning margin $W$ (e.g., $3\%$):
     - `INSUFFICIENT_DATA` if $T = 0$
     - `BELOW_THRESHOLD` if $\text{Percentage} < M$
     - `NEAR_THRESHOLD` if $M \le \text{Percentage} < (M + W)$
     - `SAFE` if $\text{Percentage} \ge (M + W)$

3. **Safe-to-Skip / Classes Needed to Recover:**
   - **Max Consecutive Skips ($y_{\max}$)** when $\text{Percentage} \ge M$:
     $$y_{\max} = \left\lfloor \frac{100 \cdot A - M \cdot T}{M} \right\rfloor$$
   - **Required Consecutive Attendances ($x_{\text{req}}$)** when $\text{Percentage} < M$:
     $$x_{\text{req}} = \left\lceil \frac{M \cdot T - 100 \cdot A}{100 - M} \right\rceil$$

4. **"What-If" Scenario Simulator (`simulateAttendance`):**
   - Inputs: `attended` ($A$), `conducted` ($T$), `attendNext` ($x$), `missNext` ($y$), `minimumRequired` ($M$).
   - Projected Percentage:
     $$\text{Projected} = \left(\frac{A + x}{T + x + y}\right) \times 100$$
   - Returns: `currentPercentage`, `projectedPercentage`, `delta`, `statusAfterSimulation`, `classesToRecoverIfBelow`, and explicit `assumptions` array.

---

## 5. Key UI Workflows to Build in This Step

1. **Responsive App Shell:**
   - **Desktop:** Left sidebar with 7 routes (`Dashboard`, `Attendance`, `Timetable`, `Tasks`, `Documents`, `AI Companion`, `Settings`).
   - **Mobile:** Bottom navigation bar with the primary 5 routes (`Dashboard`, `Attendance`, `Timetable`, `Tasks`, `Settings`) + quick action button.
2. **Daily Check-In Flow (Dashboard):**
   - Displays today's `class_occurrences` generated from the active `timetable_version`.
   - One-tap buttons per class: `Present`, `Absent`, `Cancelled`, plus an `"Add Extra Class"` modal for unscheduled makeup classes.
   - Editing an already submitted record prompts for an optional `correction_reason` and writes an entry to `audit_log`.
3. **Interactive "What-If" Simulator (Attendance Page):**
   - Select any subject -> adjust sliders for *"If I attend next $X$ classes"* and *"If I skip next $Y$ classes"* -> view real-time deterministic recalculation, safety margin warning, and recovery steps.
4. **Offline-Resilient Mock / Seed Mode:**
   - Provide a local state fallback or initial seed data (e.g., 5 sample engineering subjects, a weekly timetable, and today's pending check-in classes) so the UI can be immediately tested and reviewed before connecting live Supabase credentials.

---

## 6. Build Instructions for the Model

1. **Start with `src/lib/types.ts` and `src/lib/attendance-engine.ts`** to lock in the data structures and math formulas.
2. **Provide `supabase/schema.sql`** so the database can be initialized in one run.
3. **Build the UI shell and pages** using clean, high-contrast dark/light mode Tailwind styling optimized for both a 5:30 PM mobile check-in and a laptop planning session.
4. **Keep Phase 3 & 4 Modular:** Leave clean hooks/interfaces for `propose_timetable_update` and BYOK AI tool-calling (`get_attendance_summary`, `simulate_absences`), but do not hardcode any external LLM dependencies into the core attendance flow.