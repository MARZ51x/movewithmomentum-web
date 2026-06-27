import {
  PRIORITY_LABELS,
  type Community,
  type PriorityKey,
} from "./communities";

/**
 * Derives the figures shown on the agent PDF brochure. All values are computed
 * deterministically from the community record so the same neighborhood always
 * produces the same brochure. In production the market block comes from a live
 * MLS/market-data feed; the shape stays the same.
 */

export interface BrochureMarket {
  medianPrice: number;
  pricePerSqft: number;
  daysOnMarket: number;
  yoyTrendPct: number;
  inventoryMonths: number;
  medianRent: number;
}

export interface PreparedBy {
  name: string;
  license: string | null;
  phone: string | null;
  email: string;
}

export interface BrochureData {
  community: Community;
  preparedBy: PreparedBy;
  generatedOn: string;
  market: BrochureMarket;
  /** top dimensions, for the "highlights" strip */
  highlights: { label: string; score: number }[];
  /** all dimensions, for the at-a-glance bar list */
  scoreRows: { key: PriorityKey; label: string; score: number }[];
  /** prose bullets for "Why buyers love it" */
  buyerNotes: string[];
}

const SQFT_BY_SETTING: Record<Community["setting"], number> = {
  urban: 1450,
  suburban: 2150,
  rural: 2600,
};

const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));
const round1 = (n: number) => Math.round(n * 10) / 10;

function deriveMarket(c: Community): BrochureMarket {
  const s = c.scores;
  const desirability = (s.schools + s.safety + s.walkability + s.dining) / 4;

  return {
    medianPrice: c.medianPrice,
    pricePerSqft: Math.round(c.medianPrice / SQFT_BY_SETTING[c.setting]),
    daysOnMarket: clamp(Math.round(46 - (s.walkability + s.dining) / 18), 6, 60),
    yoyTrendPct: round1((desirability - 55) / 5),
    inventoryMonths: round1(clamp(1 + (100 - s.affordability) / 28, 0.8, 5)),
    medianRent: Math.round((c.medianPrice * 0.0042) / 50) * 50,
  };
}

const ALL_KEYS: PriorityKey[] = [
  "schools",
  "safety",
  "walkability",
  "nature",
  "dining",
  "commute",
  "nightlife",
  "affordability",
];

export function buildBrochureData(
  community: Community,
  preparedBy: PreparedBy,
  generatedOn: string,
): BrochureData {
  const scoreRows = ALL_KEYS.map((key) => ({
    key,
    label: PRIORITY_LABELS[key],
    score: community.scores[key],
  }));

  const highlights = [...scoreRows]
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((r) => ({ label: r.label, score: r.score }));

  const buyerNotes = [...scoreRows]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((r) => buyerNoteFor(r.key, r.score));

  return {
    community,
    preparedBy,
    generatedOn,
    market: deriveMarket(community),
    highlights,
    scoreRows,
    buyerNotes,
  };
}

function buyerNoteFor(key: PriorityKey, score: number): string {
  const notes: Record<PriorityKey, string> = {
    schools: `Highly rated public and private schools (${score}/100) make this a long-term family choice.`,
    safety: `Among the safest neighborhoods in the metro, with a ${score}/100 safety index.`,
    walkability: `Errands, cafés and transit are an easy walk (${score}/100 walk score).`,
    nature: `Parks, trails and green space are abundant (${score}/100), ideal for an active lifestyle.`,
    dining: `A standout dining and shopping scene (${score}/100) keeps weekends close to home.`,
    commute: `Quick access to employment centers (${score}/100 commute score).`,
    nightlife: `A lively after-hours scene (${score}/100) for residents who want energy nearby.`,
    affordability: `Strong relative value for the area (${score}/100 affordability).`,
  };
  return notes[key];
}
