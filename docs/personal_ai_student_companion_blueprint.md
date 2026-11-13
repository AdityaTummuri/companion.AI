# Personal AI Student Companion

## Product Vision, Requirements and Technical Blueprint

**Document type:** Product concept and implementation blueprint\
**Project scope:** Personal-use application for one user\
**Primary goal:** Build a free-to-run, cross-device AI companion whose
first and most reliable capability is managing college attendance.

------------------------------------------------------------------------

# 1. Product Overview

The Personal AI Student Companion is a private productivity application
designed around a student's academic life. It combines:

-   A reliable attendance manager.
-   An intelligent timetable manager that can interpret timetable
    changes.
-   A task and deadline manager.
-   An AI assistant that can understand the user's academic documents
    and personal workflow.
-   Proactive reminders and daily check-ins.
-   Synchronisation between a laptop and a phone.
-   Bring Your Own Key (BYOK) support for AI providers.

The application should feel like a companion that understands the user's
academic context and helps them stay organised. It should not be merely
a chatbot with an attendance calculator attached.

The app is initially intended for one person's private use. It does not
need public user registration, public profiles, a marketplace,
multi-tenant administration, or commercial-scale infrastructure.

## Product principle

**Deterministic systems should handle facts and calculations; AI should
handle interpretation, conversation and assistance.**

For example, the attendance calculation engine must calculate
percentages and safe-to-skip scenarios using code. The AI may explain
those results in natural language, but must not invent or independently
calculate authoritative attendance figures.

------------------------------------------------------------------------

# 2. Product Goals

## Primary goals

1.  Record attendance accurately for every subject.
2.  Track attendance against a configurable minimum threshold, initially
    80%.
3.  Understand the current timetable and future timetable changes.
4.  Let the user record attendance quickly from either phone or laptop.
5.  Keep all data synchronised across devices.
6.  Send a daily attendance check-in reminder, preferably around
    5:00--6:00 PM.
7.  Allow the user to upload a curriculum PDF and other academic
    documents.
8.  Provide an AI assistant that can answer questions using the user's
    own data and documents.
9.  Manage assignments, lab work, exams, personal tasks and deadlines.
10. Keep recurring costs as close to ₹0 as possible.

## Secondary goals

-   Predict attendance outcomes under different scenarios.
-   Produce daily briefings and weekly reviews.
-   Remember user preferences and ongoing projects.
-   Support multiple AI providers through BYOK.
-   Allow export and backup of personal data.

## Non-goals for the first release

-   Public launch or multi-user social features.
-   Paid subscription infrastructure.
-   Native iOS and Android applications.
-   Automated attendance collection from college systems.
-   Automatic submission to a college portal.
-   Unverified WhatsApp automation or paid voice-call integrations.
-   An AI agent that silently changes academic records.

------------------------------------------------------------------------

# 3. Target Experience: One App on Laptop and Phone

The initial product should be a **Progressive Web App (PWA)**.

A PWA is a responsive web application that can be opened in a browser
and installed on a compatible phone or desktop.

### Laptop experience

-   Full dashboard.
-   Timetable and calendar editing.
-   Attendance analytics.
-   Document uploads and review.
-   Task planning.
-   AI chat and settings.

### Phone experience

-   Quick attendance check-in.
-   Daily reminders and notifications.
-   Today's timetable.
-   Task completion.
-   AI chat.
-   Quick access from the home screen.

### Synchronisation

Both devices use the same account and backend database.

Example:

1.  The user marks a class as attended on the phone.
2.  The phone sends the change to the backend.
3.  The backend saves the attendance record.
4.  The laptop dashboard retrieves or receives the update.
5.  Both devices display the same attendance figures.

The backend database is the source of truth. Local browser storage may
be used for caching or temporary offline drafts, but it must not become
a competing source of truth.

------------------------------------------------------------------------

# 4. Main Modules

## 4.1 Dashboard

The dashboard is the application's home screen.

It should show:

