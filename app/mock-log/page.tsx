"use client";

import { useState } from "react";
import { useSelectedUser } from "@/hooks/useSelectedUser";
import type { MockEntry } from "@/lib/gateData";
import { useLocalStorageValue } from "@/hooks/useLocalStorageValue";

export default function MockLogPage() {
  const { selectedUser } = useSelectedUser();
  const [entries, saveEntries] = useLocalStorageValue<MockEntry[]>(selectedUser ? `gate-mocks-${selectedUser.id}` : null, []);
  const [form, setForm] = useState({
    mock: "1",
    date: new Date().toISOString().slice(0, 10),
    aptitude: "",
    core: "",
    total: "",
    leak: "",
  });
  const [error, setError] = useState("");

  const submitMock = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedUser) return;
    const mock = Number(form.mock);
    const aptitude = Number(form.aptitude);
    const core = Number(form.core);
    const total = Number(form.total);
    if (!Number.isInteger(mock) || mock < 1 || aptitude < 0 || aptitude > 15 || core < 0 || core > 85 || total < 0 || total > 100) {
      setError("Enter a positive mock number and scores within their allowed ranges.");
      return;
    }
    if (aptitude + core !== total) {
      setError("Total score must equal Aptitude plus Core.");
      return;
    }

    const entry: MockEntry = { mock, date: form.date, aptitude, core, total, leak: form.leak.trim() || "Not noted" };
    const nextEntries = [...entries.filter((item) => item.mock !== mock), entry]
      .sort((left, right) => left.date.localeCompare(right.date) || left.mock - right.mock);
    saveEntries(nextEntries);
    setForm((current) => ({ ...current, mock: String(mock + 1), aptitude: "", core: "", total: "", leak: "" }));
    setError("");
  };

  if (!selectedUser) {
    return (
      <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6 text-slate-300">
        Add a user to review mock performance.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="border-b border-slate-800 pb-5">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Mock log</p>
        <h2 className="mt-2 text-3xl font-bold text-white">{selectedUser.name}&apos;s mock performance</h2>
      </header>

      <form onSubmit={submitMock} className="grid gap-4 rounded-2xl border border-slate-700 bg-slate-900/80 p-5 md:grid-cols-3">
        <h3 className="md:col-span-3 text-lg font-semibold text-white">Add mock result</h3>
        <Field label="Mock #">
          <input required min={1} type="number" value={form.mock} onChange={(event) => setForm({ ...form, mock: event.target.value })} className={inputClass} />
        </Field>
        <Field label="Date">
          <input required type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className={inputClass} />
        </Field>
        <Field label="Aptitude / 15">
          <input required min={0} max={15} step="0.5" type="number" value={form.aptitude} onChange={(event) => setForm({ ...form, aptitude: event.target.value })} className={inputClass} />
        </Field>
        <Field label="Core / 85">
          <input required min={0} max={85} step="0.5" type="number" value={form.core} onChange={(event) => setForm({ ...form, core: event.target.value })} className={inputClass} />
        </Field>
        <Field label="Total / 100">
          <input required min={0} max={100} step="0.5" type="number" value={form.total} onChange={(event) => setForm({ ...form, total: event.target.value })} className={inputClass} />
        </Field>
        <Field label="Biggest leak / weakness">
          <input value={form.leak} onChange={(event) => setForm({ ...form, leak: event.target.value })} className={inputClass} placeholder="e.g. time management" />
        </Field>
        <div className="flex items-end md:col-span-3">
          <button type="submit" className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300">Save mock</button>
        </div>
        {error && <p role="alert" className="md:col-span-3 text-sm text-rose-300">{error}</p>}
      </form>

      <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5">
        <h3 className="mb-4 text-lg font-semibold text-white">Total score trend</h3>
        <div className="flex h-48 items-end gap-3">
          {entries.map((entry) => (
            <div key={entry.mock} className="flex flex-1 flex-col items-center gap-2">
              <div className="text-[10px] text-slate-400">{entry.total}</div>
              <div className="w-full rounded-t-xl bg-gradient-to-t from-cyan-500 to-violet-500" style={{ height: `${(entry.total / 100) * 100}%` }} />
              <div className="text-[10px] text-slate-400">M{entry.mock}</div>
            </div>
          ))}
          {entries.length === 0 && <p className="self-center text-sm text-slate-400">No mock results yet.</p>}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-700 bg-slate-900/80">
        <table className="min-w-full text-left text-sm text-slate-200">
          <thead className="bg-slate-950 text-xs uppercase tracking-[0.2em] text-slate-300">
            <tr>
              <th className="px-4 py-3">Mock #</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Aptitude</th>
              <th className="px-4 py-3">Core</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Biggest leak</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.mock} className="border-t border-slate-800">
                <td className="px-4 py-3 font-medium text-white">{entry.mock}</td>
                <td className="px-4 py-3">{entry.date}</td>
                <td className="px-4 py-3">{entry.aptitude}/15</td>
                <td className="px-4 py-3">{entry.core}/85</td>
                <td className="px-4 py-3">{entry.total}/100</td>
                <td className="px-4 py-3 text-slate-300">{entry.leak}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputClass = "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1 text-sm text-slate-300">
      <span className="block">{label}</span>
      {children}
    </label>
  );
}
