"use client";

import { useEffect, useState } from "react";
import { useSelectedUser } from "@/hooks/useSelectedUser";
import { getUserProgressSummary, USER_DATA_UPDATED_EVENT } from "@/lib/gateData";
import { supabase } from "@/lib/supabase";

type GroupSummary = {
  id: string;
  name: string;
  progress: number;
  streak: number;
  latestMock: number;
  lastErrorDaysAgo: number | null;
};

export default function GroupPage() {
  const { users } = useSelectedUser();
  const [databaseSummaries, setDatabaseSummaries] = useState<GroupSummary[]>([]);

  useEffect(() => {
    let active = true;
    const loadSummaries = async () => {
      if (document.visibilityState !== "visible") return;
      const { data } = await supabase?.auth.getSession() ?? { data: { session: null } };
      const token = data.session?.access_token;
      if (!token) return;
      try {
        const response = await fetch("/api/group", { cache: "no-store", headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) return;
        const summary = await response.json() as GroupSummary[];
        if (active) setDatabaseSummaries(summary);
      } catch {
        return;
      }
    };
    loadSummaries();
    const intervalId = window.setInterval(loadSummaries, 5000);
    window.addEventListener(USER_DATA_UPDATED_EVENT, loadSummaries);
    document.addEventListener("visibilitychange", loadSummaries);
    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener(USER_DATA_UPDATED_EVENT, loadSummaries);
      document.removeEventListener("visibilitychange", loadSummaries);
    };
  }, []);

  const rows = users.map((user) => {
    const summary = databaseSummaries.find((entry) => entry.id === user.id) ?? getUserProgressSummary(user.id);
    return {
      ...user,
      progress: summary.progress,
      streak: summary.streak,
      latestMock: summary.latestMock,
      lastErrorDaysAgo: summary.lastErrorDaysAgo,
    };
  });

  return (
    <div className="space-y-6">
      <header className="border-b border-slate-800 pb-5">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Group comparison</p>
        <h2 className="mt-2 text-3xl font-bold text-white">Friendly accountability leaderboard</h2>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-slate-700 bg-slate-900/80">
        {rows.length === 0 ? (
          <div className="p-6 text-slate-300">Add the first user to see the leaderboard.</div>
        ) : (
          <table className="min-w-full text-left text-sm text-slate-200">
            <thead className="bg-slate-950 text-xs uppercase tracking-[0.2em] text-slate-300">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Overall %</th>
                <th className="px-4 py-3">Current streak</th>
                <th className="px-4 py-3">Latest mock</th>
                <th className="px-4 py-3">Days since last error log</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-800">
                  <td className="px-4 py-3 font-medium text-white">{row.name}</td>
                  <td className="px-4 py-3 text-cyan-200">{row.progress}%</td>
                  <td className="px-4 py-3">{row.streak} weeks</td>
                  <td className="px-4 py-3">{row.latestMock}/100</td>
                  <td className="px-4 py-3">{row.lastErrorDaysAgo === null ? "—" : `${row.lastErrorDaysAgo} days`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
