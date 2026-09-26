"use client";

import { useSelectedUser } from "@/hooks/useSelectedUser";
import { roadmapMilestones } from "@/lib/gateData";
import { useLocalStorageValue } from "@/hooks/useLocalStorageValue";

export default function RoadmapPage() {
  const { selectedUser } = useSelectedUser();
  const [completed, saveCompleted] = useLocalStorageValue<Record<string, boolean>>(
    selectedUser ? `gate-milestones-${selectedUser.id}` : null,
    {},
  );

  const toggleMilestone = (key: string) => {
    if (!selectedUser) return;
    const next = { ...completed, [key]: !completed[key] };
    saveCompleted(next);
  };

  if (!selectedUser) {
    return <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6 text-slate-300">Add a user to track roadmap milestones.</div>;
  }

  return (
    <div className="space-y-6">
      <header className="border-b border-slate-800 pb-5">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Month-wise plan</p>
        <h2 className="mt-2 text-3xl font-bold text-white">Roadmap and milestones</h2>
      </header>

      <div className="space-y-4">
        {roadmapMilestones.map((item, index) => {
          const done = completed[String(index)] ?? false;
          return (
          <div key={item.month} className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">{item.month}</p>
                <h3 className="mt-1 text-xl font-semibold text-white">{item.weekRange}</h3>
                <p className="mt-1 text-sm text-slate-400">{item.dates}</p>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-200">
                <input type="checkbox" checked={done} onChange={() => toggleMilestone(String(index))} className="h-4 w-4 accent-cyan-400" />
                {done ? "Completed" : "Mark complete"}
              </label>
            </div>
            <p className="mt-3 text-slate-300">{item.focus}</p>
            <p className="mt-2 text-sm text-slate-400">{item.detail}</p>
          </div>
          );
        })}
      </div>
    </div>
  );
}