-   Today's date and day.
-   Today's scheduled classes.
-   Attendance check-in status.
-   Overall attendance summary.
-   Subject-wise attendance warnings.
-   Tasks due today.
-   Upcoming deadlines and exams.
-   Next reminder time.
-   A short AI-generated daily briefing, if enabled.

The dashboard should prioritise actions rather than displaying too much
information.

Suggested sections:

1.  **Today:** timetable and attendance actions.
2.  **Attendance health:** subject percentages and warnings.
3.  **Tasks:** overdue, due today and upcoming.
4.  **Companion:** a short message or daily briefing.
5.  **Quick actions:** mark attendance, add task, upload timetable, ask
    AI.

## 4.2 Attendance Manager --- Core Feature

Attendance is the most important and reliability-critical module.

For every subject, store:

-   Subject name.
-   Subject code, if available.
-   Total classes conducted.
-   Classes attended.
-   Classes missed.
-   Current percentage.
-   Required minimum percentage.
-   Future scheduled classes.
-   Attendance history.
-   Applicable attendance counting policy.

The default minimum threshold may be set to 80%, but it must be
configurable.

### Attendance formula

For a simple period-based attendance policy:

`Attendance percentage = (Classes attended / Classes conducted) × 100`

The calculation must handle zero conducted classes safely.

The app must not assume every institution counts attendance identically.
Some may count individual periods, some may count sessions, and labs or
special activities may follow different rules. The policy must be
configurable.

### Attendance status

Each subject should have a clear status, such as:

-   Safe.
-   Near threshold.
-   Below threshold.
-   Insufficient data.

The exact warning margins should be configurable. A subject at 81%
should not be treated as comfortably safe simply because it is
technically above 80%.

### Attendance check-in

At the configured daily time, initially around 5:00--6:00 PM:

1.  The app sends a notification.
2.  The user opens the app.
3.  The app displays the classes scheduled for that day.
4.  The user marks each class as attended, absent, cancelled,
    rescheduled or not applicable.
5.  The app asks for confirmation if any class is left unresolved.
6.  The backend saves the records.
7.  The attendance engine recalculates the subject totals.
8.  The dashboard updates on every device.

The app should support editing a mistaken entry, while retaining an
audit trail of corrections.

### Attendance statuses

Recommended initial statuses:

-   `PRESENT`
-   `ABSENT`
-   `CANCELLED`
-   `RESCHEDULED`
-   `PENDING`
-   `NOT_APPLICABLE`

Cancelled classes should not increase the conducted-class count.
Rescheduled classes should be associated with the correct actual class
occurrence rather than counted twice.

### Attendance history

The user should be able to view:

-   Attendance by subject.
-   Attendance by date.
-   Monthly attendance history.
-   Missed classes.
-   Corrected records.
-   Changes caused by timetable updates.

Past attendance records must not be silently rewritten when a new
timetable is uploaded.

## 4.3 Attendance Forecasting and "What If?" Simulator

This is a high-value feature.

The user can ask:

-   Can I skip the next class?
-   What happens if I miss two upcoming classes?
-   How many consecutive classes can I miss?
-   How many classes must I attend to reach 85% or 90%?
-   Which subject is currently most at risk?
-   If I attend every upcoming class, how will my percentage change?

The application should calculate these scenarios using deterministic
code.

For a simple policy, if current attended classes are `A` and conducted
classes are `T`, and the user attends `x` additional classes:

`New percentage = ((A + x) / (T + x)) × 100`

If the user misses `y` additional classes:

`New percentage = (A / (T + y)) × 100`

These formulas are examples for a simple period-based policy. The
implementation must use the configured institutional policy.

### Safe-to-skip calculation

The app should not simply say "You can bunk."

It should show:

-   Current attendance.
-   Projected attendance after the proposed absence.
-   Minimum required percentage.
-   Number of future classes required to recover.
-   Assumptions used.
-   A safety margin.

