# Taruu — UX Flow Map & Breakdown Tracker

_Created 2026-06-15. Working doc for the UX breakdown session._

## Backlog — new requests (2026-06-15, for next session)
Captured for GSD/next-session pickup (GSD `.planning/` not initialised in this repo — init later if wanted).

- **B1 · OTP via serverless Cloudflare Worker.** Replace/supplement Twilio Verify (current J4 phone OTP) with a Cloudflare Worker for code generation + delivery. Keep the `/api/user/phone/send-code|verify` contract; swap the backend. Infra + security (rate-limit, secrets in Worker env, no creds in client).
- **B2 · Account icon bar (masthead).** Show the authenticated Google account in the chrome — avatar/email + the verified **location** (city/municipality) as a compact indicator/menu. Today the masthead has NO auth state. Signed-out → the founders'-group CTA; signed-in → account menu (account, dashboard, sign out) + location chip.
- **B3 · Account space.** A dedicated account area (likely `/account` or expand `/settings`) — profile, the Google identity, verification status, location. Distinct from `/dashboard` (the civic ledger).
- **B4 · City + Country fields.** Onboarding/account currently capture **municipality only**. Add explicit **city** + **country** fields (capture in onboarding + editable in the account space; surface in B2's location chip). Update `UserProfile`/profile API as needed.

These mostly land in **J8 (auth/onboarding)** + a new **account** surface; B1 is J4 infra.

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
**Decisions:** (1) WhatsApp + newsletter = two separate channels, both stay. (2) Persistent WhatsApp ask = chrome only — **removed the floating button**, moved into **masthead + footer**, relabelled **"קבוצת המייסדים"** (founders' group). (3) Homepage live ballot is now a **real micro-interaction** — tap an option → tally recomputes with your +1 → honest "demo, join to make it count" prompt → founders' group. (Escalating-CTA arc deferred — chrome carries the persistent ask instead.)
`[x] MAP  [x] FRICTION  [x] UX  [x] UI  [x] COPY` — all body + marketing WhatsApp CTAs unified to "קבוצת המייסדים"; "פיילוט/מהדורת הפיילוט" kept only as edition/era framing. **J1 complete.**

### J2 · Browse votes → participate (CORE)  ✅built
**Goal:** verified resident casts a paid, sealed vote.
**Path:** `/he/votes` → `/he/votes/[id]` → Stepper: choose option → GPS presence → pay ₪3 → receipt + blockchain seal.
**Backend:** `votes`, `votes/[id]`, `verify-location`, `payments/create` (Paddle), `participate`, `issue-coin`.
**Decisions (UX):** (1) Flow reshaped to **choice → pay ₪3 → seal** — per-vote GPS removed. (2) Residency is verified **once** via J4; voting then skips location entirely. (3) Auth gate moves to **payment**; the selected option persists across the OAuth round-trip (no lost choice). (4) Verified-resident is a **precondition at payment** — unverified users route to J4 verification, then return to finish. (5) GPS **hard-fails with retry** (moved into J4); soft-pass only behind an explicit dev/mock flag. (6) Payment step must **justify the ₪3** in place (₪2 fund / ₪1 ops · funds execution · feeds the vote's BAG).
**Grounding notes:** the vote is recorded server-side on the Paddle `payment.completed` webhook, not by the client; the mock-seal path persists nothing (demo only).
`[x] MAP  [x] FRICTION  [x] UX  [x] UI  [x] COPY` — flow rebuilt (choice→pay→seal, gate-at-payment with choice persisted via sessionStorage, verified-resident precondition routing to /verification, ₪3 justified + tied to the BAG). **J2 complete** pending live visual (dev DB empty — no seed votes). Cross-journey TODOs: (a) /verification must honour `?redirect=` to return after verifying (J4); (b) server-side vote recording on the Paddle webhook is the source of truth (mock seal persists nothing).

### J3 · Create a vote  ✅built
**Goal:** resident proposes an issue, pays ₪200, it goes live.
**Path:** `/he/votes/create` Stepper: propose → options → duration → pay ₪200.
**Friction:** ₪200 is a big ask — who's the creator persona? Trust that it'll get traction before paying. Moderation/approval step? (none visible).
**MAP (grounded 2026-06-15):** `/votes/create` 4-step wizard → `POST /api/payments/create` (vote_creation, Paddle) → stashes `pendingVote` in sessionStorage → Paddle redirect. `POST /api/votes` (requires `paymentTxId`, verifies payment, blocks double-spend) is what inserts the vote. **BROKEN:** `pendingVote` was never consumed — no finaliser, so paying created no vote. No residency gate, no moderation. Price `CREATE_VOTE_COST` (was 200; CONTENT_STRATEGY §5 said 50).
**Decisions (UX) 2026-06-15:** (1) **Client return-page finalize.** (2) **Verified resident of that city** — full verification + own municipality. (3) **Auto-publish on payment** (no review). (4) **Price ₪50.**
`[x] MAP  [x] FRICTION  [x] UX  [x] UI  [x] COPY` — **J3 shipped.** New `/he/payments/return` (Paddle's return URL, now locale-prefixed) reads the draft → `POST /api/votes` with `paymentTxId`, retries 402 for webhook lag, redirects to the new vote (processing/received/error states). Creator gate: wizard pre-checks `verificationStatus.phase==='completed'` → `/verification?redirect`; server requires `verification_status==='verified'` + **derives municipality from the creator** (not client). `CREATE_VOTE_COST 200→50` (propagates to display + Paddle amount). **Caveat:** dev mock path (no Paddle) still shows an in-page seal and doesn't finalise (POST needs a completed payment); live e2e needs Paddle + the webhook to mark the payment completed.

### J4 · Resident verification  🟡partial
**Goal:** prove "I live here" once, privately.
**Path:** `/he/verification` → identity → one-time GPS → (phone?) → verified badge.
**Backend:** `verification/start|check-in|schedule|status`, `user/phone/*`, `user/verify-location`.
**Decisions (UX):** (1) **One successful GPS check-in gates voting** — keep the program, but the first check-in flips eligibility; further check-ins continue in the background for trust scoring, never blocking. (2) **Phone OTP (identity) + GPS (residency)** two-factor. (3) **Wire it for real** — replace the stubbed `alert('coming soon')` actions with the live APIs + geolocation, **hard-fail + retry**, honour `?redirect=` back to the originating vote. (4) Eligibility helper `phase==='completed' || checkInsCompleted>=1` shared with J2's payment gate.
**Grounding notes:** phone = Twilio Verify (rate-limited; mock-degrade without creds); GPS check-ins are gated by scheduled windows — the **first** check-in must be immediate to gate voting, scheduled windows continue the program after. Actions were stubbed; status comes from `user.verificationStatus` (refresh via AuthProvider.refreshSession).
`[x] MAP  [x] FRICTION  [x] UX  [x] UI  [x] COPY` — **J4 wired for real**: phone OTP (Twilio, mock-degrade) → immediate first GPS check-in (start→check-in, hard-fail+retry, next-window surfaced) → eligible; `?redirect=` preserved through sign-in back to the vote; `lib/verification.ts isEligibleToVote()` shared with the J2 gate. **J4 complete** (live visual pending Twilio creds + seed schedule).

### J5 · Issue-Coin: discover → understand → back  🟡UI built, journey thin
**Goal:** supporter finds an issue they care about and backs it (puts money behind it).
**Path:** `/he/coin` → `/he/coin/[id]` → (today: dead-ends at "view vote"; NO back/buy action).
**Backend:** `bags/trending`, `votes/[id]/issue-coin(+holders)`, `bags/quote`, `bags/swap`, `stats/network`.
**Friction:** the "why would I buy a coin for a civic issue" leap is unexplained; no wallet-connect or buy path despite quote/swap APIs; relationship to voting (do I need to vote to hold?) unclear; empty pre-launch state is most of the experience now.
**MAP (grounded 2026-06-15):** `/coin` `CoinMarket` (fetches `/api/bags/trending`, filterable table) → `/coin/[id]` `CoinDossier` (fetches `issue-coin`+`holders`+vote: header · stats · on-chain seal `SealCard`→solscan · holders ledger · "how it works" explainer). READ-ONLY — dead-ends at the vote link. `live = tradingEnabled && !isFrozen` (`CoinDossier.tsx:162`) drove nothing. Backend-no-UI: `POST /api/bags/quote` + `/api/bags/swap` (auth'd, wired to bagsService; swap falls back to user's qubik wallet → custodial path possible). NO wallet-connect/Phantom/Solana anywhere. `CoinMarket` EmptyState (`:239` "עוד לא נפתחו BAGS") is composed; the dev "couldn't load" string is the fetch-FAILURE branch (no API in dev), not the prod empty state.
**Decisions (UX) 2026-06-15:** (1) **Back = link out to bags.fm** — in-app stays discover+understand; the BACK CTA deep-links to `https://bags.fm/<tokenMint>`. quote/swap stay unwired (deferred; in-app custodial swap is a later option). Honest to "independent censorship-resistant rails". (2) **Anyone backs, residents vote** — backing open to outsiders, no gate; frame the split explicitly. (3) **Dossier-only** placement — market rows stay informational.
`[x] MAP  [x] FRICTION  [x] UX  [x] UI  [x] COPY` — **J5 shipped (link-out tier).** Added a primary BACK ink-block to `CoinDossier` after the stats grid: red `גבו ב-bags.fm` CTA → `bags.fm/<tokenMint>` when `live && tokenMint` (else disabled note: frozen / not-yet-trading); copy frames "anyone backs · residents vote" + the independent-rails note. tsc+lint green. **Live visual pending seed coin data** (dev DB empty → dossier shows empty/error, not the back panel). Deferred: in-app custodial swap via qubik (quote/swap UI), market-row quick-back.

### J6 · Merch: browse → buy  🟡UI built, fulfilment TODO
**Goal:** supporter buys merch; ILS settled via Green Invoice; POD ships.
**Path:** `/he/store` → `/he/store/[slug]` → cart → checkout (Green Invoice hosted page) → `/he/store/thank-you`.
**Backend:** `merch/checkout` (re-prices, creates GI form, mock fallback), `merch/webhook` (ack only).
**Friction / gaps:** no product imagery (placeholders); webhook doesn't persist order or trigger POD; no order-status/tracking for the buyer; guest vs logged-in checkout undecided; shipping/returns policy not linked.
**MAP (grounded 2026-06-15):** `/store` (`MERCH_CATALOG`, 5 SKUs, `ProductImage`) → `/store/[slug]` (`ProductDetail`: variant+qty → `useMerchCartStore` zustand+localStorage) → `/store/cart` (`CartView`: lines+shipping+address → `POST /api/merch/checkout`) → Green Invoice hosted page → `/store/thank-you?order=`. Checkout re-prices vs catalog, built a `MerchOrder` in memory (`randomUUID`), GI `createPaymentForm` (mock URL in dev). **Gaps:** no `merch_orders` table (order never saved); webhook (`:16`) logged only; thank-you read the bare orderId; no POD; images at `/images/merch/*.png` absent → empty plates.
**Decisions (UX) 2026-06-15:** (1) **Persistence + real thank-you** scope (POD deferred to manual for pilot). (2) **Higgsfield imagery** — generate the 5 SKUs. (3) **Require sign-in** to check out (orders tied to a user).
`[x] MAP  [x] FRICTION  [x] UX  [x] UI  [x] COPY` — **J6 shipped (integrity + imagery tier).** `merch_orders` table+migration+Supabase types+db (create/get/update); `MerchOrder.userId`. Checkout: 401 for guests, stamps userId, persists 'pending' before the payment page (hard-fails only when GI configured; dev mock still exercisable). Webhook: looks up order, idempotent flip to 'paid' (skip settled), stores doc id; POD hand-off = TODO hook. `GET /api/merch/orders/[id]` owner-only read. Thank-you: fetches the real order (line items/totals/status, graceful id-only + dev-mock fallback). Cart: gates checkout behind sign-in (`?redirect=`) + handles API 401. **Imagery:** 5 duotone risograph SKUs via Higgsfield (ink+red on cream, halftone) → `apps/web/public/images/merch/` (~750KB ea), store now renders real plates. tsc+lint green. **Deferred:** POD provider wiring (Printful) → status 'fulfilling'; order-status/tracking surface; shipping/returns links.

### J7 · Returning user → dashboard  ✅built
**Goal:** a reason to come back between votes.
**Path:** `/he/dashboard` — history, Issue-Coin balance, fund contributions, billing, settings.
**Friction:** what's the recurring hook? Notifications of new local votes? Coin positions moving? Empty states dominate pre-launch.
`[x] MAP  [x] FRICTION  [x] UX  [x] UI  [x] COPY` — **J7 pass done.** Dashboard was history-only (real API, empty states OK) — added the missing **retention hook**: an "open votes in your city" callout (fetch `/api/votes?municipality&status=active`, count + up to 3 titles + CTA, hidden when none). Fixed a stale hardcoded "₪200" create CTA → `formatCurrency(CREATE_VOTE_COST)` (₪50). Certificates tab added in J9. **Deferred:** real push notifications; refund form stays a graceful mock (no `/api/payments/refund`).

### J8 · Auth & onboarding  ✅built
**Goal:** account + municipality set, lowest friction.
**Path:** `/he/sign-in|sign-up` (Google OAuth) → `connect-social` → `/he/onboarding` (municipality) → home.
**Friction:** social-connect step purpose (identity score?) needs framing; municipality lock-in; where verification slots in vs onboarding.
**New requests folded in (see Backlog):** B2 account icon bar in masthead (auth state + location chip — masthead has none today), B3 dedicated account space, B4 city + country fields (currently municipality-only). Confirmed present: Google OAuth sign-in, `/dashboard`, `/sign-up`(+connect-social).
**MAP (grounded 2026-06-15):** sign-in/up → `signInWithGoogle()` (`AuthProvider.tsx:36`) → `POST /api/auth/callback` (tokens+DID+Qubik wallet+`isNewUser`) → `useAuthStore` localStorage → new→`/onboarding`(municipality only, `PATCH /api/user/profile`)→`/dashboard`; returning→`/dashboard`. Account space today = `/dashboard` 4 tabs (history·fund·billing·settings). `UserProfile` (`user.ts:106`) has `municipality`+`avatarUrl`, **no city/country**; PATCH whitelists `firstName/lastName/phone/municipality` only.
**FRICTION:** (1) masthead zero auth state (`Masthead.tsx:49`, WhatsApp CTA + 7 static nav only) → B2. (2) 3 dead settings links — dashboard rows route to `/settings/{profile,municipality,notifications}` (`dashboard/page.tsx:537-539`), **none built**; only `social-connections` exists → B3. (3) city/country uncapturable → B4. (4) bare sign-in redirect (no "sign in to vote" intent). (5) connect-social payoff unframed. (6) municipality lock-in (edit = dead link).
**Decisions (UX) 2026-06-15:** (B3) **build the 3 dead `/settings/*` pages** — keep `/dashboard` as hub, settings = press sub-pages (profile · municipality · notifications). (B2) masthead signed-in = **avatar dropdown** (account/dashboard/sign out) **+ city chip**; signed-out keeps founders'-group CTA; mobile collapses chip into menu (broadsheet density). (B4) **single-country pilot — country fixed `ישראל` implicit, NOT a field; `city` is the only new editable field** (free-text), surfaced in the masthead chip + edited in `/settings/profile`. Municipality stays the civic anchor; onboarding stays 2-step (no new steps).
`[x] MAP  [x] FRICTION  [x] UX  [x] UI  [x] COPY` — **J8 shipped.** Data layer: `UserProfile.city` (+ `notification_settings`) added to shared type, DB types, PATCH whitelist, `transformToProfile`; migrations `20260615000001_user_city.sql` + `..0002_user_notification_settings.sql`. (B2) `Masthead` now branches on `useAuth`: signed-out keeps founders'-group CTA; signed-in → city chip (`city || municipality`, red ● glyph, collapses into menu ≤767px) + avatar dropdown (לוח שלי · הפרופיל שלי · חשבונות מקושרים · התנתקות → `signOut()`; outside-click/Esc/route close; aria-menu). (B3) 3 dead links built as press pages: `/settings/profile` (firstName/lastName/phone/**city**, read-only Google avatar, country=ישראל implicit), `/settings/municipality` (PressSelect over MUNICIPALITIES, civic anchor), `/settings/notifications` (Segmented per `NotificationSettings` field — now persisted via the PATCH wiring). All mirror social-connections' shell + auth guard; GET `/api/user/profile` hydrate → PATCH → `refreshSession()`. tsc + lint green; routes compile 200. **Live visual pending a real session** (mock DB can't render the signed-in branch / auth-gated forms — same caveat as J2/J4). B1 (OTP Cloudflare Worker, J4 infra) still pending.

### J9 · Vote resolution → certificate  🟧backend, UX undefined
**Goal:** after a vote ends, participant gets a digital certificate (NFT) + result.
**Backend:** `cron/resolve-votes`, `votes/[id]/resolution`, `user/nfts`, NFT service.
**Friction:** no claim/view surface; how the result + certificate are presented (email? dashboard? seal view?) is unspecified.
**MAP (grounded 2026-06-15):** vote ends → cron `resolve-votes` → `processVoteResolutions` (`nft/index.ts:425`) sets `vote.resolution_status` + bulk-creates `vote_nfts` (status `pending`), type `verified_voter` (resident voter) / `civic_patron` (BAG backer). Result already shows on resolved vote detail (`votes/[id]:271`). `GET /api/user/nfts` existed but **no UI**; minting + IPFS image stubbed (`ipfs://placeholder`); archive NFT stats are mock.
**Decisions (UX) 2026-06-15:** (1) **Dashboard tab + per-vote** placement. (2) **Auto-issued, view-only** — resolution = issuance; show from the record with a status badge, no claim. (3) **Higgsfield cert art**.
`[x] MAP  [x] FRICTION  [x] UX  [x] UI  [x] COPY` — **J9 shipped (view-only tier).** 2 Higgsfield duotone civic seals (verified_voter: hand+ballot+check; civic_patron: pillar+coins+arrow) → `public/images/certificates/<type>.png`. `CertificateCard` (seal plate + vote title + role + municipality + date + on-chain status badge + seal hash). Dashboard gained a **תעודות** tab (grid of cards from `/api/user/nfts`, composed empty state). Per-vote **"התעודה שלכם"** block on resolved vote detail (matched by voteId). API relaxed to return **all** records (not just minted) + `status`; cert image served from local type art. `generateNftMetadata` image → type path. tsc+lint green; seals serve 200. **Deferred:** real on-chain mint (batch minter) + IPFS pin; per-vote-unique art; wiring archive NFT stats to real data. Auth-gated → live visual needs a session + resolved vote with a vote_nft.

### J10 · Treasury transparency  ✅built (single municipality)
**Goal:** anyone audits where the money goes.
**Path:** `/he/treasury` ledger.
**Friction:** municipality switching (`api/treasury/[municipality]`) may not be wired in UI; pre-launch empty.
`[x] MAP  [x] FRICTION  [x] UX  [x] UI  [x] COPY` — **J10 fixed.** The selector WAS wired, but the page only worked on a hardcoded mock (₪125k round numbers): the API returns `{ treasury: {...} }` with a different schema → `setTreasury(data)` stored the wrapper → every figure undefined; errors fell back to the fake mock. Now maps the real summary (totalCollectedILS/balanceILS, balanceSOL, activeVotesCount), fetches the previously-unused `/transactions` endpoint, **derives** local/external split + resolved count from the ledger, and renders an honest **zeroed board** (₪0 + coming-soon) on empty/error — no fabricated figures. **Deferred:** API doesn't track the local/external split or resolved count natively (derived from tx); municipalityName = the constant string.

### J11 · Info / support / legal  ✅built
**Path:** `/he/faq` · `/he/support` (→ WhatsApp) · `/he/download` · legal.
**Friction:** low-priority; ensure they feed back into the J1 CTA, don't leak attention.
`[x] MAP  [x] FRICTION  [x] UX  [x] UI  [x] COPY` — **J11 audited, near-clean.** faq/support/download all route their CTAs to the founders'-group WhatsApp (`FITvea9IVsn2Ljie1yCrAc`) consistently; store badges show בקרוב. Only real fix: the JSON-LD Organization schema (`layout.tsx`) had stale placeholders — `sameAs` → real WhatsApp link; `verification.google` → env (`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, omitted when unset). **Nit (deferred):** WHATSAPP link is hardcoded in 5 files — consistent but un-centralized.

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

1. ✅ **J1 funnel** — founders'-group CTA + interactive home ballot.
2. ✅ **J2 participation** — choice → pay ₪3 → seal.
3. ✅ **J5 coin** (link-out back) + ✅ **J6 store** (persistence + imagery).
4. ✅ **J4 verification** + ✅ **J8 auth/onboarding** (+ account: masthead state, settings, city).
5. ✅ **J3 create** — finalise + verified-resident gate + ₪50.
6. ✅ **J9 resolution/certificate** — view-only certificates.
7. ✅ **J7 dashboard** (retention hook) + ✅ **J10 treasury** (real API, no fake figures).
8. ✅ **J11 info/legal** — schema cleanup.

> **ALL 11 JOURNEYS DISSECTED + SHIPPED (2026-06-15).** What remains is not UX
> design but live wiring + deferred infra (see each journey's "Deferred"):
> real creds for e2e (Supabase / Paddle / Green Invoice / Twilio), on-chain mint
> + IPFS (J9), POD fulfilment (J6), in-app custodial swap (J5), push
> notifications (J7), per-vote NFT art. Auth-gated surfaces need a real session
> to visually verify.
