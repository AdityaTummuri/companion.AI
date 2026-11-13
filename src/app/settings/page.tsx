'use client';

import React, { useState } from 'react';
import {
  Settings,
  Download,
  Copy,
  Check,
  AlertTriangle,
  RotateCcw,
  Database,
  User,
  Percent,
  Clock,
} from 'lucide-react';
import { useStudentData } from '@/lib/storage/data-store';

export default function SettingsPage() {
  const {
    profile,
    updateProfileThreshold,
    exportDataJson,
    resetToDefaults,
    isUsingSupabase,
  } = useStudentData();

  const [displayName, setDisplayName] = useState(profile.display_name);
  const [minAttendance, setMinAttendance] = useState(profile.default_min_attendance);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfileThreshold(minAttendance, displayName);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_companion_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyBackup = () => {
    const jsonStr = exportDataJson();
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-3xl animate-in fade-in duration-300">
      <div className="pb-4 border-b border-[#1e293b]">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-blue-500" />
          Settings &amp; Preferences
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure attendance thresholds, timezone, and data backups
        </p>
      </div>

      {/* Backend Mode Status */}
      <div className="p-4 rounded-xl bg-[#111827] border border-[#1f293d] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              isUsingSupabase ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'
            }`}
          />
          <div>
            <span className="text-xs font-semibold text-slate-200">
              {isUsingSupabase ? 'Connected to Supabase PostgreSQL' : 'Offline / Resilient Local Storage Mode'}
            </span>
            <p className="text-[11px] text-slate-400">
              {isUsingSupabase
                ? 'Your data synchronizes automatically with your private cloud database.'
                : 'All changes are stored in client persistent storage. Connect Supabase credentials in .env to enable multi-device cloud sync.'}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
          {isUsingSupabase ? 'Cloud' : 'Local'}
        </span>
      </div>

      {/* Profile & Threshold Settings Form */}
      <form onSubmit={handleSaveProfile} className="bg-[#111827] border border-[#1f293d] rounded-2xl p-6 space-y-5">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-blue-400" /> Academic Profile &amp; Thresholds
        </h2>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Display Name / Degree
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg bg-[#0c1220] border border-[#1f293d] text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Timezone
          </label>
          <input
            type="text"
            disabled
            value={profile.timezone}
            className="w-full px-3 py-2 text-xs rounded-lg bg-[#0c1220]/50 border border-[#1f293d] text-slate-400 cursor-not-allowed"
          />
          <p className="text-[10px] text-slate-500 mt-1">Default: Asia/Kolkata</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-blue-400" /> Default Minimum Attendance Threshold
            </label>
            <span className="text-xs font-bold text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
              {minAttendance}%
            </span>
          </div>
          <input
            type="range"
            min={50}
            max={95}
            step={1}
            value={minAttendance}
            onChange={(e) => setMinAttendance(Number(e.target.value))}
            className="w-full accent-blue-500 h-2 bg-[#1e293b] rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>50%</span>
            <span>75% (Standard)</span>
            <span>80% (Configured)</span>
            <span>85%</span>
            <span>95%</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#1f293d]">
          {savedSuccess ? (
            <span className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Settings updated successfully
            </span>
          ) : (
            <span className="text-[11px] text-slate-500">
              Threshold updates apply to all connected subject health calculations.
            </span>
          )}

          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>

      {/* Data Export & Backup */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" /> Data Export &amp; Backup
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Export your entire companion state—subjects, weekly timetable, attendance records,
          occurrences, tasks, and audit logs—into an idempotent JSON backup file.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleDownloadBackup}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" /> Download JSON Backup
          </button>

          <button
            type="button"
            onClick={handleCopyBackup}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#182234] hover:bg-[#1f2d47] text-slate-300 text-xs font-medium border border-[#1f293d] transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" /> Copied to Clipboard
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy Raw JSON
              </>
            )}
          </button>
        </div>
      </div>

      {/* Reset to Seed Data */}
      <div className="bg-[#111827] border border-rose-900/30 rounded-2xl p-6 space-y-3">
        <h2 className="text-sm font-bold text-rose-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Reset Companion State
        </h2>
        <p className="text-xs text-slate-400">
          Reset all subjects, timetable entries, and attendance history back to initial factory demo seed data.
        </p>

        {showResetConfirm ? (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 space-y-3">
            <p className="text-xs text-rose-300 font-medium">
              Are you sure? This will clear local storage and reload the sample engineering schedule.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  resetToDefaults();
                  setShowResetConfirm(false);
                }}
                className="px-3 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors"
              >
                Yes, Reset Everything
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium border border-rose-500/20 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset to Initial Demo Data
          </button>
        )}
      </div>
    </div>
  );
}
