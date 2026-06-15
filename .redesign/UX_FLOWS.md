# Taruu — UX Flow Map & Breakdown Tracker

_Created 2026-06-15. Working doc for the UX breakdown session._

## Decisions log
- **2026-06-15 · J1 channels:** WhatsApp pilot group + email newsletter are **two separate channels**, both kept. Not competing — do not collapse.
- **2026-06-15 · J5 rebrand → BAGS:** "Issue Coin" is renamed **bags.fm memecoin** in all user-facing copy. Lexicon below. Tone = **bridge** (civic-trust spine; memecoin mechanics framed as the economic engine outsiders buy into to fund execution — like a stock; dignified, not hype). Code identifiers (IssueCoin type, API routes, CSS classes) stay unchanged — copy layer only.

### BAGS lexicon (canonical)
- **Section / nav label:** `BAGS` (Latin caps).
- **Per-vote object:** a `BAG` (Latin caps) — "ה-BAG של ההצבעה". (Hebrew "באג" = "bug" — never transliterate.)
- **Platform:** `bags.fm` (lowercase).
- **Concept one-liner:** "כל הצבעה מקבלת BAG משלה ב-bags.fm — מטבע ממים מבוסס בלוקצ׳יין, ממותג סביב הפלטפורמה, שמאפשר לאנשים מבחוץ להשקיע בתנועה הכלכלית של ההצבעה — בדיוק כמו במניה — ולתמוך בביצוע ההחלטה של הרוב. ככל שה-BAG גדל, לנושא יש יותר משאבים אמיתיים מאחוריו."
- **Replace:** Issue Coin / מטבע קהילה / מטבעות הקהילה / ISSUE COIN / מטבע הקהילה → BAG/BAGS framing.
- **New FAQ — "למה bags.fm?"** (economics page): independent money rails that can't be shut down. The money, votes, and fund run on a public blockchain — not one company's server anyone can pressure or switch off. Every BAG is transparent and auditable; the structure fits civic economics, community money control, and transparency toward authorities + taxation — with no single gatekeeper able to close the tap.

## How to use this
Whole-site map first, then we dissect **one journey at a time, methodically**. Each
journey carries a 5-phase checklist:

