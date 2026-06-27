/**
 * Community catalog used by the "Match Me" engine. In production this comes from
 * the `communities` Supabase table (agents submit ratings & info that feed these
 * scores). Each dimension is 0–100; higher is better, including `affordability`
 * (higher = more affordable).
 */

export type PriorityKey =
  | "schools"
  | "walkability"
  | "nightlife"
  | "nature"
  | "safety"
  | "commute"
  | "dining"
  | "affordability";

export type Setting = "urban" | "suburban" | "rural";

export interface Community {
  id: string;
  name: string;
  region: string;
  blurb: string;
  medianPrice: number;
  setting: Setting;
  /** visual: hue for the generated gradient tile */
  hue: number;
  scores: Record<PriorityKey, number>;
  tags: string[];
}

export const PRIORITY_LABELS: Record<PriorityKey, string> = {
  schools: "Great schools",
  walkability: "Walkability",
  nightlife: "Nightlife & energy",
  nature: "Parks & nature",
  safety: "Safety",
  commute: "Short commute",
  dining: "Dining & shopping",
  affordability: "Affordability",
};

/** Phrases used when explaining a match. */
export const PRIORITY_REASON: Record<PriorityKey, string> = {
  schools: "Top-rated schools",
  walkability: "Very walkable",
  nightlife: "Lively nightlife",
  nature: "Abundant parks & green space",
  safety: "Excellent safety record",
  commute: "Quick commute downtown",
  dining: "Great dining & shopping",
  affordability: "Strong value for the area",
};

export const COMMUNITIES: Community[] = [
  {
    id: "skyline-oaks",
    name: "Skyline Oaks",
    region: "North Metro",
    blurb:
      "Leafy, established streets with award-winning schools and a tight-knit civic scene.",
    medianPrice: 545000,
    setting: "suburban",
    hue: 190,
    scores: {
      schools: 94,
      walkability: 58,
      nightlife: 35,
      nature: 80,
      safety: 90,
      commute: 62,
      dining: 60,
      affordability: 55,
    },
    tags: ["Family-friendly", "Top schools", "Quiet"],
  },
  {
    id: "harbor-row",
    name: "Harbor Row",
    region: "Downtown Waterfront",
    blurb:
      "High-rise living on the water — restaurants, galleries and nightlife at your door.",
    medianPrice: 720000,
    setting: "urban",
    hue: 265,
    scores: {
      schools: 55,
      walkability: 95,
      nightlife: 92,
      nature: 45,
      safety: 68,
      commute: 90,
      dining: 93,
      affordability: 30,
    },
    tags: ["Walkable", "Nightlife", "Waterfront"],
  },
  {
    id: "cedar-glen",
    name: "Cedar Glen",
    region: "West Hills",
    blurb:
      "Rolling hills and large lots for buyers who want space, trails and privacy.",
    medianPrice: 480000,
    setting: "rural",
    hue: 130,
    scores: {
      schools: 78,
      walkability: 28,
      nightlife: 18,
      nature: 96,
      safety: 92,
      commute: 35,
      dining: 40,
      affordability: 68,
    },
    tags: ["Nature", "Spacious", "Peaceful"],
  },
  {
    id: "maple-commons",
    name: "Maple Commons",
    region: "Midtown",
    blurb:
      "A walkable urban-village feel with indie cafés, parks and a young professional crowd.",
    medianPrice: 410000,
    setting: "urban",
    hue: 30,
    scores: {
      schools: 66,
      walkability: 88,
      nightlife: 74,
      nature: 60,
      safety: 72,
      commute: 84,
      dining: 82,
      affordability: 64,
    },
    tags: ["Walkable", "Trendy", "Value"],
  },
  {
    id: "brookfield",
    name: "Brookfield Estates",
    region: "South County",
    blurb:
      "Classic master-planned suburbia with pools, greenways and excellent elementary schools.",
    medianPrice: 395000,
    setting: "suburban",
    hue: 210,
    scores: {
      schools: 88,
      walkability: 50,
      nightlife: 30,
      nature: 74,
      safety: 88,
      commute: 55,
      dining: 52,
      affordability: 76,
    },
    tags: ["Family-friendly", "Value", "Safe"],
  },
  {
    id: "the-arts-district",
    name: "The Arts District",
    region: "Central City",
    blurb:
      "Converted lofts, murals and a buzzing food-and-music calendar in the heart of the city.",
    medianPrice: 615000,
    setting: "urban",
    hue: 320,
    scores: {
      schools: 48,
      walkability: 93,
      nightlife: 96,
      nature: 38,
      safety: 60,
      commute: 88,
      dining: 95,
      affordability: 40,
    },
    tags: ["Nightlife", "Creative", "Walkable"],
  },
  {
    id: "willow-creek",
    name: "Willow Creek",
    region: "Lakeside",
    blurb:
      "Family lake town with boat docks, trails and a relaxed weekend pace.",
    medianPrice: 460000,
    setting: "suburban",
    hue: 165,
    scores: {
      schools: 82,
      walkability: 46,
      nightlife: 28,
      nature: 90,
      safety: 86,
      commute: 48,
      dining: 50,
      affordability: 70,
    },
    tags: ["Nature", "Family-friendly", "Lakeside"],
  },
  {
    id: "old-town",
    name: "Old Town Square",
    region: "Historic District",
    blurb:
      "Walkable historic streets, boutique shops and farmers markets with real character.",
    medianPrice: 525000,
    setting: "urban",
    hue: 45,
    scores: {
      schools: 70,
      walkability: 90,
      nightlife: 66,
      nature: 55,
      safety: 76,
      commute: 80,
      dining: 84,
      affordability: 52,
    },
    tags: ["Historic", "Walkable", "Charm"],
  },
  {
    id: "sunset-ridge",
    name: "Sunset Ridge",
    region: "Foothills",
    blurb:
      "Quiet, safe and affordable foothill living popular with retirees and remote workers.",
    medianPrice: 340000,
    setting: "rural",
    hue: 18,
    scores: {
      schools: 64,
      walkability: 32,
      nightlife: 14,
      nature: 88,
      safety: 94,
      commute: 30,
      dining: 38,
      affordability: 90,
    },
    tags: ["Affordable", "Peaceful", "Safe"],
  },
  {
    id: "the-grove",
    name: "The Grove",
    region: "East Side",
    blurb:
      "Up-and-coming, leafy and central — strong schools with growing dining and transit.",
    medianPrice: 575000,
    setting: "suburban",
    hue: 95,
    scores: {
      schools: 90,
      walkability: 70,
      nightlife: 52,
      nature: 72,
      safety: 84,
      commute: 74,
      dining: 70,
      affordability: 50,
    },
    tags: ["Top schools", "Balanced", "Growing"],
  },
];

export function getCommunity(id: string): Community | undefined {
  return COMMUNITIES.find((c) => c.id === id);
}
