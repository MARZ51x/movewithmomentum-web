import {
  COMMUNITIES,
  PRIORITY_REASON,
  type Community,
  type PriorityKey,
  type Setting,
} from "./communities";

export type Household = "family" | "couple" | "single" | "retiree";

export interface MatchInput {
  budget: number; // max comfortable median home price
  setting: Setting | "any";
  household: Household;
  priorities: PriorityKey[];
}

export interface ScoredCommunity {
  community: Community;
  score: number; // 0–100 overall match
  reasons: string[];
}

const ALL_KEYS: PriorityKey[] = [
  "schools",
  "walkability",
  "nightlife",
  "nature",
  "safety",
  "commute",
  "dining",
  "affordability",
];

// Implicit priorities by household, layered on top of what the user selects.
const HOUSEHOLD_WEIGHTS: Record<Household, Partial<Record<PriorityKey, number>>> =
  {
    family: { schools: 2, safety: 2, nature: 1.5, commute: 1 },
    couple: { walkability: 1.5, dining: 1.5, nightlife: 1, commute: 1 },
    single: { nightlife: 2, walkability: 1.5, dining: 1.5, commute: 1 },
    retiree: { safety: 2, nature: 1.5, dining: 1, walkability: 1 },
  };

const SELECTED_WEIGHT = 3; // weight added when the user explicitly picks a priority
const BUDGET_WEIGHT = 2.5;
const SETTING_WEIGHT = 1.5;

function weightFor(key: PriorityKey, input: MatchInput): number {
  const base = 1;
  const household = HOUSEHOLD_WEIGHTS[input.household][key] ?? 0;
  const selected = input.priorities.includes(key) ? SELECTED_WEIGHT : 0;
  return base + household + selected;
}

/** 100 if within budget, decaying as the median price exceeds it. */
function budgetScore(community: Community, budget: number): number {
  if (budget <= 0) return 60;
  if (community.medianPrice <= budget) return 100;
  const over = (community.medianPrice - budget) / budget; // fraction over
  return Math.max(0, Math.round(100 - over * 220));
}

function settingScore(community: Community, pref: MatchInput["setting"]): number {
  if (pref === "any") return 100;
  return community.setting === pref ? 100 : 55;
}

function scoreCommunity(
  community: Community,
  input: MatchInput,
): ScoredCommunity {
  let num = 0;
  let den = 0;

  for (const key of ALL_KEYS) {
    const w = weightFor(key, input);
    num += w * community.scores[key];
    den += w;
  }

  const bScore = budgetScore(community, input.budget);
  num += BUDGET_WEIGHT * bScore;
  den += BUDGET_WEIGHT;

  const sScore = settingScore(community, input.setting);
  num += SETTING_WEIGHT * sScore;
  den += SETTING_WEIGHT;

  const score = Math.round(num / den);

  return { community, score, reasons: buildReasons(community, input, bScore, sScore) };
}

function buildReasons(
  community: Community,
  input: MatchInput,
  bScore: number,
  sScore: number,
): string[] {
  const reasons: { text: string; weight: number }[] = [];

  // Prefer the priorities the user explicitly chose, where the community is strong.
  for (const key of input.priorities) {
    const v = community.scores[key];
    if (v >= 72) reasons.push({ text: `${PRIORITY_REASON[key]} (${v})`, weight: v + 100 });
  }
  // Then any standout dimension even if not selected.
  for (const key of ALL_KEYS) {
    if (input.priorities.includes(key)) continue;
    const v = community.scores[key];
    if (v >= 88) reasons.push({ text: `${PRIORITY_REASON[key]} (${v})`, weight: v });
  }

  if (bScore >= 100) reasons.push({ text: "Comfortably within your budget", weight: 95 });
  else if (bScore >= 75) reasons.push({ text: "Fits your budget", weight: 70 });

  if (input.setting !== "any" && sScore === 100)
    reasons.push({ text: `${capitalize(community.setting)} setting you wanted`, weight: 80 });

  reasons.sort((a, b) => b.weight - a.weight);
  const top = reasons.slice(0, 3).map((r) => r.text);
  return top.length ? top : ["Well-rounded match across your criteria"];
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Rank the catalog against the input and return the top N (default 5). */
export function matchCommunities(
  input: MatchInput,
  n = 5,
): ScoredCommunity[] {
  return COMMUNITIES.map((c) => scoreCommunity(c, input))
    .sort((a, b) => b.score - a.score || b.community.scores.safety - a.community.scores.safety)
    .slice(0, n);
}
