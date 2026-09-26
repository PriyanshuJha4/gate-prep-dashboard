"use client";

import { useMemo } from "react";
import { buildDefaultProgressState } from "@/lib/defaultProgress";
import { chapters, subjects } from "@/lib/gateData";
import { useSelectedUser } from "@/hooks/useSelectedUser";
import { useLocalStorageValue } from "@/hooks/useLocalStorageValue";

export default function SyllabusPage() {
  const { selectedUser } = useSelectedUser();
  const [progressMap, saveProgress] = useLocalStorageValue<Record<string, { status: string; pyqDone: boolean }>>(
    selectedUser ? `gate-${selectedUser.id}-progress` : null,
    buildDefaultProgressState(),
  );

  const overallPercent = useMemo(() => {
    const done = Object.values(progressMap).filter((entry) => entry?.status === "done").length;
    return Math.round((done / chapters.length) * 100);
  }, [progressMap]);

  const subjectProgress = useMemo(() => {
    return subjects.map((subject) => {
      const subjectChapters = chapters.filter((chapter) => chapter.subjectId === subject.id);
      const done = subjectChapters.filter((chapter) => progressMap[chapter.id]?.status === "done").length;
      return {
        ...subject,
        count: done,
        total: subjectChapters.length,
        percent: Math.round((done / subjectChapters.length) * 100),
      };
    });
  }, [progressMap]);

  if (!selectedUser) {
    return (
      <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6 text-slate-300">
        Add a user to start tracking syllabus progress.
      </div>
    );
  }

  const handleStatusChange = (chapterId: string, status: string) => {
    if (!selectedUser) return;
    const nextProgress = {
      ...progressMap,
      [chapterId]: {
        status,
        pyqDone: status === "done" || progressMap[chapterId]?.pyqDone,
      },
    };
    saveProgress(nextProgress);
  };

  const handlePyqToggle = (chapterId: string) => {
    if (!selectedUser) return;
    const nextProgress = {
      ...progressMap,
      [chapterId]: {
        status: progressMap[chapterId]?.status ?? "not_started",
        pyqDone: !(progressMap[chapterId]?.pyqDone ?? false),
      },
    };
    saveProgress(nextProgress);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 border-b border-slate-800 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Syllabus tracker</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Chapter checklist</h2>
        </div>
        <div className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-100">
          Overall completion: {overallPercent}%
        </div>
      </header>

      <div className="space-y-5">
        {subjectProgress.map((subject) => (
          <div key={subject.id} className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">{subject.name}</h3>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-300">
                  <span className="rounded-full border border-slate-600 px-2 py-1">Marks: {subject.marksRange}</span>
                  <span className="rounded-full border border-slate-600 px-2 py-1">Priority: {subject.priorityTier}</span>
                </div>
              </div>
              <div className="text-sm text-cyan-200">
                {subject.count}/{subject.total} done · {subject.percent}%
              </div>
            </div>

            <div className="mb-4 h-2.5 rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400" style={{ width: `${subject.percent}%` }} />
            </div>

            <div className="mb-3 rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-200">
              <span className="font-semibold text-cyan-300">Strategy:</span> {subject.strategyNote}
            </div>

            <div className="grid gap-3">
              {chapters
                .filter((chapter) => chapter.subjectId === subject.id)
                .map((chapter) => {
                  const value = progressMap[chapter.id] ?? { status: "not_started", pyqDone: false };
                  return (
                    <div key={chapter.id} className="rounded-xl border border-slate-700 bg-slate-950/70 p-3">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-slate-100">{chapter.name}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <select
                            value={value.status}
                            onChange={(event) => handleStatusChange(chapter.id, event.target.value)}
                            className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-slate-100"
                          >
                            <option value="not_started">Not Started</option>
                            <option value="in_progress">In Progress</option>
                            <option value="done">Done</option>
                          </select>

                          <label className="flex items-center gap-2 text-xs text-slate-300">
                            <input
                              type="checkbox"
                              checked={Boolean(value.pyqDone)}
                              onChange={() => handlePyqToggle(chapter.id)}
                              className="h-4 w-4 rounded border-slate-600 bg-slate-800"
                            />
                            PYQs solved
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
