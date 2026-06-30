import "server-only";
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from "./supabase";
import type { Json } from "./database.types";
import type {
  Comment,
  Post,
  PostCategory,
  PostWithRelations,
  PublicProfile,
} from "./types";
import type { MatchInput, ScoredCommunity } from "./match";

/** A saved "Match Me" submission — also the agent lead record. */
export interface MatchReport {
  id: string;
  name: string;
  email: string;
  input: MatchInput;
  results: ScoredCommunity[];
  emailed: boolean;
  createdAt: string;
}

/**
 * Data access layer. Every function here talks to Supabase, mapping the
 * snake_case columns to the camelCase domain shapes in `types.ts`. Reads/writes
 * that act on behalf of the signed-in user go through the cookie-bound server
 * client (RLS applies); the public Match Me funnel uses the service-role client
 * because it must read/update reports that anonymous callers can't select.
 */

// ---- mappers (snake_case row -> camelCase domain) ----

type PublicProfileRow = {
  id: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: PublicProfile["role"] | null;
  is_verified_agent: boolean | null;
  neighborhood: string | null;
};

function mapPublicProfile(row: PublicProfileRow): PublicProfile {
  return {
    id: row.id ?? "",
    fullName: row.full_name ?? "",
    avatarUrl: row.avatar_url,
    role: row.role ?? "user",
    isVerifiedAgent: row.is_verified_agent ?? false,
    neighborhood: row.neighborhood ?? "",
  };
}

type PostRow = {
  id: string;
  author_id: string;
  body: string;
  category: PostCategory;
  fair_housing_approved: boolean;
  created_at: string;
};

function mapPost(row: PostRow): Post {
  return {
    id: row.id,
    authorId: row.author_id,
    body: row.body,
    category: row.category,
    fairHousingApproved: row.fair_housing_approved,
    createdAt: row.created_at,
  };
}

type CommentRow = {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  created_at: string;
};

function mapComment(row: CommentRow): Comment {
  return {
    id: row.id,
    postId: row.post_id,
    authorId: row.author_id,
    body: row.body,
    createdAt: row.created_at,
  };
}

type MatchReportRow = {
  id: string;
  name: string;
  email: string;
  input: Json;
  results: Json;
  emailed: boolean;
  created_at: string;
};

function mapMatchReport(row: MatchReportRow): MatchReport {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    input: row.input as unknown as MatchInput,
    results: row.results as unknown as ScoredCommunity[],
    emailed: row.emailed,
    createdAt: row.created_at,
  };
}

// ---- feed ----

export async function listFeed(opts: {
  neighborhood: string;
  category?: PostCategory | "all";
}): Promise<PostWithRelations[]> {
  const category = opts.category ?? "all";
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("posts")
    .select(
      "id, author_id, body, category, fair_housing_approved, created_at, comments(id, post_id, author_id, body, created_at)",
    )
    // Only fair-housing-approved posts surface in the feed (RLS also enforces
    // this for non-owners; the explicit filter keeps owners' pending posts out).
    .eq("fair_housing_approved", true)
    .order("created_at", { ascending: false });

  if (category !== "all") query = query.eq("category", category);

  const { data: posts, error } = await query;
  if (error || !posts) return [];

  // Hydrate authors via the non-PII projection (profiles_public). The full
  // profiles row is RLS-locked to its owner, and the view has no FK PostgREST
  // can embed, so we batch-fetch the authors and join in memory.
  const authorIds = new Set<string>();
  for (const p of posts) {
    authorIds.add(p.author_id);
    for (const c of p.comments ?? []) authorIds.add(c.author_id);
  }
  if (authorIds.size === 0) return [];

  const { data: authorRows } = await supabase
    .from("profiles_public")
    .select("id, full_name, avatar_url, role, is_verified_agent, neighborhood")
    .in("id", [...authorIds]);

  const authors = new Map<string, PublicProfile>();
  for (const row of authorRows ?? []) {
    if (!row.id) continue;
    authors.set(row.id, mapPublicProfile(row));
  }

  const result: PostWithRelations[] = [];
  for (const p of posts) {
    const author = authors.get(p.author_id);
    if (!author || author.neighborhood !== opts.neighborhood) continue;

    const comments = (p.comments ?? [])
      .map((c) => {
        const cAuthor = authors.get(c.author_id);
        return cAuthor ? { ...mapComment(c), author: cAuthor } : null;
      })
      .filter((c): c is Comment & { author: PublicProfile } => c !== null)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    result.push({ ...mapPost(p), author, comments });
  }
  return result;
}

