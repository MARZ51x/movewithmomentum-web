import { ComingSoon } from "@/components/ComingSoon";

export default function InsightsPage() {
  return (
    <ComingSoon
      title="Neighborhood"
      emphasis="Insights"
      blurb="Hyper-local intelligence on zoning, expansion, demographics, and community sentiment — the data layer that powers the gated experience."
      features={[
        "Demographics & lifestyle breakdown",
        "Market sentiment (bullish / bearish)",
        "Zoning & expansion map overlays",
        "Permit approvals & active projects",
        "Walkability & transit scores",
        "Full census data deep-dive",
      ]}
    />
  );
}
