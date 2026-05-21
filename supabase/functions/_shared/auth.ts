// Authenticated-caller helper for edge functions.
// Verifies the Supabase JWT in the `Authorization` header and returns the
// caller's user id. Use this for any edge function that takes user_id from
// the request body — never trust client-supplied user_id directly.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface AuthedUser {
  id: string;
  email: string | null;
}

/**
 * Verify the JWT in `Authorization: Bearer <token>` against Supabase Auth.
 * Returns the authenticated user, or null if the header is missing/invalid.
 */
export async function getAuthedUser(req: Request): Promise<AuthedUser | null> {
  const authHeader = req.headers.get("Authorization") ?? req.headers.get("authorization");
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey) return null;

  // Use anon client + JWT; auth.getUser() validates signature & expiry against
  // Supabase Auth, so we don't need to verify HS256 manually.
  const sb = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data, error } = await sb.auth.getUser(token);
  if (error || !data?.user) return null;
  return { id: data.user.id, email: data.user.email ?? null };
}