The app should warn that future timetable changes, cancelled classes and
institutional rules can alter the projection.

## 4.4 Timetable Manager

The timetable is a structured schedule, not just a PDF attachment.

Each scheduled class should include:

-   Subject.
-   Day of week.
-   Start time.
-   End time.
-   Room or location, if known.
-   Class type, such as lecture, tutorial or lab.
-   Optional faculty information.
-   Recurrence pattern.
-   Effective start and end dates.
-   Whether the class is active.

The app should support manual editing and timetable imports.

### Timetable upload workflow

The user may upload a PDF, image or spreadsheet.

The system should:

1.  Store the original document.
2.  Extract text or table information.
3.  Identify days, time slots, subjects and class types.
4.  Convert the extracted data into a proposed structured timetable.
5.  Show a preview.
6.  Compare it with the currently active timetable.
7.  Highlight additions, removals and changed periods.
8.  Ask the user to approve the changes.
9.  Create a new timetable version.
10. Use the new timetable for future scheduling.

### Important timetable rules

-   AI extraction must be treated as a proposal, not truth.
-   The user must approve changes before activation.
-   Timetable versions must be retained.
-   Past attendance must remain unchanged.
-   A timetable change must not create duplicate class occurrences.
-   One-off holidays, cancellations and special schedules should be
    supported.
-   The user should be able to manually correct extraction mistakes.

## 4.5 Academic Knowledge Base

At setup, the user can upload:

-   Curriculum PDF.
-   Semester syllabus.
-   Academic calendar.
-   Timetable.
-   Course outlines.
-   Assignment instructions.
-   Lab manuals.
-   Notes and other useful documents.

The system should maintain a document library and make documents
searchable.

The AI should be able to answer questions such as:

-   What subjects am I taking this semester?
-   What topics are included in a particular course?
-   What assessments are coming up?
-   What does the curriculum say about a course?
-   Which document contains a particular requirement?

### Document handling

Each document should have:

-   File name.
-   File type.
-   Upload date.
-   Document category.
-   Extracted text, where possible.
-   Processing status.
-   Source file reference.
-   Optional semester or subject association.

The AI should cite or identify the source document when answering
factual questions from uploaded material.

It must distinguish between:

-   Information explicitly present in a document.
-   Information inferred from multiple documents.
-   Information not found in the documents.

It must not pretend a document contains something it does not.

## 4.6 Google Drive Integration

Google Drive should be used for document storage and access, not as the
application's main database.

Recommended responsibilities:

**Google Drive:** - Curriculum PDFs. - Timetable originals. - Academic
documents. - Notes and reference files. - Optional exported backups.

**Application database:** - Attendance entries. - Timetable structures
and versions. - Tasks and deadlines. - User settings. - Reminder
preferences. - AI provider configuration metadata. - Audit history.

The app should request only the Google Drive permissions it needs.
Prefer the narrowest practical OAuth scopes.

If Drive integration is not available in the first milestone, local file
upload to the app can be used temporarily.

## 4.7 Task and Deadline Manager

The companion should also manage academic and personal tasks.

Task fields:

-   Title.
-   Description.
-   Category.
-   Subject, if applicable.
-   Due date and time.
-   Priority.
-   Status.
-   Estimated duration.
-   Optional checklist.
-   Created date.
-   Completion date.

Suggested categories:

-   Assignment.
-   Lab record.
-   Project.
-   Exam preparation.
-   Reading.
-   Personal.
-   Administrative.

Task features:

-   Add tasks manually.
-   Extract potential tasks from uploaded documents, with user
    confirmation.
-   Set reminders.
-   Mark tasks complete.
-   Show overdue tasks.
-   Group tasks by subject.
-   Sort by priority and deadline.
-   Plan available study time.

AI can suggest priorities, but the user should remain in control of
deadlines and task status.

## 4.8 AI Companion

The AI companion is the conversational interface to the application's
data and capabilities.

It should understand:

