# Taruu — Financial Model & Expectancy

_Locked 2026-06-24. All ₪. Rate USD/ILS = 3.7 (assumption). Recompute: `python3 growth/build_financial_model.py` → `growth/financial-model.xlsx`._

## Locked inputs

| Lever | Value | Note |
|---|---|---|
| Participation fee | ₪3 | platform skims **30%** (₪0.90), treasury keeps 70% (₪2.10) |
| Create-vote fee | ₪50 | **100% platform** revenue; treasury funded by the 70% participation share |
| Payment rail | Paddle (Merchant of Record) | **5% + $0.50/txn** ≈ 5% + ₪1.85 |
| Take-home target | ₪30–45k/mo combined | midpoint ₪37.5k → ~**₪52.5k/mo gross profit** pre personal tax (27% eff. income tax + Bituach Leumi for 2× osek murshe) |
| Fixed costs | ~₪1,200/mo | infra + tooling (breakdown below) |

## The single most important finding: ₪3 single-charge is underwater

Paddle's **fixed ₪1.85 per transaction** is fatal to a ₪3 micro-charge.

| Pack | Votes | Paddle fee | Platform NET | **Platform / vote** | Treasury / vote |
|---|---|---|---|---|---|
| **₪3 (single charge)** | 1 | ₪2.00 | **−₪1.10** | **−1.100** ✕ | ₪2.10 |
| ₪30 wallet | 10 | ₪3.35 | +₪5.65 | +0.565 | ₪2.10 |
| ₪60 wallet | 20 | ₪4.85 | +₪13.15 | +0.657 | ₪2.10 |
| ₪150 wallet | 50 | ₪9.35 | +₪35.65 | +0.713 | ₪2.10 |
| ₪300 wallet | 100 | ₪16.85 | +₪73.15 | +0.732 | ₪2.10 |

Charging ₪3 once **loses ₪1.10** and can't even fully fund the ₪2.10 treasury share — the platform subsidizes every vote. **Fix = a credit wallet** (P0 on the roadmap): the citizen tops up once (e.g. ₪30 = 10 votes) in a single Paddle txn, then votes are drawn from balance with zero marginal processing. Per-vote platform NET climbs from −₪1.10 to +₪0.57…+₪0.73 as pack size grows.

> Treasury always gets its ₪2.10/vote (that's the civic-funding promise — untouched). The wallet only fixes who eats the processing fee: the platform's skim, not the treasury.

Create-vote economics are healthy as-is: **₪50 gross − ₪4.35 Paddle = ₪45.65 NET**, 100% platform.

## The P&L is create-led

Per unit, a paid create nets **₪45.65** vs **~₪0.66** per participation — a **~69×** gap. So:

- **Creates carry the income.** To hit the ₪52.5k/mo gross-profit target on creates alone: **~1,150 paid creates/mo (~38/day)**.
- **Participations are gravy + fuel.** Matching that target on participations alone would need **~80,000 paid votes/mo** — unrealistic early. Their real job is to (a) fund the treasury, (b) prove the vote is real/binding, and (c) convert engaged voters into the next vote's *creator*.
- **Cover fixed costs (zero salary):** just **~27 paid creates/mo (~1/day)**. Break-even is trivially close; "making a living" is the climb.

## Scenarios (monthly)

| Scenario | Ambassadors | Paid creates | Participations | Gross rev | Gross profit | Est. take-home |
|---|---|---|---|---|---|---|
| Break-even | 8 | 25 | 990 | ₪1,792 | ₪392 | ₪286 |
| Lean (ramp) | 20 | 120 | 5,600 | ₪9,157 | ₪7,457 | ₪5,444 |
| **Target (living)** | **50** | **600** | **32,500** | **₪48,742** | **₪46,342** | **₪33,830** |
| Scale | 120 | 1,800 | 134,400 | ₪170,471 | ₪166,771 | ₪121,743 |

"Target (living)" lands at **₪33.8k/mo take-home** — inside your ₪30–45k band — at **50 active ambassadors driving ~600 paid creates + ~50 paid voters each**. That's the number to organize the whole company around.

## Fixed cost breakdown (~₪1,200/mo)

| Item | ₪/mo | Note |
|---|---|---|
| Cloudflare Workers Paid | ~19 | $5 |
| Supabase Pro | ~93 | $25 (free tier until prod load) |
| Resend | ~74 | $20 (free 3k emails to start → ₪0) |
| Upstash Redis | ~37 | rate-limit persistence |
| Domain (amortized) | ~10 | taruu.co.il |
| Agent LLM API (Claude, 3 agents) | ~500 | scales with outreach/content volume |
| Asset gen (Higgsfield) | ~50 | occasional |
| Postiz | 0 | self-host; cloud is ~₪107 if you skip self-host |
| Cold-email tool (Instantly/lemlist) | ~137 | only when running marketing outreach |
| Buffer | ~180 | Sentry, misc |

**Not in fixed costs — growth CAC:** ambassador first-vote comps (we *waive* the ₪50, no Paddle hit → ₪0 cash, pure opportunity cost) + grey-hat amplification budget (aged Reddit accounts ~₪75, paid reposts $100–350 each). Treat as a separate, throttle-able marketing line.

## Three things that most move the model

1. **Ship the wallet** — turns every participation from −₪1.10 to positive. Without it, growth in voting *increases* your losses.
2. **Drive creates, not just votes** — every product surface should nudge an engaged voter toward creating their own ₪50 vote. That's the 69× lever.
3. **Ambassador → creator conversion rate** — the funded first vote is CAC; the business only works if a meaningful share of ambassadors (and their most active voters) go on to create *paid* votes. Track this cohort ruthlessly.
