// ============================================================================
// Deterministic Attendance Calculation & Simulation Engine
// Pure TypeScript mathematical engine - ZERO LLM dependencies
// ============================================================================

import {
  AttendanceHealthStatus,
  AttendanceRecord,
  AttendanceSimulationInput,
  AttendanceSimulationResult,
  AttendanceStatus,
  ClassOccurrence,
  Subject,
  SubjectStats,
} from './types';

/**
 * Calculates deterministic attendance percentage.
 * Only PRESENT and ABSENT count towards total conducted (T).
 * Formula: (A / T) * 100 rounded to 2 decimal places.
 */
export function calculateAttendancePercentage(attended: number, conducted: number): number {
  if (conducted <= 0) {
    return 0;
  }
  if (attended <= 0) {
    return 0;
  }
  const raw = (attended / conducted) * 100;
  return Math.round(raw * 100) / 100;
}

/**
 * Classifies health status based on attendance percentage, target threshold M, and warning margin W.
 *
 * - INSUFFICIENT_DATA: T = 0
 * - BELOW_THRESHOLD: percentage < M
 * - NEAR_THRESHOLD: M <= percentage < (M + W)
 * - SAFE: percentage >= (M + W)
 */
export function classifyAttendanceHealth(
  percentage: number,
  conducted: number,
  minimumRequired: number = 80.0,
  warningMargin: number = 3.0
): AttendanceHealthStatus {
  if (conducted === 0) {
    return 'INSUFFICIENT_DATA';
  }
  // Tolerant comparison with floating-point epsilon
  const eps = 0.0001;
  if (percentage < minimumRequired - eps) {
    return 'BELOW_THRESHOLD';
  }
  if (percentage < minimumRequired + warningMargin - eps) {
    return 'NEAR_THRESHOLD';
  }
  return 'SAFE';
}

/**
 * Calculates maximum consecutive classes that can be missed without dipping below threshold M%.
 * Formula: floor((100 * A - M * T) / M)
 */
export function calculateMaxConsecutiveSkips(
  attended: number,
  conducted: number,
  minimumRequired: number = 80.0
): number {
  if (conducted === 0 || attended === 0 || minimumRequired <= 0) {
    return 0;
  }
  const currentPct = (attended / conducted) * 100;
  if (currentPct < minimumRequired) {
    return 0;
  }

  const numerator = 100 * attended - minimumRequired * conducted;
  if (numerator <= 0) {
    return 0;
  }

  const skips = Math.floor(numerator / minimumRequired);
  return Math.max(0, skips);
}

/**
 * Calculates minimum consecutive classes that must be attended to recover to threshold M%.
 * Formula: ceil((M * T - 100 * A) / (100 - M))
 */
export function calculateClassesNeededToRecover(
  attended: number,
  conducted: number,
  minimumRequired: number = 80.0
): number {
  if (minimumRequired >= 100) {
    // If 100% is required, any single absence means 100% can never be achieved unless conducted=0
    return attended === conducted ? 0 : Infinity;
  }
  if (conducted === 0) {
    return 0;
  }
  const currentPct = (attended / conducted) * 100;
  if (currentPct >= minimumRequired) {
    return 0;
  }

  const numerator = minimumRequired * conducted - 100 * attended;
  if (numerator <= 0) {
    return 0;
  }

  const denominator = 100 - minimumRequired;
  const classesNeeded = Math.ceil(numerator / denominator);
  return Math.max(0, classesNeeded);
}

/**
 * Aggregates statistics for a subject given its records/occurrences.
 */