-   Current semester.
-   Subjects.
-   Timetable.
-   Attendance records.
-   Academic documents.
-   Tasks and deadlines.
-   User preferences.
-   Ongoing projects.

Example questions:

-   "What do I have tomorrow?"
-   "How is my attendance looking?"
-   "Can I miss the next Analog Electronics class?"
-   "What assignments are pending?"
-   "Explain this section of my syllabus."
-   "Help me plan this evening."
-   "What should I focus on this week?"

### AI tool access

The AI should not directly write arbitrary database values.

Instead, expose controlled application functions such as:

-   `get_today_schedule`
-   `get_attendance_summary`
-   `simulate_absences`
-   `get_pending_tasks`
-   `create_task`
-   `propose_timetable_update`
-   `request_attendance_correction`
-   `create_reminder`

Read-only operations can generally be performed without confirmation.
Operations that change important records should require explicit user
confirmation.

### Memory

Memory should store useful long-term preferences and context, such as:

-   Preferred reminder time.
-   Preferred response style.
-   Current academic goals.
-   Ongoing projects.
-   Planning preferences.

Do not store unnecessary sensitive information. The user should be able
to inspect, edit and delete stored memory.

## 4.9 BYOK --- Bring Your Own AI Key

The user supplies their own API keys.

The application should support multiple AI providers through a common
provider interface.

Potential providers to investigate:

-   Google Gemini.
-   Groq.
-   Other providers offering a suitable free tier.
-   Local models in a later version.

The app should support:

-   Adding an API key.
-   Selecting a provider.
-   Selecting an available model.
-   Testing a key.
-   Setting a preferred provider.
-   Configuring fallback providers.
-   Removing or replacing keys.
-   Tracking usage where the provider exposes usage information.

### Provider fallback

Example:

1.  Try the preferred provider.
2.  If the provider returns a rate-limit response, inspect whether
    another configured provider is available.
3.  Retry using the fallback provider if appropriate.
4.  If all providers fail, show a clear error.
5.  Never silently claim that an AI operation succeeded when it failed.

### API key security

API keys must never be hardcoded into frontend source code or exposed in
browser JavaScript.

For a hosted PWA, a safer design is:

-   Send requests through a backend.
-   Encrypt stored provider credentials.
-   Restrict access to the authenticated user.
-   Never log full keys.
-   Allow key deletion and replacement.

A device-side key store is another option, but it complicates using the
same key securely across devices.

Free-tier quotas, supported models and terms can change. The app should
not assume that multiple keys from one provider multiply the available
quota.

## 4.10 Daily Briefing and Proactive Reminders

The app should proactively help the user rather than waiting for
questions.

### Daily attendance reminder

Default target: approximately 5:00--6:00 PM, configurable by the user.

Example:

"Your attendance check-in is ready. You had five scheduled periods
today. Please confirm which classes you attended."

### Other reminders

-   Upcoming assignments.
-   Lab submissions.
-   Exams.
-   Important personal tasks.
-   Incomplete attendance check-in.
-   Subjects approaching the attendance threshold.

### Reminder channels

Initial priority:

1.  PWA/browser notifications.
2.  Firebase Cloud Messaging for supported installed clients.
3.  Email or other integrations if useful.
4.  Messaging integrations later.
5.  Voice calls only if a suitable affordable service is available.

A PWA's background behaviour varies by browser and operating system.
Push notifications generally require permission, a service worker and a
functioning push backend. A website cannot guarantee that a notification
will always be delivered.

WhatsApp automation and voice calls should not be assumed to be free.

## 4.11 Weekly Review

Once a week, the app can prepare a summary:

-   Attendance changes.
-   Subjects below or near the threshold.
-   Classes missed.
-   Tasks completed.
-   Overdue tasks.
-   Upcoming assignments and exams.
-   Suggested priorities for the next week.

The report should be based on stored data and clearly distinguish
suggestions from facts.

------------------------------------------------------------------------

# 5. Recommended Technology Stack

