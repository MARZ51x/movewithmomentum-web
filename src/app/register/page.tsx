"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Brand } from "@/components/Brand";
import { registerAction, type ActionState } from "@/app/actions/auth";
import type { Role } from "@/lib/types";

const ROLES: { value: Role; label: string; tagline: string }[] = [
  {
    value: "resident",
    label: "Buyer / Seller",
    tagline: "Get your neighborhood matches & claim your property",
  },
  {
    value: "agent",
    label: "Realtor",
    tagline: "Claim your profile — upload license & business phone",
  },
  {
    value: "researcher",
    label: "Researcher / News",
    tagline: "Access the data & news we share",
  },
];

const initial: ActionState = {};

export default function RegisterPage() {
  const [role, setRole] = useState<Role>("resident");
  const [captcha, setCaptcha] = useState(false);
  const [state, formAction, pending] = useActionState(registerAction, initial);

  const labelCls =
    "block text-xs font-bold tracking-wider uppercase text-on-surface-variant mb-2";
  const inputCls =
    "w-full rounded-md bg-white/[0.03] border border-outline-variant px-4 py-3 text-on-surface placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 transition";

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-10">
      <div className="text-center mb-8">
        <Brand size="lg" />
        <p className="text-on-surface-variant mt-3">
          Elite Real Estate &amp; Community Ecosystem
        </p>
      </div>

      <div className="glass-shelf rounded-xl w-full max-w-lg p-7 sm:p-9">
        <h1 className="font-display text-3xl font-bold mb-1">
          Create Your <span className="display-em">Sanctuary</span>
        </h1>
        <p className="text-on-surface-variant text-sm mb-6">
          Join the exclusive digital lounge for homeowners and real estate
          professionals.
        </p>

        {/* Role selector — routes each persona to its own portal */}
        <p className={labelCls}>I am a&hellip;</p>
        <div className="grid grid-cols-3 gap-2 mb-2" role="tablist">
          {ROLES.map((r) => {
            const active = role === r.value;
            return (
              <button
                key={r.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setRole(r.value)}
                className={`rounded-lg px-2 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-primary text-on-primary glow-primary"
                    : "bg-white/[0.03] border border-outline-variant text-on-surface-variant hover:border-primary/50"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-primary/90 mb-6 h-4">
          {ROLES.find((r) => r.value === role)?.tagline}
        </p>

        <form action={formAction} className="space-y-5">
          <input type="hidden" name="role" value={role} />
          <input type="hidden" name="captcha" value={captcha ? "verified" : ""} />

          <div>
            <label className={labelCls} htmlFor="fullName">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              className={inputCls}
              placeholder="Alex Sterling"
              required
            />
          </div>

          <div>
            <label className={labelCls} htmlFor="email">
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
            <label className={labelCls} htmlFor="password">
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

          <div>
            <label className={labelCls} htmlFor="neighborhood">
              {role === "researcher" ? "Area of interest" : "Neighborhood"}
            </label>
            <input
              id="neighborhood"
              name="neighborhood"
              className={inputCls}
              placeholder="Skyline Oaks"
              defaultValue="Skyline Oaks"
              required
            />
          </div>

          {role !== "researcher" && (
            <div>
              <label className={labelCls} htmlFor="address">
                Primary Residence Search
              </label>
              <div className="relative">
                <input
                  id="address"
                  name="address"
                  className={`${inputCls} pr-10`}
                  placeholder="Search address, neighborhood…"
                />
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary"
                  aria-hidden
                >
                  ◎
                </span>
              </div>
            </div>
          )}

          {/* Agent-only: Claim Your Profile */}
          {role === "agent" && (
            <div className="grid sm:grid-cols-2 gap-4 rounded-lg border border-secondary/30 bg-secondary/[0.06] p-4">
              <div className="sm:col-span-2 flex items-center gap-2 text-secondary text-xs font-bold tracking-wider uppercase">
                <span aria-hidden>★</span> Claim Your Profile
              </div>
              <div>
                <label className={labelCls} htmlFor="licenseNumber">
                  License Number
                </label>
                <input
                  id="licenseNumber"
                  name="licenseNumber"
                  className={inputCls}
                  placeholder="TX-0000000"
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="businessPhone">
                  Business Phone
                </label>
                <input
                  id="businessPhone"
                  name="businessPhone"
                  className={inputCls}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          )}

          {/* Captcha placeholder */}
          <label className="flex items-center gap-3 rounded-md border border-outline-variant bg-white/[0.02] px-4 py-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={captcha}
              onChange={(e) => setCaptcha(e.target.checked)}
              className="size-5 accent-primary"
            />
            <span className="text-sm text-on-surface-variant">
              I&apos;m not a robot{" "}
              <span className="text-muted">(captcha placeholder)</span>
            </span>
          </label>

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
            {pending ? "Initializing…" : "Initialize Account →"}
          </button>
        </form>
      </div>

      <p className="text-sm text-on-surface-variant mt-6">
        Already a member?{" "}
        <Link href="/login" className="text-primary font-semibold hover:underline">
          Sign in to your hub
        </Link>
      </p>
    </main>
  );
}
