import { describe, it, expect } from 'vitest';
import {
  calculateAttendancePercentage,
  classifyAttendanceHealth,
  calculateMaxConsecutiveSkips,
  calculateClassesNeededToRecover,
  simulateAttendance,
  computeSubjectStats,
} from '../attendance-engine';
import { Subject } from '../types';

describe('Deterministic Attendance Engine', () => {
  describe('calculateAttendancePercentage', () => {
    it('returns 0 when 0 classes conducted', () => {
      expect(calculateAttendancePercentage(0, 0)).toBe(0);
      expect(calculateAttendancePercentage(5, 0)).toBe(0);
    });

    it('returns 0 when attended is 0', () => {
      expect(calculateAttendancePercentage(0, 10)).toBe(0);
    });

    it('calculates correct percentages rounded to 2 decimal places', () => {
      expect(calculateAttendancePercentage(8, 10)).toBe(80);
      expect(calculateAttendancePercentage(18, 20)).toBe(90);
      expect(calculateAttendancePercentage(2, 3)).toBe(66.67);
      expect(calculateAttendancePercentage(1, 3)).toBe(33.33);
    });
  });

  describe('classifyAttendanceHealth', () => {
    it('returns INSUFFICIENT_DATA when conducted is 0', () => {
      expect(classifyAttendanceHealth(0, 0, 80, 3)).toBe('INSUFFICIENT_DATA');
    });

    it('returns BELOW_THRESHOLD when percentage is below minimum requirement', () => {
      expect(classifyAttendanceHealth(79.9, 20, 80, 3)).toBe('BELOW_THRESHOLD');
      expect(classifyAttendanceHealth(74.0, 50, 75, 5)).toBe('BELOW_THRESHOLD');
    });

    it('returns NEAR_THRESHOLD when percentage is between M and M + W', () => {
      expect(classifyAttendanceHealth(80.0, 20, 80, 3)).toBe('NEAR_THRESHOLD');
      expect(classifyAttendanceHealth(81.5, 20, 80, 3)).toBe('NEAR_THRESHOLD');
      expect(classifyAttendanceHealth(82.99, 100, 80, 3)).toBe('NEAR_THRESHOLD');
    });

    it('returns SAFE when percentage is at or above M + W', () => {
      expect(classifyAttendanceHealth(83.0, 20, 80, 3)).toBe('SAFE');
      expect(classifyAttendanceHealth(90.0, 20, 80, 3)).toBe('SAFE');
      expect(classifyAttendanceHealth(100.0, 20, 80, 3)).toBe('SAFE');
    });
  });

  describe('calculateMaxConsecutiveSkips', () => {
    it('returns 0 when attendance is already below threshold', () => {
      // 7/10 = 70% < 80%
      expect(calculateMaxConsecutiveSkips(7, 10, 80)).toBe(0);
    });

    it('returns 0 when attendance is at threshold boundary and skipping would drop below', () => {
      // 8/10 = 80%. If skips 1, 8/11 = 72.7% < 80%. Skips = floor((800 - 800) / 80) = 0
      expect(calculateMaxConsecutiveSkips(8, 10, 80)).toBe(0);
    });

    it('correctly calculates maximum safe skips', () => {
      // 9/10 = 90%. Formula: floor((900 - 800) / 80) = floor(100 / 80) = 1.
      // Check: if skips 1 -> 9/11 = 81.8% >= 80% (SAFE). If skips 2 -> 9/12 = 75% < 80% (FAIL).
      expect(calculateMaxConsecutiveSkips(9, 10, 80)).toBe(1);

      // 18/20 = 90%. Formula: floor((1800 - 1600) / 80) = floor(200 / 80) = 2.
      // Check: if skips 2 -> 18/22 = 81.8% >= 80%. If skips 3 -> 18/23 = 78.26% < 80%.
      expect(calculateMaxConsecutiveSkips(18, 20, 80)).toBe(2);

      // 40/40 = 100%. Formula: floor((4000 - 3200) / 80) = floor(800 / 80) = 10 skips.
      // Check: 40/50 = 80% exactly!
      expect(calculateMaxConsecutiveSkips(40, 40, 80)).toBe(10);
    });

    it('handles edge cases safely', () => {
      expect(calculateMaxConsecutiveSkips(0, 0, 80)).toBe(0);
      expect(calculateMaxConsecutiveSkips(0, 10, 80)).toBe(0);
    });
  });

  describe('calculateClassesNeededToRecover', () => {
    it('returns 0 when already at or above threshold', () => {
      expect(calculateClassesNeededToRecover(8, 10, 80)).toBe(0);
      expect(calculateClassesNeededToRecover(18, 20, 80)).toBe(0);
    });

    it('correctly calculates required consecutive classes to reach 80%', () => {
      // 7/10 = 70%. Need 80%.
      // Formula: ceil((80*10 - 100*7) / (100 - 80)) = ceil((800 - 700) / 20) = ceil(100 / 20) = 5.
      // Check: attend 5 -> (7+5)/(10+5) = 12/15 = 80%!
      expect(calculateClassesNeededToRecover(7, 10, 80)).toBe(5);

      // 6/10 = 60%. Need 80%.
      // Formula: ceil((800 - 600) / 20) = ceil(200 / 20) = 10.
      // Check: attend 10 -> (6+10)/(10+10) = 16/20 = 80%!
      expect(calculateClassesNeededToRecover(6, 10, 80)).toBe(10);

      // 15/22 = 68.18%. Need 75%.
      // Formula: ceil((75*22 - 1500) / 25) = ceil((1650 - 1500) / 25) = ceil(150 / 25) = 6.
      // Check: attend 6 -> 21/28 = 75%!
      expect(calculateClassesNeededToRecover(15, 22, 75)).toBe(6);
    });

    it('handles 100% threshold boundary', () => {
      expect(calculateClassesNeededToRecover(10, 10, 100)).toBe(0);
      expect(calculateClassesNeededToRecover(9, 10, 100)).toBe(Infinity);
    });
  });

  describe('simulateAttendance', () => {
    it('simulates future attendances and skips correctly', () => {
      const result = simulateAttendance({
        attended: 16,
        conducted: 20, // 80.0%
        attendNext: 4,
        missNext: 0,
        minimumRequired: 80,
      });

      // After attending 4: 20/24 = 83.33%
      expect(result.currentPercentage).toBe(80);
      expect(result.projectedPercentage).toBe(83.33);
      expect(result.delta).toBe(3.33);
      expect(result.statusAfterSimulation).toBe('SAFE');
      expect(result.maxSkipsAfterSimulation).toBe(1);
    });

    it('simulates future misses dropping below threshold and flags recovery', () => {
      const result = simulateAttendance({
        attended: 16,
        conducted: 20, // 80.0%
        attendNext: 0,
        missNext: 2,
        minimumRequired: 80,
      });

      // After missing 2: 16/22 = 72.73%
      expect(result.projectedPercentage).toBe(72.73);
      expect(result.statusAfterSimulation).toBe('BELOW_THRESHOLD');
      // Need: ceil((80*22 - 1600) / 20) = ceil(160 / 20) = 8 classes
      expect(result.classesToRecoverIfBelow).toBe(8);
      expect(result.assumptions.length).toBeGreaterThan(0);
    });
  });

  describe('computeSubjectStats', () => {
    const mockSubject: Subject = {
      id: 'sub-1',
      user_id: 'user-1',
      name: 'Data Structures',
      subject_code: 'CS201',
      semester: '3',
      minimum_attendance_percentage: 80,
      warning_margin: 3,
      is_active: true,
    };

    it('ignores CANCELLED and PENDING from conducted count', () => {
      const records = [
        { status: 'PRESENT' as const },
        { status: 'PRESENT' as const },
        { status: 'ABSENT' as const },
        { status: 'CANCELLED' as const },
        { status: 'PENDING' as const },
      ];

      const stats = computeSubjectStats(mockSubject, records);
      expect(stats.totalAttended).toBe(2);
      expect(stats.totalConducted).toBe(3); // only 2 PRESENT + 1 ABSENT
      expect(stats.totalCancelled).toBe(1);
      expect(stats.totalPending).toBe(1);
      expect(stats.percentage).toBe(66.67);
      expect(stats.healthStatus).toBe('BELOW_THRESHOLD');
      expect(stats.classesNeededToRecover).toBe(2); // (2+2)/(3+2) = 4/5 = 80%
    });
  });
});
