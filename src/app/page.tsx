import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand } from "@/components/Brand";
import { getCurrentUser } from "@/lib/session";

export default async function Home() {
  // If already signed in, go straight to the hub.
  const user = await getCurrentUser();
  if (user) redirect("/app");

  return (
    <main className="flex-1 flex flex-col">
      <header className="flex items-center justify-between px-6 sm:px-10 py-6">
        <Brand />
        <div className="flex items-center gap-5">
          <Link
            href="/match"
            className="text-sm text-primary hover:underline"
          >
            Match Me
          </Link>
          <Link
            href="/login"
            className="text-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      <section className="flex-1 grid lg:grid-cols-2 gap-12 items-center max-w-7xl w-full mx-auto px-6 sm:px-10 py-12">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase mb-5">
            Neighborhood Intelligence
          </p>
          <h1 className="font-display text-5xl sm:text-6xl font-bold leading-[1.05] mb-6">
            The most comprehensive housing database.{" "}
            <span className="display-em">Free.</span>
          </h1>
          <p className="text-lg text-on-surface-variant max-w-xl mb-8 leading-relaxed">
            An exclusive digital lounge for homeowners and real estate
            professionals. Get deeper neighborhood data, connect with your
            neighbors, and access verified agent insight — all in one private
            community hub.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-md bg-secondary px-7 py-3.5 font-semibold text-on-secondary glow-gold hover:brightness-110 transition"
            >
              Create your sanctuary
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center rounded-md border border-primary/60 px-7 py-3.5 font-semibold text-primary hover:bg-primary/10 transition"
            >
              I already have a hub
            </Link>
          </div>

          <dl className="mt-12 grid grid-cols-3 gap-6 max-w-md">
            {[
              ["67", "Counties scored"],
              ["887", "ZIP codes"],
              ["4,500+", "Neighborhoods"],
            ].map(([n, label]) => (
              <div key={label}>
                <dt className="font-display text-3xl font-bold text-primary">
                  {n}
                </dt>
                <dd className="text-xs text-muted mt-1">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="hidden lg:block">
          <div className="glass-shelf rounded-xl p-8 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 size-64 rounded-full bg-primary/10 blur-3xl" />
            <p className="text-xs font-bold tracking-[0.2em] text-secondary uppercase mb-4">
              Inside the hub
            </p>
            <ul className="space-y-4 relative">
              {[
                [
                  "Community Collab",
                  "Post, comment, and get recommendations from verified neighbors.",
                ],
                [
                  "Neighborhood Insights",
                  "Demographics, sentiment, zoning & expansion data.",
                ],
                [
                  "Verified Agent Insight",
                  "Fair-housing-approved commentary from licensed agents.",
                ],
                [
                  "Match Me",
                  "Tell us what you want — get your top 5 community matches.",
                ],
              ].map(([title, desc]) => (
                <li
                  key={title}
                  className="rounded-lg border border-white/5 bg-white/[0.03] p-4"
                >
                  <p className="font-semibold text-on-surface">{title}</p>
                  <p className="text-sm text-on-surface-variant mt-1">{desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="px-6 sm:px-10 py-8 text-xs text-muted flex flex-wrap gap-x-8 gap-y-2 border-t divider">
        <span>© 2026 Move With Momentum. All rights reserved.</span>
        <span>Encrypted Vault</span>
        <span>Fair Housing Certified</span>
        <span>Privacy First</span>
      </footer>
    </main>
  );
}
