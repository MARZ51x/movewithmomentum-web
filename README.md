# Move With Momentum — Neighborhood Hub (web)

An exclusive, gated community + real-estate-intelligence app for a real estate
client. This is the **Next.js web app** (the first surface; an Expo/React Native
mobile app shares the same Supabase backend later).

Design system: **Azure Onyx** — editorial glassmorphism, deep dark surfaces,
ocean-teal primary, warm-gold prestige accent (from the Stitch `DESIGN.md`
handoff).

## What's built today

The first vertical slice is **complete and runnable with zero credentials**:

- **Public landing** (`/`) — "The most comprehensive housing database. Free."
- **Role-based onboarding** (`/register`) — pick **Buyer/Seller**, **Realtor**,
  or **Researcher/News**. Realtors get a "Claim Your Profile" panel (license # +
  business phone). Captcha placeholder + primary-residence address search.
- **Login** (`/login`) — mock auth (any seeded email, no password needed).
- **Gated hub** (`/app`, auth-gated) with the **Community Collab feed**:
  - FB-style posts + inline comments, live comment counts.
  - Category filter chips (All / Market Updates / Resident Voice / Local Events /
    Agent Insight).
  - Verified-agent ★ gold badges; "Agent Insight" posts are gold-ringed and
    flagged fair-housing reviewed.
- **Match Me** (`/match`, public lead-gen) — a questionnaire (budget, household,
  setting, priorities) → a scored **Top 5 communities** report with reasons →
  the results are "emailed" (logged in dev; Resend-ready) and saved as a lead.
- **Roadmap placeholders**: Neighborhood Insights (`/app/insights`) and the
  agent-only **Command Center** (`/app/toolkit`) — 2-page PDF export, ratings,
  moderation queue.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts: `npm run build`, `npm run start`, `npm run lint`,
`npx tsc --noEmit`.

### Try the flow
1. `/register` → choose **Realtor** → fill license/phone → check captcha →
   **Initialize Account** → lands you in the gated feed as a verified agent.
2. Post something, expand a post, add a comment.
3. Or sign in with a seeded account at `/login`:
   `marcus@globalluxury.com` (agent) · `sarah@skylineoaks.org` (resident).

## Architecture

```
src/
  app/
    page.tsx                 # public landing
    register/ login/         # onboarding (client forms + server actions)
    actions/auth.ts          # register / login / logout (Zod-validated)
    app/                     # gated subtree (layout enforces auth)
      page.tsx               # Community Collab feed
      actions.ts             # createPost / addComment (Zod-validated)
      insights/ toolkit/     # roadmap placeholders
    match/                   # Match Me: questionnaire + server action
      results/[id]/          # scored Top 5 report
  components/                # Brand, Avatar, Badges, HubNav, Composer, PostCard, CommunityTile…
  lib/
    types.ts                 # domain types — mirror the future DB tables
    store.ts                 # in-memory seed store (the Supabase swap-in seam)
    session.ts               # cookie session (→ Supabase Auth later)
    supabase.ts              # client factory; no-ops until keys are set
    communities.ts           # community catalog (→ `communities` table)
    match.ts                 # pure scoring engine (top-5 + reasons)
    email.ts                 # Match Me email seam (Resend-ready; logs in dev)
    format.ts                # deterministic date / initials helpers
```

### The data layer is built to swap to Supabase

Everything reads/writes through `lib/store.ts` and `lib/session.ts`. The types in
`lib/types.ts` already match the intended `profiles` / `posts` / `comments`
tables. To go live (per the team's full-stack conventions):

1. Create the Supabase project; put the URL + **publishable** key in `.env.local`
   (see `.env.example`). The secret key stays server-only — never `NEXT_PUBLIC_`.
2. Create `profiles`, `posts`, `comments` (columns = `types.ts`) and **enable RLS
   with explicit policies** on each (index every column a policy references).
3. Regenerate DB types, then replace the function bodies in `store.ts`/`session.ts`
   with Supabase queries (the server-client snippet is in `supabase.ts`).

## Not yet built (next slices)

- Real Supabase auth/DB + RLS, and email notifications on new comments.
- Match Me: real email delivery (set `RESEND_API_KEY`), and a saved-results /
  lead dashboard for agents (submissions are already stored).
- Agent **2-page PDF export** and the fair-housing **moderation queue**.
- **Neighborhood Insights** data (demographics, sentiment, zoning).
- Expo / React Native mobile app on the same backend.

## Notes

- Mock data lives in memory and resets when the dev server restarts.
- Stack: Next.js 16 (App Router) · React 19 · Tailwind v4 · Zod · (Supabase ready).
