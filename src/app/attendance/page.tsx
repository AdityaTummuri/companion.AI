'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Sliders,
  History,
  FileSpreadsheet,
  Plus,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { useStudentData } from '@/lib/storage/data-store';
import { SubjectHealthCard } from '@/components/attendance/SubjectHealthCard';
import { WhatIfSimulator } from '@/components/attendance/WhatIfSimulator';

export default function AttendancePage() {
  const {
    subjects,
    subjectStats,
    overallStats,
    occurrences,
    auditLogs,
    addSubject,
    profile,
  } = useStudentData();

  const [activeTab, setActiveTab] = useState<'cards' | 'simulator' | 'history' | 'audit'>('cards');
  const [selectedSubjectForSim, setSelectedSubjectForSim] = useState<string>(subjects[0]?.id || '');
  const [historySubjectFilter, setHistorySubjectFilter] = useState<string>('ALL');

  // Add Subject Form
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubSemester, setNewSubSemester] = useState('Semester 3');
  const [newSubMin, setNewSubMin] = useState<number>(profile.default_min_attendance || 80);

  const handleAddSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName || !newSubCode) return;

    await addSubject({
      name: newSubName,
      subject_code: newSubCode,
      semester: newSubSemester,
      minimum_attendance_percentage: newSubMin,
    });

    setNewSubName('');
    setNewSubCode('');
    setShowAddSubjectModal(false);
  };

  const handleSimulateSubject = (subjectId: string) => {
    setSelectedSubjectForSim(subjectId);
    setActiveTab('simulator');
  };

  const filteredHistory = occurrences
    .filter((o) => o.status !== 'PENDING')
    .filter((o) => (historySubjectFilter === 'ALL' ? true : o.subject_id === historySubjectFilter))
    .sort((a, b) => b.scheduled_date.localeCompare(a.scheduled_date));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1e293b]">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <CheckCircle2 className="w-7 h-7 text-blue-500" />
            Deterministic Attendance Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Mathematical calculations, safe-to-skip margins, and non-destructive audit history
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddSubjectModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Subject
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1e293b] overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('cards')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
            activeTab === 'cards'
              ? 'bg-blue-600/15 text-blue-400 border border-blue-500/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#131c2e]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Subject Health ({subjects.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
            activeTab === 'simulator'
              ? 'bg-blue-600/15 text-blue-400 border border-blue-500/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#131c2e]'
          }`}
        >
          <Sliders className="w-4 h-4" /> &quot;What-If&quot; Simulator
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
            activeTab === 'history'
              ? 'bg-blue-600/15 text-blue-400 border border-blue-500/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#131c2e]'
          }`}
        >
          <History className="w-4 h-4" /> Attendance History ({filteredHistory.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
            activeTab === 'audit'
              ? 'bg-blue-600/15 text-blue-400 border border-blue-500/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#131c2e]'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" /> Audit Log ({auditLogs.length})
        </button>
      </div>

      {/* Tab Content: Subject Health Cards */}
      {activeTab === 'cards' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjects.map((sub) => {
              const stats = subjectStats[sub.id];
              if (!stats) return null;
              return (
                <SubjectHealthCard
                  key={sub.id}
                  stats={stats}
                  onSimulateClick={handleSimulateSubject}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Content: What-If Simulator */}
      {activeTab === 'simulator' && (
        <WhatIfSimulator
          subjects={subjects}
          subjectStats={subjectStats}
          initialSubjectId={selectedSubjectForSim}
        />
      )}

      {/* Tab Content: Attendance History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="history-subject-filter" className="text-xs text-slate-400 font-medium">Filter by subject:</label>
            <select
              id="history-subject-filter"
              value={historySubjectFilter}
              onChange={(e) => setHistorySubjectFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#0c1220] border border-[#1f293d] text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.subject_code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-[#111827] border border-[#1f293d] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0c1220] text-slate-400 uppercase font-semibold border-b border-[#1f293d]">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f293d]">
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No attendance history records match the filter.
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map((occ) => {
                      const sub = subjects.find((s) => s.id === occ.subject_id);
                      return (
                        <tr key={occ.id} className="hover:bg-[#131c2e] transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-slate-200">
                            {occ.scheduled_date}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-white">
                              {sub?.subject_code}
                            </span>{' '}
                            - {sub?.name}
                          </td>
                          <td className="py-3 px-4 text-slate-400 font-mono">
                            {occ.start_time} - {occ.end_time}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                occ.status === 'PRESENT'
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : occ.status === 'ABSENT'
                                  ? 'bg-rose-500/15 text-rose-400'
                                  : 'bg-slate-500/15 text-slate-400'
                              }`}
                            >
                              {occ.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400 truncate max-w-xs">
                            {occ.notes || '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Audit Log */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#0c1220] border border-[#1f293d] text-xs text-slate-400 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              All modifications, status reversals, and attendance corrections are permanently
              logged with old and new values.
            </span>
          </div>

          <div className="bg-[#111827] border border-[#1f293d] rounded-2xl overflow-hidden divide-y divide-[#1f293d]">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No audit log entries recorded yet.
              </div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-[#131c2e] transition-colors text-xs">
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                          log.action === 'CORRECTION'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                            : 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                        }`}
                      >
                        {log.action}
                      </span>
                      <span className="font-semibold text-slate-200">
                        {log.entity_type}
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        ID: {log.entity_id}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="mt-2 bg-[#0c1220] p-2.5 rounded-lg border border-[#1f293d]/50 font-mono text-[11px] text-slate-400 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500 block mb-0.5">Old Value:</span>
                      <pre className="text-rose-400/90 whitespace-pre-wrap">
                        {log.old_value ? JSON.stringify(log.old_value, null, 2) : 'null'}
                      </pre>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">New Value:</span>
                      <pre className="text-emerald-400/90 whitespace-pre-wrap">
                        {log.new_value ? JSON.stringify(log.new_value, null, 2) : 'null'}
                      </pre>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111827] border border-[#1f293d] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" /> Create New Academic Subject
            </h3>
            <form onSubmit={handleAddSubjectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design and Analysis of Algorithms"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#0c1220] border border-[#1f293d] text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Subject Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS305"
                    value={newSubCode}
                    onChange={(e) => setNewSubCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#0c1220] border border-[#1f293d] text-slate-200 uppercase focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Semester
                  </label>
                  <input
                    type="text"
                    value={newSubSemester}
                    onChange={(e) => setNewSubSemester(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#0c1220] border border-[#1f293d] text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Minimum Attendance Threshold (%)
                </label>
                <input
                  type="number"
                  min={50}
                  max={100}
                  step={1}
                  value={newSubMin}
                  onChange={(e) => setNewSubMin(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#0c1220] border border-[#1f293d] text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-sm"
                >
                  Create Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
