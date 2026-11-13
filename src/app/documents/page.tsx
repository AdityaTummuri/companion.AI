'use client';

import React from 'react';
import { FileText, UploadCloud, FolderCheck, HardDrive, CheckCircle2 } from 'lucide-react';

export default function DocumentsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="pb-4 border-b border-[#1e293b]">
        <div className="flex items-center gap-2">
          <FileText className="w-7 h-7 text-indigo-400" />
          <h1 className="text-2xl font-extrabold text-white">Academic Knowledge Base</h1>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 uppercase">
            Phase 4 Roadmap Shell
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Syllabus PDFs, lecture slide indexer, and Google Drive document integration
        </p>
      </div>

      <div className="bg-[#111827] border border-[#1f293d] rounded-2xl p-8 text-center max-w-2xl mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
          <UploadCloud className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-white">Document Processing Pipeline</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          In Phase 4, you can upload PDF syllabi, exam schedules, and lecture notes. The companion
          will automatically cross-reference course topics against your timetable occurrences and task deadlines.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-left">
          <div className="p-3 rounded-xl bg-[#0c1220] border border-[#1f293d]">
            <FolderCheck className="w-4 h-4 text-emerald-400 mb-1" />
            <h4 className="text-xs font-semibold text-slate-200">Syllabus Indexing</h4>
            <p className="text-[11px] text-slate-500 mt-1">Auto-extract course milestones &amp; modules</p>
          </div>
          <div className="p-3 rounded-xl bg-[#0c1220] border border-[#1f293d]">
            <HardDrive className="w-4 h-4 text-blue-400 mb-1" />
            <h4 className="text-xs font-semibold text-slate-200">Google Drive Sync</h4>
            <p className="text-[11px] text-slate-500 mt-1">Link assignment folders and notes</p>
          </div>
          <div className="p-3 rounded-xl bg-[#0c1220] border border-[#1f293d]">
            <CheckCircle2 className="w-4 h-4 text-purple-400 mb-1" />
            <h4 className="text-xs font-semibold text-slate-200">Deterministic First</h4>
            <p className="text-[11px] text-slate-500 mt-1">Files enrich your timetable without slowing it down</p>
          </div>
        </div>
      </div>
    </div>
  );
}
