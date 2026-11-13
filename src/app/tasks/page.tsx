'use client';

import React, { useState } from 'react';
import {
  ListTodo,
  Plus,
  Clock,
  Calendar,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { useStudentData } from '@/lib/storage/data-store';
import { Task, TaskPriority } from '@/lib/types';

export default function TasksPage() {
  const { tasks, subjects, addTask, toggleTask, deleteTask } = useStudentData();

  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState<string>(subjects[0]?.id || '');
  const [category, setCategory] = useState<Task['category']>('ACADEMIC');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [dueAt, setDueAt] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(60);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    await addTask({
      title,
      description,
      subject_id: subjectId || null,
      category,
      priority,
      due_at: dueAt ? new Date(dueAt).toISOString() : null,
      estimated_minutes: estimatedMinutes,
    });

    setTitle('');
    setDescription('');
    setShowAddModal(false);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterCategory !== 'ALL' && t.category !== filterCategory) return false;
    if (filterStatus === 'ACTIVE' && t.status === 'COMPLETED') return false;
    if (filterStatus === 'COMPLETED' && t.status !== 'COMPLETED') return false;
    return true;
  });

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'CRITICAL':
        return 'bg-rose-500/15 text-rose-400 border border-rose-500/25';
      case 'HIGH':
        return 'bg-amber-500/15 text-amber-400 border border-amber-500/25';
      case 'LOW':
        return 'bg-slate-500/15 text-slate-400 border border-slate-500/25';
      default:
        return 'bg-blue-500/15 text-blue-400 border border-blue-500/25';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1e293b]">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <ListTodo className="w-7 h-7 text-amber-400" /> Academic &amp; Personal Tasks
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track assignment deadlines, exam preparations, and academic goals
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#0c1220] border border-[#1f293d] rounded-xl">
        <div className="flex items-center gap-2">
          <label htmlFor="filter-status-select" className="text-xs text-slate-400 font-medium">Status:</label>
          <select
            id="filter-status-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg bg-[#111827] border border-[#1f293d] text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Tasks</option>
            <option value="ACTIVE">Active (To Do)</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="filter-category-select" className="text-xs text-slate-400 font-medium">Category:</label>
          <select
            id="filter-category-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg bg-[#111827] border border-[#1f293d] text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="ACADEMIC">Academic</option>
            <option value="ASSIGNMENT">Assignment</option>
            <option value="EXAM">Exam Prep</option>
            <option value="PERSONAL">Personal</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-2xl divide-y divide-[#1f293d]">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No tasks found. Click &quot;Add Task&quot; to organize your academic responsibilities.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const sub = subjects.find((s) => s.id === task.subject_id);
            const isDone = task.status === 'COMPLETED';

            return (
              <div
                key={task.id}
                className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                  isDone ? 'bg-[#0d1424]/50 opacity-60' : 'hover:bg-[#131c2e]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => toggleTask(task.id)}
                    className="mt-1 w-4 h-4 rounded accent-blue-600 bg-slate-800 border-slate-700 cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-semibold ${
                          isDone ? 'line-through text-slate-400' : 'text-slate-100'
                        }`}
                      >
                        {task.title}
                      </span>
                      {sub && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-500/15 text-blue-400">
                          {sub.subject_code}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${getPriorityBadge(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-400 mt-1">{task.description}</p>
                    )}

                    <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500">
                      {task.due_at && (
                        <span className="flex items-center gap-1 text-amber-400/80">
                          <Calendar className="w-3 h-3" /> Due:{' '}
                          {new Date(task.due_at).toLocaleDateString()}
                        </span>
                      )}
                      {task.estimated_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {task.estimated_minutes} mins
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" /> {task.category}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => deleteTask(task.id)}
                  title="Delete task"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111827] border border-[#1f293d] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" /> Add Academic Task
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete OS Assignment 2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#0c1220] border border-[#1f293d] text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Details or references"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#0c1220] border border-[#1f293d] text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Related Subject
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#0c1220] border border-[#1f293d] text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">None (Personal)</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.subject_code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Task['category'])}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#0c1220] border border-[#1f293d] text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="ACADEMIC">Academic</option>
                    <option value="ASSIGNMENT">Assignment</option>
                    <option value="EXAM">Exam Prep</option>
                    <option value="PERSONAL">Personal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#0c1220] border border-[#1f293d] text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueAt}
                    onChange={(e) => setDueAt(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#0c1220] border border-[#1f293d] text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
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
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
