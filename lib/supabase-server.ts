import { createClient, type User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

export type SupabaseRequestContext = { client: SupabaseClient; user: User };

export async function getSupabaseRequestContext(request: Request): Promise<SupabaseRequestContext | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!url || !anonKey || !token) return null;

  const client = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await client.auth.getUser(token);
  return error || !data.user ? null : { client, user: data.user };
}

export async function ownsProfile(client: SupabaseClient, authUserId: string, profileId: string) {
  const { data, error } = await client
    .from("users")
    .select("id")
    .eq("id", profileId)
    .eq("auth_user_id", authUserId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}