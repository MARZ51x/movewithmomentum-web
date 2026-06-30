import Link from "next/link";
import { notFound } from "next/navigation";
import { Brand } from "@/components/Brand";
import { CommunityTile } from "@/components/CommunityTile";
import { getMatchReport } from "@/lib/store";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function scoreColor(score: number): string {
  if (score >= 80) return "text-secondary";
  if (score >= 65) return "text-primary";
  return "text-on-surface-variant";
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getMatchReport(id);
  if (!report) notFound();

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-10">
      <header className="w-full max-w-3xl flex items-center justify-between mb-8">
        <Brand />
        <Link
          href="/match"
          className="text-sm text-on-surface-variant hover:text-primary transition"
        >
          ↺ Start over
        </Link>
      </header>

      <div className="w-full max-w-3xl">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary mb-3">
          Your matches
        </p>
        <h1 className="font-display text-4xl font-bold mb-2">
          {report.name}, here are your{" "}
          <span className="display-em">top 5 communities</span>
        </h1>
        <p className="text-on-surface-variant mb-2">
          Ranked against your budget, household and priorities.
        </p>
        {report.emailed && (
          <p className="inline-flex items-center gap-2 rounded-full bg-success/10 border border-success/30 text-success text-sm px-3 py-1.5 mb-8">
            ✓ We&apos;ve emailed this report to {report.email}
          </p>
        )}

        <ol className="space-y-4 mt-6">
          {report.results.map((r, i) => (
            <li
              key={r.community.id}
              className={`glass-shelf rounded-xl p-5 flex gap-4 ${
                i === 0 ? "ring-1 ring-secondary/30" : ""
              }`}
            >
              <div className="flex flex-col items-center gap-2 pt-1">
                <span className="font-display text-2xl font-bold text-muted w-6 text-center">
                  {i + 1}
                </span>
                <CommunityTile community={r.community} size={56} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-lg leading-tight">
                      {r.community.name}
                      {i === 0 && (
                        <span className="ml-2 text-xs font-bold text-secondary align-middle">
                          ★ BEST MATCH
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-muted">
                      {r.community.region} · {money.format(r.community.medianPrice)} median ·{" "}
                      {r.community.setting}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-display text-3xl font-bold ${scoreColor(r.score)}`}>
                      {r.score}%
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-muted">
                      match
                    </p>
                  </div>
                </div>

                <p className="text-sm text-on-surface-variant mt-2">
                  {r.community.blurb}
                </p>

                <ul className="flex flex-wrap gap-2 mt-3">
                  {r.reasons.map((reason) => (
                    <li
                      key={reason}
                      className="text-xs rounded-full bg-primary/10 text-primary border border-primary/25 px-2.5 py-1"
                    >
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>

        <div className="glass rounded-xl p-6 mt-8 text-center">
          <h3 className="font-display text-xl font-bold mb-1">
            Want a closer look?
          </h3>
          <p className="text-sm text-on-surface-variant mb-4">
            Create your hub to unlock neighborhood insights and connect with a
            verified local agent.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="rounded-md bg-secondary px-6 py-3 font-semibold text-on-secondary glow-gold hover:brightness-110 transition"
            >
              Create my hub →
            </Link>
            <Link
              href="/match"
              className="rounded-md border border-primary/60 px-6 py-3 font-semibold text-primary hover:bg-primary/10 transition"
            >
              Adjust my answers
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
