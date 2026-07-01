"use client";

import { useOptimistic, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Avatar } from "@/components/Avatar";
import { CategoryBadge } from "@/components/Badges";
import { addCommentAction } from "@/app/app/actions";
import { formatDate } from "@/lib/format";
import type { Comment, PostWithRelations, PublicProfile } from "@/lib/types";

type CommentWithAuthor = Comment & { author: PublicProfile };

function ReplyButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-primary/90 px-4 py-2 text-sm font-semibold text-on-primary hover:brightness-110 transition disabled:opacity-60"
    >
      {pending ? "…" : "Reply"}
    </button>
  );
}

export function PostCard({
  post,
  currentUser,
}: {
  post: PostWithRelations;
  currentUser: PublicProfile;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Canonical comment list, seeded from the server render. We append the real
  // row returned by the action here (no full-feed refetch needed).
  const [comments, setComments] = useState<CommentWithAuthor[]>(post.comments);
  // Instant-feedback layer: the pending comment shows immediately and reverts to
  // `comments` once the action's transition settles.
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (state, pending: CommentWithAuthor) => [...state, pending],
  );
  const formRef = useRef<HTMLFormElement>(null);
  const isAgentInsight = post.category === "agent_insight";

  async function onComment(formData: FormData) {
    const body = String(formData.get("body") ?? "").trim();
    if (!body) return;

    setError(null);
    setOpen(true);
    formRef.current?.reset();

    addOptimisticComment({
      id: `optimistic-${crypto.randomUUID()}`,
      postId: post.id,
      authorId: currentUser.id,
      body,
      createdAt: new Date().toISOString(),
      author: currentUser,
    });

    const res = await addCommentAction(formData);
    if ("error" in res) {
      setError(res.error);
      return;
    }
    setComments((prev) => [...prev, res.comment]);
  }

  return (
    <article
      className={`glass-shelf rounded-xl p-5 ${
        isAgentInsight ? "ring-1 ring-secondary/25" : ""
      }`}
    >
      <header className="flex items-start gap-3">
        <Avatar name={post.author.fullName} verified={post.author.isVerifiedAgent} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold">{post.author.fullName}</span>
            {post.author.role === "agent" && (
              <span className="text-xs text-secondary font-medium">
                Real Estate Agent
              </span>
            )}
            <span className="text-muted text-xs">· {formatDate(post.createdAt)}</span>
          </div>
          <div className="mt-1">
            <CategoryBadge category={post.category} />
          </div>
        </div>
      </header>

      <p className="mt-3 text-on-surface/95 leading-relaxed whitespace-pre-wrap">
        {post.body}
      </p>

      <div className="mt-4 flex items-center gap-4 text-sm text-on-surface-variant border-t divider pt-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="hover:text-primary transition"
        >
          💬 {optimisticComments.length}{" "}
          {optimisticComments.length === 1 ? "Comment" : "Comments"}
        </button>
      </div>

      {open && (
        <div className="mt-3 space-y-3">
          {optimisticComments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <Avatar name={c.author.fullName} size={28} verified={c.author.isVerifiedAgent} />
              <div className="flex-1 rounded-lg bg-white/[0.03] border border-white/5 px-3 py-2">
                <p className="text-sm">
                  <span className="font-semibold">{c.author.fullName}</span>{" "}
                  <span className="text-muted text-xs">
                    · {formatDate(c.createdAt)}
                  </span>
                </p>
                <p className="text-sm text-on-surface-variant mt-0.5">{c.body}</p>
              </div>
            </div>
          ))}

          <form ref={formRef} action={onComment} className="flex gap-2 pt-1">
            <input type="hidden" name="postId" value={post.id} />
            <input
              name="body"
              placeholder="Write a comment…"
              className="flex-1 rounded-full bg-white/[0.03] border border-outline-variant px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 transition"
            />
            <ReplyButton />
          </form>

          {error && <p className="text-sm text-error">{error}</p>}
        </div>
      )}
    </article>
  );
}
