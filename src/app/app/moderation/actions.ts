"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { approvePost, declinePost } from "@/lib/store";
import { getCurrentUser } from "@/lib/session";

const idSchema = z.string().uuid();

export async function approvePostAction(id: string) {
  const user = await getCurrentUser();
  if (user?.role !== "admin") return { error: "Not authorized." };

  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { error: "Invalid post." };

  await approvePost(parsed.data);
  revalidatePath("/app/moderation");
  revalidatePath("/app");
  return { ok: true };
}

export async function declinePostAction(id: string) {
  const user = await getCurrentUser();
  if (user?.role !== "admin") return { error: "Not authorized." };

  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { error: "Invalid post." };

  await declinePost(parsed.data);
  revalidatePath("/app/moderation");
  revalidatePath("/app");
  return { ok: true };
}
