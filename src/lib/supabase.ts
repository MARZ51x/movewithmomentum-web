import "server-only";

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

/** True once real Supabase credentials are present in the environment. */
export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY,
);

/*
  When you flip to real Supabase, the server client looks like this (uncomment
  after installing @supabase/ssr, which is already in package.json):

  import { cookies } from "next/headers";
  import { createServerClient } from "@supabase/ssr";

  export async function createSupabaseServerClient() {
    const cookieStore = await cookies();
    return createServerClient(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) =>
          toSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          ),
      },
    });
  }
*/
