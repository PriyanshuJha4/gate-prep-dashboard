import { getSupabaseRequestContext, ownsProfile } from "@/lib/supabase-server";
import { chapters, weeklyRules } from "@/lib/gateData";

function isAllowedKey(userId: string, key: string) {
  return [
    `gate-${userId}-progress`,
    `gate-profile-${userId}`,
    `gate-weekly-${userId}`,
    `gate-milestones-${userId}`,
    `gate-resources-${userId}`,
    `gate-mocks-${userId}`,
    `gate-errors-${userId}`,
  ].includes(key);
}

export async function GET(request: Request) {
  const context = await getSupabaseRequestContext(request);
  if (!context) return Response.json({ error: "Sign in required." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") ?? "";
  const key = searchParams.get("key") ?? "";
  if (!userId || !isAllowedKey(userId, key)) {
    return Response.json({ error: "A valid user ID and data key are required." }, { status: 400 });
  }
  if (!await ownsProfile(context.client, context.user.id, userId)) {
    return Response.json({ error: "Profile not found." }, { status: 404 });
  }

  const { data, error } = await readActivity(context.client, userId, key);
  if (error) return Response.json({ error: "Unable to load activity." }, { status: 500 });
  return Response.json({ value: data }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  const context = await getSupabaseRequestContext(request);
  if (!context) return Response.json({ error: "Sign in required." }, { status: 401 });

  let body: { userId?: string; key?: string; value?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const userId = body.userId ?? "";
  const key = body.key ?? "";
  if (!userId || !isAllowedKey(userId, key) || body.value === undefined) {
    return Response.json({ error: "A valid user ID, data key, and value are required." }, { status: 400 });
  }
  if (!await ownsProfile(context.client, context.user.id, userId)) {
    return Response.json({ error: "Profile not found." }, { status: 404 });
  }

  const { error } = await writeActivity(context.client, userId, key, body.value);
  if (error) return Response.json({ error: "Unable to save activity." }, { status: 500 });
  return Response.json({ saved: true });
}

async function readActivity(client: NonNullable<Awaited<ReturnType<typeof getSupabaseRequestContext>>>["client"], userId: string, key: string): Promise<{ data: unknown; error: unknown }> {
  if (key === `gate-${userId}-progress`) {
    const { data, error } = await client.from("chapter_progress").select("chapter_id,status,pyq_done").eq("user_id", userId);
    return {
      data: Object.fromEntries((data ?? []).map((row) => [row.chapter_id, { status: row.status, pyqDone: row.pyq_done }])),
      error,
    };
  }

  if (key === `gate-weekly-${userId}`) {
    const { data, error } = await client.from("weekly_log").select("*").eq("user_id", userId).order("week_number");
    const saved = new Map((data ?? []).map((row) => [row.week_number, row]));
    return {
      data: weeklyRules.map((week) => {
        const row = saved.get(week.week);
        return row ? {
          ...week,
          classNotesDone: row.class_notes_done,
          dppQuestionsDone: row.dpp_questions_done,
          pyqsDone: row.pyqs_done,
          mockTestDone: row.mock_test_done,
          errorLogDone: row.error_log_done,
          shortNotesDone: row.short_notes_done,
        } : week;
      }),
      error,
    };
  }

  if (key === `gate-mocks-${userId}`) {
    const { data, error } = await client.from("mock_logs").select("mock_number,date,aptitude_score,core_score,total_score,biggest_leak").eq("user_id", userId).order("date").order("mock_number");
    return {
      data: (data ?? []).map((row) => ({ mock: row.mock_number, date: row.date, aptitude: Number(row.aptitude_score), core: Number(row.core_score), total: Number(row.total_score), leak: row.biggest_leak })),
      error,
    };
  }

  if (key === `gate-errors-${userId}`) {
    const { data, error } = await client.from("error_logs").select("id,user_id,date,subject,question_summary,reason_tag,resolved").eq("user_id", userId).order("date");
    return {
      data: (data ?? []).map((row) => ({ id: row.id, userId: row.user_id, date: row.date, subject: row.subject, question: row.question_summary, reason: row.reason_tag, resolved: row.resolved })),
      error,
    };
  }

  if (key === `gate-resources-${userId}`) {
    const { data, error } = await client.from("resources").select("id,title,url").eq("user_id", userId).eq("is_default", false).order("created_at");
    return { data: (data ?? []).map((row) => ({ id: row.id, label: row.title, url: row.url })), error };
  }

  if (key === `gate-milestones-${userId}`) {
    const { data, error } = await client.from("milestone_progress").select("milestone_key,completed").eq("user_id", userId);
    return { data: Object.fromEntries((data ?? []).map((row) => [row.milestone_key, row.completed])), error };
  }

  return { data: null, error: new Error("Unsupported activity key.") };
}

async function writeActivity(client: NonNullable<Awaited<ReturnType<typeof getSupabaseRequestContext>>>["client"], userId: string, key: string, value: unknown): Promise<{ error: unknown }> {
  if (key === `gate-${userId}-progress`) {
    const progress = value as Record<string, { status?: string; pyqDone?: boolean }>;
    const rows = chapters.map((chapter) => ({
      user_id: userId,
      chapter_id: chapter.id,
      status: progress[chapter.id]?.status ?? "not_started",
      pyq_done: progress[chapter.id]?.pyqDone ?? false,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await client.from("chapter_progress").upsert(rows, { onConflict: "user_id,chapter_id" });
    return { error };
  }

  if (key === `gate-weekly-${userId}`) {
    const values = value as Array<Record<string, unknown>>;
    const rows = values.map((week) => ({
      user_id: userId,
      week_number: Number(week.week),
      start_date: week.startDate,
      end_date: week.endDate,
      focus: week.focus,
      class_notes_done: week.classNotesDone === true,
      dpp_questions_done: week.dppQuestionsDone === true,
      pyqs_done: week.pyqsDone === true,
      mock_test_done: week.mockTestDone === true,
      error_log_done: week.errorLogDone === true,
      short_notes_done: week.shortNotesDone === true,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await client.from("weekly_log").upsert(rows, { onConflict: "user_id,week_number" });
    return { error };
  }

  if (key === `gate-mocks-${userId}`) {
    const rows = (value as Array<Record<string, unknown>>).map((mock) => ({
      user_id: userId,
      mock_number: Number(mock.mock),
      date: mock.date,
      aptitude_score: Number(mock.aptitude),
      core_score: Number(mock.core),
      total_score: Number(mock.total),
      biggest_leak: String(mock.leak ?? ""),
    }));
    const { error } = await client.from("mock_logs").upsert(rows, { onConflict: "user_id,mock_number" });
    return { error };
  }

  if (key === `gate-errors-${userId}`) {
    const rows = (value as Array<Record<string, unknown>>).map((entry) => ({
      id: String(entry.id),
      user_id: userId,
      date: entry.date,
      subject: entry.subject,
      question_summary: entry.question,
      reason_tag: entry.reason,
      resolved: entry.resolved === true,
    }));
    const { error } = await client.from("error_logs").upsert(rows, { onConflict: "id" });
    return { error };
  }

  if (key === `gate-resources-${userId}`) {
    const resources = value as Array<Record<string, unknown>>;
    const rows = resources.map((resource) => ({
      id: String(resource.id),
      user_id: userId,
      title: String(resource.label),
      url: String(resource.url),
      is_default: false,
    }));
    if (rows.length) {
      const { error } = await client.from("resources").upsert(rows, { onConflict: "id" });
      if (error) return { error };
      const retainedIds = rows.map((row) => row.id);
      const { data: current, error: loadError } = await client.from("resources").select("id").eq("user_id", userId).eq("is_default", false);
      if (loadError) return { error: loadError };
      const removedIds = (current ?? []).map((row) => row.id).filter((id) => !retainedIds.includes(id));
      if (removedIds.length) {
        const { error: deleteError } = await client.from("resources").delete().eq("user_id", userId).in("id", removedIds);
        if (deleteError) return { error: deleteError };
      }
      return { error: null };
    }
    const { error } = await client.from("resources").delete().eq("user_id", userId).eq("is_default", false);
    return { error };
  }

  if (key === `gate-milestones-${userId}`) {
    const milestones = value as Record<string, boolean>;
    const rows = Object.entries(milestones).map(([milestone_key, completed]) => ({
      user_id: userId,
      milestone_key,
      completed: completed === true,
      updated_at: new Date().toISOString(),
    }));
    const { error } = rows.length
      ? await client.from("milestone_progress").upsert(rows, { onConflict: "user_id,milestone_key" })
      : await client.from("milestone_progress").delete().eq("user_id", userId);
    return { error };
  }

  return { error: new Error("Unsupported activity key.") };
}