import { redirect } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { CategoryBadge } from "@/components/Badges";
import { ModerationActions } from "@/components/ModerationActions";
import { getCurrentUser } from "@/lib/session";
import { listPendingPosts } from "@/lib/store";
import { formatDate } from "@/lib/format";

export default async function ModerationPage() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") redirect("/app");

  const posts = await listPendingPosts();

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="font-display text-3xl font-bold">
          Post <span className="display-em">Moderation</span>
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Fair-housing review queue · approve to publish, decline to delete.
        </p>
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <p className="glass-shelf rounded-xl p-8 text-center text-on-surface-variant">
            Nothing pending. The queue is clear.
          </p>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="glass-shelf rounded-xl p-5">
              <header className="flex items-start gap-3">
                <Avatar
                  name={post.author.fullName}
                  verified={post.author.isVerifiedAgent}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-semibold">{post.author.fullName}</span>
                    {post.author.role === "agent" && (
                      <span className="text-xs text-secondary font-medium">
                        Real Estate Agent
                      </span>
                    )}
                    <span className="text-muted text-xs">
                      · {post.author.neighborhood} · {formatDate(post.createdAt)}
                    </span>
                  </div>
                  <div className="mt-1">
                    <CategoryBadge category={post.category} />
                  </div>
                </div>
              </header>

              <p className="mt-3 text-on-surface/95 leading-relaxed whitespace-pre-wrap">
                {post.body}
              </p>

              <ModerationActions postId={post.id} />
            </article>
          ))
        )}
      </div>
    </div>
  );
}
