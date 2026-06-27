import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { BrochureData } from "@/lib/brochure";

/**
 * Two-page neighborhood brochure rendered with @react-pdf/renderer (server-side,
 * no headless browser). Print-optimized: light background, editorial serif
 * headers (Times) + clean sans body (Helvetica), with the brand gold/teal as
 * accents. Page 1 = overview + market; page 2 = scorecard + agent + compliance.
 */

const GOLD = "#9c7414";
const GOLD_SOFT = "#c8a544";
const TEAL = "#0e6c7a";
const INK = "#1b232f";
const MUTE = "#6b7480";
const LINE = "#e4e0d6";
const PANEL = "#f6f4ee";

/** community hue -> a deep hex for the hero band */
function hueToHex(h: number, s = 46, l = 26): string {
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

const money = (n: number) =>
  "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 56,
    paddingHorizontal: 44,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: INK,
    lineHeight: 1.5,
  },
  topbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: LINE,
    paddingBottom: 10,
    marginBottom: 18,
  },
  brand: { fontFamily: "Helvetica-Bold", fontSize: 11, letterSpacing: 2, color: INK },
  brandGold: { color: GOLD },
  overline: { fontSize: 8, letterSpacing: 2, color: MUTE, fontFamily: "Helvetica-Bold" },

  hero: { borderRadius: 8, padding: 22, marginBottom: 18 },
  heroLabel: { fontSize: 8, letterSpacing: 2, color: "#ffffff", opacity: 0.8, fontFamily: "Helvetica-Bold" },
  heroName: { fontFamily: "Times-Bold", fontSize: 28, color: "#ffffff", marginTop: 8, marginBottom: 6, lineHeight: 1.1 },
  heroSub: { fontSize: 10, color: "#ffffff", opacity: 0.9 },
  tagRow: { flexDirection: "row", marginTop: 12 },
  tag: {
    fontSize: 8,
    color: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: 999,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginRight: 6,
  },

  sectionTitle: {
    fontFamily: "Times-Bold",
    fontSize: 15,
    color: INK,
    marginBottom: 8,
  },
  sectionRule: { borderBottomWidth: 2, borderBottomColor: GOLD, width: 34, marginBottom: 10 },
  body: { color: "#39424f", marginBottom: 16 },

  statGrid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -5, marginBottom: 8 },
  statCard: {
    width: "33.33%",
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  statInner: {
    backgroundColor: PANEL,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: LINE,
    padding: 10,
  },
  statValue: { fontFamily: "Times-Bold", fontSize: 17, color: INK },
  statLabel: { fontSize: 8, color: MUTE, letterSpacing: 1, marginTop: 2, textTransform: "uppercase" },

  highlightRow: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -4 },
  highlight: {
    paddingHorizontal: 4,
    width: "50%",
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: TEAL, marginRight: 6 },

  scoreRow: { flexDirection: "row", alignItems: "center", marginBottom: 9 },
  scoreLabel: { width: 120, fontSize: 9, color: INK },
  barTrack: { flex: 1, height: 7, backgroundColor: "#ece8dd", borderRadius: 4 },
  barFill: { height: 7, borderRadius: 4, backgroundColor: TEAL },
  scoreNum: { width: 28, textAlign: "right", fontSize: 9, color: MUTE, fontFamily: "Helvetica-Bold" },

  note: { flexDirection: "row", marginBottom: 7 },
  noteDot: { color: GOLD, marginRight: 6, fontFamily: "Helvetica-Bold" },

  agentBox: {
    backgroundColor: INK,
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 16,
  },
  agentName: { fontFamily: "Times-Bold", fontSize: 14, color: "#ffffff" },
  agentMeta: { fontSize: 9, color: "#c7ccd4", marginTop: 3 },
  badge: {
    alignSelf: "flex-start",
    fontSize: 7,
    letterSpacing: 1,
    color: INK,
    backgroundColor: GOLD_SOFT,
    borderRadius: 999,
    paddingVertical: 2,
    paddingHorizontal: 7,
    fontFamily: "Helvetica-Bold",
  },

  disclaimer: {
    fontSize: 7.5,
    color: MUTE,
    lineHeight: 1.4,
    borderTopWidth: 1,
    borderTopColor: LINE,
    paddingTop: 10,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 44,
    right: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.5,
    color: MUTE,
    borderTopWidth: 1,
    borderTopColor: LINE,
    paddingTop: 8,
  },
});

function TopBar({ right }: { right: string }) {
  return (
    <View style={styles.topbar}>
      <Text style={styles.brand}>
        MOVE <Text style={styles.brandGold}>WITH</Text> MOMENTUM
      </Text>
      <Text style={styles.overline}>{right}</Text>
    </View>
  );
}

