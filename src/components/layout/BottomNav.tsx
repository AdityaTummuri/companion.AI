'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CheckCircle2,
  CalendarDays,
  ListTodo,
  Settings,
} from 'lucide-react';
import { useStudentData } from '@/lib/storage/data-store';

const MOBILE_NAV_ITEMS = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/attendance', label: 'Attendance', icon: CheckCircle2 },
  { href: '/timetable', label: 'Schedule', icon: CalendarDays },
  { href: '/tasks', label: 'Tasks', icon: ListTodo },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const { todayOccurrences } = useStudentData();

  const pendingCount = todayOccurrences.filter((o) => o.status === 'PENDING').length;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0c1220]/95 backdrop-blur-lg border-t border-[#1e293b] px-2 py-1 safe-area-pb">
      <div className="flex items-center justify-around">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const isHome = item.href === '/';

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-3 relative transition-colors ${
                isActive ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {isHome && pendingCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-amber-500 text-slate-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="w-1 h-1 bg-blue-500 rounded-full mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
