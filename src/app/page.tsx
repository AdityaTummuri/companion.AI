'use client';

import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle,
  Plus,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  ListTodo,
} from 'lucide-react';
import Link from 'next/link';
import { useStudentData } from '@/lib/storage/data-store';
import { CheckInCard } from '@/components/attendance/CheckInCard';
import { SubjectHealthCard } from '@/components/attendance/SubjectHealthCard';
import { ClassType } from '@/lib/types';

export default function DashboardPage() {
  const {
    profile,
    subjects,
    todayOccurrences,
    subjectStats,
    overallStats,
    tasks,
    toggleTask,
    addExtraClass,
    isLoaded,
    todayDate,
  } = useStudentData();

  const [showExtraClassModal, setShowExtraClassModal] = useState(false);
  const [extraSubId, setExtraSubId] = useState(subjects[0]?.id || '');
  const [extraStartTime, setExtraStartTime] = useState('16:00');
  const [extraEndTime, setExtraEndTime] = useState('17:00');
  const [extraClassType, setExtraClassType] = useState<ClassType>('EXTRA');
  const [extraNotes, setExtraNotes] = useState('Makeup lecture');

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-400 text-sm flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Loading student companion...
        </div>
      </div>
    );
  }

  const pendingClasses = todayOccurrences.filter((o) => o.status === 'PENDING');
  const activeTasks = tasks.filter((t) => t.status !== 'COMPLETED').slice(0, 4);

  const handleCreateExtraClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extraSubId) return;

    await addExtraClass({
      subjectId: extraSubId,
      date: todayDate,
      startTime: extraStartTime,
      endTime: extraEndTime,
      classType: extraClassType,
      notes: extraNotes,
    });

    setShowExtraClassModal(false);
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900/40 border border-blue-500/20 rounded-2xl p-6 md:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
              <Calendar className="w-3.5 h-3.5" /> {formattedDate}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {profile.display_name.split(' ')[0]}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
              {pendingClasses.length > 0
                ? `You have ${pendingClasses.length} pending class ${
                    pendingClasses.length === 1 ? 'occurrence' : 'occurrences'
                  } today requiring check-in.`
                : 'All classes checked in for today! Your attendance health is up to date.'}
            </p>
          </div>

          {/* Quick Health Stats Pill */}
          <div className="bg-[#0c1220]/80 backdrop-blur border border-slate-700/60 rounded-xl p-4 flex items-center gap-5 shrink-0">
            <div>
              <span className="text-[11px] text-slate-400 block">Overall Attendance</span>
              <span
                className={`text-2xl font-black ${
                  overallStats.overallPercentage >= profile.default_min_attendance
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                {overallStats.overallPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-px h-10 bg-slate-800" />
            <div>
              <span className="text-[11px] text-slate-400 block">Target Threshold</span>
              <span className="text-2xl font-bold text-slate-200">
                {profile.default_min_attendance}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Classes Check-In Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Today&apos;s Classes Check-in</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
              {todayOccurrences.length}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setExtraSubId(subjects[0]?.id || '');
              setShowExtraClassModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#182234] hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Extra Class
          </button>
        </div>

        {todayOccurrences.length === 0 ? (
          <div className="bg-[#111827] border border-[#1f293d] rounded-2xl p-8 text-center text-slate-400 text-xs">
            No classes scheduled for today. Tap &quot;Add Extra Class&quot; to log an unscheduled makeup lecture or lab.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayOccurrences.map((occ) => (
              <CheckInCard key={occ.id} occurrence={occ} />
            ))}
          </div>
        )}
      </section>

      {/* Attendance Health Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Subject Attendance Health</h2>
          </div>
          <Link
            href="/attendance"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            Full Audit &amp; Simulator <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub) => {
            const stats = subjectStats[sub.id];
            if (!stats) return null;
            return <SubjectHealthCard key={sub.id} stats={stats} />;
          })}
        </div>
      </section>

      {/* Tasks & Immediate Priorities */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Academic Tasks &amp; Priorities</h2>
          </div>
          <Link
            href="/tasks"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            View All Tasks <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-[#111827] border border-[#1f293d] rounded-2xl divide-y divide-[#1f293d]">
          {activeTasks.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No pending tasks! You are all caught up.
            </div>
          ) : (
            activeTasks.map((task) => {
              const sub = subjects.find((s) => s.id === task.subject_id);
              return (
                <div
                  key={task.id}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-[#131c2e] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.status === 'COMPLETED'}
                      onChange={() => toggleTask(task.id)}
                      className="w-4 h-4 rounded accent-blue-600 bg-slate-800 border-slate-700 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        {sub && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-500/15 text-blue-400">
                            {sub.subject_code}
                          </span>
                        )}
                        <h4 className="text-xs font-semibold text-slate-100">
                          {task.title}
                        </h4>
                      </div>
                      {task.description && (
                        <p className="text-[11px] text-slate-400 mt-0.5">{task.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        task.priority === 'CRITICAL'
                          ? 'bg-rose-500/15 text-rose-400'
                          : task.priority === 'HIGH'
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-slate-500/15 text-slate-400'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Add Extra Class Modal */}
      {showExtraClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111827] border border-[#1f293d] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" /> Add Unscheduled / Extra Class
            </h3>
            <form onSubmit={handleCreateExtraClass} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Subject
                </label>
                <select
                  value={extraSubId}
                  onChange={(e) => setExtraSubId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#0c1220] border border-[#1f293d] text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.subject_code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={extraStartTime}
                    onChange={(e) => setExtraStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#0c1220] border border-[#1f293d] text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={extraEndTime}
                    onChange={(e) => setExtraEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#0c1220] border border-[#1f293d] text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Class Type
                </label>
                <select
                  value={extraClassType}
                  onChange={(e) => setExtraClassType(e.target.value as ClassType)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#0c1220] border border-[#1f293d] text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="EXTRA">Extra Lecture</option>
                  <option value="LAB">Makeup Lab</option>
                  <option value="TUTORIAL">Tutorial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Makeup lecture for missed Monday session"
                  value={extraNotes}
                  onChange={(e) => setExtraNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#0c1220] border border-[#1f293d] text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowExtraClassModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-sm"
                >
                  Add Class to Today
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
