"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Brand } from "@/components/Brand";
import { loginAction, type ActionState } from "@/app/actions/auth";

const initial: ActionState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  const inputCls =
    "w-full rounded-md bg-white/[0.03] border border-outline-variant px-4 py-3 text-on-surface placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 transition";

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
      <div className="text-center mb-8">
        <Brand size="lg" />
      </div>

      <div className="glass-shelf rounded-xl w-full max-w-md p-7 sm:p-9">
        <h1 className="font-display text-3xl font-bold mb-1">
          Welcome <span className="display-em">back</span>
        </h1>
        <p className="text-on-surface-variant text-sm mb-6">
          Sign in to your community hub.
        </p>

        <form action={formAction} className="space-y-5">
          <div>
            <label
              className="block text-xs font-bold tracking-wider uppercase text-on-surface-variant mb-2"
              htmlFor="email"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={inputCls}
              placeholder="alex@sterling.com"
              required
            />
          </div>
          <div>
            <label
              className="block text-xs font-bold tracking-wider uppercase text-on-surface-variant mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className={inputCls}
              placeholder="••••••••••••"
              required
            />
          </div>

          {state.error && (
            <p className="text-sm text-error bg-error/10 border border-error/30 rounded-md px-3 py-2">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3.5 font-semibold text-on-primary glow-primary hover:brightness-110 transition disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Enter the hub →"}
          </button>
        </form>
      </div>

      <p className="text-sm text-on-surface-variant mt-6">
        New here?{" "}
        <Link
          href="/register"
          className="text-primary font-semibold hover:underline"
        >
          Create your sanctuary
        </Link>
      </p>
    </main>
  );
}
