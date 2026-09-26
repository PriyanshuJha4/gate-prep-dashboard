import { getSupabaseRequestContext } from "@/lib/supabase-server";
import { chapters, getWeeklyStreak, weeklyRules } from "@/lib/gateData";

export async function GET(request: Request) {
  const context = await getSupabaseRequestContext(request);
  if (!context) return Response.json({ error: "Sign in required." }, { status: 401 });

  const [usersResult, progressResult, weeklyResult, mockResult, errorResult] = await Promise.all([
    context.client.from("users").select("id,name").order("name"),
    context.client.from("chapter_progress").select("user_id,chapter_id,status"),
    context.client.from("weekly_log").select("user_id,week_number,class_notes_done,dpp_questions_done,pyqs_done,mock_test_done,error_log_done,short_notes_done"),
    context.client.from("mock_logs").select("user_id,total_score,date,mock_number").order("date"),
    context.client.from("error_logs").select("user_id,date").order("date"),
  ]);
  const error = usersResult.error ?? progressResult.error ?? weeklyResult.error ?? mockResult.error ?? errorResult.error;
  if (error) return Response.json({ error: "Unable to load group summaries." }, { status: 500 });

  const summary = (usersResult.data ?? []).map((user) => {
    const userProgress = (progressResult.data ?? []).filter((row) => row.user_id === user.id);
    const done = userProgress.filter((row) => row.status === "done").length;
    const userWeekly = new Map((weeklyResult.data ?? []).filter((row) => row.user_id === user.id).map((row) => [row.week_number, row]));
    const alignedWeekly = weeklyRules.map((week) => {
      const row = userWeekly.get(week.week);
      return {
        ...week,
        classNotesDone: row?.class_notes_done ?? false,
        dppQuestionsDone: row?.dpp_questions_done ?? false,
        pyqsDone: row?.pyqs_done ?? false,
        mockTestDone: row?.mock_test_done ?? false,
        errorLogDone: row?.error_log_done ?? false,
        shortNotesDone: row?.short_notes_done ?? false,
      };
    });
    const userMocks = (mockResult.data ?? []).filter((row) => row.user_id === user.id);
    const latestMock = userMocks.at(-1);
    const latestError = (errorResult.data ?? []).filter((row) => row.user_id === user.id).at(-1)?.date;
    const lastErrorDaysAgo = latestError
      ? Math.max(0, Math.floor((Date.now() - new Date(`${latestError}T00:00:00`).getTime()) / 86_400_000))
      : null;

    return {
      id: user.id,
      name: user.name,
      progress: Math.round((done / chapters.length) * 100),
      streak: getWeeklyStreak(alignedWeekly),
      latestMock: Number(latestMock?.total_score ?? 0),
      lastErrorDaysAgo,
    };
  });

  return Response.json(summary, { headers: { "Cache-Control": "no-store" } });
}