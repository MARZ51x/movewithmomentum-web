import { redirect } from "next/navigation";
import { PdfGenerator } from "@/components/PdfGenerator";
import { COMMUNITIES } from "@/lib/communities";
import { getCurrentUser } from "@/lib/session";

const ROADMAP = [
  "Submit community ratings & detailed commentary",
  "Fair-housing moderation queue",
  "'Match Me' lead reports (top 5 communities)",
  "CRM sync & lead pipeline",
  "Compliance / license verification",
];

export default async function ToolkitPage() {
  // Agent-only surface.
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "agent") redirect("/app");

  const communities = COMMUNITIES.map((c) => ({
    id: c.id,
    name: c.name,
    region: c.region,
  }));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary mb-2">
          Agent Command Center
        </p>
        <h1 className="font-display text-4xl font-bold">
          Your <span className="display-em">toolkit</span>
        </h1>
        <p className="text-on-surface-variant mt-1">
          Generate marketing-ready collateral and manage your community presence.
        </p>
      </div>

      <PdfGenerator communities={communities} />

      <div>
        <p className="text-xs font-bold tracking-[0.15em] uppercase text-secondary mb-3">
          Coming next
        </p>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ROADMAP.map((f) => (
            <li
              key={f}
              className="rounded-lg border border-white/5 bg-white/[0.03] px-4 py-3 text-sm text-on-surface-variant"
            >
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
