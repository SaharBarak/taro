# Taruu — Brutalist Tech-Press Design System (v2)

> ✅ **LOCKED — APPROVED ART DIRECTION (2026-06-14).** This is the canonical Taruu design system. Luminous Civic (v1, `DESIGN_SYSTEM.md`) is **deprecated** — kept only until inner pages migrate off it. Do NOT re-explore alternative directions. All new/changed surfaces use `--np-*` tokens, the press primitives (`components/press/`), and this contract. The homepage is the reference implementation.

_(v2, replaces Luminous Civic)_

Art direction: **Brutalist tech-press**. A newspaper you participate in. Newsprint + ink + pillarbox red, heavy grotesque headlines, monospace data/control surfaces, thick black rules, halftone + paper grain. Desktop-first, wide. Mobile = minimized version.

Brand idea: **תַּרְאוּ — the public ledger as a living newspaper.** Headlines are the issues; the reader doesn't just read, they *vote inside the page*. Control surfaces (ballots, tallies, buttons) are first-class, on the homepage, styled as press furniture.

Stack: Next.js + CSS Modules + tokens. RTL Hebrew. Replace `--lc-*` usage on rebuilt surfaces with `--np-*`. Keep `--lc-*` defined (legacy, inner pages until migrated).

---

## 1. Color (newsprint + ink + red)
```
--np-paper:      #F4F1E8;  /* newsprint cream — page base */
--np-paper-2:    #ECE7D8;  /* deeper band / alternating section */
--np-paper-box:  #FBFAF4;  /* raised box / card fill (whiter) */
--np-ink:        #14110E;  /* near-black ink — text, rules */
--np-ink-soft:   #3B362E;
--np-ink-faint:  #6E675A;  /* meta / mono labels */
--np-red:        #E0301E;  /* pillarbox red — accent, kickers, tallies */
--np-red-dark:   #B0220F;  /* hover/active red */
--np-red-ink:    #7A1607;  /* deep red on cream for text */
--np-paper-edge: rgba(20,17,14,0.12); /* hairline */
```
Rules: red is the ONE accent — kickers, tally bars, the primary participate action, breaking-news ticker, drop-cap, underlines. Never gradient. Ink for type + rules. Cream everywhere; whiter boxes for elevated furniture. Two-color print discipline (ink + red on cream); no third hue.

## 2. Typography
- **Headlines (display):** `--np-font-display` = Heebo 900 (black), `letter-spacing: -0.02em`, `line-height: 0.95`, often UPPERCASE-feel via weight + tight tracking. Huge. This is the grotesque voice.
- **Sub-deck / standfirst:** Heebo 600, 1.2–1.4rem, ink-soft.
- **Body / editorial columns:** Frank Ruhl Libre (serif, already loaded) for long-read column texture, OR Heebo 400 for UI copy. Use serif for editorial prose, sans for UI.
- **Mono (data + control surfaces):** `--np-font-mono` = 'JetBrains Mono' (ADD) for dateline, issue no., tallies, percentages, kickers, byline meta, vote counts. Hebrew meta uses Heebo 500 tracked `+0.06em` uppercase-ish.
- **Kicker:** mono, `--text-xs`/`sm`, `letter-spacing:.12em`, uppercase, **red**, often with a ▍ or ■ red tick prefix.
- **Drop cap:** first letter of an editorial block, Heebo 900, red or ink, ~3 lines tall, float inline-start.
Scale: reuse existing type ramp; push display to `--text-7xl`/`8xl`/`9xl` on wide desktop.

## 3. Texture (code-based, crisp)
- **Paper grain:** existing body SVG-noise overlay, retuned (opacity ~0.05, multiply) over cream.
- **Halftone:** CSS `radial-gradient(circle, ink 1px, transparent 1.6px) 0 0 / 6px 6px` (or red dots) — used as: section fills behind boxes, the masthead ear, dividers, hero accent panels, hover reveals. Provide `.np-halftone` (ink) + `.np-halftone-red`.
- **Rules:** ink borders at 1px (hairline), 2px (standard), 4px (heavy), 6px (masthead). Double-rule = two stacked borders w/ gap. `.np-rule`, `.np-rule-heavy`, `.np-rule-double`.
- **Red block / ink block:** solid fill furniture for callouts + the participate CTA.

