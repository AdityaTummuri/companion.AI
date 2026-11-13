# 🎓 Personal AI Student Companion

[![Next.js 15](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4.0-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Tests-100%25%20Passing-brightgreen?style=flat-square&logo=vitest)](https://vitest.dev/)
[![PWA](https://img.shields.io/badge/PWA-Ready-orange?style=flat-square&logo=pwa)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

> **Core Product Principle:**  
> *Build the reliable, deterministic student management system first. Make it intelligent second.*  
> All attendance calculations, percentage aggregations, safe-to-skip margins, and "What-If" projections are powered by **deterministic TypeScript functions**—zero LLM math hallucinations.

---

## 📑 Table of Contents

- [Vision & Architecture](#-vision--architecture)
- [The Deterministic Attendance Engine](#-the-deterministic-attendance-engine)
  - [Formulas & Mathematics](#formulas--mathematics)
  - [Health Status Classification](#health-status-classification)
  - [Safe-to-Skip & Recovery Derivations](#safe-to-skip--recovery-derivations)
- [Key Modules & UI Walkthrough](#-key-modules--ui-walkthrough)
  - [1. Dashboard (Daily Check-in & Health)](#1-dashboard-daily-check-in--health)
  - [2. Interactive "What-If" Scenario Simulator](#2-interactive-what-if-scenario-simulator)
  - [3. Timetable & Schedule Manager](#3-timetable--schedule-manager)
  - [4. Academic & Personal Task Tracker](#4-academic--personal-task-tracker)
  - [5. Audit Log & Non-Destructive Corrections](#5-audit-log--non-destructive-corrections)
  - [6. Offline-Resilient Local Storage Fallback](#6-offline-resilient-local-storage-fallback)
- [Database Schema & Supabase Setup](#-database-schema--supabase-setup)
- [BYOK AI Companion (Phase 4 Roadmap)](#-byok-ai-companion-phase-4-roadmap)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Development & Production Commands](#development--production-commands)
- [Verification & Quality Assurance](#-verification--quality-assurance)
- [License](#-license)

---

## 🏛️ Vision & Architecture

The **Personal AI Student Companion** is a private, cross-device academic productivity system. It bridges a student's daily routine across laptop and mobile with instant synchronisation:

```
                  ┌────────────────────────────────────────────────────────┐
                  │           Progressive Web App (PWA) Shell              │
                  ├────────────────────────────┬───────────────────────────┤
                  │     Laptop Experience      │     Mobile Experience     │
                  │   Full Desktop Sidebar     │  Native Bottom Nav Bar    │
                  │ 7 Navigation Destinations  │   5 Primary Quick Routes  │
                  └─────────────┬──────────────┴─────────────┬─────────────┘
                                │                            │
                                └──────────────┬─────────────┘
                                               │
               ┌───────────────────────────────┴───────────────────────────────┐
               │              Deterministic TypeScript Engine                  │
               │  • Pure Math Attendance Formulas     • Zero LLM Calculations  │
               │  • Safe-to-Skip Bounds (floor)       • Recovery Bounds (ceil) │
               │  • "What-If" Scenario Projections    • Immutable Audit Logger │
               └───────────────┬───────────────────────────────┬───────────────┘
                               │                               │
            ┌──────────────────┴────────────────┐     ┌────────┴─────────────────┐
            │   Live Supabase PostgreSQL        │     │  Offline Local Fallback  │
            │   (Cloud Auth, Tables, RLS,       │ <-> │  (Full browser demo seed │
            │    Idempotent SQL Migration)      │     │   storage without setup) │
            └───────────────────────────────────┘     └──────────────────────────┘
```

---

## 🧮 The Deterministic Attendance Engine

Located at `src/lib/attendance-engine.ts`, this pure TypeScript module executes all calculations without network overhead, latency, or rounding errors.

### Formulas & Mathematics

1. **Total Conducted Classes ($T$):**  
   Only `PRESENT` and `ABSENT` increment the conducted total:
   $$T = N_{\text{PRESENT}} + N_{\text{ABSENT}}$$
   `CANCELLED`, `RESCHEDULED`, `PENDING`, and `NOT_APPLICABLE` **never** increment $T$ or penalise the student.

2. **Total Attended Classes ($A$):**  
   Only `PRESENT` records count towards attended sessions:
   $$A = N_{\text{PRESENT}}$$

3. **Attendance Percentage:**  
   $$\text{Percentage} = \begin{cases} 0\% & \text{if } T = 0 \\ \left(\frac{A}{T}\right) \times 100 & \text{if } T > 0 \end{cases}$$

---

### Health Status Classification

Given a target minimum threshold $M$ (e.g. $80.0\%$) and warning margin $W$ (e.g. $3.0\%$):

| Health Status | Mathematical Condition | UI Color Indicator | Student Meaning |
| :--- | :--- | :--- | :--- |
| `SAFE` | $\text{Percentage} \ge (M + W)$ | 🟢 Emerald | Attendance is well above requirement; safe to miss classes. |
| `NEAR_THRESHOLD` | $M \le \text{Percentage} < (M + W)$ | 🟡 Amber | Danger zone; student is within $3\%$ of dropping below $M\%$. |
| `BELOW_THRESHOLD` | $\text{Percentage} < M$ | 🔴 Rose | Deficit; student must attend upcoming classes consecutively. |
| `INSUFFICIENT_DATA`| $T = 0$ | ⚪ Slate | No classes conducted yet; threshold is displayed as baseline. |

---

### Safe-to-Skip & Recovery Derivations

#### 1. Maximum Consecutive Skips ($y_{\max}$)
When $\text{Percentage} \ge M$, how many consecutive upcoming classes $y$ can the student miss before dropping below $M\%$?

$$\frac{A}{T + y} \ge \frac{M}{100} \implies 100 \cdot A \ge M \cdot T + M \cdot y \implies y \le \frac{100 \cdot A - M \cdot T}{M}$$

Because skips must be discrete whole classes:
$$y_{\max} = \left\lfloor \frac{100 \cdot A - M \cdot T}{M} \right\rfloor$$

#### 2. Required Consecutive Attendances ($x_{\text{req}}$)
When $\text{Percentage} < M$, how many consecutive upcoming classes $x$ must the student attend without missing any to restore $\ge M\%$?

$$\frac{A + x}{T + x} \ge \frac{M}{100} \implies 100 \cdot (A + x) \ge M \cdot (T + x) \implies (100 - M) \cdot x \ge M \cdot T - 100 \cdot A$$

Because attendances must be discrete whole classes:
$$x_{\text{req}} = \left\lceil \frac{M \cdot T - 100 \cdot A}{100 - M} \right\rceil$$

---

## 💻 Key Modules & UI Walkthrough

### 1. Dashboard (Daily Check-in & Health)
- **Today's Classes:** Automatically resolves today's timetable slots by day-of-week and renders one-tap check-in buttons (`Present`, `Absent`, `Cancelled`).
- **Extra Class Creator:** Add unscheduled or makeup lectures and labs on the fly.
- **Overall Attendance Bar:** Displays aggregate percentage across all subjects against the global threshold.
- **Task Overview:** Quick priority view of immediate academic deadlines.

### 2. Interactive "What-If" Scenario Simulator
- Select any subject to project future attendance trajectories.
- **Dual Sliders:** Adjust *"Attend next $X$ classes"* and *"Skip next $Y$ classes"*.
- **Real-Time Projection:**
  $$\text{Projected \%} = \left(\frac{A + X}{T + X + Y}\right) \times 100$$
- Visualises delta shift (e.g. `+3.33%` or `-7.27%`), new health status, remaining safe skips, or classes needed to recover if dropped below threshold.
- Explicitly lists all mathematical assumptions used in the projection.

### 3. Timetable & Schedule Manager
- **Weekly Structured Grid:** View and edit recurring classes across Monday through Saturday.
- **Class Types:** Classifies slots as `LECTURE`, `LAB`, `TUTORIAL`, or `EXTRA`.
- **Non-Destructive Principle:** Updating or deleting timetable slots applies strictly to future occurrences and does not alter historical attendance records.

### 4. Academic & Personal Task Tracker
- Organize coursework, coding assignments, exam preparation, and personal items.
- Filter by Category (`ACADEMIC`, `ASSIGNMENT`, `EXAM`, `PERSONAL`) and Priority (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- Estimated completion time and due date tracking.

### 5. Audit Log & Non-Destructive Corrections
- Correcting an already submitted attendance status prompts for an optional correction reason.
- Every modification is written to `audit_log` capturing `old_value`, `new_value`, user ID, entity ID, and timestamp.

### 6. Offline-Resilient Local Storage Fallback
- Runs **instantly out-of-the-box** without requiring live Supabase credentials.
- Seeded with realistic Computer Science Engineering courses:
  - `CS301` — Data Structures & Algorithms ($88.9\%$, Safe Margin)
  - `CS303` — Operating Systems ($80.0\%$, Near Threshold)
  - `CS304` — Database Management Systems ($73.3\%$, Deficit / Recovery Needed)
  - `CS302` — Computer Organization & Architecture ($87.5\%$, Safe Margin)
  - `MA301` — Discrete Mathematics ($85.7\%$, Safe Margin)

---

## 🗄️ Database Schema & Supabase Setup

The database schema is fully defined and idempotent in [`supabase/schema.sql`](supabase/schema.sql).

### Key Entities
```
┌──────────────┐       1:N       ┌──────────────┐
│   profiles   │────────────────<│   subjects   │
└──────┬───────┘                 └──────┬───────┘
       │                                │
       │ 1:N                            │ 1:N
       v                                v
┌─────────────────────┐          ┌───────────────────────┐
│ timetable_versions  │───1:N───<│   timetable_entries   │
└─────────────────────┘          └──────────┬────────────┘
                                            │ 1:N (optional)
                                            v
                                 ┌───────────────────────┐
                                 │   class_occurrences   │
                                 └──────────┬────────────┘
                                            │ 1:1
                                            v
                                 ┌───────────────────────┐
                                 │  attendance_records   │
                                 └───────────────────────┘
```

### Security & Integrity
- **Unique Constraint:** `(timetable_entry_id, scheduled_date)` prevents duplicate occurrence generation on the same day.
- **Row Level Security (RLS):** Policies enforce that users can access only their own records (`auth.uid() = user_id`).
- **Enums:** Strongly typed PostgreSQL enums for `attendance_status`, `class_type`, `task_priority`, and `task_status`.

---

## 🤖 BYOK AI Companion (Phase 4 Roadmap)

The companion architecture reserves a dedicated boundary for AI. The model never guesses or hallucinates attendance mathematics. Instead, it interacts via deterministic tool schemas:

```typescript
// Tool 1: Inspect verified statistics
get_attendance_summary({ subject_id?: string })

// Tool 2: Simulate future scenarios
simulate_absences({ subject_id: string, attend_next: number, miss_next: number })

// Tool 3: Propose schedule updates
propose_timetable_update({ raw_text: string, image_url?: string })
```

Supported BYOK (Bring-Your-Own-Key) providers include **Gemini 2.5 Flash**, **OpenAI GPT-4o-mini**, **Groq Llama 3**, and local **Ollama**. If AI providers are unavailable, the core application remains 100% operational.

---

## 📂 Project Directory Structure

```text
companion/
├── docs/
│   ├── personal_ai_student_companion_blueprint.md   # Architectural blueprint
│   └── personal_ai_student_companion_build_plan.md   # Phased execution plan
├── public/
│   ├── icon.svg                                     # Maskable vector app icon
│   └── manifest.json                                # PWA manifest specification
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── checkin/route.ts                     # Attendance check-in & audit API
│   │   │   └── occurrences/route.ts                 # Idempotent occurrence generator
│   │   ├── attendance/page.tsx                      # Subject health & audit hub
│   │   ├── companion/page.tsx                       # Phase 4 AI Companion shell
│   │   ├── documents/page.tsx                       # Phase 4 Knowledge base shell
│   │   ├── settings/page.tsx                        # Thresholds & JSON backup
│   │   ├── tasks/page.tsx                           # Academic & personal tasks
│   │   ├── timetable/page.tsx                       # Schedule viewer & editor
│   │   ├── globals.css                              # Tailwind v4 styles
│   │   ├── layout.tsx                               # Responsive shell & providers
│   │   └── page.tsx                                 # Today's check-in dashboard
│   ├── components/
│   │   ├── attendance/
│   │   │   ├── CheckInCard.tsx                      # Daily class check-in card
│   │   │   ├── SubjectHealthCard.tsx                # Subject status & safe skips card
│   │   │   └── WhatIfSimulator.tsx                  # Interactive scenario slider
│   │   ├── layout/
│   │   │   ├── BottomNav.tsx                        # Mobile PWA bottom bar
│   │   │   └── Sidebar.tsx                          # Desktop left navigation
│   │   └── timetable/
│   │       └── WeeklyGrid.tsx                       # Weekly timetable schedule grid
│   └── lib/
│       ├── __tests__/
│       │   └── attendance-engine.test.ts            # Vitest unit test suite (17 tests)
│       ├── storage/
│       │   ├── data-store.tsx                       # Reactive context & state provider
│       │   └── mock-data.ts                         # Realistic engineering seed dataset
│       ├── supabase/
│       │   ├── client.ts                            # Browser Supabase client
│       │   └── server.ts                            # Server Supabase client
│       ├── attendance-engine.ts                     # Pure mathematical calculation engine
│       └── types.ts                                 # Strict TypeScript domain interfaces
├── supabase/
│   └── schema.sql                                   # Production PostgreSQL migration
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js:** `v20.0.0` or later (`v24+` recommended)
- **npm:** `v10+` or `v11+`

### Installation

```bash
# Clone the repository
git clone https://github.com/AdityaTummuri/companion.git
cd companion

# Install dependencies
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your Supabase project credentials (optional for local mock mode):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Development & Production Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server at [http://localhost:3000](http://localhost:3000) |
| `npm test` | Runs the Vitest test suite for deterministic math functions |
| `npm run typecheck` | Validates strict TypeScript compilation (`tsc --noEmit`) |
| `npm run build` | Builds the optimized production application |
| `npm start` | Runs the production build server |

---

## ✅ Verification & Quality Assurance

All core requirements from the specification have been verified:

- [x] **Mathematical Accuracy:** 17 Vitest unit tests covering zero conducted classes, 100% threshold limits, float rounding, skip boundaries, recovery counts, and multi-scenario projections.
- [x] **Strict Type Safety:** Zero TypeScript errors across all routes, components, and server actions.
- [x] **Production Bundle:** Static page generation and dynamic API route compilation validated with Next.js 15.
- [x] **PWA Installability:** Configured with `manifest.json`, theme colors, and vector icon assets.
- [x] **Zero-Loss Data Safety:** Every attendance edit requires a reason and generates a timestamped entry in the audit log.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
