'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CheckCircle2,
  CalendarDays,
  ListTodo,
  FileText,
  Sparkles,
  Settings,
  GraduationCap,
  Percent,
} from 'lucide-react';
import { useStudentData } from '@/lib/storage/data-store';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/attendance', label: 'Attendance', icon: CheckCircle2 },
  { href: '/timetable', label: 'Timetable', icon: CalendarDays },
  { href: '/tasks', label: 'Tasks', icon: ListTodo },
  { href: '/documents', label: 'Documents', icon: FileText, badge: 'Phase 4' },
  { href: '/companion', label: 'AI Companion', icon: Sparkles, badge: 'Phase 4' },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { profile, overallStats } = useStudentData();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-[#1e293b] bg-[#0c1220] h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1e293b] flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-semibold text-sm tracking-tight text-white leading-tight">
            AI Companion
          </h1>
          <p className="text-xs text-slate-400">Student System</p>
        </div>
      </div>

      {/* Attendance Quick Health Bar */}
      <div className="px-4 py-3 mx-3 my-3 rounded-lg bg-[#131c2e] border border-[#1e293b]/70">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="flex items-center gap-1 font-medium">
            <Percent className="w-3.5 h-3.5 text-blue-400" /> Overall Attendance
          </span>
          <span
            className={`font-semibold ${
              overallStats.overallPercentage >= profile.default_min_attendance
                ? 'text-emerald-400'
                : 'text-rose-400'
            }`}
          >
            {overallStats.overallPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-[#1e293b] h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              overallStats.overallPercentage >= profile.default_min_attendance
                ? 'bg-emerald-500'
                : 'bg-rose-500'
            }`}
            style={{ width: `${Math.min(100, overallStats.overallPercentage)}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-1.5 text-[10px] text-slate-500">
          <span>{overallStats.totalAttended} / {overallStats.totalConducted} classes</span>
          <span>Target: {profile.default_min_attendance}%</span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#131c2e]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-[#1e293b] text-slate-400">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-[#1e293b] bg-[#090d16]">
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-[#131c2e] transition-colors">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300">
            {profile.display_name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-200 truncate">
              {profile.display_name}
            </p>
            <p className="text-[11px] text-slate-500 truncate">{profile.timezone}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
