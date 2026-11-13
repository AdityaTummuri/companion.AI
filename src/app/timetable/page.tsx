'use client';

import React from 'react';
import { CalendarDays, AlertCircle } from 'lucide-react';
import { WeeklyGrid } from '@/components/timetable/WeeklyGrid';

export default function TimetablePage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="pb-4 border-b border-[#1e293b]">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
          <CalendarDays className="w-7 h-7 text-blue-500" />
          Timetable &amp; Schedule Manager
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Structured recurring weekly timetable slots and one-off class occurrences
        </p>
      </div>

      <div className="bg-[#0c1220] p-4 rounded-xl border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
        <div>
          <strong className="font-semibold text-white">Non-Destructive Principle:</strong> Updating
          or editing timetable slots defines future occurrences and does not overwrite or corrupt
          historical attendance records.
        </div>
      </div>

      <WeeklyGrid />
    </div>
  );
}
