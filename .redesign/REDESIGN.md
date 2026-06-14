# Taruu Redesign — Progress Tracker

## ✅ LOCKED DIRECTION (2026-06-14) — Brutalist Tech-Press
**APPROVED & FINAL.** Luminous Civic (v1) deprecated. Direction: **Brutalist tech-press newspaper** — newsprint cream + ink + pillarbox red, heavy grotesque headlines (Heebo 900), monospace data (JetBrains Mono), serif editorial body (Frank Ruhl Libre), thick ink rules, newsprint grain + halftone, in-page participation surfaces (live ballot), broadsheet density, civic linocut engraving art. Desktop-first wide, mobile minimized. Contract: `.redesign/NEWSPRINT_TECH.md` (LOCKED). Reference impl: the homepage. Do not re-explore alternatives.
- Assets: `public/images/civic-engraving.png` (linocut, lead art) · `public/og-image.png` (newspaper OG) — both Higgsfield.
- DONE: `--np-*` tokens + `.np-*` utilities + JetBrains Mono. Press primitives in `components/press/`: Masthead, Ticker, NewsButton, VoteWidget+TallyBar. Front-page sections in `components/press/sections/`: Lead, Participate (control-surfaces showcase), Pillars, HowItWorks, PilotDispatch, Colophon. Homepage `page.tsx` rebuilt to the newspaper front page (`.np-page`). tsc+lint green, HTTP 200, mobile overflow fixed (NewsButton wraps), tightened + higher typescale per feedback.
- NOTE: inner pages (votes/about/economics/etc.) + global Header/Footer are still **Luminous v1** — NOT yet migrated to newspaper. Next session: propagate press system site-wide. Higgsfield out of credits (3 left, gen costs ~7).
- Higgsfield textures deferred → using crisp CSS/SVG (halftone/grain/rules) which suits brutalist better.

---
## v1 (Luminous Civic) — superseded on homepage, still live on inner pages

Direction: **Luminous Civic** (light, gradient blue→green→purple, glass, colored interactions) · **Whole site** scope (multi-session) · **Design-first, Higgsfield assets last**.

Contracts: `.redesign/DESIGN_SYSTEM.md` (design) · `.redesign/CONTENT_STRATEGY.md` (copy + funnel).
North-Star CTA: **join WhatsApp pilot** (`https://chat.whatsapp.com/FITvea9IVsn2Ljie1yCrAc`).

## DONE (session 1) — gates green (tsc + lint pass)
- **Design tokens** `--lc-*` added to `styles/tokens.css`; luminous utilities in `styles/globals.css` (.lc-glass, .lc-gradient-text, .lc-rule, .lc-eyebrow, .lc-glow-*, .lc-section, .lc-band-tint).
- **Primitives** (`components/ui/`): `GradientText`, `GlassCard` (static/interactive/spotlight), `RippleButton` (color ripple + glow + tactile), `Eyebrow` (+ live dot). Exported from ui barrel.
- **Homepage rebuilt** — new conversion order: Hero → TrustBar → Problem → Manifesto(pillars) → HowItWorks → MoneyTransparency → Pilot → CTA. Stats + crypto-jargon cut from homepage.
  - Hero: asymmetric split, light mesh, gradient accent, `ConsensusVisual` glass live-vote card, RippleButton→WhatsApp.
  - TrustBar (new), Problem (new, noise→signal), MoneyTransparency (new, ₪2+₪1 proportional split).
  - Manifesto / HowItWorks(`id="how"`) / Pilot / CTA(`id="join"`, newsletter form intact) restyled luminous.
- **Global shell**: Header (liquid-glass sticky, new nav, gradient-pill pilot CTA, glass mobile menu) + Footer (deep-ink anchor band, brand-gradient rule) restyled.
- Verified via Playwright screenshots (desktop 1440 + mobile 390) — `.redesign/scan-*.png`.

## DONE (session 2) — gates green (tsc + lint pass), all routes HTTP 200
- **Inner pages** rebuilt to luminous + CONTENT_STRATEGY §5 copy (logic/data preserved, mock fallback intact):
  votes (list/[id]/create/archive — glass consensus cards, composed empty state), about (AboutHero/Mission/Technology/Team), economics (hero/flywheel/dashboard/FAQ/CTA — the only page keeping crypto/Issue-Coin depth), pricing (₪3 split + ₪50 cards), treasury (fintech transparency board, honest "בקרוב" empty state), download (coming-soon stores + WhatsApp primary + phone mockup), verification (privacy reassurance, auth flow preserved), support (human help, WhatsApp + faq paths), faq (glass accordion + added objection-busting Q&A), legal (shared LegalPage → luminous reading layout + sticky TOC).
- Header auth UI: **confirmed removed** (user decision) — pre-launch marketing header.
- Verified via Playwright screenshots `.redesign/page-*.png`.
- Note: local dev shows data-fetch fails to `placeholder.supabase.co` (no real creds) — components fall back to mock; NOT a redesign issue.

## DONE (session 3) — assets + polish
- **Higgsfield OG artwork** generated (GPT Image 2): luminous "voices→one beam→city of light", text-free → `.redesign/hf-artwork.png`. Composed into a branded 1200×630 social card (Hebrew wordmark + gradient tagline + live-pilot pills) via headless render (`.redesign/og.html`) → installed at `apps/web/public/og-image.png`. Old square OG backed up to `.redesign/og-image-OLD.png`. layout.tsx OG dims fixed 600×600→1200×630 + new alt.
- **StoryScene fix**: root cause was the grain overlay `<rect>` (no fill → black) at opacity 0.5 = 50% dark veil over every HowItWorks scene. Set fill=none + opacity 0.1 → all 4 scenes now bright/luminous. Pure SVG kept (sharper than any raster).
- Reusable `hf-artwork.png` also available for hero backdrop / empty-state art if wanted later.
- **Empty-state art wired**: optimized artwork → `apps/web/public/images/consensus-aura.png` (1600×904). Added as a subtle edge-weighted background (radial mask keeps center clear for text) to the votes pre-launch EmptyState (`VotesList`) and the treasury "בקרוב" board (`TreasuryDashboard`). Verified render via forced-empty screenshot. Note: both empty states only show when data is truly empty — in local dev the mock fallback usually populates, so they appear on zero-result filters / production-empty.

## OPEN / NEXT SESSIONS
- [ ] Auth/onboarding screens (sign-in/up, onboarding, dashboard) — lower priority, behind auth.
- [ ] Optional: real Supabase/Paddle keys for live e2e (handover item, not redesign).

## Notes
- Hebrew-only, RTL, logical props. No emojis (SVG icons). reduced-motion handled everywhere.
- Dev: `cd apps/web && node_modules/.bin/next dev -p 3777`. Never `next build` while dev runs.
- Not committed (per user git rules — branch first, no AI co-author).
