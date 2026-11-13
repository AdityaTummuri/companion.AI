'use client';

import React, { useState } from 'react';
import {
  Check,
  X,
  MinusCircle,
  Clock,
  MapPin,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { AttendanceStatus, ClassOccurrence } from '@/lib/types';
import { useStudentData } from '@/lib/storage/data-store';

interface CheckInCardProps {
  occurrence: ClassOccurrence;
}

export function CheckInCard({ occurrence }: CheckInCardProps) {
  const { markAttendance, subjects } = useStudentData();
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [pendingNewStatus, setPendingNewStatus] = useState<AttendanceStatus | null>(null);
  const [correctionReason, setCorrectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subject =
    occurrence.subject || subjects.find((s) => s.id === occurrence.subject_id);

  const handleStatusClick = async (newStatus: AttendanceStatus) => {
    // If clicking the current status, no-op
    if (occurrence.status === newStatus) return;

    // If it was already marked (not PENDING), prompt for correction reason
    if (occurrence.status !== 'PENDING') {
      setPendingNewStatus(newStatus);
      setShowCorrectionModal(true);
      return;
    }

    // Direct mark
    setIsSubmitting(true);
    await markAttendance(occurrence.id, newStatus);
    setIsSubmitting(false);
  };

  const confirmCorrection = async () => {
    if (!pendingNewStatus) return;
    setIsSubmitting(true);
    await markAttendance(occurrence.id, pendingNewStatus, correctionReason || 'User correction');
    setIsSubmitting(false);
    setShowCorrectionModal(false);
    setCorrectionReason('');
    setPendingNewStatus(null);
  };

  const getStatusBadge = () => {
    switch (occurrence.status) {
      case 'PRESENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
            <Check className="w-3.5 h-3.5" /> Present
          </span>
        );
      case 'ABSENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/20">
            <X className="w-3.5 h-3.5" /> Absent
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/15 text-slate-400 border border-slate-500/20">
            <MinusCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      case 'RESCHEDULED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/20">
            Rescheduled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" /> Pending Check-in
          </span>
        );
    }
  };

  return (
    <>
      <div className="bg-[#111827] border border-[#1f293d] hover:border-slate-700/80 rounded-xl p-4 transition-all duration-200">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/20">
                {subject?.subject_code || 'CLASS'}
              </span>
              <h3 className="font-semibold text-sm text-slate-100 line-clamp-1">
                {subject?.name || 'Class Session'}
              </h3>
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {occurrence.start_time} - {occurrence.end_time}
              </span>
              {occurrence.notes && (
                <span className="flex items-center gap-1 text-slate-400 truncate max-w-[180px]">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {occurrence.notes}
                </span>
              )}
            </div>
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1f293d]/80">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleStatusClick('PRESENT')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
              occurrence.status === 'PRESENT'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 font-semibold'
                : 'bg-[#182234] text-slate-300 hover:bg-emerald-600/20 hover:text-emerald-300'
            }`}
          >
            <Check className="w-4 h-4" /> Present
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleStatusClick('ABSENT')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
              occurrence.status === 'ABSENT'
                ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30 font-semibold'
                : 'bg-[#182234] text-slate-300 hover:bg-rose-600/20 hover:text-rose-300'
            }`}
          >
            <X className="w-4 h-4" /> Absent
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleStatusClick('CANCELLED')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
              occurrence.status === 'CANCELLED'
                ? 'bg-slate-600 text-white shadow-sm font-semibold'
                : 'bg-[#182234] text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
            }`}
          >
            <MinusCircle className="w-4 h-4" /> Cancelled
          </button>
        </div>
      </div>

      {/* Correction Modal */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#111827] border border-[#1f293d] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h4 className="font-semibold text-base text-slate-100">
                Attendance Correction
              </h4>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You are updating an already submitted record for{' '}
              <strong className="text-white">{subject?.name}</strong> from{' '}
              <span className="font-semibold text-slate-200">{occurrence.status}</span> to{' '}
              <span className="font-semibold text-blue-400">{pendingNewStatus}</span>. This
              action is recorded in the audit log.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Reason for correction (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Teacher marked wrongly, proxy corrected, duty leave"
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-[#0c1220] border border-[#1f293d] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowCorrectionModal(false);
                  setPendingNewStatus(null);
                }}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmCorrection}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm transition-colors"
              >
                Confirm Correction
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
