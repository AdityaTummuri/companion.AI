'use client';

import React, { useState, useMemo } from 'react';
import { Subject, SubjectStats } from '@/lib/types';
import { simulateAttendance } from '@/lib/attendance-engine';
import {
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  RotateCcw,
  Info,
  Sliders,
} from 'lucide-react';

interface WhatIfSimulatorProps {
  subjects: Subject[];
  subjectStats: Record<string, SubjectStats>;
  initialSubjectId?: string;
}

export function WhatIfSimulator({
  subjects,
  subjectStats,
  initialSubjectId,
}: WhatIfSimulatorProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSubjectId || subjects[0]?.id || ''
  );
  const [attendNext, setAttendNext] = useState<number>(0);
  const [missNext, setMissNext] = useState<number>(0);

  const selectedStats = subjectStats[selectedSubjectId];
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  const simulation = useMemo(() => {
    if (!selectedStats) return null;

    return simulateAttendance({
      attended: selectedStats.totalAttended,
      conducted: selectedStats.totalConducted,
      attendNext,
      missNext,
      minimumRequired: selectedStats.minimumRequired,
      warningMargin: selectedStats.warningMargin,
    });
  }, [selectedStats, attendNext, missNext]);

  const resetSimulation = () => {
    setAttendNext(0);
    setMissNext(0);
  };

  if (!selectedStats || !selectedSubject) {
    return (
      <div className="p-6 text-center text-slate-500 bg-[#111827] rounded-xl border border-[#1f293d]">
        No subject available to simulate.
      </div>
    );
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/15 text-slate-400">
            Insufficient Data
          </span>
        );
    }
  };

  return (
    <div className="bg-[#111827] border border-[#1f293d] rounded-2xl p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#1f293d]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/20">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              Attendance &quot;What-If&quot; Simulator
            </h2>
            <p className="text-xs text-slate-400">
              Deterministic mathematical projection of upcoming attendance and absences
            </p>
          </div>
        </div>

        {/* Subject Selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="subject-select" className="text-xs text-slate-400 font-medium">Subject:</label>
          <select
            id="subject-select"
            value={selectedSubjectId}
            onChange={(e) => {
              setSelectedSubjectId(e.target.value);
              resetSimulation();
            }}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#0c1220] border border-[#1f293d] text-slate-200 focus:outline-none focus:border-blue-500"
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.subject_code} - {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Projection Comparison Card */}
      {simulation && (
        <div className="my-6 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-[#0c1220] border border-[#1f293d]">
          {/* Current */}
          <div className="p-3 rounded-lg bg-[#111827]/60 border border-[#1f293d]/50">
            <span className="text-xs text-slate-400 block mb-1">Current Attendance</span>
            <div className="text-2xl font-bold text-slate-200">
              {simulation.currentPercentage.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {selectedStats.totalAttended} / {selectedStats.totalConducted} classes
            </div>
            <div className="mt-2">{renderStatusBadge(selectedStats.healthStatus)}</div>
          </div>

          {/* Projection Indicator */}
          <div className="p-3 rounded-lg bg-[#111827]/60 border border-[#1f293d]/50 flex flex-col justify-center items-center text-center">
            <span className="text-xs text-slate-400 block mb-1">Projected Shift</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-400">
                {simulation.currentPercentage.toFixed(1)}%
              </span>
              <ArrowRight className="w-4 h-4 text-blue-400" />
              <span className="text-xl font-bold text-white">
                {simulation.projectedPercentage.toFixed(1)}%
              </span>
            </div>
            <div
              className={`text-xs font-semibold mt-1 ${
                simulation.delta > 0
                  ? 'text-emerald-400'
                  : simulation.delta < 0
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }`}
            >
              {simulation.delta > 0 ? `+${simulation.delta.toFixed(1)}%` : `${simulation.delta.toFixed(1)}%`}
            </div>
          </div>

          {/* Projected Status */}
          <div className="p-3 rounded-lg bg-[#111827]/60 border border-[#1f293d]/50">
            <span className="text-xs text-slate-400 block mb-1">Projected Outcome</span>
            <div className="text-2xl font-bold text-white">
              {simulation.projectedPercentage.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {simulation.attendedAfter} / {simulation.conductedAfter} classes
            </div>
            <div className="mt-2">{renderStatusBadge(simulation.statusAfterSimulation)}</div>
          </div>
        </div>
      )}

      {/* Sliders Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-[#1f293d]">
        {/* Attend Next Classes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Attend Next Classes (+{attendNext})
            </label>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              +{attendNext}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={30}
            step={1}
            value={attendNext}
            onChange={(e) => setAttendNext(Number(e.target.value))}
            className="w-full accent-emerald-500 h-2 bg-[#1e293b] rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>0</span>
            <span>10</span>
            <span>20</span>
            <span>30 classes</span>
          </div>
        </div>

        {/* Miss Next Classes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              Skip Next Classes (+{missNext})
            </label>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/20">
              +{missNext}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={30}
            step={1}
            value={missNext}
            onChange={(e) => setMissNext(Number(e.target.value))}
            className="w-full accent-rose-500 h-2 bg-[#1e293b] rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>0</span>
            <span>10</span>
            <span>20</span>
            <span>30 classes</span>
          </div>
        </div>
      </div>

      {/* Quick Action Presets & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Quick Scenarios:</span>
          <button
            type="button"
            onClick={() => {
              setAttendNext(5);
              setMissNext(0);
            }}
            className="px-2.5 py-1 text-xs rounded-lg bg-[#182234] hover:bg-[#1f2d47] text-slate-300 transition-colors"
          >
            Attend Next 5
          </button>
          <button
            type="button"
            onClick={() => {
              setAttendNext(0);
              setMissNext(1);
            }}
            className="px-2.5 py-1 text-xs rounded-lg bg-[#182234] hover:bg-[#1f2d47] text-slate-300 transition-colors"
          >
            Skip Next 1
          </button>
          <button
            type="button"
            onClick={() => {
              setAttendNext(0);
              setMissNext(3);
            }}
            className="px-2.5 py-1 text-xs rounded-lg bg-[#182234] hover:bg-[#1f2d47] text-slate-300 transition-colors"
          >
            Skip Next 3
          </button>
        </div>

        <button
          type="button"
          onClick={resetSimulation}
          className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* Outcome Analysis Box */}
      {simulation && (
        <div className="mt-4 p-4 rounded-xl bg-[#0c1220] border border-[#1f293d]/80 space-y-2">
          {simulation.statusAfterSimulation === 'BELOW_THRESHOLD' ? (
            <div className="flex items-start gap-2 text-rose-400 text-xs">
              <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Threshold Breach Warning:</strong> In this
                scenario, attendance drops to {simulation.projectedPercentage.toFixed(1)}% (below{' '}
                {selectedStats.minimumRequired}%). You would then need to attend at least{' '}
                <strong className="underline">{simulation.classesToRecoverIfBelow}</strong> consecutive
                classes without missing any to restore {selectedStats.minimumRequired}%.
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-emerald-400 text-xs">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Safe Trajectory:</strong> Projected attendance is{' '}
                {simulation.projectedPercentage.toFixed(1)}%. Under this scenario, you would still have{' '}
                <strong className="underline">{simulation.maxSkipsAfterSimulation}</strong> consecutive
                safe skips remaining before falling below {selectedStats.minimumRequired}%.
              </div>
            </div>
          )}

          {/* Explicit mathematical assumptions */}
          <div className="pt-2 border-t border-[#1f293d]/50">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Info className="w-3 h-3 text-slate-500" /> Assumptions applied:
            </span>
            <ul className="list-disc list-inside text-[11px] text-slate-500 mt-1 space-y-0.5">
              {simulation.assumptions.map((assump, idx) => (
                <li key={idx}>{assump}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
