'use client';

import React from 'react';
import { SubjectStats } from '@/lib/types';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

interface SubjectHealthCardProps {
  stats: SubjectStats;
  onSimulateClick?: (subjectId: string) => void;
}

export function SubjectHealthCard({ stats, onSimulateClick }: SubjectHealthCardProps) {
  const {
    subjectId,
    subjectName,
    subjectCode,
    totalAttended,
    totalConducted,
    percentage,
    minimumRequired,
    warningMargin,
    healthStatus,
    maxConsecutiveSkips,
    classesNeededToRecover,
  } = stats;

  const renderBadge = () => {
    switch (healthStatus) {
      case 'SAFE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
            <ShieldCheck className="w-3.5 h-3.5" /> Safe Margin
          </span>
        );
      case 'NEAR_THRESHOLD':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/25">
            <AlertTriangle className="w-3.5 h-3.5" /> Near Threshold
          </span>
        );
      case 'BELOW_THRESHOLD':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/25">
            <AlertOctagon className="w-3.5 h-3.5" /> Deficit
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/15 text-slate-400 border border-slate-500/25">
            <HelpCircle className="w-3.5 h-3.5" /> Insufficient Data
          </span>
        );
    }
  };

  const renderAdvice = () => {
    if (healthStatus === 'INSUFFICIENT_DATA') {
      return (
        <p className="text-xs text-slate-400">
          No classes conducted yet. Minimum target is {minimumRequired}%.
        </p>
      );
    }
    if (healthStatus === 'BELOW_THRESHOLD') {
      return (
        <p className="text-xs text-rose-400 font-medium">
          Must attend next <strong className="font-bold underline">{classesNeededToRecover}</strong> consecutive{' '}
          {classesNeededToRecover === 1 ? 'class' : 'classes'} to reach {minimumRequired}%.
        </p>
      );
    }
    if (healthStatus === 'NEAR_THRESHOLD') {
      return (
        <p className="text-xs text-amber-300 font-medium">
          At edge! Can safely miss{' '}
          <strong className="font-bold">{maxConsecutiveSkips}</strong>{' '}
          {maxConsecutiveSkips === 1 ? 'class' : 'classes'} before dropping below threshold.
        </p>
      );
    }
    return (
      <p className="text-xs text-emerald-400 font-medium">
        Safe to miss <strong className="font-bold">{maxConsecutiveSkips}</strong> upcoming{' '}
        {maxConsecutiveSkips === 1 ? 'class' : 'classes'} without falling below {minimumRequired}%.
      </p>
    );
  };

  const getProgressColor = () => {
    if (healthStatus === 'SAFE') return 'bg-emerald-500';
    if (healthStatus === 'NEAR_THRESHOLD') return 'bg-amber-500';
    if (healthStatus === 'BELOW_THRESHOLD') return 'bg-rose-500';
    return 'bg-slate-600';
  };

  return (
    <div className="bg-[#111827] border border-[#1f293d] hover:border-slate-700/80 rounded-xl p-5 transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/20">
                {subjectCode}
              </span>
              <h3 className="font-semibold text-sm text-slate-100">{subjectName}</h3>
            </div>
          </div>
          <div>{renderBadge()}</div>
        </div>

        {/* Big percentage display */}
        <div className="flex items-baseline gap-3 my-3">
          <div className="text-3xl font-extrabold tracking-tight text-white">
            {percentage.toFixed(1)}%
          </div>
          <div className="text-xs text-slate-400">
            {totalAttended} / {totalConducted} classes attended
          </div>
        </div>

        {/* Progress Bar with target threshold tick mark */}
        <div className="relative w-full bg-[#1e293b] h-2 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
          {/* Target marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white/70"
            style={{ left: `${minimumRequired}%` }}
            title={`Target: ${minimumRequired}%`}
          />
        </div>

        {/* Advice / Safe skips sentence */}
        <div className="bg-[#0c1220] p-2.5 rounded-lg border border-[#1f293d]/60 mb-3">
          {renderAdvice()}
        </div>
      </div>

      {/* Simulator Link */}
      {onSimulateClick && (
        <button
          type="button"
          onClick={() => onSimulateClick(subjectId)}
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-[#182234] hover:bg-blue-600/20 hover:text-blue-300 text-xs font-medium text-slate-300 transition-colors"
        >
          <TrendingUp className="w-3.5 h-3.5 text-blue-400" /> Simulate Absences & Recoveries
        </button>
      )}
    </div>
  );
}
