"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createComment, createPost } from "@/lib/store";
import { getCurrentUser } from "@/lib/session";

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

  revalidatePath("/app");
  return { ok: true };
}

const commentSchema = z.object({
  postId: z.string().min(1),
  body: z.string().trim().min(1, "Write a comment first.").max(1000),
});

export async function addCommentAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "You must be signed in." };

  const parsed = commentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid comment." };
  }

  await createComment({
    postId: parsed.data.postId,
    authorId: user.id,
    body: parsed.data.body,
  });

  revalidatePath("/app");
  return { ok: true };
}