The project should use a simple, low-cost architecture suitable for one
person.

  -----------------------------------------------------------------------
  Layer                   Suggested technology    Purpose
  ----------------------- ----------------------- -----------------------
  Frontend                Next.js + TypeScript    Responsive web
                                                  application

  App experience          Progressive Web App     Installable experience
                                                  on phone and laptop

  UI styling              Tailwind CSS            Responsive interface

  Backend/database        Supabase + PostgreSQL   Shared cloud data

  Authentication          Supabase Auth           Secure sign-in

  Hosting                 Vercel Hobby or another Frontend deployment
                          suitable free host      

  File storage            Google Drive, with      Documents
                          optional Supabase       
                          Storage                 

  AI integration          Provider abstraction    BYOK support
                          layer                   

  Notifications           Firebase Cloud          Push notifications
                          Messaging               

  Background work         Supabase scheduled      Daily reminders and
                          functions or another    processing
                          free-compatible         
                          scheduler               

  Version control         GitHub                  Source code and version
                                                  history
  -----------------------------------------------------------------------

These are proposed choices, not guaranteed permanent free services.
Check current pricing, quotas, inactivity rules and terms before
deployment.

## Why a PWA first?

A PWA avoids maintaining separate Android, iOS and web codebases.

The same application can be:

-   Opened in a laptop browser.
-   Opened in a phone browser.
-   Installed on a compatible phone.
-   Installed on a compatible desktop environment.

Native Android development can be considered later if the PWA cannot
provide a required capability.

------------------------------------------------------------------------

# 6. High-Level Architecture

``` text
                  LAPTOP BROWSER
                        |
                        |
                  PHONE PWA
                        |
                        v
              NEXT.JS APPLICATION
                        |
                        v
                  BACKEND API
                        |
        +---------------+----------------+
        |               |                |
        v               v                v
   POSTGRESQL       AI SERVICE       FILE SERVICE
   (Supabase)       (BYOK)            (Drive)
        |               |                |
        |               |                |
        v               v                v
 Attendance         Gemini          Curriculum PDFs
 Timetable          Groq            Timetable files
 Tasks              Other models    Notes and manuals
 Settings
 Audit records
        |
        v
  SCHEDULED JOBS
        |
        v
  PUSH NOTIFICATIONS
```

### Architecture principles

-   The database is the source of truth.
-   The attendance engine is deterministic.
-   AI does not silently alter important records.
-   The frontend does not contain secrets.
-   The system works even when an AI provider is unavailable.
-   Documents and structured application data have separate storage
    responsibilities.
-   Both devices use the same backend.

------------------------------------------------------------------------

# 7. Suggested Database Design

A practical initial schema could include the following tables.

## `profiles`

-   `id`
-   `display_name`
-   `timezone`
-   `created_at`
-   `updated_at`

Even with one user, a profile table helps organise settings and
ownership.

## `subjects`

-   `id`
-   `user_id`
-   `name`
-   `subject_code`
-   `semester`
-   `minimum_attendance_percentage`
-   `attendance_policy`
-   `is_active`

## `timetable_versions`

-   `id`
-   `user_id`
-   `version_name`
-   `source_document_id`
-   `effective_from`
-   `effective_until`
-   `status`
-   `created_at`
-   `approved_at`

## `timetable_entries`

-   `id`
-   `timetable_version_id`
-   `subject_id`
-   `day_of_week`
-   `start_time`
-   `end_time`
-   `class_type`
-   `room`
-   `is_active`

## `class_occurrences`

Represents an actual scheduled class on a particular date.

-   `id`
-   `subject_id`
-   `timetable_entry_id`
-   `scheduled_date`
-   `start_time`
-   `end_time`
-   `status`
-   `notes`

This separation is important. A recurring timetable entry is not the
same thing as an actual class occurrence.

## `attendance_records`

-   `id`
-   `class_occurrence_id`
-   `subject_id`
-   `attendance_status`
-   `recorded_at`
-   `updated_at`
-   `correction_reason`

