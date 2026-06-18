# Taruu — Luminous Civic Design System (v1)

Art direction: **Luminous Civic / Bright**. Light, optimistic, trustworthy, alive.
Stack: Next.js + CSS Modules + `tokens.css` (NOT Tailwind). Framer Motion for choreography.
RTL Hebrew, fonts Heebo (display) + Assistant (UI/body). Mobile-first.

Dials: VARIANCE 7 · MOTION 6 · DENSITY 4. Colorful brand is intentional (user brief overrides the skill's mono-accent default) — but disciplined per the rules below so it reads premium, not slop.

---

## 1. Color & gradient usage

Base is **warm light**, not stark white. Brand triad (blue→green→purple) is a *signature gradient*, used sparingly as a through-line — never as the fill of every element.

New semantic tokens to ADD to `tokens.css` (`:root`):
```
/* Luminous surfaces — warm light base, not #fff everywhere */
--lc-canvas:        #FBFBFD;   /* page background, faint cool-warm white */
--lc-canvas-tint:   #F4F6FB;   /* alternating section band */
--lc-surface:       #FFFFFF;   /* raised glass/card fill base */
--lc-ink:           #0E1525;   /* near-black ink (NOT pure black) */
--lc-ink-soft:      #3A4358;   /* secondary text */
--lc-ink-faint:     #6B7488;   /* muted/meta */

/* Brand signature gradient (the one hero through-line) */
--lc-grad-brand:    linear-gradient(110deg, #2563EB 0%, #10B981 52%, #8B5CF6 100%);
--lc-grad-brand-soft: linear-gradient(110deg, #3B82F6 0%, #34D399 55%, #A78BFA 100%);
/* Per-chapter accent gradients (story uses ONE accent per chapter) */
--lc-grad-blue:     linear-gradient(135deg, #3B82F6, #2563EB);
--lc-grad-green:    linear-gradient(135deg, #34D399, #059669);
--lc-grad-purple:   linear-gradient(135deg, #A78BFA, #7C3AED);
--lc-grad-amber:    linear-gradient(135deg, #FBBF24, #F59E0B);

/* Tinted soft glows — NOT harsh neon. Wide, low-opacity, hue-matched */
--lc-glow-blue:   0 12px 40px -12px rgba(37,99,235,0.35);
--lc-glow-green:  0 12px 40px -12px rgba(16,185,129,0.35);
--lc-glow-purple: 0 12px 40px -12px rgba(139,92,246,0.35);
--lc-glow-brand:  0 18px 50px -16px rgba(37,99,235,0.28), 0 18px 60px -20px rgba(139,92,246,0.22);

/* Glass */
--lc-glass-fill:   rgba(255,255,255,0.62);
--lc-glass-stroke: rgba(255,255,255,0.7);
--lc-glass-edge:   rgba(14,21,37,0.06);   /* hairline outer for definition on light bg */
--lc-glass-blur:   18px;
```

**Rules**
- Gradient text: allowed but RARE — only the hero accent line and one number/stat per section. Everywhere else, color via solid ink + one accent. (Skill bans excessive gradient text; we keep it to ≤1 per viewport.)
- Each story chapter / pillar owns ONE accent (blue/green/purple/amber) — never two accents fighting in one card.
- Glows are **tinted soft shadows** (the `--lc-glow-*` recipes), never `box-shadow: 0 0 20px neon`. Glow appears on hover/active and on the primary CTA at rest only.
- Backgrounds: page = `--lc-canvas`; alternate sections with `--lc-canvas-tint` for rhythm. Mesh-gradient blobs (existing ShaderBackground, recolored light) live behind hero + CTA only, low opacity.

---

## 2. Glass + glow recipes (Liquid Glass)

Glass card (`.glass`):
```
background: var(--lc-glass-fill);
backdrop-filter: blur(var(--lc-glass-blur)) saturate(140%);
-webkit-backdrop-filter: blur(var(--lc-glass-blur)) saturate(140%);
border: 1px solid var(--lc-glass-edge);
box-shadow:
  inset 0 1px 0 var(--lc-glass-stroke),      /* top refraction edge */
  0 1px 2px rgba(14,21,37,0.04),
  0 20px 40px -24px rgba(14,21,37,0.18);      /* diffusion shadow, tinted to ink */
border-radius: var(--radius-3xl);              /* 24px; hero/feature cards use 2.5rem */
```
On hover (interactive glass): add the hue-matched `--lc-glow-*`, lift `translateY(-3px)`, 220ms spring-ish ease.

Spotlight-border card (premium feature tiles): a `::before` radial-gradient that follows cursor (motion values, no React state) illuminating the 1px border. Falls back to static gradient border under reduced motion.

---

## 3. Typography

Fonts stay Heebo (display/headlines) + Assistant (UI/body) — Hebrew-required, do not swap to Geist/etc.
Scale from `tokens.css` (1.2 minor third). Usage:
- **Display H1 (hero):** `--text-6xl`→`--text-7xl` desktop, `--text-4xl`→`--text-5xl` mobile. Weight 800–900. `letter-spacing: var(--tracking-tight)`, `line-height: var(--leading-tight)`. NOT a screaming oversized wall — control hierarchy with weight + the single gradient accent line.
- **Section H2:** `--text-3xl`→`--text-4xl`, weight 700–800.
- **Eyebrow/label:** `--text-sm`, weight 700, `--tracking-wider`, uppercase-ish (Hebrew: letterspaced + accent color), often with a small gradient dot/line prefix.
- **Body:** `--text-lg` lead paragraphs, `--text-base` standard. Color `--lc-ink-soft`. Max measure ~58–64ch (Hebrew reads a touch wider).
- **Numbers / stats:** large, weight 800, may use gradient fill (counts as the one-per-section gradient).

RTL: all directional spacing via logical properties (`margin-inline-start`, `padding-inline`, `inset-inline`), never raw left/right. Icons/arrows mirror.

---

## 4. Spacing & layout rhythm

- Section vertical padding: `clamp(var(--space-20), 12vw, var(--space-40))` — generous, gallery-adjacent (DENSITY 4).
- Container: `max-width: var(--container-7xl)` (1280px), `margin-inline: auto`, `padding-inline: clamp(var(--space-4), 5vw, var(--space-8))`.
- **Grid over flex-math** for all multi-col structures. `grid; gap: var(--space-6/8)`.
- **Anti-center + anti-3-card (VARIANCE 7):**
  - Hero = asymmetric split (content inline-start, living visual inline-end), collapses to single column < md.
  - Feature/value sections = 2-col zig-zag or bento, NOT three equal cards in a row.
  - Use deliberate asymmetric whitespace and one offset/overlap per section.
- **Mobile-first:** every asymmetric layout falls back to strict single column `< 768px` (`width:100%`, `padding-inline: var(--space-4)`). No horizontal scroll except intentional marquee/carousel.
- Full-height hero uses `min-height: 100dvh` (never `100vh`).
- Radii: cards `--radius-3xl` (24px); hero/marquee feature tiles `2.5rem`; pills/buttons `--radius-full`; inputs `--radius-xl`.

---

## 5. Elevation

Tinted-to-ink shadows only (no flat gray). Three levels:
- **e1 (raised):** `0 1px 2px rgba(14,21,37,.04), 0 8px 24px -16px rgba(14,21,37,.12)`
- **e2 (card/glass):** glass recipe above.
- **e3 (floating/CTA):** glass + hue glow.
Cards used ONLY where elevation conveys hierarchy; otherwise group with whitespace / `border-block` hairlines (`--lc-glass-edge`).

---

## 6. Motion principles (MOTION 6)

Easing: brand cubic `cubic-bezier(0.22, 1, 0.36, 1)` (swift-in slow-out) for entrances; spring `{stiffness:120, damping:18, mass:0.6}` for interactive/magnetic.
Durations: micro 120–180ms, standard 280–360ms, reveal 500–700ms. Never animate left/top/width/height — only `transform`/`opacity`/`filter`.

Patterns:
- **Entrance:** staggered reveals (letters 0.03s, words 0.07s, cards 0.10–0.12s). `whileInView once`, viewport margin -60px.
- **Magnetic CTA:** existing MagneticButton (motion values only), touch/reduced-motion off.
- **Ripple click:** color wave from click coords on primary buttons (the requested "ripple color"). Pure CSS/MV, cleaned up.
- **Spotlight/tilt cards:** cursor-tracked, motion values.
- **Scroll progress rails:** the story timeline draws as you scroll (existing pattern, recolor per-chapter gradient).
- **Perpetual life (subtle):** hero mesh drift, one breathing status dot ("פיילוט חי" live indicator), gentle float on hero visual. All isolated in memoized client leaves, paused off-screen / reduced-motion.
- **Reduced motion:** every effect degrades to a clean static/opacity-only state.

Forbidden: linear easing on interactives, custom mouse cursor, `window.addEventListener('scroll')` (use Framer hooks), grain on scrolling containers, emojis (use Phosphor/Radix or inline SVG — note: many current sections use emoji 📍📅💰📈 → REPLACE with SVG icons).

---

## 7. Component architecture rules

- Server Components render static layout; every interactive/animated piece is an isolated `'use client'` leaf. Perpetual loops memoized + microscopic.
- New shared primitives to build under `components/ui` / `components/effects`:
  - `GlassCard` (variant: static | interactive | spotlight)
  - `GradientText` (brand | blue | green | purple | amber) — guard usage ≤1/viewport
  - `RippleButton` (extends Button; color ripple + tactile `:active scale .98 / translateY 1px`)
  - `GlowPill` / `LiveDot` (breathing indicator)
  - `TiltCard` / `SpotlightCard`
  - `Eyebrow` (dot/line + letterspaced label)
  - recolor `ShaderBackground` → light luminous mesh variant.
- Keep existing AnimatedLetters/Words/FadeInUp, MagneticButton, HeroParallax — restyle, don't rebuild.
- Interaction states MANDATORY everywhere: hover, `:active` tactile, focus-visible ring (`--focus-ring`), loading (skeleton shimmer not spinners), empty (composed), error (inline). Forms: label above input, helper/error below, `gap: var(--space-2)`.
- All numbers/placeholder data: organic, never `99.99%`/`12,500` round slop. Pilot honesty: show real small/"בקרוב" states beautifully, don't fake metrics.

---

## 8. Brand motifs (the "enchanting" through-line)

- **The consensus line:** a single brand-gradient stroke that recurs — under the hero accent word, as the story timeline rail, as section divider, as the underline that draws on link hover. One visual idea, repeated → cohesion.
- **Verified glow:** anything "מאומת" (verified) carries a soft green inner glow + check.
- **City→nation scale:** subtle motif of dots coalescing (one → many), usable in hero visual + section transitions.
- **Light mesh aura** behind hero & final CTA only.

This file is the build contract. Implement tokens first (§1–2), then primitives (§7), then sections per CONTENT_STRATEGY.md order.
