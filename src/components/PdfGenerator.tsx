"use client";

import { useState } from "react";

export function PdfGenerator({
  communities,
}: {
  communities: { id: string; name: string; region: string }[];
}) {
  const [id, setId] = useState(communities[0]?.id ?? "");
  const [busy, setBusy] = useState(false);

  function generate() {
    if (!id) return;
    setBusy(true);
    // Opens the server-rendered PDF in a new tab.
    window.open(`/app/toolkit/pdf?community=${encodeURIComponent(id)}`, "_blank");
    // Brief visual feedback; the request is fire-and-forget to the new tab.
    setTimeout(() => setBusy(false), 1200);
  }

  return (
    <div className="glass-shelf rounded-xl p-6 sm:p-8 max-w-2xl">
      <div className="flex items-start justify-between gap-4 mb-1">
        <h2 className="font-display text-2xl font-bold">
          2-Page Neighborhood <span className="display-em">Summary PDF</span>
        </h2>
        <span className="shrink-0 text-[10px] font-bold tracking-wider uppercase text-secondary border border-secondary/40 rounded-full px-2 py-1">
          Premium
        </span>
      </div>
      <p className="text-on-surface-variant text-sm mb-6">
        Instantly generate a designer-grade, fair-housing-compliant brochure with
        live market data, neighborhood scores, and your contact details.
      </p>

      <label className="block text-xs font-bold tracking-wider uppercase text-on-surface-variant mb-2">
        Select target neighborhood
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="flex-1 rounded-md bg-surface-high border border-outline-variant px-4 py-3 text-on-surface focus:border-primary focus:outline-none"
        >
          {communities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} — {c.region}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={generate}
          disabled={busy}
          className="rounded-md bg-secondary px-6 py-3 font-semibold text-on-secondary glow-gold hover:brightness-110 transition disabled:opacity-60 whitespace-nowrap"
        >
          {busy ? "Generating…" : "Generate PDF Summary →"}
        </button>
      </div>
      <p className="text-xs text-muted mt-3">
        Opens a ready-to-share PDF in a new tab. Page 1: overview & market. Page 2:
        scorecard, highlights & your agent profile.
      </p>
    </div>
  );
}
