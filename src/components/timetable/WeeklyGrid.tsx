'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  BookOpen,
} from 'lucide-react';
import { ClassType, Subject, TimetableEntry } from '@/lib/types';
import { useStudentData } from '@/lib/storage/data-store';

const DAYS = [
  { dayIndex: 1, name: 'Monday', short: 'Mon' },
  { dayIndex: 2, name: 'Tuesday', short: 'Tue' },
  { dayIndex: 3, name: 'Wednesday', short: 'Wed' },
  { dayIndex: 4, name: 'Thursday', short: 'Thu' },
  { dayIndex: 5, name: 'Friday', short: 'Fri' },
  { dayIndex: 6, name: 'Saturday', short: 'Sat' },
];

export function WeeklyGrid() {
  const {
    timetableEntries,
    subjects,
    addTimetableEntry,
    deleteTimetableEntry,
    timetableVersion,
  } = useStudentData();

  const [activeDay, setActiveDay] = useState<number>(1);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [newSubjectId, setNewSubjectId] = useState<string>(subjects[0]?.id || '');
  const [newDayOfWeek, setNewDayOfWeek] = useState<number>(1);
  const [newStartTime, setNewStartTime] = useState<string>('09:00');
  const [newEndTime, setNewEndTime] = useState<string>('10:00');
  const [newClassType, setNewClassType] = useState<ClassType>('LECTURE');
  const [newRoom, setNewRoom] = useState<string>('Hall 101');

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectId) return;

    await addTimetableEntry({
      subject_id: newSubjectId,
      day_of_week: newDayOfWeek,
      start_time: newStartTime,
      end_time: newEndTime,
      class_type: newClassType,
      room: newRoom,
      is_active: true,
    });

    setShowAddModal(false);
  };

  const getEntriesForDay = (dayIndex: number) => {
    return timetableEntries
      .filter((e) => e.day_of_week === dayIndex && e.is_active)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  const getTypeBadge = (type: ClassType) => {
    switch (type) {
      case 'LAB':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/25">
            LAB
          </span>
        );
      case 'TUTORIAL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25">
            TUTORIAL
          </span>
        );
      case 'EXTRA':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/25">
            EXTRA
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/25">
            LECTURE
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Version Info & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111827] border border-[#1f293d] p-5 rounded-2xl">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            {timetableVersion?.version_name || 'Active Timetable'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Effective: {timetableVersion?.effective_from} to{' '}
            {timetableVersion?.effective_until || 'End of Semester'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setNewDayOfWeek(activeDay);
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Slot
        </button>
      </div>

      {/* Day Selector Pills */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#0c1220] border border-[#1f293d] rounded-xl overflow-x-auto">
        {DAYS.map((day) => {
          const count = getEntriesForDay(day.dayIndex).length;
          const isActive = activeDay === day.dayIndex;

          return (
            <button
              key={day.dayIndex}
              type="button"
              onClick={() => setActiveDay(day.dayIndex)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#111827]'
              }`}
            >
              <span>{day.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Day Slots List */}
      <div className="space-y-3">
        {getEntriesForDay(activeDay).length === 0 ? (
          <div className="p-8 text-center bg-[#111827] border border-[#1f293d] rounded-xl text-slate-500 text-xs">
            No classes scheduled for {DAYS.find((d) => d.dayIndex === activeDay)?.name}. Tap
            &quot;Add Slot&quot; to configure a class.
          </div>
        ) : (
          getEntriesForDay(activeDay).map((entry) => {
            const subject = subjects.find((s) => s.id === entry.subject_id);

            return (
              <div
                key={entry.id}
                className="bg-[#111827] border border-[#1f293d] hover:border-slate-700 p-4 rounded-xl flex items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-center gap-4">
                  {/* Time badge */}
                  <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1f293d] text-center min-w-[100px]">
                    <div className="text-xs font-bold text-white flex items-center justify-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      {entry.start_time}
                    </div>
                    <div className="text-[10px] text-slate-500">to {entry.end_time}</div>
                  </div>

                  {/* Subject Details */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-400">
                        {subject?.subject_code || 'CLASS'}
                      </span>
                      {getTypeBadge(entry.class_type)}
                    </div>
                    <h4 className="font-semibold text-sm text-slate-100 mt-1">
                      {subject?.name || 'Class Session'}
                    </h4>
                    {entry.room && (
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {entry.room}
                      </p>
                    )}
                  </div>
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => deleteTimetableEntry(entry.id)}
                  title="Remove slot"
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Add Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111827] border border-[#1f293d] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" /> Add Timetable Slot
            </h3>
            <form onSubmit={handleAddEntry} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Subject
                </label>
                <select
                  value={newSubjectId}
                  onChange={(e) => setNewSubjectId(e.target.value)}
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
                  <label className="block text-xs font-medium text-slate-400 mb-1">Day</label>
                  <select
                    value={newDayOfWeek}
                    onChange={(e) => setNewDayOfWeek(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#0c1220] border border-[#1f293d] text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    {DAYS.map((d) => (
                      <option key={d.dayIndex} value={d.dayIndex}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Type</label>
                  <select
                    value={newClassType}
                    onChange={(e) => setNewClassType(e.target.value as ClassType)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#0c1220] border border-[#1f293d] text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="LECTURE">Lecture</option>
                    <option value="LAB">Lab</option>
                    <option value="TUTORIAL">Tutorial</option>
                    <option value="EXTRA">Extra</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#0c1220] border border-[#1f293d] text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#0c1220] border border-[#1f293d] text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Room / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hall 302, Lab 4"
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#0c1220] border border-[#1f293d] text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-sm"
                >
                  Save Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
