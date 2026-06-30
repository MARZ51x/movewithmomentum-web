import "server-only";
import { createSupabaseServerClient } from "./supabase";
import type { Profile } from "./types";

/**
 * Auth session backed by Supabase Auth. `getCurrentUser()` resolves the signed-in
 * Auth user from the request cookies, then loads their domain `profiles` row.
 * The base table's RLS only lets the owner read their full row, so this returns
 * the caller's own profile (or null when signed out).
 */

export async function getCurrentUser(): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: row } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
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
}
