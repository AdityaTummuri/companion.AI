# Personal AI Student Companion

A private, cross-device academic productivity system and deterministic student management application built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL)**.

---

## 🚀 Key Features Built in Phase 1 & 2

### 1. Deterministic Attendance Engine (`src/lib/attendance-engine.ts`)
- **Zero Hallucination Arithmetic:** All attendance calculations, percentage aggregations, and safe margins are computed using pure TypeScript mathematical functions—never delegated to an LLM.
- **Rules & Formulas:**
  - Only `PRESENT` and `ABSENT` count toward total conducted ($T$).
  - `PRESENT` counts toward attended ($A$).
  - `CANCELLED`, `RESCHEDULED`, `PENDING`, and `NOT_APPLICABLE` do not increment $T$ or $A$.
  - Formula: $\text{Percentage} = \frac{A}{T} \times 100$
- **Health Classification:**
  - `SAFE`: $\ge M + W$ (e.g. $\ge 83\%$)
  - `NEAR_THRESHOLD`: $M \le \text{Percentage} < M + W$ (e.g. $[80\%, 83\%)$)
  - `BELOW_THRESHOLD`: $< M$ (e.g. $< 80\%$)
  - `INSUFFICIENT_DATA`: $T = 0$
- **Safe-to-Skip Margins:**
  $$y_{\max} = \left\lfloor \frac{100 \cdot A - M \cdot T}{M} \right\rfloor$$
- **Consecutive Recovery Requirement:**
  $$x_{\text{req}} = \left\lceil \frac{M \cdot T - 100 \cdot A}{100 - M} \right\rceil$$

### 2. Interactive "What-If" Scenario Simulator
- Test future attendance patterns in real-time.
- Move sliders for *"Attend next $X$ classes"* and *"Skip next $Y$ classes"* to view instant mathematical projections, delta shifts, safety margin warnings, and recovery steps.

### 3. Responsive Dual-Layout (Desktop & Mobile PWA)
- **Laptop Experience:** Full desktop sidebar with 7 routes, attendance progress bar, and user profile badge.
- **Mobile Experience:** Native bottom navigation bar with pending check-in badges and PWA manifest (`manifest.json`) for home-screen installation.

### 4. Daily Check-In Flow & Non-Destructive Corrections
- Displays today's recurring class occurrences based on the day of the week.
- One-tap check-in buttons: `Present`, `Absent`, `Cancelled`.
- **Audit Logging:** Editing an already submitted attendance record prompts for an optional correction reason and writes an immutable record to the `audit_log`.
- **Extra Classes:** Add unscheduled or makeup lectures and labs on the fly.

### 5. Timetable & Schedule Manager
- Structured weekly slot editor (Monday to Saturday).
- Configure subjects, class types (`LECTURE`, `LAB`, `TUTORIAL`, `EXTRA`), start/end times, and room numbers.
- Timetable updates define future occurrences without altering or deleting historical attendance records.

### 6. Academic & Personal Tasks
- Manage assignments, exam preparation, and personal academic goals.
- Filter by category (`ACADEMIC`, `ASSIGNMENT`, `EXAM`, `PERSONAL`) and priority (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).

### 7. Offline-Resilient Local Storage Fallback
- Works immediately out of the box with realistic engineering seed data (DSA, Operating Systems, DBMS, Computer Architecture, Discrete Math).
- Seamlessly connects to live Supabase backend when environment variables are supplied.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5.9
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Database:** Supabase (PostgreSQL with Row Level Security & Enums)
- **Testing:** Vitest 3.2 (100% test coverage for math engine)

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Unit Tests & Typecheck
```bash
npm test          # Run Vitest unit tests for attendance engine
npm run typecheck # Strict TypeScript validation
npm run build     # Production Next.js build
```

---

## 🗄️ Database Setup (Supabase)

1. Create a project in [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Paste and run the idempotent migration script from:
   ```text
   supabase/schema.sql
   ```
4. Copy your project URL and anon public key into `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

---

## 📁 Project Structure

```text
src/
├── app/
│   ├── layout.tsx                # PWA shell, Root layout & metadata
│   ├── page.tsx                  # Dashboard (Today's classes, Check-in, Health, Tasks)
│   ├── attendance/
│   │   └── page.tsx              # Subject cards, Attendance history, Audit log, Simulator
│   ├── timetable/
│   │   └── page.tsx              # Weekly schedule editor & Extra class creator
│   ├── tasks/
│   │   └── page.tsx              # Academic task manager with priorities & deadlines
│   ├── documents/
│   │   └── page.tsx              # Placeholder shell for Phase 4 Knowledge Base
│   ├── companion/
│   │   └── page.tsx              # Placeholder shell for Phase 4 BYOK AI Companion
│   ├── settings/
│   │   └── page.tsx              # Threshold config, Timezone, Data Export & Backup
│   └── api/
│       ├── checkin/route.ts      # POST/PATCH attendance records with audit logging
│       └── occurrences/route.ts  # Idempotent daily class occurrence generator
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx           # Desktop left navigation
│   │   └── BottomNav.tsx         # Mobile PWA bottom bar
│   ├── attendance/
│   │   ├── CheckInCard.tsx       # Daily check-in card with correction modal
│   │   ├── SubjectHealthCard.tsx # Subject health card with safe skips margin
│   │   └── WhatIfSimulator.tsx   # Interactive What-If slider simulator
│   └── timetable/
│       └── WeeklyGrid.tsx        # Structured schedule viewer & slot editor
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   └── server.ts             # Server Supabase client
│   ├── storage/
│   │   ├── data-store.tsx        # Unified state context & offline mock provider
│   │   └── mock-data.ts          # Realistic initial seed data
│   ├── attendance-engine.ts      # Pure deterministic math engine
│   └── types.ts                  # TypeScript interfaces matching PostgreSQL schema
└── supabase/
    └── schema.sql                # Complete PostgreSQL migration script
```

---

## 📄 License
MIT
