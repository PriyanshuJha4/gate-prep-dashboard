"use client";

import { useState } from "react";
import { useSelectedUser } from "@/hooks/useSelectedUser";
import { subjects, type ErrorLogEntry } from "@/lib/gateData";
import { useLocalStorageValue } from "@/hooks/useLocalStorageValue";

const reasonColors: Record<string, string> = {
  "misread the question": "bg-cyan-500/15 text-cyan-200",
  "wrong formula": "bg-violet-500/15 text-violet-200",
  "concept gap": "bg-amber-500/15 text-amber-200",
  "unit/sign error": "bg-emerald-500/15 text-emerald-200",
  "calculation slip": "bg-rose-500/15 text-rose-200",
  "ran out of time": "bg-indigo-500/15 text-indigo-200",
  guessed: "bg-slate-500/15 text-slate-200",
};

export default function ErrorLogPage() {
  const { selectedUser } = useSelectedUser();
  const [filter, setFilter] = useState("all");
  const [storedEntries, saveEntries] = useLocalStorageValue<ErrorLogEntry[]>(selectedUser ? `gate-errors-${selectedUser.id}` : null, []);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    subject: subjects[0]?.name ?? "",
    question: "",
    reason: "concept gap",
  });

  const entries = selectedUser
    ? storedEntries.filter((entry) => filter === "all" ? true : filter === "resolved" ? entry.resolved : !entry.resolved)
    : [];

  const persistEntries = (nextEntries: ErrorLogEntry[]) => {
    if (!selectedUser) return;
    saveEntries(nextEntries);
  };

  const addError = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedUser || !form.question.trim()) return;
    const entry: ErrorLogEntry = {
      id: crypto.randomUUID(),
      userId: selectedUser.id,
      date: form.date,
      subject: form.subject,
      question: form.question.trim(),
      reason: form.reason,
      resolved: false,
    };
    persistEntries([...storedEntries, entry]);
    setForm((current) => ({ ...current, question: "" }));
  };

  const toggleResolved = (entryId: string) => {
    persistEntries(storedEntries.map((entry) => entry.id === entryId ? { ...entry, resolved: !entry.resolved } : entry));
  };

  const deleteEntry = (entryId: string) => {
    persistEntries(storedEntries.filter((entry) => entry.id !== entryId));
  };

  const reasonCounts = new Map<string, number>();
  entries.forEach((entry) => {
    reasonCounts.set(entry.reason, (reasonCounts.get(entry.reason) ?? 0) + 1);
  });
  const reasonBreakdown = Array.from(reasonCounts.entries());

  if (!selectedUser) {
    return (
      <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6 text-slate-300">
        Add a user to review mistake patterns.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 border-b border-slate-800 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Error log</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Mistake review and pattern spotting</h2>
        </div>
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
        >
          <option value="all">All entries</option>
          <option value="resolved">Resolved</option>
          <option value="unresolved">Unresolved</option>
        </select>
      </header>

      <form onSubmit={addError} className="grid gap-4 rounded-2xl border border-slate-700 bg-slate-900/80 p-5 md:grid-cols-2">
        <h3 className="md:col-span-2 text-lg font-semibold text-white">Add an error-log entry</h3>
        <label className="space-y-1 text-sm text-slate-300">
          <span className="block">Date</span>
          <input required type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className={inputClass} />
        </label>
        <label className="space-y-1 text-sm text-slate-300">
          <span className="block">Subject</span>
          <select value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} className={inputClass}>
            {subjects.map((subject) => <option key={subject.id}>{subject.name}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-sm text-slate-300">
          <span className="block">Question or topic</span>
          <input required value={form.question} onChange={(event) => setForm({ ...form, question: event.target.value })} className={inputClass} placeholder="What went wrong?" />
        </label>
        <label className="space-y-1 text-sm text-slate-300">
          <span className="block">Reason</span>
          <select value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} className={inputClass}>
            {Object.keys(reasonColors).map((reason) => <option key={reason}>{reason}</option>)}
          </select>
        </label>
        <button type="submit" className="w-fit rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300">Save entry</button>
      </form>

      <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5">
        <h3 className="mb-4 text-lg font-semibold text-white">Most common wrong reason</h3>
        <div className="flex flex-wrap gap-3">
          {reasonBreakdown.length ? reasonBreakdown.map(([reason, count]) => (
            <span key={reason} className={`rounded-full px-3 py-2 text-sm font-medium ${reasonColors[reason] ?? "bg-slate-500/15 text-slate-200"}`}>
              {reason}: {count}
            </span>
          )) : <span className="text-slate-400">No entries match the current filter.</span>}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-700 bg-slate-900/80">
        <table className="min-w-full text-left text-sm text-slate-200">
          <thead className="bg-slate-950 text-xs uppercase tracking-[0.2em] text-slate-300">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Question</th>
              <th className="px-4 py-3">Exact reason</th>
              <th className="px-4 py-3">Resolved</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-t border-slate-800">
                <td className="px-4 py-3">{entry.date}</td>
                <td className="px-4 py-3 text-white">{entry.subject}</td>
                <td className="px-4 py-3">{entry.question}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${reasonColors[entry.reason] ?? "bg-slate-500/15 text-slate-200"}`}>
                    {entry.reason}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button type="button" onClick={() => toggleResolved(entry.id)} className="text-cyan-200 hover:text-cyan-100">
                    {entry.resolved ? "Resolved" : "Mark resolved"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button type="button" onClick={() => deleteEntry(entry.id)} className="text-rose-300 hover:text-rose-200">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputClass = "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100";
