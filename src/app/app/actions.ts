"use server";

import { z } from "zod";
import { createComment, createPost } from "@/lib/store";
import { getCurrentUser } from "@/lib/session";
import type { Comment, PublicProfile } from "@/lib/types";

const postSchema = z.object({
  body: z.string().trim().min(1, "Write something first.").max(2000),
  category: z.enum(["market", "resident", "events", "agent_insight"]),
});

export async function createPostAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "You must be signed in." };

  const parsed = postSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid post." };
  }

  // Only agents may post "Agent Insight".
  let category = parsed.data.category;
  if (category === "agent_insight" && user.role !== "agent") {
    category = "resident";
  }

  // The DB moderation trigger forces fair_housing_approved = false on insert,
  // so posts created here sit in the moderation queue until an admin/service
  // role approves them (and then surface in the feed).
  await createPost({
    authorId: user.id,
    body: parsed.data.body,
    category,
  });

  // No revalidation: the DB moderation trigger holds new posts as pending, so
  // they don't surface in the feed until an admin approves. Refetching the feed
  // here would show nothing new and just add latency. The client shows a
  // "pending review" confirmation instead.
  return { ok: true };
}

const commentSchema = z.object({
  postId: z.string().min(1),
  body: z.string().trim().min(1, "Write a comment first.").max(1000),
});

type CommentWithAuthor = Comment & { author: PublicProfile };

export async function addCommentAction(
  formData: FormData,
): Promise<{ error: string } | { ok: true; comment: CommentWithAuthor }> {
  const user = await getCurrentUser();
  if (!user) return { error: "You must be signed in." };

  const parsed = commentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid comment." };
  }

  const comment = await createComment({
    postId: parsed.data.postId,
    authorId: user.id,
    body: parsed.data.body,
  });

  // Return the created row (with its author) so the client can render the real
  // comment directly. Comments have no moderation gate, so this avoids a full
  // feed refetch via revalidatePath.
  const author: PublicProfile = {
    id: user.id,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    isVerifiedAgent: user.isVerifiedAgent,
    neighborhood: user.neighborhood,
  };

  return { ok: true, comment: { ...comment, author } };
}
