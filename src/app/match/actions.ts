"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { matchCommunities } from "@/lib/match";
import { createMatchReport, markReportEmailed } from "@/lib/store";
import { sendMatchReport } from "@/lib/email";

export interface MatchState {
  error?: string;
}

const PRIORITY_KEYS = [
  "schools",
  "walkability",
  "nightlife",
  "nature",
  "safety",
  "commute",
  "dining",
  "affordability",
] as const;

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  budget: z.coerce
    .number()
    .int()
    .positive("Choose a budget."),
  setting: z.enum(["any", "urban", "suburban", "rural"]),
  household: z.enum(["family", "couple", "single", "retiree"]),
  priorities: z.array(z.enum(PRIORITY_KEYS)).max(4, "Pick up to 4 priorities."),
});

export async function matchAction(
  _prev: MatchState,
  formData: FormData,
): Promise<MatchState> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    budget: formData.get("budget"),
    setting: formData.get("setting"),
    household: formData.get("household"),
    priorities: formData.getAll("priorities").map(String),
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please complete the form." };
  }

  const { name, email, budget, setting, household, priorities } = parsed.data;

  const results = matchCommunities(
    { budget, setting, household, priorities },
    5,
  );

  const report = createMatchReport({
    name,
    email,
    matchInput: { budget, setting, household, priorities },
    results,
  });

  const emailRes = await sendMatchReport(report);
  if (emailRes.ok) markReportEmailed(report.id);

  redirect(`/match/results/${report.id}`);
}
