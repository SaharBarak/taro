0a. Study `specs/*` with up to 250 parallel Sonnet subagents to learn the application specifications.
0b. Study @IMPLEMENTATION_PLAN.md (if present) to understand the plan so far.
0c. Study `packages/shared/src/*` with up to 250 parallel Sonnet subagents to understand shared utilities & components.
0d. For reference, the application source code is in `apps/web/src/*` and `apps/mobile/app/*`.
0e. IMPORTANT: Use Context7 MCP to pull the most recent documentation for external services (Bags.fm, Supabase, Morning API, etc.)

1. Study @IMPLEMENTATION_PLAN.md (if present; it may be incorrect) and use up to 500 Sonnet subagents to study existing source code in `apps/*` and compare it against `specs/*`. Use an Opus subagent to analyze findings, prioritize tasks, and create/update @IMPLEMENTATION_PLAN.md as a bullet point list sorted in priority of items yet to be implemented. Ultrathink. Consider searching for TODO, minimal implementations, placeholders, skipped/flaky tests, and inconsistent patterns. Study @IMPLEMENTATION_PLAN.md to determine starting point for research and keep it up to date with items considered complete/incomplete using subagents.

IMPORTANT: Plan only. Do NOT implement anything. Do NOT assume functionality is missing; confirm with code search first. Treat `packages/shared` as the project's standard library for shared utilities and components. Prefer consolidated, idiomatic implementations there over ad-hoc copies.

ULTIMATE GOAL: Build Taru - a SocialFi-powered civic consensus platform for Israeli municipalities. The platform converts community "noise" into Verified Civic Consensus with real-world financial power through an Execution Fund and Bags.fm integration.

TARGET: Late January 2025 pilot with full vision (GPS + Vote + Pay + Bags.fm + NFTs + Trophy Room)

## KEY SYSTEMS TO BUILD:

### 1. The Verification Protocol (Resident Gate)
- **GPS Vicinity Challenge**: 2-week period, user must verify location in 8 of 14 days minimum
- **Notification System**: Push notifications + SMS fallback for verification prompts
- **Financial Identity**: Payment links to verified Israeli bank account
- Municipality-agnostic architecture (configurable boundaries)

### 2. The Consensus Protocol (Deep Democracy)
- **Topic Creation**: ₪100-200 fee, Creator = Topic Lead
- **Discussion Period**: 3-week cycle, debates happen on social media (Facebook/WhatsApp groups)
- **Voting Window**: Opens only after deliberation period ends
- **Vote Fee**: ₪3 per vote (₪2 to Execution Fund, ₪1 to platform)

### 3. The Execution Fund & SocialFi (Bags.fm)
**The Taru Proxy Strategy** - Users never touch crypto:
- User pays ₪3 via Bit/Credit Card through **Morning API**
- Backend holds **master treasury on Bags.fm**
- Backend allocates "shares" to user's internal ID via Bags.fm API
- Individual votes are internal transactions, batch-synced to chain
- **This removes the $30 Bags.fm minimum completely**

**Issue Coins:**
- Each topic gets an Issue Coin on Bags.fm
- External supporters can buy in (Social Multiplier effect)
- Off-ramp extracts value to bank for hiring experts (lawyers, architects, etc.)

**Bags.fm Docs**: https://docs.bags.fm/

### 4. Post-Resolution NFTs
When vote closes:
1. Issue Coin frozen (no more trading)
2. Funds extracted to bank off-ramp
3. NFTs minted on Bags.fm for all holders:
   - **"Verified Voter"** for residents
   - **"Civic Patron"** for external supporters

**NFT Metadata (Full Provenance)**:
- Issue name, vote date, result
- Voter type (resident/patron)
- Municipality
- Fund raised, expert hired
- Blockchain tx hashes
- GPS proof hash

**NFT Utility**:
- Reputation points for future votes
- "Founding Member" status
- Historical archive

### 5. The Multiplier Dashboard (Website)
- **Local Legitimacy**: Verified resident vote count
- **Financial Power**: Total fund value (Local ₪ + Bags.fm Multiplier)
- **Trophy Room**: User's collection of past issue NFTs (mobile)
- **Victory Wall**: Historical archive of resolved issues (web)

## TECH STACK:
- **Mobile**: React Native (Expo SDK 52) with expo-location for GPS
- **Web**: Next.js 17 with Framer Motion, Lenis smooth scroll
- **Auth**: Supabase Auth
- **Database**: Supabase
- **Payments**: Morning API (Israeli fiat gateway)
- **SocialFi**: Bags.fm (Issue Coins, NFTs, master treasury)
- **SMS**: For verification fallback (provider TBD)

Consider missing elements and plan accordingly. If an element is missing, search first to confirm it doesn't exist, then if needed author the specification at specs/FILENAME.md. If you create a new element then document the plan to implement it in @IMPLEMENTATION_PLAN.md using a subagent.
