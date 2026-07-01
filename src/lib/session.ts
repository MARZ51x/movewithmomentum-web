import "server-only";
import { cache } from "react";
import { createSupabaseServerClient } from "./supabase";
import type { Profile } from "./types";

/**
 * Auth session backed by Supabase Auth. `getCurrentUser()` resolves the signed-in
 * Auth user from the request cookies, then loads their domain `profiles` row.
 * The base table's RLS only lets the owner read their full row, so this returns
 * the caller's own profile (or null when signed out).
 *
 * Wrapped in React `cache()` so multiple callers in the same request render
 * (e.g. the hub layout and the feed page) share a single resolution instead of
 * each re-verifying the token and re-reading the profile. Identity comes from
 * `getClaims()`, which verifies the JWT locally (no Auth-server round-trip) when
 * the project uses asymmetric signing keys.
 */

export const getCurrentUser = cache(async (): Promise<Profile | null> => {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (error || !userId) return null;

  const { data: row } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (!row) return null;

  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    neighborhood: row.neighborhood,
    address: row.address,
    avatarUrl: row.avatar_url,
    licenseNumber: row.license_number,
    businessPhone: row.business_phone,
    isVerifiedAgent: row.is_verified_agent,
    createdAt: row.created_at,
  };
});
