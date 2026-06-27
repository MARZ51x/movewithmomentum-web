import { CATEGORY_LABELS, ROLE_LABELS } from "@/lib/types";
import type { PostCategory, Role } from "@/lib/types";

export function RoleBadge({ role }: { role: Role }) {
  const isAgent = role === "agent";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        isAgent
          ? "bg-secondary/15 text-secondary border border-secondary/30"
          : "bg-primary/15 text-primary border border-primary/30"
      }`}
    >
      {isAgent && <span aria-hidden>★</span>}
      {ROLE_LABELS[role]}
    </span>
  );
}

const CATEGORY_STYLES: Record<PostCategory, string> = {
  agent_insight: "bg-secondary/15 text-secondary border-secondary/30",
  market: "bg-primary/15 text-primary border-primary/30",
  resident: "bg-white/5 text-on-surface-variant border-white/10",
  events: "bg-success/15 text-success border-success/30",
};

export function CategoryBadge({ category }: { category: PostCategory }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_STYLES[category]}`}
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
}