Use a unique constraint to prevent duplicate attendance records for the
same class occurrence.

## `tasks`

-   `id`
-   `user_id`
-   `title`
-   `description`
-   `category`
-   `subject_id`
-   `priority`
-   `due_at`
-   `estimated_minutes`
-   `status`
-   `completed_at`

## `documents`

-   `id`
-   `user_id`
-   `file_name`
-   `file_type`
-   `storage_provider`
-   `storage_reference`
-   `document_category`
-   `processing_status`
-   `uploaded_at`

## `reminder_settings`

-   `id`
-   `user_id`
-   `attendance_reminder_time`
-   `timezone`
-   `push_enabled`
-   `follow_up_enabled`

## `ai_provider_configs`

-   `id`
-   `user_id`
-   `provider`
-   `model`
-   `encrypted_key_reference`
-   `is_enabled`
-   `is_primary`

Do not store unencrypted API keys in this table.

## `audit_log`

-   `id`
-   `user_id`
-   `entity_type`
-   `entity_id`
-   `action`
-   `old_value`
-   `new_value`
-   `created_at`

The audit log is especially useful for attendance corrections and
timetable changes.

------------------------------------------------------------------------

# 8. Important Workflows

## Workflow A: Initial Setup

1.  Open the application.
2.  Create or configure the private account.
3.  Set the timezone.
4.  Set the attendance threshold, initially 80%.
5.  Upload the curriculum PDF.
6.  Upload the current timetable.
7.  Review the extracted subjects and timetable.
8.  Approve the structured data.
9.  Configure the daily attendance reminder.
10. Optionally connect Google Drive.
11. Optionally add an AI provider key.
12. Start using the attendance dashboard.

## Workflow B: Daily Attendance

1.  Scheduled reminder is sent.
2.  User opens the attendance check-in.
3.  App displays today's class occurrences.
4.  User marks each occurrence.
5.  App highlights unresolved entries.
6.  User confirms submission.
7.  Backend saves records.
8.  Attendance engine recalculates subject summaries.
9.  Dashboard synchronises across devices.

## Workflow C: Timetable Update

1.  User uploads a new timetable.
2.  Document parser extracts proposed entries.
3.  App compares them with the active timetable.
4.  User reviews changes.
5.  User approves the new version.
6.  New timetable version becomes active from its effective date.
7.  Future class occurrences are updated.
8.  Past attendance records remain intact.

## Workflow D: AI Attendance Question

User: "Can I miss the next two classes of this subject?"

1.  AI identifies the subject.
2.  AI calls the attendance summary function.
3.  Backend returns the current counts and policy.
4.  AI calls the scenario simulator.
5.  Backend returns the projected result.
6.  AI explains the result and assumptions.

The AI must not make up attendance numbers or override the calculation
engine.

## Workflow E: Task Planning

1.  User creates a task or asks AI to create one.
2.  AI proposes a title, deadline and priority.
3.  User reviews the proposed details.
4.  User confirms.
5.  Task is saved.
6.  Reminder service schedules relevant notifications.

------------------------------------------------------------------------

# 9. Safety, Reliability and Privacy Rules

These rules should be part of the product design from the beginning.

1.  **No fabricated attendance:** never create attendance records based
    on AI guesses.
2.  **No silent timetable changes:** show a comparison and request
    approval.
3.  **Preserve history:** changing the timetable must not rewrite
    historical attendance.
4.  **Explicit corrections:** attendance corrections should be
    auditable.
5.  **Explain projections:** show formulas, assumptions and safety
    margins.
6.  **AI is optional:** attendance tracking must work without an AI API
    key.
7.  **Provider failure handling:** clearly report rate limits and
    unavailable providers.
8.  **Protect API keys:** never expose keys in frontend code or logs.
9.  **Protect documents:** use appropriate access controls and narrow
    Drive permissions.
