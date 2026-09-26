"use client";

import { useSelectedUser } from "@/hooks/useSelectedUser";

export default function ProfilePage() {
  const { selectedUser, updateUser } = useSelectedUser();
  const form = selectedUser ? {
    targetBand: selectedUser.targetBand,
    targetScore: selectedUser.targetScore,
    dailyStudyHours: selectedUser.dailyStudyHours,
  } : {
    targetBand: "Just qualify",
    targetScore: 60,
    dailyStudyHours: 5,
  };

  if (!selectedUser) {
    return (
      <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6 text-slate-300">
        Add a user from the sidebar to manage profile settings.
      </div>
    );
  }

  const updateProfile = (updates: Partial<typeof form>) => {
    if (!selectedUser) return;
    updateUser(selectedUser.id, updates);
  };

  return (
    <div className="space-y-6">
      <header className="border-b border-slate-800 pb-5">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Profile & settings</p>
        <h2 className="mt-2 text-3xl font-bold text-white">Set your target and habit goals</h2>
      </header>

      <div className="max-w-xl space-y-5 rounded-2xl border border-slate-700 bg-slate-900/80 p-5">
        <div>
          <label className="mb-2 block text-sm text-slate-300">Target band</label>
          <select
            value={form.targetBand}
            onChange={(event) => updateProfile({ targetBand: event.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
          >
            <option>Just qualify</option>
            <option>NIT / good state college M.Tech</option>
            <option>IIT M.Tech / MS by research</option>
            <option>PSU interview call</option>
            <option>Top 100 AIR</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">Target score</label>
          <input
            type="number"
            min={0}
            max={100}
            value={form.targetScore}
            onChange={(event) => updateProfile({ targetScore: Number(event.target.value) })}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">Daily study hours</label>
          <input
            type="number"
            min={1}
            max={12}
            value={form.dailyStudyHours}
            onChange={(event) => updateProfile({ dailyStudyHours: Number(event.target.value) })}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
          />
        </div>
      </div>
    </div>
  );
}
