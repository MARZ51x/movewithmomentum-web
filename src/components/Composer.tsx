"use client";

import { useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { createPostAction } from "@/app/app/actions";
import type { PostCategory, Role } from "@/lib/types";

const OPTIONS: { value: PostCategory; label: string; agentOnly?: boolean }[] = [
  { value: "resident", label: "Resident Voice" },
  { value: "market", label: "Market Update" },
  { value: "events", label: "Local Event" },
  { value: "agent_insight", label: "Agent Insight", agentOnly: true },
];

export function Composer({
  authorName,
  role,
  verified,
}: {
  authorName: string;
  role: Role;
  verified: boolean;
}) {
  const isAgent = role === "agent";
  const [category, setCategory] = useState<PostCategory>(
    isAgent ? "agent_insight" : "resident",
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const options = OPTIONS.filter((o) => !o.agentOnly || isAgent);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const res = await createPostAction(formData);
    setPending(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={onSubmit} className="glass-shelf rounded-xl p-4 sm:p-5">
      <div className="flex gap-3">
        <Avatar name={authorName} verified={verified} />
        <div className="flex-1">
          <textarea
            name="body"
            rows={2}
            placeholder={
              isAgent
                ? "Share a market update or community insight…"
                : "Share a neighborhood update, ask a question…"
            }
            className="w-full resize-none rounded-lg bg-white/[0.03] border border-outline-variant px-4 py-3 text-on-surface placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 transition"
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <select
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as PostCategory)}
              className="rounded-md bg-surface-high border border-outline-variant px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
            >
              {options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-3">
              {category === "agent_insight" && (
                <span className="text-xs text-secondary">
                  Fair-housing reviewed
                </span>
              )}
              <button
                type="submit"
                disabled={pending}
                className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-on-primary glow-primary hover:brightness-110 transition disabled:opacity-60"
              >
                {pending ? "Posting…" : "Post"}
              </button>
            </div>
          </div>

          {error && <p className="mt-2 text-sm text-error">{error}</p>}
        </div>
      </div>
    </form>
  );
}