10. **Backups:** provide an export or backup mechanism.
11. **User control:** allow the user to edit or delete their data.
12. **Uncertainty:** if timetable extraction or document interpretation
    is unclear, ask for review instead of guessing.

------------------------------------------------------------------------

# 10. Free-Tier Strategy and Cost Expectations

The target is ₹0 per month for the initial personal deployment.

Potential services to evaluate:

  -----------------------------------------------------------------------
  Service                 Intended use            Cost strategy
  ----------------------- ----------------------- -----------------------
  Vercel Hobby            Frontend hosting        Free personal tier,
                                                  subject to terms and
                                                  limits

  Supabase Free           Database and            Free quota
                          authentication          

  Google Drive            Existing document       Use available account
                          storage                 storage

  Firebase Cloud          Push notifications      No-cost messaging
  Messaging                                       service

  Gemini API              AI provider             Use available free-tier
                                                  quota

  Groq API                Alternative AI provider Use available free-tier
                                                  quota

  GitHub                  Source control          Free repository
  -----------------------------------------------------------------------

### Cost caveats

-   Free tiers and quotas can change.
-   Free projects may pause or have usage limits.
-   API providers can change their free models and rate limits.
-   A custom domain may cost money.
-   Some messaging and voice-call services may charge.
-   Large document collections can exceed free storage or processing
    quotas.
-   Never build critical functionality around an assumption that an
    external free tier will remain unchanged.

### Cost-saving decisions

-   Use a PWA instead of separate native applications.
-   Store documents in the user's existing Drive account.
-   Keep structured data in a small PostgreSQL database.
-   Use AI only when a task benefits from it.
-   Cache document extraction results.
-   Avoid repeatedly sending entire PDFs to an AI model.
-   Keep attendance calculations local to deterministic backend code.
-   Use notifications rather than paid calls or messaging.

------------------------------------------------------------------------

# 11. Development Roadmap

Build the application in stages. Do not attempt every feature in the
first release.

## Phase 1 --- Foundation

Deliverables:

-   Next.js application.
-   Responsive design.
-   PWA configuration.
-   Supabase project.
-   Authentication.
-   Database schema.
-   Laptop and phone access.
-   Shared data synchronisation.

**Completion condition:** the same account can open the app on both
devices and see the same saved data.

## Phase 2 --- Attendance MVP

Deliverables:

-   Subject management.
-   Manual timetable entry.
-   Class occurrence generation.
-   Daily attendance check-in.
-   Attendance calculations.
-   Subject-wise attendance dashboard.
-   80% threshold warnings.
-   Attendance history.
-   Manual corrections and audit log.
-   What-if simulator.

**Completion condition:** attendance works correctly without AI.

## Phase 3 --- Timetable Intelligence

Deliverables:

-   PDF/image/spreadsheet upload.
-   Text and table extraction.
-   Structured timetable proposals.
-   Timetable diff view.
-   User approval.
-   Version history.
-   Effective dates.
-   Special class and cancellation support.

**Completion condition:** a new timetable can be reviewed and activated
without damaging historical attendance.

## Phase 4 --- Academic Documents and AI

Deliverables:

-   Curriculum document library.
-   Document search.
-   AI provider abstraction.
-   BYOK key configuration.
-   Provider/model selection.
-   Provider fallback.
-   AI chat.
-   Controlled tool/function access.
-   Answers grounded in uploaded documents and app data.

**Completion condition:** the assistant can answer useful academic and
attendance questions while clearly identifying uncertainty.

## Phase 5 --- Tasks and Planning

Deliverables:

-   Task manager.
-   Deadlines.
-   Categories and priorities.
-   Task reminders.
-   AI-assisted task creation.
-   Daily planning.
-   Weekly review.

**Completion condition:** academic and personal tasks are tracked in the
same application.

## Phase 6 --- Proactive Companion

Deliverables:

-   Scheduled attendance reminders.
-   Push notification support.
-   Follow-up reminders.
-   Daily briefing.
-   Weekly summary.
-   Notification preferences.
-   Background processing and failure handling.

