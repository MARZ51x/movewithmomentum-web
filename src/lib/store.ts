import "server-only";
import type {
  Comment,
  Post,
  PostCategory,
  PostWithRelations,
  Profile,
  Role,
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
 * In-memory data store with seed data so the app is fully runnable today
 * without any Supabase credentials. Every function here is the seam where the
 * real Supabase queries will go (see `src/lib/data.ts` for the public API used
 * by the UI). We keep it on `globalThis` so it survives dev-server HMR reloads.
 */

interface DB {
  profiles: Map<string, Profile>;
  posts: Post[];
  comments: Comment[];
  matchReports: Map<string, MatchReport>;
  seq: number;
}

const SEED_NEIGHBORHOOD = "Skyline Oaks";

function seed(): DB {
  const profiles = new Map<string, Profile>();

  const add = (p: Omit<Profile, "createdAt">) =>
    profiles.set(p.id, { ...p, createdAt: "2026-06-20T12:00:00.000Z" });

  add({
    id: "u_marcus",
    fullName: "Marcus Sterling",
    email: "marcus@globalluxury.com",
    role: "agent",
    neighborhood: SEED_NEIGHBORHOOD,
    address: null,
    avatarUrl: null,
    licenseNumber: "TX-0294817",
    businessPhone: "+1 (512) 555-0147",
    isVerifiedAgent: true,
  });
  add({
    id: "u_sarah",
    fullName: "Sarah Jennings",
    email: "sarah@skylineoaks.org",
    role: "resident",
    neighborhood: SEED_NEIGHBORHOOD,
    address: "812 Oak Crest Ln",
    avatarUrl: null,
    licenseNumber: null,
    businessPhone: null,
    isVerifiedAgent: false,
  });
  add({
    id: "u_david",
    fullName: "David Chen",
    email: "david@skylineoaks.org",
    role: "resident",
    neighborhood: SEED_NEIGHBORHOOD,
    address: "44 Lantern Walk",
    avatarUrl: null,
    licenseNumber: null,
    businessPhone: null,
    isVerifiedAgent: false,
  });

  const posts: Post[] = [
    {
      id: "p_1",
      authorId: "u_marcus",
      body: "Just closed a record deal in the Heights district. We're seeing a 14% increase in buyer inquiries for modern brutalist architecture. If you're considering listing, now is the time to leverage the current inventory shortage. Happy to run a free comp analysis for any neighbor here.",
      category: "agent_insight",
      fairHousingApproved: true,
      createdAt: "2026-06-25T15:30:00.000Z",
    },
    {
      id: "p_2",
      authorId: "u_sarah",
      body: "The new community garden project is finally taking shape! Check out the progress on the sustainable irrigation system we're installing this weekend. Volunteers are still welcome — bring gloves. 🌱",
      category: "events",
      fairHousingApproved: true,
      createdAt: "2026-06-25T18:05:00.000Z",
    },
    {
      id: "p_3",
      authorId: "u_david",
      body: "Does anyone have a recommendation for a reliable electrician in the area? Looking to add some outdoor lighting before the block party.",
      category: "resident",
      fairHousingApproved: true,
      createdAt: "2026-06-26T09:12:00.000Z",
    },
  ];

  const comments: Comment[] = [
    {
      id: "c_1",
      postId: "p_2",
      authorId: "u_david",
      body: "Count me in for Saturday morning! I'll bring an extra wheelbarrow.",
      createdAt: "2026-06-25T19:00:00.000Z",
    },
    {
      id: "c_2",
      postId: "p_3",
      authorId: "u_sarah",
      body: "We used Lumen Electric last month — fast and fairly priced. I'll DM you the number.",
      createdAt: "2026-06-26T10:01:00.000Z",
    },
  ];

  return { profiles, posts, comments, matchReports: new Map(), seq: 100 };
}

const globalForDb = globalThis as unknown as { __mwm_db?: DB };
const db: DB = (globalForDb.__mwm_db ??= seed());
// Self-heal stale singletons from before a field was added (dev HMR).
db.matchReports ??= new Map();

function nextId(prefix: string): string {
  db.seq += 1;
  return `${prefix}_${db.seq}`;
}

// ---- profiles ----

export function getProfile(id: string): Profile | undefined {
  return db.profiles.get(id);
}

export function getProfileByEmail(email: string): Profile | undefined {
  const lower = email.toLowerCase();
  return [...db.profiles.values()].find((p) => p.email.toLowerCase() === lower);
}

export function createProfile(input: {
  fullName: string;
  email: string;
  role: Role;
  neighborhood: string;
  address?: string | null;
  licenseNumber?: string | null;
  businessPhone?: string | null;
}): Profile {
  const profile: Profile = {
    id: nextId("u"),
    fullName: input.fullName,
    email: input.email,
    role: input.role,
    neighborhood: input.neighborhood,
    address: input.address ?? null,
    avatarUrl: null,
    licenseNumber: input.licenseNumber ?? null,
    businessPhone: input.businessPhone ?? null,
    // Agents are auto-flagged verified here; in production this is a manual
    // license check before the gold "Verified Agent" badge is granted.
    isVerifiedAgent: input.role === "agent",
    createdAt: new Date().toISOString(),
  };
  db.profiles.set(profile.id, profile);
  return profile;
}

// ---- feed ----

export function listFeed(opts: {
  neighborhood: string;
  category?: PostCategory | "all";
}): PostWithRelations[] {
  const category = opts.category ?? "all";
  return db.posts
    .filter((p) => p.fairHousingApproved)
    .filter((p) => category === "all" || p.category === category)
    .map((p) => hydrate(p))
    .filter((p): p is PostWithRelations => p !== null)
    .filter((p) => p.author.neighborhood === opts.neighborhood)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function hydrate(post: Post): PostWithRelations | null {
  const author = db.profiles.get(post.authorId);
  if (!author) return null;
  const comments = db.comments
    .filter((c) => c.postId === post.id)
    .map((c) => {
      const cAuthor = db.profiles.get(c.authorId);
      return cAuthor ? { ...c, author: cAuthor } : null;
    })
    .filter((c): c is Comment & { author: Profile } => c !== null)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return { ...post, author, comments };
}

export function createPost(input: {
  authorId: string;
  body: string;
  category: PostCategory;
  /** Agent posts require fair-housing approval before they appear in the feed. */
  fairHousingApproved: boolean;
}): Post {
  const post: Post = {
    id: nextId("p"),
    authorId: input.authorId,
    body: input.body,
    category: input.category,
    fairHousingApproved: input.fairHousingApproved,
    createdAt: new Date().toISOString(),
  };
  db.posts.push(post);
  return post;
}

export function createComment(input: {
  postId: string;
  authorId: string;
  body: string;
}): Comment {
  const comment: Comment = {
    id: nextId("c"),
    postId: input.postId,
    authorId: input.authorId,
    body: input.body,
    createdAt: new Date().toISOString(),
  };
  db.comments.push(comment);
  return comment;
}

// ---- match reports (Match Me) ----

export function createMatchReport(input: {
  name: string;
  email: string;
  matchInput: MatchInput;
  results: ScoredCommunity[];
}): MatchReport {
  const report: MatchReport = {
    id: nextId("m"),
    name: input.name,
    email: input.email,
    input: input.matchInput,
    results: input.results,
    emailed: false,
    createdAt: new Date().toISOString(),
  };
  db.matchReports.set(report.id, report);
  return report;
}

export function getMatchReport(id: string): MatchReport | undefined {
  return db.matchReports.get(id);
}

export function markReportEmailed(id: string): void {
  const r = db.matchReports.get(id);
  if (r) r.emailed = true;
}
