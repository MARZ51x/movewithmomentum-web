/**
 * Domain types. These deliberately mirror the future Supabase tables so the
 * mock store and the real DB stay shape-compatible. When Supabase is wired up,
 * generate types into `database.types.ts` and re-export the row types here.
 */

// 'user' is a buyer or seller; 'agent' is a licensed realtor; 'admin' is a
// privileged moderator/operator (assigned server-side only, never via signup).
export type Role = "admin" | "agent" | "user";

export type PostCategory =
  | "market" // Market Updates
  | "resident" // Resident Voice
  | "events" // Local Events
  | "agent_insight"; // Agent Insight (agents only)

/**
 * Non-sensitive author projection, maps to `public.profiles_public`. This is
 * what the feed renders for post/comment authors (the full `profiles` row is
 * RLS-locked to its owner). PII fields (email, address, license, phone) are
 * intentionally absent.
 */
export interface PublicProfile {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  role: Role;
  isVerifiedAgent: boolean;
  neighborhood: string;
}

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
  author: PublicProfile;
  comments: (Comment & { author: PublicProfile })[];
}

export const CATEGORY_LABELS: Record<PostCategory, string> = {
  market: "Market Updates",
  resident: "Resident Voice",
  events: "Local Events",
  agent_insight: "Agent Insight",
};

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  agent: "Licensed Agent",
  user: "Buyer / Seller",
};
