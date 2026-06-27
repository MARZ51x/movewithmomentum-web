import { redirect } from "next/navigation";
import { ComingSoon } from "@/components/ComingSoon";
import { getCurrentUser } from "@/lib/session";

export default async function ToolkitPage() {
  // Agent-only surface.
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "agent") redirect("/app");

  return (
    <ComingSoon
      title="Agent"
      emphasis="Command Center"
      blurb="The toolkit verified agents asked for: generate a polished 2-page neighborhood PDF, submit ratings and community info, and manage fair-housing moderation — all in one place."
      features={[
        "2-page Neighborhood Summary PDF export",
        "Submit community ratings & detailed commentary",
        "Fair-housing moderation queue",
        "'Match Me' lead reports (top 5 communities)",
        "CRM sync & lead pipeline",
        "Compliance / license verification",
      ]}
    />
  );
}
