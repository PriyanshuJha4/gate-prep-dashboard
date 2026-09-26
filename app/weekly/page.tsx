"use client";

import { useSelectedUser } from "@/hooks/useSelectedUser";
import {
  getWeeklyStreak,
  weeklyRules,
  type WeeklyRuleEntry,
} from "@/lib/gateData";
import { useLocalStorageValue } from "@/hooks/useLocalStorageValue";

export default function WeeklyPage() {
  const { selectedUser } = useSelectedUser();
  const [storedEntries, saveEntries] = useLocalStorageValue<WeeklyRuleEntry[]>(
    selectedUser ? `gate-weekly-${selectedUser.id}` : null,
    weeklyRules,
  );
  const savedByWeek = new Map(storedEntries.map((entry) => [entry.week, entry]));
  const entries = weeklyRules.map((entry) => {
    const savedEntry = savedByWeek.get(entry.week);
    return {
      ...entry,
      classNotesDone: savedEntry?.classNotesDone ?? false,
      dppQuestionsDone: savedEntry?.dppQuestionsDone ?? false,
      pyqsDone: savedEntry?.pyqsDone ?? false,
      mockTestDone: savedEntry?.mockTestDone ?? false,
      errorLogDone: savedEntry?.errorLogDone ?? false,
      shortNotesDone: savedEntry?.shortNotesDone ?? false,
    };
  });

  const streak = getWeeklyStreak(entries);

  const updateRule = (week: number, key: keyof Pick<WeeklyRuleEntry, "classNotesDone" | "dppQuestionsDone" | "pyqsDone" | "mockTestDone" | "errorLogDone" | "shortNotesDone">, value: boolean) => {
    if (!selectedUser) return;
    const nextEntries = entries.map((entry) => entry.week === week ? { ...entry, [key]: value } : entry);
    saveEntries(nextEntries);
  };

  return (
    <div className="space-y-6">
      {!selectedUser && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
          Add a user from the sidebar to save weekly progress. The schedule is shown below.
        </div>
      )}
      <header className="flex flex-col gap-2 border-b border-slate-800 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Weekly non-negotiables</p>
          <h2 className="mt-2 text-3xl font-bold text-white">19-week discipline tracker</h2>
          <p className="mt-2 text-sm text-slate-400">Schedule begins September 26, 2026.</p>
        </div>
        <div className="rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-100">
          Current streak: {streak} weeks
        </div>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-slate-700 bg-slate-900/80">
        <table className="min-w-full text-left text-sm text-slate-200">
          <thead className="bg-slate-950 text-xs uppercase tracking-[0.2em] text-slate-300">
            <tr>
              <th className="px-4 py-3">Week</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Focus</th>
              <th className="px-4 py-3">Completed Class Notes</th>
              <th className="px-4 py-3">DPP Questions Notes</th>
              <th className="px-4 py-3">PYQs</th>
              <th className="px-4 py-3">Mock Test</th>
              <th className="px-4 py-3">Error Log</th>
              <th className="px-4 py-3">Short Notes</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              return (
                <tr key={entry.week} className="border-t border-slate-800">
                  <td className="px-4 py-3 font-medium text-white">Week {entry.week}</td>
                  <td className="whitespace-nowrap px-4 py-3">{formatDate(entry.startDate)} – {formatDate(entry.endDate)}</td>
                  <td className="min-w-64 px-4 py-3 text-slate-300">{entry.focus}</td>
                  <td className="px-4 py-3"><RuleCheckbox checked={entry.classNotesDone} label="Completed class notes" disabled={!selectedUser} onChange={(checked) => updateRule(entry.week, "classNotesDone", checked)} /></td>
                  <td className="px-4 py-3"><RuleCheckbox checked={entry.dppQuestionsDone} label="DPP questions" disabled={!selectedUser} onChange={(checked) => updateRule(entry.week, "dppQuestionsDone", checked)} /></td>
                  <td className="px-4 py-3"><RuleCheckbox checked={entry.pyqsDone} label="PYQs" disabled={!selectedUser} onChange={(checked) => updateRule(entry.week, "pyqsDone", checked)} /></td>
                  <td className="px-4 py-3"><RuleCheckbox checked={entry.mockTestDone} label="Mock test" disabled={!selectedUser} onChange={(checked) => updateRule(entry.week, "mockTestDone", checked)} /></td>
                  <td className="px-4 py-3"><RuleCheckbox checked={entry.errorLogDone} label="Error log" disabled={!selectedUser} onChange={(checked) => updateRule(entry.week, "errorLogDone", checked)} /></td>
                  <td className="px-4 py-3"><RuleCheckbox checked={entry.shortNotesDone} label="Short notes" disabled={!selectedUser} onChange={(checked) => updateRule(entry.week, "shortNotesDone", checked)} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RuleCheckbox({ checked, label, disabled, onChange }: { checked: boolean; label: string; disabled: boolean; onChange: (checked: boolean) => void }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      aria-label={label}
      onChange={(event) => onChange(event.target.checked)}
      className="h-4 w-4 rounded border-slate-600 bg-slate-900 accent-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
    />
  );
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
