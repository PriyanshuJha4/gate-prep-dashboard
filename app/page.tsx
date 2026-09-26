"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { buildDefaultProgressState } from "@/lib/defaultProgress";
import {
  chapters,
  getDaysLeft,
  getCurrentStudyWeek,
  getWeeklyStreak,
  reverseCalendar,
  subjects,
  weeklyRules,
  type MockEntry,
  type WeeklyRuleEntry,
} from "@/lib/gateData";
import { useSelectedUser } from "@/hooks/useSelectedUser";
import { useLocalStorageValue } from "@/hooks/useLocalStorageValue";

export default function HomePage() {
  const { selectedUser } = useSelectedUser();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [progressMap] = useLocalStorageValue<Record<string, { status: string; pyqDone: boolean }>>(
    selectedUser ? `gate-${selectedUser.id}-progress` : null,
    buildDefaultProgressState(),
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const [userMocks] = useLocalStorageValue<MockEntry[]>(selectedUser ? `gate-mocks-${selectedUser.id}` : null, []);
  const [storedWeeklyRules] = useLocalStorageValue<WeeklyRuleEntry[]>(selectedUser ? `gate-weekly-${selectedUser.id}` : null, weeklyRules);
  const storedWeeklyByWeek = new Map(storedWeeklyRules.map((entry) => [entry.week, entry]));
  const userWeeklyRules = weeklyRules.map((entry) => {
    const saved = storedWeeklyByWeek.get(entry.week);
    return {
      ...entry,
      classNotesDone: saved?.classNotesDone ?? false,
      dppQuestionsDone: saved?.dppQuestionsDone ?? false,
      pyqsDone: saved?.pyqsDone ?? false,
      mockTestDone: saved?.mockTestDone ?? false,
      errorLogDone: saved?.errorLogDone ?? false,
      shortNotesDone: saved?.shortNotesDone ?? false,
    };
  });
  const activeWeek = getCurrentStudyWeek(currentTime ?? new Date(2026, 8, 26));
  const currentWeek = activeWeek ? userWeeklyRules.find((entry) => entry.week === activeWeek.week) ?? activeWeek : null;
  const daysUntilStudyEnd = currentTime ? getCalendarDaysUntil("2027-01-31", currentTime) : null;
  const daysUntilExam = currentTime ? getCalendarDaysUntil("2027-02-06", currentTime) : null;
  const overallPercent = useMemo(() => {
    const done = Object.values(progressMap).filter((entry) => entry?.status === "done").length;
    return Math.round((done / chapters.length) * 100);
  }, [progressMap]);

  const subjectSnapshot = useMemo(() => {
    return subjects.map((subject) => {
      const subjectChapters = chapters.filter((chapter) => chapter.subjectId === subject.id);
      const done = subjectChapters.filter((chapter) => progressMap[chapter.id]?.status === "done").length;
      return {
        ...subject,
        done,
        total: subjectChapters.length,
        percent: Math.round((done / subjectChapters.length) * 100),
      };
    });
  }, [progressMap]);

  const latestMock = userMocks.at(-1);
  const currentStreak = getWeeklyStreak(userWeeklyRules);

  if (!selectedUser) {
    return (
      <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6 text-slate-300">
        No user selected yet. Add a user from the sidebar to view your dashboard.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-xl border border-cyan-500/30 bg-slate-900/80 p-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Live schedule</p>
          <time dateTime={currentTime?.toISOString()} className="mt-1 block text-sm text-slate-100">
            {currentTime ? new Intl.DateTimeFormat(undefined, { dateStyle: "full", timeStyle: "medium" }).format(currentTime) : "Starting live clock..."}
          </time>
        </div>
        <Countdown label="Study plan ends Jan 31" days={daysUntilStudyEnd} />
        <Countdown label="Exam window Feb 6" days={daysUntilExam} />
      </section>

      <header className="flex flex-col gap-3 border-b border-slate-800 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Welcome back</p>
          <h2 className="mt-2 text-3xl font-bold text-white">{selectedUser.name}&apos;s dashboard</h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-200">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          {overallPercent}% syllabus complete
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Overall progress" value={`${overallPercent}%`} helper="Across all chapter checkpoints" accent="cyan" />
        <MetricCard label="Current streak" value={`${currentStreak} weeks`} helper="All non-negotiables cleared" accent="violet" />
        <MetricCard label="Latest mock" value={`${latestMock?.total ?? 0}/100`} helper={`Aptitude ${latestMock?.aptitude ?? 0} · Core ${latestMock?.core ?? 0}`} accent="amber" />
        <MetricCard label="Daily study hours" value={`${selectedUser.dailyStudyHours} hrs`} helper="Your planning target" accent="emerald" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Reverse calendar</h3>
            <Link href="/plan" className="text-sm text-cyan-300 hover:text-cyan-200">View roadmap →</Link>
          </div>
          <div className="space-y-3">
            {reverseCalendar.map((item) => {
              const daysLeft = getDaysLeft(item.date);
              return (
                <div key={item.id} className="rounded-xl border border-slate-700 bg-slate-950/70 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-white">{item.title}</h4>
                      <p className="mt-1 text-xs text-slate-400">{item.lock}</p>
                    </div>
                    <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2 py-1 text-xs font-medium text-cyan-200">{daysLeft} days left</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-300">{item.reminder}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5">
          {currentWeek ? (
            <>
              <h3 className="text-lg font-semibold text-white">Week {currentWeek.week}: non-negotiables</h3>
              <p className="mt-1 text-xs text-slate-400">{currentWeek.focus}</p>
              <div className="mt-4 space-y-3">
                {[
                  { label: "Completed Class Notes", done: currentWeek.classNotesDone },
                  { label: "DPP Questions Notes", done: currentWeek.dppQuestionsDone },
                  { label: "PYQs", done: currentWeek.pyqsDone },
                  { label: "Mock Test", done: currentWeek.mockTestDone },
                  { label: "Error Log", done: currentWeek.errorLogDone },
                  { label: "Short Notes", done: currentWeek.shortNotesDone },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm">
                    <span className="text-slate-200">{item.label}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${item.done ? "bg-emerald-400/20 text-emerald-200" : "bg-rose-400/20 text-rose-200"}`}>{item.done ? "Done" : "Pending"}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-white">Study schedule complete</h3>
              <p className="mt-1 text-sm text-slate-400">Final exam window begins February 6, 2027.</p>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Subject progress</h3>
            <Link href="/syllabus" className="text-sm text-cyan-300 hover:text-cyan-200">Open tracker →</Link>
          </div>
          <div className="space-y-3">
            {subjectSnapshot.slice(0, 6).map((subject) => (
              <div key={subject.id} className="rounded-xl border border-slate-700 bg-slate-950/70 p-3">
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-100">{subject.name}</span>
                  <span className="text-cyan-200">{subject.done}/{subject.total}</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400" style={{ width: `${subject.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5">
          <h3 className="text-lg font-semibold text-white">Mock score trend</h3>
          <div className="mt-5 flex h-40 items-end gap-3">
            {userMocks.map((entry) => (
              <div key={`${selectedUser.id}-${entry.mock}`} className="flex flex-1 flex-col items-center">
                <div className="mb-2 text-[10px] text-slate-400">{entry.total}</div>
                <div className="w-full rounded-t-xl bg-gradient-to-t from-cyan-500 to-violet-500" style={{ height: `${(entry.total / 100) * 100}%` }} />
              </div>
            ))}
            {userMocks.length === 0 && <p className="self-center text-sm text-slate-400">No mock scores yet.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}

function Countdown({ label, days }: { label: string; days: number | null }) {
  return (
    <div className="sm:text-right">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-0.5 text-xl font-semibold tabular-nums text-white">{days === null ? "--" : `${days} days`}</p>
    </div>
  );
}

function getCalendarDaysUntil(targetDate: string, now: Date) {
  const [year, month, day] = targetDate.split("-").map(Number);
  const target = new Date(year, month - 1, day);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.round((target.getTime() - today.getTime()) / 86_400_000));
}

function MetricCard({ label, value, helper, accent }: { label: string; value: string; helper: string; accent: "cyan" | "violet" | "amber" | "emerald" }) {
  const accentStyles = {
    cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-100",
    violet: "border-violet-500/30 bg-violet-500/10 text-violet-100",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-100",
    emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100",
  };

  return (
    <div className={`rounded-2xl border p-4 ${accentStyles[accent]}`}>
      <p className="text-xs uppercase tracking-[0.2em] opacity-80">{label}</p>
      <p className="mt-3 text-3xl font-bold">{value}</p>
      <p className="mt-2 text-sm opacity-80">{helper}</p>
    </div>
  );
}
