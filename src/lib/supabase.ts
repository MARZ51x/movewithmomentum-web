import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Supabase wiring seam.
 *
 * The app runs today entirely on the in-memory store (`store.ts`). When you're
 * ready to go live:
 *   1. Create a Supabase project and copy the URL + publishable (anon) key into
 *      `.env.local` (see `.env.example`).
 *   2. Create the `profiles` / `posts` / `comments` tables — their columns match
 *      the types in `types.ts` — and enable RLS on each (see README).
 *   3. Swap the calls in `store.ts` / the data layer for the clients below.
 *
 * Per project conventions:
 *   - The publishable key is the only key that may reach the browser.
 *   - The secret/service-role key bypasses RLS and stays server-only.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
/** Service-role (secret) key — bypasses RLS. Server-only, never sent to the browser. */
export const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

/** True once real Supabase credentials are present in the environment. */
export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY,
);

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    SUPABASE_URL!,
    SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try {
            toSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component, where cookies are read-only.
            // The proxy refreshes the session cookie instead.
          }
        },
      },
    },
  );
}

/**
 * Service-role client. Bypasses RLS, so only ever call this from trusted
 * server code (e.g. the public Match Me funnel that must read/update reports
 * across users, or seed/admin scripts). Never expose its results unfiltered.
 */
export function createSupabaseServiceClient() {
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SECRET_KEY for the service-role client.",
    );
  }
  return createClient<Database>(SUPABASE_URL, SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
