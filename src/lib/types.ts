/**
 * Domain types. These deliberately mirror the future Supabase tables so the
 * mock store and the real DB stay shape-compatible. When Supabase is wired up,
 * generate types into `database.types.ts` and re-export the row types here.
 */

export type Role = "resident" | "agent" | "researcher";

export type PostCategory =
  | "market" // Market Updates
  | "resident" // Resident Voice
  | "events" // Local Events
  | "agent_insight"; // Agent Insight (agents only)

/** maps to `public.profiles` */
export interface Profile {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  neighborhood: string;
  address: string | null;
  avatarUrl: string | null;
  // agent-only fields ("Claim Your Profile")
  licenseNumber: string | null;
  businessPhone: string | null;
  isVerifiedAgent: boolean;
  createdAt: string;
}

/** maps to `public.posts` */
export interface Post {
  id: string;
  authorId: string;
  body: string;
  category: PostCategory;
  /** Fair-housing review state. Agent posts must be approved before publishing. */
  fairHousingApproved: boolean;
  createdAt: string;
}

/** maps to `public.comments` */
export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  body: string;
  createdAt: string;
}

/** A post joined with its author + comments (joined comments joined with authors). */
export interface PostWithRelations extends Post {
  author: Profile;
  comments: (Comment & { author: Profile })[];
}

export const CATEGORY_LABELS: Record<PostCategory, string> = {
  market: "Market Updates",
  resident: "Resident Voice",
  events: "Local Events",
  agent_insight: "Agent Insight",
};

export const ROLE_LABELS: Record<Role, string> = {
  resident: "Resident",
  agent: "Licensed Agent",
  researcher: "Researcher / News",
};
