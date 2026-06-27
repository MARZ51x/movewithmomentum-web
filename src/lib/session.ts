import "server-only";
import { cookies } from "next/headers";
import { getProfile } from "./store";
import type { Profile } from "./types";

/**
 * Mock auth session. Today the signed-in user id is stored in a cookie. When
 * Supabase Auth is wired up, replace these with `supabase.auth.getUser()` /
 * `signInWithPassword` / `signOut` — the rest of the app only depends on
 * `getCurrentUser()` returning a `Profile | null`.
 */

const COOKIE = "mwm_session";

export async function getCurrentUser(): Promise<Profile | null> {
  const store = await cookies();
  const id = store.get(COOKIE)?.value;
  if (!id) return null;
  return getProfile(id) ?? null;
}

/** Call only from a Server Action or Route Handler. */
export async function setSession(profileId: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, profileId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

/** Call only from a Server Action or Route Handler. */
export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}
