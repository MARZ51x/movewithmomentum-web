import Link from "next/link";
import { Composer } from "@/components/Composer";
import { PostCard } from "@/components/PostCard";
import { getCurrentUser } from "@/lib/session";
import { listFeed } from "@/lib/store";
import { CATEGORY_LABELS, type PostCategory } from "@/lib/types";

const FILTERS: { value: PostCategory | "all"; label: string }[] = [
  { value: "all", label: "All Stories" },
  { value: "market", label: CATEGORY_LABELS.market },
  { value: "resident", label: CATEGORY_LABELS.resident },
  { value: "events", label: CATEGORY_LABELS.events },
  { value: "agent_insight", label: CATEGORY_LABELS.agent_insight },
];

function isCategory(v: string | undefined): v is PostCategory | "all" {
  return FILTERS.some((f) => f.value === v);
}

export default async function CommunityCollabPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null; // layout already gates; satisfies the type checker

  const { category: raw } = await searchParams;
  const category = isCategory(raw) ? raw : "all";
  const posts = await listFeed({ neighborhood: user.neighborhood, category });

  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-6">
      <div className="space-y-5">
        <div>
          <h1 className="font-display text-3xl font-bold">
            Community <span className="display-em">Collab</span>
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            {user.neighborhood} · connect, ask, and share with your neighbors.
          </p>
        </div>

        <Composer
          authorName={user.fullName}
          role={user.role}
          verified={user.isVerifiedAgent}
        />

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = f.value === category;
            const href = f.value === "all" ? "/app" : `/app?category=${f.value}`;
            return (
              <Link
                key={f.value}
                href={href}
                className={`rounded-full px-4 py-1.5 text-sm font-medium border transition ${
                  active
                    ? "bg-primary text-on-primary border-primary glow-primary"
                    : "border-outline-variant text-on-surface-variant hover:border-primary/60 hover:text-on-surface"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>

        {/* Feed */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <p className="glass-shelf rounded-xl p-8 text-center text-on-surface-variant">
              No posts in this category yet. Be the first to share something.
            </p>
          ) : (
            posts.map((p) => <PostCard key={p.id} post={p} />)
          )}
        </div>
      </div>

      {/* Sidebar */}
      <aside className="space-y-4 hidden lg:block">
        <Link
          href="/match"
          className="block glass-shelf rounded-xl p-5 hover:ring-1 hover:ring-secondary/40 transition"
        >
          <p className="text-xs font-bold tracking-[0.15em] uppercase text-secondary mb-1">
            Match Me
          </p>
          <p className="font-display text-lg font-bold leading-tight">
            Find your next community
          </p>
          <p className="text-sm text-on-surface-variant mt-1">
            Answer 5 questions → get your top 5 matches, emailed to you. →
          </p>
        </Link>

        <div className="glass-shelf rounded-xl p-5">
          <p className="text-xs font-bold tracking-[0.15em] uppercase text-secondary mb-3">
            Trending Topics
          </p>
          <ul className="space-y-3 text-sm">
            {[
              ["Skyline Oaks Expansion", "24 residents discussing"],
              ["New 'Artisanal Row' Opening", "642 check-ins today"],
              ["Q3 District Planning", "zoning review ongoing"],
            ].map(([t, meta]) => (
              <li key={t} className="border-b divider pb-3 last:border-0 last:pb-0">
                <p className="font-medium text-on-surface">{t}</p>
                <p className="text-xs text-muted">{meta}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-shelf rounded-xl p-5">
          <p className="text-xs font-bold tracking-[0.15em] uppercase text-primary mb-3">
            Top Agents
          </p>
          <p className="text-sm text-on-surface-variant">
            Verified agents post fair-housing-approved insight here. Look for the{" "}
            <span className="text-secondary">★ gold badge</span>.
          </p>
        </div>
      </aside>
    </div>
  );
}