function Footer({ data, page }: { data: BrochureData; page: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text>{data.community.name} · Neighborhood Summary</Text>
      <Text>
        Prepared {data.generatedOn} · {page}
      </Text>
    </View>
  );
}

export function NeighborhoodBrochure({ data }: { data: BrochureData }) {
  const { community: c, market: m } = data;
  const heroColor = hueToHex(c.hue);

  const stats: { value: string; label: string }[] = [
    { value: money(m.medianPrice), label: "Median home price" },
    { value: `$${m.pricePerSqft}`, label: "Price / sq ft" },
    { value: `${m.daysOnMarket} days`, label: "Avg days on market" },
    { value: `${m.yoyTrendPct >= 0 ? "+" : ""}${m.yoyTrendPct}%`, label: "1-yr price trend" },
    { value: `${m.inventoryMonths} mo`, label: "Inventory supply" },
    { value: money(m.medianRent), label: "Median rent" },
  ];

  return (
    <Document
      title={`${c.name} — Neighborhood Summary`}
      author={data.preparedBy.name}
      subject="Neighborhood Summary"
    >
      {/* ---------- PAGE 1 ---------- */}
      <Page size="LETTER" style={styles.page}>
        <TopBar right="NEIGHBORHOOD SUMMARY" />

        <View style={[styles.hero, { backgroundColor: heroColor }]}>
          <Text style={styles.heroLabel}>{c.region.toUpperCase()}</Text>
          <Text style={styles.heroName}>{c.name}</Text>
          <Text style={styles.heroSub}>
            {c.setting.charAt(0).toUpperCase() + c.setting.slice(1)} community ·{" "}
            {money(c.medianPrice)} median
          </Text>
          <View style={styles.tagRow}>
            {c.tags.map((t) => (
              <Text key={t} style={styles.tag}>
                {t}
              </Text>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.sectionRule} />
        <Text style={styles.body}>{c.blurb}</Text>

        <Text style={styles.sectionTitle}>Market Snapshot</Text>
        <View style={styles.sectionRule} />
        <View style={styles.statGrid}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <View style={styles.statInner}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Highlights</Text>
        <View style={styles.sectionRule} />
        <View style={styles.highlightRow}>
          {data.highlights.map((h) => (
            <View key={h.label} style={styles.highlight}>
              <View style={styles.dot} />
              <Text>
                {h.label}{" "}
                <Text style={{ color: MUTE }}>({h.score}/100)</Text>
              </Text>
            </View>
          ))}
        </View>

        <Footer data={data} page="Page 1 of 2" />
      </Page>

      {/* ---------- PAGE 2 ---------- */}
      <Page size="LETTER" style={styles.page}>
        <TopBar right="LIFESTYLE & COMPLIANCE" />

        <Text style={styles.sectionTitle}>Neighborhood Scorecard</Text>
        <View style={styles.sectionRule} />
        <View style={{ marginBottom: 16 }}>
          {data.scoreRows.map((r) => (
            <View key={r.key} style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>{r.label}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${r.score}%` }]} />
              </View>
              <Text style={styles.scoreNum}>{r.score}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Why buyers love it</Text>
        <View style={styles.sectionRule} />
        <View style={{ marginBottom: 18 }}>
          {data.buyerNotes.map((n, i) => (
            <View key={i} style={styles.note}>
              <Text style={styles.noteDot}>›</Text>
              <Text style={{ flex: 1, color: "#39424f" }}>{n}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Prepared by</Text>
        <View style={styles.sectionRule} />
        <View style={styles.agentBox}>
          <View>
            <Text style={styles.agentName}>{data.preparedBy.name}</Text>
            <Text style={styles.agentMeta}>{data.preparedBy.email}</Text>
            {data.preparedBy.phone ? (
              <Text style={styles.agentMeta}>{data.preparedBy.phone}</Text>
            ) : null}
            {data.preparedBy.license ? (
              <Text style={styles.agentMeta}>License #{data.preparedBy.license}</Text>
            ) : null}
          </View>
          <Text style={styles.badge}>VERIFIED AGENT</Text>
        </View>

        <Text style={styles.disclaimer}>
          Fair Housing Notice: All information is provided in compliance with the
          Fair Housing Act. We do not steer or discriminate on the basis of race,
          color, religion, sex, disability, familial status, or national origin.
          Neighborhood scores and market figures are estimates for general
          informational purposes only, are not a guarantee of value or future
          performance, and should be independently verified. This material does
          not constitute legal, financial, or appraisal advice.{"\n"}
          {"\n"}© 2026 Move With Momentum. Generated {data.generatedOn}.
        </Text>

        <Footer data={data} page="Page 2 of 2" />
      </Page>
    </Document>
  );
}