## 4. Layout (desktop-first, wide)
- Container: `max-width: 1600px`; gutters `clamp(24px, 4vw, 64px)`. Editorial **12-col grid** with visible **column rules** (vertical ink hairlines between columns) on wide.
- Masthead (header): publication wordmark BIG center/inline-start, flanked by mono "ears" (dateline + edition + issue no. + live ticker). Heavy 4–6px rule under. Nav = section labels (חדשות/הצבעות/כלכלה…) in a thin sub-bar, mono/grotesque, with the **participate CTA** as a red block at the inline-start corner.
- Front page: a dominant lead headline (huge), a multi-deck, a lead participation surface (the live ballot) boxed on the inline-end, secondary stories in columns below, a breaking-news **ticker** marquee strip.
- Sections as **boxed editorial blocks** with kicker + rule + headline + body; sidebars/pull-quotes in red or ink boxes.
- **Mobile (minimized):** single column, masthead shrinks to wordmark + ticker, column rules drop, type scales down, participation widget stays but compact, ornament reduced. `< 768px` strict single col.

## 5. Control surfaces — the "participate" brand (first-class)
These ARE the brand. Hard-edged, mechanical, mono.
- **NewsButton:** zero/2px radius (hard corners), ink or red solid block, bold label (mono or Heebo 800), tight padding. Hover = **invert** (ink→paper / red→ink) with a hard 0ms-ish snap or 120ms. Active = press translateY(1px). Variants: `solid-red` (primary participate), `solid-ink`, `outline-ink`.
- **VoteWidget (the live ballot):** boxed press furniture — kicker "הצבעה חיה / LIVE", question as a bold grotesque headline, options each a row: label + **red horizontal tally bar** (hard rectangle, animates width) + mono `72%` + mono vote count; a bold [ הצביעו · VOTE ] red block; footer meta in mono (`מאומת · חתום בבלוקצ׳יין · 1,247 קולות`). This is on the homepage as a *control surface* (styled + interactive bars; not the full multi-step flow).
- **Inputs:** hard-edge box, 2px ink border, mono text, label above in mono kicker; focus = red 2px border (no glow).
- **Segmented / tabs:** boxed row, ink rules between, active = ink/red fill inverted.
- **Tally bar:** rectangle, `--np-red` fill on `--np-paper-2` track, hairline ink border, width animates on view; percentage in mono overlaps end.
- **Ticker:** full-width strip, ink bg / paper text (or red), mono uppercase, marquee scroll, "● LIVE" + rotating issue lines.

## 6. Motion (editorial/mechanical, not soft)
- Snappier than luminous: durations 80–220ms, ease `cubic-bezier(0.2,0,0,1)` (hard-out) or near-linear. No bounce/glow.
- Patterns: tally bars **fill on view**; counters **tick up** (mono); red underline **wipes** in under links/kickers; ticker **marquee**; headline **type/stamp-in** (clip reveal, no blur); hover **invert** on buttons & rows; halftone panels **shift** subtly. Drop-in of boxes = hard clip reveal (inset wipe), not fade-up.
- Reduced-motion: bars/counters jump to final, marquee static, no perpetual.

## 7. Component architecture (rebuild targets)
New primitives (`components/ui` or `components/press`):
- `Masthead` (header) + `Ticker` + `EditionMeta` (dateline/issue/edition mono)
- `Kicker`, `Rule` (variants), `DropCap`, `ColumnGrid`
- `NewsButton` (replaces RippleButton on rebuilt surfaces)
- `VoteWidget` / `TallyBar` (the participation control surface)
- `PressInput`, `Segmented`
- `Halftone` panel util
Rebuild homepage sections as front-page furniture: Masthead → Ticker → Lead (headline + standfirst + lead VoteWidget) → "How you participate" control-surface showcase → editorial proof/manifesto boxes → pilot dispatch (Kiryat Tivon, dateline) → subscribe (press-style). Footer = colophon (masthead repeat, imprint, rules).
- Keep functionality/data; restyle to press furniture. No emojis (use ■ ▍ ● ✕ ✓ as glyphs or SVG). RTL logical props. Desktop-first; mobile minimized fallbacks mandatory.

## 8. Voice carryover
Hebrew copy stays from CONTENT_STRATEGY.md, re-set as headlines/kickers/decks. North-star participate action carries (join pilot / vote). The home shows participation *surfaces*, not the whole flow.

This file is the build contract for v2. Implement tokens+fonts+utilities first, then press primitives, then rebuild front page.
