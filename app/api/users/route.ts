import { getSupabaseRequestContext } from "@/lib/supabase-server";
import type { UserProfile } from "@/lib/gateData";

export async function GET(request: Request) {
  const context = await getSupabaseRequestContext(request);
  if (!context) return Response.json({ error: "Sign in required." }, { status: 401 });

  const { data, error } = await context.client
    .from("users")
    .select("id,name,email,target_score,target_band,daily_study_hours,created_at")
    .eq("auth_user_id", context.user.id)
    .order("name");
  if (error) return Response.json({ error: "Unable to load profiles." }, { status: 500 });

  const users: UserProfile[] = (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    targetScore: Number(row.target_score),
    targetBand: row.target_band,
    dailyStudyHours: Number(row.daily_study_hours),
    currentStreak: 0,
    latestMock: 0,
    lastErrorDaysAgo: 0,
  }));
  return Response.json(users, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const context = await getSupabaseRequestContext(request);
  if (!context) return Response.json({ error: "Sign in required." }, { status: 401 });

  let users: UserProfile[];
  try {
    const body = await request.json() as { users?: UserProfile[] };
    users = body.users ?? [];
    if (!Array.isArray(users) || users.some((user) => !user?.id || !user.name?.trim())) {
      return Response.json({ error: "A list of users with IDs and names is required." }, { status: 400 });
    }
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const rows = users.map((user) => ({
    id: user.id,
    auth_user_id: context.user.id,
    name: user.name.trim(),
    email: user.email || context.user.email || "",
    target_band: user.targetBand ?? "Just qualify",
    target_score: user.targetScore ?? 60,
    daily_study_hours: user.dailyStudyHours ?? 5,
  }));
  const { error } = await context.client.from("users").upsert(rows, { onConflict: "id" });
  if (error) return Response.json({ error: "Unable to save profiles." }, { status: 500 });
  return Response.json({ saved: rows.length });
}

export async function PATCH(request: Request) {
  const context = await getSupabaseRequestContext(request);
  if (!context) return Response.json({ error: "Sign in required." }, { status: 401 });

  let body: { id?: string; updates?: Partial<UserProfile> };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!body.id || !body.updates) return Response.json({ error: "A user ID and updates are required." }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (body.updates.name !== undefined) updates.name = body.updates.name.trim();
  if (body.updates.email !== undefined) updates.email = body.updates.email;
  if (body.updates.targetBand !== undefined) updates.target_band = body.updates.targetBand;
  if (body.updates.targetScore !== undefined) updates.target_score = body.updates.targetScore;
  if (body.updates.dailyStudyHours !== undefined) updates.daily_study_hours = body.updates.dailyStudyHours;
  const { data, error } = await context.client.from("users").update(updates).eq("id", body.id).select("id").maybeSingle();
  if (error) return Response.json({ error: "Unable to update profile." }, { status: 500 });
  return data ? Response.json({ saved: true }) : Response.json({ error: "Profile not found." }, { status: 404 });
}

export async function DELETE(request: Request) {
  const context = await getSupabaseRequestContext(request);
  if (!context) return Response.json({ error: "Sign in required." }, { status: 401 });

  const userId = new URL(request.url).searchParams.get("id");
  if (!userId) return Response.json({ error: "A user ID is required." }, { status: 400 });

  const { data, error } = await context.client.from("users").delete().eq("id", userId).select("id").maybeSingle();
  if (error) return Response.json({ error: "Unable to delete profile." }, { status: 500 });
  return data ? Response.json({ deleted: true }) : Response.json({ error: "Profile not found." }, { status: 404 });
}