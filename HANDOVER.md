# HANDOVER — Taruu Redesign → Full Build

_Updated 2026-06-15._

## ✅ LOCKED design decision
**Brutalist Tech-Press** is the approved, final art direction. Do NOT re-explore alternatives.
- Contract (read first): `.redesign/NEWSPRINT_TECH.md` (LOCKED).
- Copy/funnel: `.redesign/CONTENT_STRATEGY.md`. Progress: `.redesign/REDESIGN.md`.
- Luminous Civic (`.redesign/DESIGN_SYSTEM.md`) is **DEPRECATED** — still live only on un-migrated inner pages.

Look & feel: newsprint cream `--np-paper #F4F1E8` + ink `--np-ink #14110E` + pillarbox red `--np-red #E0301E`. Heavy grotesque headlines (Heebo 900), monospace data/control surfaces (JetBrains Mono), serif editorial body (Frank Ruhl Libre). Thick ink rules, newsprint grain + halftone, broadsheet density, hard corners (radius 0), red = only accent, in-page participation surfaces. Desktop-first wide, mobile minimized. RTL Hebrew, no emoji (glyphs ■▍●□✓✕/SVG), reduced-motion guards, mechanical motion (`--np-ease`).

## System map
- Tokens: `apps/web/src/styles/tokens.css` → `--np-*` block. Utilities: `apps/web/src/styles/globals.css` → `.np-*` (`.np-page` grain overlay, `.np-container`, `.np-rule*`, `.np-kicker`, `.np-mono`, `.np-halftone*`, `.np-block-*`, `.np-dropcap`).
- Press primitives: `apps/web/src/components/press/` → `Masthead`, `Ticker`, `NewsButton` (hard-edge, invert-hover; **wraps** long Hebrew — never add `nowrap`), `VoteWidget`+`TallyBar` (participation control surface), barrel `index.ts`.
- Front-page sections: `apps/web/src/components/press/sections/` → `Lead` (reference impl + canonical typescale), `Participate` (control-surface spec-sheet), `Pillars`, `HowItWorks`, `PilotDispatch`, `Colophon`.
- Homepage: `apps/web/src/app/[locale]/page.tsx` (`.np-page` wrapper).
- Assets (Higgsfield): `public/images/civic-engraving.png` (linocut lead art), `public/og-image.png` (newspaper OG). HF ~17 credits left, ~13/gen.

### Canonical type scale (match on EVERY press surface)
- Section H2: `clamp(var(--text-4xl), 5.5vw, var(--text-8xl))`, line-height 0.88, letter-spacing -0.04em, ink + red `<span>` accent. Page-1 lead headline → `--text-9xl`.
- Kicker: mono, `--text-sm`, weight 800, letter-spacing 0.12em, uppercase, red, ■ tick prefix.
- Standfirst: serif, `clamp(var(--text-base), 0.5vw+0.9rem, var(--text-xl))`, lh 1.45, ink-soft.
- Numbers/meta/captions: mono, tabular.

## DONE
Homepage front page fully rebuilt to the locked system (masthead · ticker · 3-col broadsheet Lead with engraving + live ballot · Participate · Pillars · HowItWorks · PilotDispatch · Colophon). tsc + lint green, HTTP 200, desktop + mobile verified. Newsletter capsule + newspaper OG done. Mobile overflow fixed (NewsButton wraps; headline clamps mobile-safe).

## TODO — manifest ALL control surfaces + flows in the press system
Everything below is still **Luminous v1** or unbuilt — migrate/build in brutalist tech-press, reusing press primitives + canonical scale.

1. **Global shell site-wide**: replace luminous `components/layout/Header`+`Footer` with `Masthead`+`Colophon` across all pages (only homepage uses them now). Best: wire into the `[locale]` layout.
2. **Inner pages → press**: `votes` (list/[id]/create/archive), `economics`, `treasury`, `pricing`, `about`, `faq`, `support`, `download`, `verification`, legal (`privacy/terms/refund`). Per-page copy in CONTENT_STRATEGY §5.
3. **Participation FLOW** (real, not just the home surface): vote detail → choose option → verify presence (GPS) → pay ₪3 → confirmation/receipt → blockchain-seal view. Press multi-step.
4. **Payments & billing**: Paddle checkout, ₪3 vote / ₪50 create-vote, payment status/verify/receipt, billing history, refunds UI. API routes exist under `apps/web/src/app/api/payments/*` + `api/payments/webhook`; build press surfaces on top. Mobile payment screens: `apps/mobile/app/payment/*`.
5. **Verification flow**: identity + one-time GPS check, reassurance UI, check-in screens (`apps/mobile/app/verification/*` + web `verification`).
6. **User dashboard**: profile, voting history, token/Issue-Coin balance, treasury contributions, settings (notifications/municipality/profile), verification status — press furniture (boxed ledgers, mono tallies, ink rules).
7. **Auth**: sign-in / sign-up / onboarding / connect-social (Supabase OAuth) — press-styled.
8. **Create-vote wizard**: propose issue → options → duration → ₪50 — press multi-step.
9. **Mobile app** (`apps/mobile`, NativeWind/luminous): decide whether to port the press language to RN (separate system, lower priority — flag to user).

Build approach that worked: fan out parallel agents (one per page/flow) with NEWSPRINT_TECH.md + Lead as reference + the canonical-scale block above + "use press primitives, keep all data/logic, typecheck only your files." Then assemble + verify with Playwright screenshots (desktop-first 1600/1920, mobile 390).

## Run / verify
- Dev: `cd apps/web && node_modules/.bin/next dev -p 3777` → http://localhost:3777/he. **Never `next build` while dev runs** (clobbers `.next`). Hebrew-only.
- Typecheck: `node_modules/.bin/tsc -p apps/web/tsconfig.json --noEmit`. Lint: `cd apps/web && node_modules/.bin/next lint`.
- Screenshots: playwright-core at `node_modules/.pnpm/playwright-core@1.57.0/...`; headless shell `~/Library/Caches/ms-playwright/chromium_headless_shell-1217/...`. See `.redesign/shot.mjs`.
- Local dev data: Supabase placeholder creds → components fall back to MOCK; real Supabase/Paddle creds needed for live e2e.

## Gotchas
- pnpm not on PATH in this shell; use `node_modules/.bin/*` directly.
- Background `&` inside a `run_in_background` bash detaches further — start dev with `nohup ... & disown`, poll the port.
- `.redesign/*.png|*.mjs|*.html` are throwaway (gitignored); the `.md` docs are tracked.
- Git rules: branch before commit, semantic commits, **NEVER** Claude/Anthropic co-author.