**Completion condition:** reminders can arrive when the application is
not open, within the limitations of the device and browser.

## Phase 7 --- Optional Advanced Features

Possible later work:

-   Voice interaction.
-   Voice-call reminders.
-   Telegram integration.
-   WhatsApp integration, subject to official API requirements and cost.
-   Local AI models.
-   Calendar integrations.
-   More advanced study planning.
-   Additional data visualisations.

These are optional. They should not delay the reliable core application.

------------------------------------------------------------------------

# 12. Suggested User Interface

## Main navigation

A simple navigation structure:

1.  Dashboard
2.  Attendance
3.  Timetable
4.  Tasks
5.  Documents
6.  AI Companion
7.  Settings

## Dashboard layout

-   Greeting and date.
-   Today's schedule.
-   Attendance check-in.
-   Attendance health cards.
-   Tasks due soon.
-   Upcoming academic events.
-   Companion briefing.

## Attendance page

-   Subject list.
-   Attendance percentages.
-   Threshold indicators.
-   Classes attended and conducted.
-   Attendance history.
-   Scenario simulator.

## Timetable page

-   Weekly timetable.
-   Calendar view.
-   Manual edit.
-   Upload new timetable.
-   Compare timetable versions.

## AI Companion page

-   Chat interface.
-   Current context indicator.
-   Document references.
-   Suggested actions.
-   Provider/model indicator.

## Settings page

-   Profile and timezone.
-   Attendance threshold.
-   Attendance counting policy.
-   Reminder schedule.
-   Notification permissions.
-   Google Drive connection.
-   AI provider keys and model selection.
-   Data export and deletion.

------------------------------------------------------------------------

# 13. MVP Acceptance Checklist

The first usable version should meet all of these conditions:

-   [ ] App opens on laptop and phone.
-   [ ] PWA can be installed on a supported device.
-   [ ] Both devices use the same account.
-   [ ] Data synchronises through the backend.
-   [ ] Subjects can be created and edited.
-   [ ] Timetable can be entered manually.
-   [ ] Daily class occurrences are generated correctly.
-   [ ] User can mark attendance for each class.
-   [ ] Attendance percentage is calculated correctly.
-   [ ] 80% threshold is configurable.
-   [ ] User can see how many future classes can be missed under the
    configured policy.
-   [ ] User can simulate future absences and attendances.
-   [ ] Attendance corrections are recorded.
-   [ ] Timetable changes do not rewrite past attendance.
-   [ ] App remains useful when AI providers are unavailable.
-   [ ] Data can be backed up or exported.

------------------------------------------------------------------------

# 14. Recommended First Build

Do not start with the AI chat interface.

Start with this exact sequence:

1.  Create the GitHub repository.
2.  Set up Next.js with TypeScript.
3.  Build the responsive dashboard shell.
4.  Configure Supabase authentication and PostgreSQL.
5.  Create the subjects table.
6.  Create timetable entries and class occurrences.
7.  Implement attendance recording.
8.  Write and test the attendance calculation engine.
9.  Build the attendance dashboard.
10. Implement the what-if simulator.
11. Configure the PWA and test it on your phone.
12. Add timetable import and AI features only after the core works.

The first milestone is a reliable attendance application accessible from
both devices. The AI companion is built on top of that foundation.

------------------------------------------------------------------------

# 15. Final Product Definition

The Personal AI Student Companion is a private, cross-device academic
and personal productivity system.

It combines a deterministic attendance engine, intelligent timetable
management, academic document understanding, task planning, BYOK AI
integration and proactive reminders.

It is designed to run on a free or near-free infrastructure stack for a
single user.

Its defining characteristic is not that it has a chatbot. It is that it
maintains a structured understanding of the user's academic schedule and
responsibilities, uses that information reliably, and proactively helps
the user act on it.

**Build the reliable student management system first. Make it
intelligent second.**
