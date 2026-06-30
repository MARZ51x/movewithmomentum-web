"use client";

import { useState, useTransition } from "react";
import { approvePostAction, declinePostAction } from "@/app/app/moderation/actions";

export function ModerationActions({ postId }: { postId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: (id: string) => Promise<{ error?: string; ok?: boolean }>) {
    setError(null);
    startTransition(async () => {
      const res = await action(postId);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="mt-4 flex items-center gap-3 border-t divider pt-3">
      <button
        type="button"
        disabled={pending}
        onClick={() => run(approvePostAction)}
        className="rounded-full bg-success/90 px-4 py-2 text-sm font-semibold text-on-primary hover:brightness-110 transition disabled:opacity-60"
      >
        Approve
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => run(declinePostAction)}
        className="rounded-full border border-error/40 px-4 py-2 text-sm font-semibold text-error hover:bg-error/10 transition disabled:opacity-60"
      >
        Decline
      </button>
      {pending && <span className="text-xs text-muted">Working…</span>}
      {error && <span className="text-xs text-error">{error}</span>}
    </div>
  );
}