export function computeSubjectStats(
  subject: Subject,
  occurrencesOrRecords: Array<{
    status?: AttendanceStatus;
    attendance_status?: AttendanceStatus;
  }>
): SubjectStats {
  let totalAttended = 0;
  let totalConducted = 0;
  let totalCancelled = 0;
  let totalPending = 0;

  for (const item of occurrencesOrRecords) {
    const status = item.attendance_status || item.status || 'PENDING';
    switch (status) {
      case 'PRESENT':
        totalAttended += 1;
        totalConducted += 1;
        break;
      case 'ABSENT':
        totalConducted += 1;
        break;
      case 'CANCELLED':
        totalCancelled += 1;
        break;
      case 'PENDING':
        totalPending += 1;
        break;
      case 'RESCHEDULED':
      case 'NOT_APPLICABLE':
        // Does not count towards conducted
        break;
    }
  }

  const minRequired = subject.minimum_attendance_percentage ?? 80.0;
  const warningMargin = subject.warning_margin ?? 3.0;
  const percentage = calculateAttendancePercentage(totalAttended, totalConducted);
  const healthStatus = classifyAttendanceHealth(
    percentage,
    totalConducted,
    minRequired,
    warningMargin
  );
  const maxConsecutiveSkips = calculateMaxConsecutiveSkips(
    totalAttended,
    totalConducted,
    minRequired
  );
  const classesNeededToRecover = calculateClassesNeededToRecover(
    totalAttended,
    totalConducted,
    minRequired
  );

  return {
    subjectId: subject.id,
    subjectName: subject.name,
    subjectCode: subject.subject_code,
    totalConducted,
    totalAttended,
    totalCancelled,
    totalPending,
    percentage,
    minimumRequired: minRequired,
    warningMargin,
    healthStatus,
    maxConsecutiveSkips,
    classesNeededToRecover,
  };
}

/**
 * Simulates a "What-If" scenario for future classes.
 * Inputs:
 * - attended (A)
 * - conducted (T)
 * - attendNext (x): number of upcoming classes student attends
 * - missNext (y): number of upcoming classes student misses
 * - minimumRequired (M)
 * - warningMargin (W)
 */
export function simulateAttendance(input: AttendanceSimulationInput): AttendanceSimulationResult {
  const {
    attended,
    conducted,
    attendNext,
    missNext,
    minimumRequired,
    warningMargin = 3.0,
  } = input;

  const validAttendNext = Math.max(0, Math.floor(attendNext || 0));
  const validMissNext = Math.max(0, Math.floor(missNext || 0));

  const currentPercentage = calculateAttendancePercentage(attended, conducted);

  const conductedAfter = conducted + validAttendNext + validMissNext;
  const attendedAfter = attended + validAttendNext;

  const projectedPercentage = calculateAttendancePercentage(attendedAfter, conductedAfter);
  const delta = Math.round((projectedPercentage - currentPercentage) * 100) / 100;

  const statusAfterSimulation = classifyAttendanceHealth(
    projectedPercentage,
    conductedAfter,
    minimumRequired,
    warningMargin
  );

  const maxSkipsAfterSimulation = calculateMaxConsecutiveSkips(
    attendedAfter,
    conductedAfter,
    minimumRequired
  );

  const classesToRecoverIfBelow = calculateClassesNeededToRecover(
    attendedAfter,
    conductedAfter,
    minimumRequired
  );

  const assumptions: string[] = [
    `Assumes ${validAttendNext} upcoming ${validAttendNext === 1 ? 'class is' : 'classes are'} attended`,
    `Assumes ${validMissNext} upcoming ${validMissNext === 1 ? 'class is' : 'classes are'} missed`,
    `Target threshold maintained at ${minimumRequired.toFixed(1)}%`,
    `Cancelled or rescheduled classes are excluded from calculations`,
  ];

  return {
    currentPercentage,
    projectedPercentage,
    delta,
    conductedAfter,
    attendedAfter,
    statusAfterSimulation,
    maxSkipsAfterSimulation,
    classesToRecoverIfBelow,
    assumptions,
  };
}

/**
 * Formats attendance summary string for quick human glance or tool responses.
 */
export function formatAttendanceSummary(stats: SubjectStats): string {
  const {
    subjectName,
    subjectCode,
    percentage,
    totalAttended,
    totalConducted,
    healthStatus,
    maxConsecutiveSkips,
    classesNeededToRecover,
    minimumRequired,
  } = stats;

  if (healthStatus === 'INSUFFICIENT_DATA') {
    return `${subjectCode} (${subjectName}): No classes conducted yet. Threshold: ${minimumRequired}%.`;
  }

  let advice = '';
  if (healthStatus === 'BELOW_THRESHOLD') {
    advice = `⚠️ Below ${minimumRequired}%! Must attend next ${classesNeededToRecover} consecutive classes to recover.`;
  } else if (healthStatus === 'NEAR_THRESHOLD') {
    advice = `⚡ Warning margin! Can skip ${maxConsecutiveSkips} class(es) before dropping below ${minimumRequired}%.`;
  } else {
    advice = `✅ Safe margin. Can safely miss ${maxConsecutiveSkips} upcoming class(es).`;
  }

  return `${subjectCode} (${subjectName}): ${percentage.toFixed(1)}% (${totalAttended}/${totalConducted} classes). ${advice}`;
}
