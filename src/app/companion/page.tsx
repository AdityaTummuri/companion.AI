'use client';

import React from 'react';
import { Sparkles, Key, Cpu, ShieldCheck, Terminal, Check } from 'lucide-react';
import { useStudentData } from '@/lib/storage/data-store';
import { formatAttendanceSummary } from '@/lib/attendance-engine';

export default function CompanionPage() {
  const { subjects, subjectStats } = useStudentData();

  // Demonstration of deterministic tool calling output format
  const sampleToolOutput = subjects
    .map((s) => {
      const stats = subjectStats[s.id];
      return stats ? formatAttendanceSummary(stats) : null;
    })
    .filter(Boolean)
    .join('\n');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="pb-4 border-b border-[#1e293b]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-purple-400" />
          <h1 className="text-2xl font-extrabold text-white">BYOK AI Student Companion</h1>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/25 uppercase">
            Phase 4 Roadmap Shell
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Bring-Your-Own-Key academic intelligence powered by deterministic tool execution
        </p>
      </div>

      {/* Principle Banner */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3 text-purple-400">
          <ShieldCheck className="w-6 h-6" />
          <h2 className="text-base font-bold text-white">
            Architecture Principle: Zero LLM Math Delegation
          </h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          When the AI companion answers questions like <em>&quot;Can I skip OS tomorrow?&quot;</em> or{' '}
          <em>&quot;How many classes do I need to attend to recover 80% in DBMS?&quot;</em>, it{' '}
          <strong>never performs arithmetic inside its generation tokens</strong>. Instead, it invokes
          the local deterministic tools:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-[#0c1220] border border-[#1f293d] font-mono text-xs">
            <span className="text-purple-400 font-bold block mb-1">Tool 1: get_attendance_summary()</span>
            <span className="text-slate-400 text-[11px]">
              Returns verified counts of attended, conducted, percentage, and safe consecutive skips.
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0c1220] border border-[#1f293d] font-mono text-xs">
            <span className="text-purple-400 font-bold block mb-1">
              Tool 2: simulate_absences(x, y)
            </span>
            <span className="text-slate-400 text-[11px]">
              Deterministic projection calculation matching <code className="text-blue-400">simulateAttendance()</code>.
            </span>
          </div>
        </div>
      </div>

      {/* Live Tool Execution Preview */}
      <div className="bg-[#0c1220] border border-[#1f293d] rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            Live Deterministic Tool Output (<code className="text-emerald-400">get_attendance_summary</code>)
          </span>
          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <Check className="w-3 h-3" /> Pure TypeScript execution
          </span>
        </div>
        <pre className="p-3.5 rounded-xl bg-[#070b12] border border-[#1a2336] text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
          {sampleToolOutput || 'No subjects loaded.'}
        </pre>
      </div>

      {/* Provider Fallback Strategy */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-blue-400">
          <Cpu className="w-5 h-5" />
          <h3 className="text-sm font-bold text-white">Supported Free &amp; Low-Cost Providers</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          In Phase 4, configure free-tier keys for Gemini 2.5 Flash, Groq Llama 3, OpenAI, or local Ollama.
          If AI providers are offline or quota-depleted, the app remains 100% functional because all core
          attendance calculations and timetable logic are deterministic.
        </p>
      </div>
    </div>
  );
}
