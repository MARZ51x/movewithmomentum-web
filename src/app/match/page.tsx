"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Brand } from "@/components/Brand";
import { matchAction, type MatchState } from "./actions";
import { PRIORITY_LABELS, type PriorityKey } from "@/lib/communities";
import type { Household } from "@/lib/match";

const BUDGETS: { label: string; value: number }[] = [
  { label: "Up to $350k", value: 350000 },
  { label: "$350k – $500k", value: 500000 },
  { label: "$500k – $650k", value: 650000 },
  { label: "$650k+", value: 900000 },
];

const HOUSEHOLDS: { label: string; value: Household }[] = [
  { label: "Family with kids", value: "family" },
  { label: "Couple", value: "couple" },
  { label: "Single", value: "single" },
  { label: "Retiree", value: "retiree" },
];

const SETTINGS: { label: string; value: "any" | "urban" | "suburban" | "rural" }[] =
  [
    { label: "No preference", value: "any" },
    { label: "Urban", value: "urban" },
    { label: "Suburban", value: "suburban" },
    { label: "Rural", value: "rural" },
  ];

const PRIORITY_KEYS = Object.keys(PRIORITY_LABELS) as PriorityKey[];
const initial: MatchState = {};

export default function MatchPage() {
  const [budget, setBudget] = useState<number>(500000);
  const [household, setHousehold] = useState<Household>("family");
  const [setting, setSetting] = useState<(typeof SETTINGS)[number]["value"]>("any");
  const [priorities, setPriorities] = useState<PriorityKey[]>([
    "schools",
    "safety",
  ]);
  const [state, formAction, pending] = useActionState(matchAction, initial);

  function togglePriority(key: PriorityKey) {
    setPriorities((prev) =>
      prev.includes(key)
        ? prev.filter((k) => k !== key)
        : prev.length >= 4
          ? prev
          : [...prev, key],
    );
  }

  const chip = (active: boolean) =>
    `rounded-full px-4 py-2 text-sm font-medium border transition ${
      active
        ? "bg-primary text-on-primary border-primary glow-primary"
        : "border-outline-variant text-on-surface-variant hover:border-primary/60 hover:text-on-surface"
    }`;

  const inputCls =
    "w-full rounded-md bg-white/[0.03] border border-outline-variant px-4 py-3 text-on-surface placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 transition";
  const sectionLabel =
    "block text-xs font-bold tracking-wider uppercase text-on-surface-variant mb-3";

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-10">
      <header className="w-full max-w-2xl flex items-center justify-between mb-8">
        <Brand />
        <Link
          href="/"
          className="text-sm text-on-surface-variant hover:text-primary transition"
        >
          ← Home
        </Link>
      </header>

      <div className="w-full max-w-2xl">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary mb-3">
          Match Me
        </p>
        <h1 className="font-display text-4xl font-bold mb-2">
          Find your <span className="display-em">community</span>
        </h1>
        <p className="text-on-surface-variant mb-8">
          Answer a few questions and we&apos;ll rank your top 5 communities — and
          email you the full report.
        </p>

        <form action={formAction} className="glass-shelf rounded-xl p-6 sm:p-8 space-y-7">
          {/* hidden state-backed fields */}
          <input type="hidden" name="budget" value={budget} />
          <input type="hidden" name="household" value={household} />
          <input type="hidden" name="setting" value={setting} />
          {priorities.map((p) => (
            <input key={p} type="hidden" name="priorities" value={p} />
          ))}

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className={sectionLabel} htmlFor="name">
                Your name
              </label>
              <input id="name" name="name" className={inputCls} placeholder="Alex Sterling" required />
            </div>
            <div>
              <label className={sectionLabel} htmlFor="email">
                Email for your report
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
          </div>

          <div>
            <span className={sectionLabel}>Budget</span>
            <div className="flex flex-wrap gap-2">
              {BUDGETS.map((b) => (
                <button
                  key={b.value}
                  type="button"
                  onClick={() => setBudget(b.value)}
                  className={chip(budget === b.value)}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className={sectionLabel}>Household</span>
            <div className="flex flex-wrap gap-2">
              {HOUSEHOLDS.map((h) => (
                <button
                  key={h.value}
                  type="button"
                  onClick={() => setHousehold(h.value)}
                  className={chip(household === h.value)}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className={sectionLabel}>Preferred setting</span>
            <div className="flex flex-wrap gap-2">
              {SETTINGS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSetting(s.value)}
                  className={chip(setting === s.value)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className={sectionLabel}>
              What matters most?{" "}
              <span className="text-muted normal-case font-normal">
                (pick up to 4 — {priorities.length}/4)
              </span>
            </span>
            <div className="flex flex-wrap gap-2">
              {PRIORITY_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => togglePriority(key)}
                  className={chip(priorities.includes(key))}
                >
                  {PRIORITY_LABELS[key]}
                </button>
              ))}
            </div>
          </div>

          {state.error && (
            <p className="text-sm text-error bg-error/10 border border-error/30 rounded-md px-3 py-2">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-secondary px-6 py-3.5 font-semibold text-on-secondary glow-gold hover:brightness-110 transition disabled:opacity-60"
          >
            {pending ? "Finding your matches…" : "Get my top 5 matches →"}
          </button>
        </form>
      </div>
    </main>
  );
}
