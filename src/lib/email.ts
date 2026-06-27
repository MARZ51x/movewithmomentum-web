import "server-only";
import type { MatchReport } from "./store";
import { PRIORITY_LABELS } from "./communities";

/**
 * Email seam for the "Match Me" report. Runs in dev with NO provider — it logs a
 * preview to the server console and reports success. To send for real, set
 * RESEND_API_KEY (and EMAIL_FROM) and fill in the fetch call below.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM ?? "Move With Momentum <hello@movewithmomentum.app>";

export interface EmailResult {
  ok: boolean;
  delivered: "resend" | "console";
}

export async function sendMatchReport(report: MatchReport): Promise<EmailResult> {
  const subject = `${report.name}, your top 5 community matches`;
  const text = renderText(report);

  if (!RESEND_API_KEY) {
    // Dev / no-key mode: log a preview instead of sending.
    console.info(
      `\n[Match Me] (no RESEND_API_KEY — preview only)\nTo: ${report.email}\nSubject: ${subject}\n\n${text}\n`,
    );
    return { ok: true, delivered: "console" };
  }

  // Live mode (uncomment once you've verified a sending domain in Resend):
  //
  // const res = await fetch("https://api.resend.com/emails", {
  //   method: "POST",
  //   headers: {
  //     Authorization: `Bearer ${RESEND_API_KEY}`,
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     from: EMAIL_FROM,
  //     to: report.email,
  //     subject,
  //     html: renderHtml(report),
  //     text,
  //   }),
  // });
  // return { ok: res.ok, delivered: "resend" };

  console.info(`[Match Me] would send via Resend from ${EMAIL_FROM} to ${report.email}`);
  return { ok: true, delivered: "resend" };
}

function renderText(report: MatchReport): string {
  const prefs = report.input.priorities
    .map((p) => PRIORITY_LABELS[p])
    .join(", ");
  const lines = report.results.map(
    (r, i) =>
      `${i + 1}. ${r.community.name} — ${r.score}% match (${r.community.region})\n   ${r.reasons.join(" · ")}`,
  );
  return [
    `Hi ${report.name},`,
    ``,
    `Based on what you told us (${prefs || "your overall preferences"}), here are your top matches:`,
    ``,
    ...lines,
    ``,
    `A licensed agent can walk you through any of these — just reply to this email.`,
    `— Move With Momentum`,
  ].join("\n");
}