// ---- moderation (admin-only) ----

/**
 * Pending posts awaiting fair-housing review. Mirrors `listFeed`'s hydration but
 * selects unapproved rows and skips the neighborhood filter — admins moderate
 * across neighborhoods. RLS ("posts readable ... or admin") still gates this to
 * admins/owners, and the moderation page is admin-gated on top.
 */
export async function listPendingPosts(): Promise<PostWithRelations[]> {
  const supabase = await createSupabaseServerClient();

  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      "id, author_id, body, category, fair_housing_approved, created_at, comments(id, post_id, author_id, body, created_at)",
    )
    .eq("fair_housing_approved", false)
    .order("created_at", { ascending: false });
  if (error || !posts) return [];

  const authorIds = new Set<string>();
  for (const p of posts) {
    authorIds.add(p.author_id);
    for (const c of p.comments ?? []) authorIds.add(c.author_id);
  }
  if (authorIds.size === 0) return [];

  const { data: authorRows } = await supabase
    .from("profiles_public")
    .select("id, full_name, avatar_url, role, is_verified_agent, neighborhood")
    .in("id", [...authorIds]);

  const authors = new Map<string, PublicProfile>();
  for (const row of authorRows ?? []) {
    if (!row.id) continue;
    authors.set(row.id, mapPublicProfile(row));
  }

  const result: PostWithRelations[] = [];
  for (const p of posts) {
    const author = authors.get(p.author_id);
    if (!author) continue;

    const comments = (p.comments ?? [])
      .map((c) => {
        const cAuthor = authors.get(c.author_id);
        return cAuthor ? { ...mapComment(c), author: cAuthor } : null;
      })
      .filter((c): c is Comment & { author: PublicProfile } => c !== null)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    result.push({ ...mapPost(p), author, comments });
  }
  return result;
}

/** Approve a pending post. Allowed by the "admins update any post" RLS policy. */
export async function approvePost(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("posts")
    .update({ fair_housing_approved: true })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

/** Decline (delete) a post. Allowed by the "admins delete any post" RLS policy. */
export async function declinePost(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function createPost(input: {
  authorId: string;
  body: string;
  category: PostCategory;
}): Promise<Post> {
  // The DB moderation trigger forces fair_housing_approved = false on insert for
  // non-service callers, so a post created here always starts pending until an
  // admin/service-role approval.
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: input.authorId,
      body: input.body,
      category: input.category,
    })
    .select("id, author_id, body, category, fair_housing_approved, created_at")
    .single();
  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create post.");
  }
  return mapPost(data);
}

export async function createComment(input: {
  postId: string;
  authorId: string;
  body: string;
}): Promise<Comment> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: input.postId,
      author_id: input.authorId,
      body: input.body,
    })
    .select("id, post_id, author_id, body, created_at")
    .single();
  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create comment.");
  }
  return mapComment(data);
}

// ---- match reports (Match Me) ----

export async function createMatchReport(input: {
  name: string;
  email: string;
  matchInput: MatchInput;
  results: ScoredCommunity[];
}): Promise<MatchReport> {
  // Match Me is a public, unauthenticated funnel. Anon callers may insert but
  // can't select the row back, so we use the service-role client server-side.
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("match_reports")
    .insert({
      user_id: null,
      name: input.name,
      email: input.email,
      input: input.matchInput as unknown as Json,
      results: input.results as unknown as Json,
    })
    .select("*")
    .single();
  if (error || !data) {
    throw new Error(error?.message ?? "Failed to save match report.");
  }
  return mapMatchReport(data);
}

export async function getMatchReport(
  id: string,
): Promise<MatchReport | undefined> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("match_reports")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return undefined;
  return mapMatchReport(data);
}

export async function markReportEmailed(id: string): Promise<void> {
  const supabase = createSupabaseServiceClient();
  await supabase.from("match_reports").update({ emailed: true }).eq("id", id);
}