- `[ ] MAP` — steps + surfaces + backend laid out and agreed
- `[ ] FRICTION` — drop-off points / anxieties / dead-ends named
- `[ ] UX` — decisions made (what changes, what's added/cut)
- `[ ] UI` — press visual pass on the decided flow
- `[ ] COPY` — Hebrew microcopy + headlines finalised

Don't touch UI or COPY for a journey until MAP→FRICTION→UX are checked. Update the
boxes as we go so we never lose the thread across sessions.

Status legend: ✅ built · 🟡 partial / thin · 🟧 backend exists, UX undefined · ⬜ not built.

---

## Site map (IA)

**Shell (site-wide):** Masthead (nav + WhatsApp CTA) · Ticker · Colophon (footer + newsletter).
Nav today: הצבעות · מטבעות הקהילה · כלכלה אזרחית · שקיפות הקרן · חנות · אודות · שאלות נפוצות.

**Public / marketing**
- `/he` — front page ✅
- `/he/economics` — civic economy, Issue-Coin depth ✅
- `/he/treasury` — public fund ledger ✅
- `/he/pricing` — rate card (₪3 / ₪200) ✅
- `/he/about` ✅ · `/he/faq` ✅ · `/he/support` ✅ · `/he/download` ✅
- `/he/privacy` · `/he/terms` · `/he/refund` — legal ✅

**Voting**
- `/he/votes` — board ✅ · `/he/votes/archive` — settled records ✅
- `/he/votes/[id]` — detail + participation flow ✅
- `/he/votes/create` — create-vote wizard ✅

**Issue-Coin**
- `/he/coin` — market index ✅ (empty pre-launch) · `/he/coin/[id]` — dossier ✅
- 🟧 trading: `api/bags/quote` + `api/bags/swap` exist; NO buy/trade UI (no wallet connect)

**Store**
- `/he/store` ✅ · `/he/store/[slug]` ✅ · `/he/store/cart` ✅ · `/he/store/thank-you` ✅
- 🟡 product/coin imagery missing (placeholders); POD fulfilment + webhook persistence = TODO

**Account**
- `/he/dashboard` — personal ledger ✅
- `/he/verification` — resident verification 🟡 (status/check-in display; phone + GPS APIs exist)
- `/he/onboarding` — municipality select ✅
- `/he/sign-in` · `/he/sign-up` · `/he/sign-up/connect-social` · `/he/settings/social-connections` ✅

**Backend capabilities with thin/absent UX (🟧)**
- NFT resolution certificates — `api/user/nfts`, `votes/[id]/resolution`, NFT service (vote ends → digital certificate). No claim/view UX.
- Phone verification — `api/user/phone/*`. Not surfaced in the verification flow UI.
- Issue-Coin trading — `api/bags/quote|swap`. No UI.
- Network stats — `api/stats/network`. Not shown on coin/economics.
- Per-municipality treasury — `api/treasury/[municipality]`. Treasury page may not switch municipalities live.

---

## Primary journeys

### J1 · First-visit → pilot signup  ✅built / needs UX pass
**Goal:** stranger → WhatsApp pilot member (pre-launch north-star).
**Path:** `/he` (or any marketing page) → reads value → single WhatsApp CTA (or newsletter capsule in Colophon).
**Surfaces:** front page, economics/treasury/pricing/about/faq, Masthead CTA, Colophon newsletter.
**Friction (hypotheses):** one CTA repeated everywhere — does the page earn the click first? 21 routes + 7 nav items may dilute the single action. Newsletter vs WhatsApp = two competing captures.
`[ ] MAP  [ ] FRICTION  [ ] UX  [ ] UI  [ ] COPY`

### J2 · Browse votes → participate (CORE)  ✅built
**Goal:** verified resident casts a paid, sealed vote.
**Path:** `/he/votes` → `/he/votes/[id]` → Stepper: choose option → GPS presence → pay ₪3 → receipt + blockchain seal.
**Backend:** `votes`, `votes/[id]`, `verify-location`, `payments/create` (Paddle), `participate`, `issue-coin`.
**Friction (hypotheses):** paying ₪3 *to vote* is a novel ask — needs justification at the moment of payment; GPS permission anxiety; 4-step stepper weight on mobile; auth gate mid-flow (must sign in to vote).
`[ ] MAP  [ ] FRICTION  [ ] UX  [ ] UI  [ ] COPY`

### J3 · Create a vote  ✅built
**Goal:** resident proposes an issue, pays ₪200, it goes live.
**Path:** `/he/votes/create` Stepper: propose → options → duration → pay ₪200.
**Friction:** ₪200 is a big ask — who's the creator persona? Trust that it'll get traction before paying. Moderation/approval step? (none visible).
`[ ] MAP  [ ] FRICTION  [ ] UX  [ ] UI  [ ] COPY`

### J4 · Resident verification  🟡partial
**Goal:** prove "I live here" once, privately.
**Path:** `/he/verification` → identity → one-time GPS → (phone?) → verified badge.
**Backend:** `verification/start|check-in|schedule|status`, `user/phone/*`, `user/verify-location`.
**Friction:** privacy anxiety is the core barrier; phone verification exists in API but not in the UI; relationship between verification and the in-vote GPS check is unclear (verify once vs every vote?).
`[ ] MAP  [ ] FRICTION  [ ] UX  [ ] UI  [ ] COPY`

### J5 · Issue-Coin: discover → understand → back  🟡UI built, journey thin
**Goal:** supporter finds an issue they care about and backs it (puts money behind it).
**Path:** `/he/coin` → `/he/coin/[id]` → (today: dead-ends at "view vote"; NO back/buy action).
**Backend:** `bags/trending`, `votes/[id]/issue-coin(+holders)`, `bags/quote`, `bags/swap`, `stats/network`.
**Friction:** the "why would I buy a coin for a civic issue" leap is unexplained; no wallet-connect or buy path despite quote/swap APIs; relationship to voting (do I need to vote to hold?) unclear; empty pre-launch state is most of the experience now.
`[ ] MAP  [ ] FRICTION  [ ] UX  [ ] UI  [ ] COPY`

### J6 · Merch: browse → buy  🟡UI built, fulfilment TODO
**Goal:** supporter buys merch; ILS settled via Green Invoice; POD ships.
**Path:** `/he/store` → `/he/store/[slug]` → cart → checkout (Green Invoice hosted page) → `/he/store/thank-you`.
**Backend:** `merch/checkout` (re-prices, creates GI form, mock fallback), `merch/webhook` (ack only).
**Friction / gaps:** no product imagery (placeholders); webhook doesn't persist order or trigger POD; no order-status/tracking for the buyer; guest vs logged-in checkout undecided; shipping/returns policy not linked.
`[ ] MAP  [ ] FRICTION  [ ] UX  [ ] UI  [ ] COPY`

### J7 · Returning user → dashboard  ✅built
**Goal:** a reason to come back between votes.
**Path:** `/he/dashboard` — history, Issue-Coin balance, fund contributions, billing, settings.
**Friction:** what's the recurring hook? Notifications of new local votes? Coin positions moving? Empty states dominate pre-launch.
`[ ] MAP  [ ] FRICTION  [ ] UX  [ ] UI  [ ] COPY`

### J8 · Auth & onboarding  ✅built
**Goal:** account + municipality set, lowest friction.
**Path:** `/he/sign-in|sign-up` (Google OAuth) → `connect-social` → `/he/onboarding` (municipality) → home.
**Friction:** social-connect step purpose (identity score?) needs framing; municipality lock-in; where verification slots in vs onboarding.
`[ ] MAP  [ ] FRICTION  [ ] UX  [ ] UI  [ ] COPY`

### J9 · Vote resolution → certificate  🟧backend, UX undefined
**Goal:** after a vote ends, participant gets a digital certificate (NFT) + result.
**Backend:** `cron/resolve-votes`, `votes/[id]/resolution`, `user/nfts`, NFT service.
**Friction:** no claim/view surface; how the result + certificate are presented (email? dashboard? seal view?) is unspecified.
`[ ] MAP  [ ] FRICTION  [ ] UX  [ ] UI  [ ] COPY`

### J10 · Treasury transparency  ✅built (single municipality)
**Goal:** anyone audits where the money goes.
**Path:** `/he/treasury` ledger.
**Friction:** municipality switching (`api/treasury/[municipality]`) may not be wired in UI; pre-launch empty.
`[ ] MAP  [ ] FRICTION  [ ] UX  [ ] UI  [ ] COPY`

### J11 · Info / support / legal  ✅built
**Path:** `/he/faq` · `/he/support` (→ WhatsApp) · `/he/download` · legal.
**Friction:** low-priority; ensure they feed back into the J1 CTA, don't leak attention.
`[ ] MAP  [ ] FRICTION  [ ] UX  [ ] UI  [ ] COPY`

---

## Cross-cutting concerns (apply to every journey)
- **Single-CTA discipline** — one primary action per screen, all roads → WhatsApp pilot pre-launch (CONTENT_STRATEGY §6). Audit per page.
- **Nav / IA** — 7 nav items + store/coin; is that the right top-level set, or should coin/store/treasury live under a secondary bar?
- **Auth gating** — verification/dashboard/onboarding redirect to sign-in; make the redirect intent legible ("sign in to vote").
- **Empty / pre-launch states** — most surfaces are empty until launch; the empty state IS the product right now. Each needs a deliberate pre-launch message + CTA.
- **Mobile-first** — every journey must hold at 390px (done structurally; re-check per flow during UI phase).
- **Microcopy system** — CTA vocabulary, error/success/empty strings live in CONTENT_STRATEGY §6; keep one source of truth.
- **Trust reminders** — blockchain-seal / "we don't track location" / ₪ split lines, placed at the anxiety moments.
- **Imagery** — POD product art + coin/issue art missing; decide source (Higgsfield) during UI phases.

---

## Methodical worklist (order to dissect)
Proposed sequence — highest leverage first. Reorder as you like.

1. ⬜ **J1 funnel** — sets the north-star everything else serves.
2. ⬜ **J2 participation** — core money loop.
3. ⬜ **J5 coin** + **J6 store** — newest, least-specified; high ambiguity.
4. ⬜ **J4 verification** + **J8 auth/onboarding** — the gate before J2.
5. ⬜ **J3 create** — narrower persona.
6. ⬜ **J9 resolution/certificate** — close the loop after a vote.
7. ⬜ **J7 dashboard** + **J10 treasury** — retention + trust.
8. ⬜ **J11 info/legal** — cleanup pass.

> Next: pick a journey, fill MAP together, then work the phases down.
