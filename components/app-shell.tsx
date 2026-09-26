"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useSelectedUser } from "@/hooks/useSelectedUser";
import { useDatabaseSyncStatus } from "@/hooks/useLocalStorageValue";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { supabase } from "@/lib/supabase";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/syllabus", label: "Syllabus" },
  { href: "/weekly", label: "Non-negotiables" },
  { href: "/mock-log", label: "Mock log" },
  { href: "/error-log", label: "Error log" },
  { href: "/group", label: "Group" },
  { href: "/plan", label: "Roadmap" },
  { href: "/resources", label: "Resources" },
  { href: "/profile", label: "Profile" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, loading } = useSupabaseSession();
  const { users, selectedUser, setUser, addUser, removeUser } = useSelectedUser();
  const syncStatus = useDatabaseSyncStatus();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [draftName, setDraftName] = useState("");

  const onCreateUser = () => {
    const created = addUser(draftName);
    if (created) {
      setDraftName("");
      setIsAddOpen(false);
    }
  };

  const syncStatusLabel = syncStatus === "synced"
    ? "Database synced"
    : syncStatus === "syncing"
      ? "Syncing"
      : syncStatus === "checking"
        ? "Checking sync"
        : syncStatus === "offline"
          ? "Offline · cached data"
          : "Local cache · DB unavailable";

  if (pathname === "/login" || pathname === "/reset-password") {
    return <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">{children}</main>;
  }

  if (loading) {
    return <main className="min-h-screen bg-slate-950 p-8 text-slate-300">Checking Supabase session…</main>;
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
        <div className="mx-auto max-w-xl rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h1 className="text-2xl font-bold">Sign in to continue</h1>
          <p className="mt-2 text-slate-300">Study progress and profiles are stored in your Supabase account.</p>
          <button type="button" onClick={() => router.push("/login")} className="mt-5 rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950">Open sign in</button>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-slate-800 bg-slate-950/95 px-4 backdrop-blur md:hidden">
        <button
          type="button"
          aria-label={isMobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMobileNavOpen}
          aria-controls="primary-navigation"
          onClick={() => setIsMobileNavOpen((open) => !open)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-100 hover:bg-slate-800"
        >
          {isMobileNavOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
        <span className="truncate text-sm font-semibold text-white">GATE 2027 CS Prep</span>
      </header>

      {isMobileNavOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setIsMobileNavOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      )}

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-6 pt-20 md:flex-row md:py-6">
        <aside
          id="primary-navigation"
          className={`fixed inset-y-0 left-0 z-50 h-dvh w-72 shrink-0 overflow-y-auto border-r border-slate-800 bg-slate-900 p-4 transition-transform duration-200 md:sticky md:top-6 md:z-auto md:h-fit md:max-h-[calc(100vh-3rem)] md:rounded-2xl md:border md:bg-slate-900/70 ${isMobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        >
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">GATE 2027</p>
            <h1 className="mt-2 text-2xl font-bold text-white">Prep Dashboard</h1>
            <div className="mt-3 flex h-9 min-w-0 items-center gap-2">
              <div
                aria-live="polite"
                title={syncStatusLabel}
                className={`flex h-7 min-w-0 flex-1 items-center gap-2 overflow-hidden whitespace-nowrap rounded-full border px-2.5 text-xs ${
                  syncStatus === "synced"
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                    : syncStatus === "syncing" || syncStatus === "checking"
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                      : "border-rose-500/40 bg-rose-500/10 text-rose-200"
                }`}
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                <span className="truncate">{syncStatusLabel}</span>
              </div>
              <button
                type="button"
                onClick={async () => { await supabase?.auth.signOut(); router.replace("/login"); }}
                className="inline-flex h-8 shrink-0 items-center whitespace-nowrap rounded-md px-2 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              >
                Sign out
              </button>
            </div>
          </div>

          <div className="mb-6 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Current user</p>
              <button
                type="button"
                onClick={() => setIsAddOpen(true)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-cyan-400/40 bg-slate-950 text-lg font-bold text-cyan-200 hover:bg-slate-800"
                aria-label="Add user"
              >
                +
              </button>
            </div>

            {users.length === 0 ? (
              <div className="mt-3 rounded-lg border border-dashed border-slate-600 bg-slate-950/60 p-3 text-sm text-slate-300">
                No users yet. Add your name to start.
              </div>
            ) : (
              <div className="mt-2 space-y-1">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setUser(user.id)}
                      aria-pressed={selectedUser?.id === user.id}
                      className={`min-w-0 flex-1 truncate rounded-lg px-3 py-2 text-left text-sm ${selectedUser?.id === user.id ? "bg-cyan-500/20 font-semibold text-cyan-100" : "text-slate-200 hover:bg-slate-800"}`}
                    >
                      {user.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete ${user.name} and all of their saved study data?`)) removeUser(user.id);
                      }}
                      aria-label={`Delete ${user.name}`}
                      title={`Delete ${user.name}`}
                      className="rounded-lg px-2 py-2 text-xs text-rose-300 hover:bg-rose-500/15 hover:text-rose-200"
                    >
                      Del
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isAddOpen && (
            <div className="mb-6 rounded-xl border border-slate-700 bg-slate-950 p-3">
              <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-300">New user</label>
              <input
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                placeholder="Enter name"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none"
              />
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={onCreateUser}
                  className="flex-1 rounded-lg bg-cyan-500 px-3 py-2 text-sm font-medium text-slate-950"
                >
                  Save user
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setDraftName("");
                  }}
                  className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <nav className="space-y-2">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-cyan-500 text-slate-950"
                      : "text-slate-200 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
