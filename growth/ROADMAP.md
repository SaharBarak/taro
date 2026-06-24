# Taruu — Roadmap (How We Continue)

_Owner: 2 founders. Updated 2026-06-24. Companion docs: [`FINANCIAL-MODEL.md`](./FINANCIAL-MODEL.md) · agent specs in [`agents/`](./agents) · live console [`dashboard.html`](./dashboard.html)._

## Where we are

The product is **built and code-reviewed** (11 UX journeys shipped, brutalist tech-press, Cloudflare Workers deploy scaffolded). What's missing is **(a) it's not live with real creds, (b) zero distribution, (c) the payment unit-economics are broken at the ₪3 tier.** See `HANDOVER.md` for the build state.

The whole company reduces to one number: **paid vote-creations per month.** Target = **~600/mo** (with ~50 active ambassadors and ~50 paid voters each) → **₪33.8k/mo take-home**, inside our ₪30–45k goal. Everything below serves that number.

## North-star metric & guardrails

- **North star:** paid creates/mo (driver of the P&L, 69× richer than a participation).
- **Leading indicators:** active ambassadors · ambassador→creator conversion · paid voters per vote · wallet top-up rate.
- **Health guardrail:** treasury always receives its ₪2.10/vote (the civic promise). The wallet fix only changes who eats Paddle's fee, never the treasury.

---

## Phase 0 — Don't bleed (Week 1–2) · BLOCKS EVERYTHING

| # | Item | Why |
|---|---|---|
| 0.1 | **Credit wallet** (top-up packs ₪30/₪60/₪150, vote draws from balance) | ₪3 single-charge **loses ₪1.10/vote**. Until this ships, more voting = more loss. **P0.** |
| 0.2 | Go live: Cloudflare deploy + real creds (Supabase/Paddle/Green Invoice), Paddle create price = **₪50**, `GREENINVOICE_WEBHOOK_SECRET`, SMS OTP gateway | Can't earn ₪0 while in mock mode. (`HANDOVER.md` deploy seq.) |
| 0.3 | **Backend e2e flow check** — one real ₪50 create + one real wallet top-up + one participation, end to end, money landing, treasury ledger correct, webhook idempotent | Prove the rails before we drive traffic. |
| 0.4 | **Security pre-launch pass** — close deferred MED findings: Google OAuth **state+PKCE**, `merch_orders` **RLS**, webhook-secret→header, OTP attempt-reset, send-code rate-limit | Civic + payments + PII. Non-negotiable before outreach. (`SECURITY-AUDIT.md`) |

**Exit:** a real human can top up, create a ₪50 vote, others can vote, money + treasury reconcile, no open HIGH/MED security findings.

## Phase 1 — Seed distribution: the ambassador engine (Week 2–6)

The growth thesis (adapted from the Postiz playbook → civic): **one-to-many, give-before-you-take, ride local outrage.** We don't grind an audience — we find people *already* angry/active on local municipal Facebook groups and hand them a tool + a funded first vote.

| # | Item |
|---|---|
| 1.1 | **Listening agent** (human-in-the-loop) — watches PUBLIC municipal/community FB pages, surfaces top topics/complaints + most-active citizens. → [`agents/listening-agent.md`](./agents/listening-agent.md) |
| 1.2 | **Outreach agent** (human-in-the-loop) — drafts personal DMs/comments inviting top citizens to be ambassadors; **we fund their first ₪50 vote.** Founder approves & sends every message. → [`agents/outreach-agent.md`](./agents/outreach-agent.md) |
| 1.3 | **Ambassador kit** — a 1-pager + pre-filled vote template so a "yes" converts to a live vote in <10 min. |
| 1.4 | **Ambassador pipeline board** (in `dashboard.html`, later Supabase-backed): Spotted → Contacted → Onboarding → Active. |

**Target by end of phase:** 8–15 active ambassadors, first real treasury-funded decisions executed (proof + story material).

**Compliance (locked: human-in-the-loop):** public data only; no scraping at scale; **no automated mass-DM** — Israeli anti-spam (תיקון 40) is up to **₪1,000 statutory damages per unsolicited commercial message**, and Meta bans automation. Agents *draft*; a human reads and sends. Guardrails live in each agent spec.

## Phase 2 — Marketing machine (Week 4–10, overlaps)

| # | Item |
|---|---|
| 2.1 | **Marketing agent** on the **Postiz playbook** — trend-jack local civic news, "sell the outcome not the tool", one-to-many posts (Reddit r/israel + local FB groups + X + TikTok interest algos), GitHub-style flywheel adapted to civic wins. → [`agents/marketing-agent.md`](./agents/marketing-agent.md) |
| 2.2 | **Homepage copy rewrite** — current copy is placeholder-grade. Rewrite for the create-led funnel: hero = "start a binding vote in your city for ₪50", proof = real executed decisions, CTA = founders' group + create. Brutalist tech-press voice, Hebrew, RTL. |
| 2.3 | **Content pipeline** — turn each executed civic decision into a post/video ("how a ₪50 vote fixed X in city Y"). Outcome stories, not product demos. |
| 2.4 | **AEO/LLM-search** — structure pages so ChatGPT/Claude/Perplexity surface Taruu when asked "how do residents change municipal decisions in Israel". (We have an `ai-seo` skill.) |

## Phase 3 — Compound (Month 3+)

- Ambassador→creator flywheel: every engaged voter nudged to create their own ₪50 vote.
- Paid ads **only after** brand + known LTV (playbook rule). Cheap long-tail Hebrew civic keywords.
- Reliability = retention: Sentry, never show "unknown error", AI support.
- City-by-city expansion; treasury transparency as a trust/marketing asset.

---

## Cross-cutting ops tasks (always-on)

| Task | Cadence | Owner |
|---|---|---|
| Homepage + funnel copywrite | once now, iterate | founder A |
| Backend / flow e2e check | before each release | founder B |
| Security review | pre-launch + monthly | founder B + `octo:security` |
| Agent run review (listening/outreach/marketing) | daily, 15 min, in `dashboard.html` | both |
| Financial reconciliation (treasury ↔ Paddle ↔ ledger) | weekly | founder A |

## 90-day plan (one line each)

- **Weeks 1–2:** wallet + go-live + e2e + security → stop bleeding, be real.
- **Weeks 2–6:** listening + outreach agents → 8–15 ambassadors, first executed votes.
- **Weeks 4–10:** marketing agent + homepage rewrite → first outcome stories drive inbound creates.
- **Month 3:** push ambassador→creator conversion; measure against the 600-creates/mo target; decide if/where to add paid ads.

## Risk register

| Risk | Mitigation |
|---|---|
| Wallet not shipped → losses scale with usage | P0; gate all traffic behind it |
| Anti-spam / Meta ToS exposure | human-in-the-loop, public data, personal messages, per-spec kill-switches |
| Creates don't materialize (participation-only) | product nudges every voter → creator; track cohort; price/》why-create messaging |
| Treasury trust (handling civic money) | full ledger transparency, reconciliation, never touch the 70% |
| Founder bandwidth (2 people) | agents draft, humans approve; ruthless WIP limits; dashboard as single pane |
