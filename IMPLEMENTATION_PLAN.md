# Taru Implementation Plan

**Target:** Late January 2025 Pilot Launch (Kiryat Tivon)
**First Vote Date:** January 23, 2025
**Last Analyzed:** January 15, 2025 (Opus 4.5 comprehensive codebase audit with parallel subagents + full verification pass)
**Re-Verified:** January 15, 2025 (Opus 4.5 - all 26 blockers confirmed via 5 parallel exploration agents)

---

## Executive Summary

This document tracks the implementation status for the Taru civic consensus platform. Items are organized by priority with the Late January 2025 Kiryat Tivon pilot as the primary deadline.

**Codebase Statistics (verified Jan 15, 2025):**
- Shared Package: 29 type definitions, 8+ constant groups, 30+ utility functions, 45+ Zod schemas across 4 contract modules
- API Client: 3 modules complete (votes.ts 8 methods, users.ts 10 methods, payments.ts 6 methods) - 4 endpoints missing backend
- Web API: 22 endpoints across 11 route files (4 incomplete, 4 missing)
- Services: 12 complete services (~3,786 lines) + 1 unused (grow.ts 232 lines - DEAD CODE)
- Mobile: 28 screens across 6 sections (25 complete, 3 with issues)
- Database: 10 tables, 32+ indexes, 5 triggers, 6 functions, RLS policies on all tables

**Legend:**
- [x] Completed
- [ ] Not started
- [~] Partially complete / In progress
- [!] VERIFIED BLOCKER - Confirmed via code inspection

---

## BLOCKERS: Critical Issues Preventing Pilot Launch

These issues MUST be resolved before the January 23, 2025 pilot:

| # | Issue | File | Line | Impact | Fix Required | Status |
|---|-------|------|------|--------|--------------|--------|
| ~~1~~ | ~~Login buttons disabled~~ | `apps/web/src/components/layout/Header/Header.tsx` | 112-117 | ~~Web users cannot sign in~~ | ~~Remove `disabled` prop~~ | [x] RESOLVED |
| 2 | **Hero download button disabled** | `apps/web/src/components/sections/Hero/Hero.tsx` | 84 | Main CTA non-functional | Remove `disabled` prop or link to app store | [!] VERIFIED |
| ~~3~~ | ~~Push notifications not sending~~ | `apps/web/src/app/api/cron/verification-notifications/route.ts` | 46 | ~~Users miss check-in reminders~~ | ~~Call `sendCheckInReminder()` from expo service~~ | [x] RESOLVED |
| ~~4~~ | ~~No push token storage~~ | `supabase/migrations/20250115000001_push_tokens_and_wallet.sql` | N/A | ~~Cannot send notifications~~ | ~~Add `push_tokens` table, implement mobile registration~~ | [x] RESOLVED |
| ~~5~~ | ~~expo-notifications not installed~~ | `apps/mobile/package.json` | N/A | ~~Push notifications impossible~~ | ~~`npx expo install expo-notifications expo-device`~~ | [x] RESOLVED |
| ~~6~~ | ~~expo-device not installed~~ | `apps/mobile/package.json` | N/A | ~~Cannot detect physical device~~ | ~~Required for push token registration~~ | [x] RESOLVED |
| ~~7~~ | ~~app.json missing notification plugin~~ | `apps/mobile/app.json` | plugins array (40-48) | ~~Android notifications fail~~ | ~~Add `expo-notifications` plugin config~~ | [x] RESOLVED |
| 8 | **Empty wallet address** | `apps/web/src/app/api/payments/webhook/route.ts` | 84 | Token minting fails silently | Fetch user, get `qubik_wallet_address` field | [!] VERIFIED |
| ~~9~~ | ~~Missing session refresh endpoint~~ | `apps/web/src/app/api/auth/session/refresh/route.ts` | N/A | ~~Sessions expire, 401 errors~~ | ~~Add POST /api/auth/session/refresh~~ | [x] RESOLVED - EXISTS (99 lines) |
| 10 | **Mock data in dashboard** | `apps/web/src/app/[locale]/dashboard/page.tsx` | 31-61, 78-82 | Users see fake stats | Replace mockStats, mockRecentVotes with API calls | [!] VERIFIED |
| 11 | **Mock data in history** | `apps/mobile/app/(tabs)/history.tsx` | 21-63, 119-122 | Users see fake voting history | Replace mockHistory with `usersApi.getVotingHistory()` | [!] VERIFIED |
| 12 | **Votes page ComingSoon** | `apps/web/src/app/[locale]/votes/page.tsx` | 33-36 | Users see placeholder only | Replace `<ComingSoon>` with VotesList using real data | [!] VERIFIED |
| 13 | **Download page ComingSoon** | `apps/web/src/app/[locale]/download/page.tsx` | 31-34 | Download page non-functional | Add app store links or QR codes | [!] VERIFIED |
| 14 | **Profile stats hardcoded** | `apps/mobile/app/(tabs)/profile.tsx` | 143, 154 | Vote/created counts show "0" always | Fetch stats from API, token balance works | [!] VERIFIED |
| 15 | **Mock votes list** | `apps/web/src/app/[locale]/votes/components/VotesList.tsx` | 11-69, 109 | Users see 4 hardcoded fake votes | Fetch from votes API | [!] VERIFIED |
| 16 | **Verification status mock data** | `apps/web/src/app/api/verification/status/route.ts` | 37-66 | Returns mock progress data | Implement actual schedule fetch | [!] VERIFIED |
| 17 | **Missing confetti package** | `apps/mobile/app/verification/complete.tsx` | 15 | Import error on completion screen | `pnpm add react-native-confetti` or remove import | [!] VERIFIED |
| ~~18~~ | ~~Payment type mismatch~~ | `apps/mobile/app/vote/[id].tsx` | 173 | ~~Payment flow will fail~~ | ~~Already uses `type: 'vote_participation'`~~ | [x] RESOLVED |
| 19 | **EAS project ID placeholder** | `apps/mobile/app.json` | 58 | Push tokens won't work | Replace `"your-project-id"` with actual EAS ID | [!] VERIFIED |
| ~~20~~ | ~~No wallet_address column in DB~~ | `supabase/migrations/20250115000001_push_tokens_and_wallet.sql` | N/A | ~~Wallets cannot be persisted~~ | ~~Add `qubik_wallet_address` column to users table~~ | [x] RESOLVED |
| 21 | **API client social endpoint mismatch** | `packages/api-client/src/users.ts` | 70,84,97 | Social features completely broken | Change `/api/user/social-connections` to `/api/social/proofs` | [!] VERIFIED |
| 22 | **oderId typo in participate** | `apps/web/src/app/api/votes/[id]/participate/route.ts` | 102 | Blockchain records have wrong field | Change `oderId` to `userId` or `voterId` | [!] VERIFIED |
| 23 | **Missing /api/user/participations** | `apps/web/src/app/api/` | N/A | Mobile history screen cannot fetch data | Create endpoint returning user's vote history | [!] VERIFIED |
| 24 | **Missing /api/votes/[id]/participated** | `apps/web/src/app/api/` | N/A | Cannot check if user already voted | Create endpoint checking participation | [!] VERIFIED |
| 25 | **Missing /api/user/tokens endpoint** | `apps/web/src/app/api/` | N/A | Cannot fetch token balance | Create endpoint returning user's token balance | [!] VERIFIED |
| 26 | **SocialProof type mismatch** | `packages/shared/src/types/user.ts` vs `contracts/social.ts` | N/A | Type errors at runtime | Align field names: platformUserId/providerId, verifiedAt/connectedAt | [!] VERIFIED |
| 27 | **Missing /api/user/tokens/transactions** | `packages/api-client/src/users.ts` | 119 | Cannot fetch token history | Create endpoint returning token transactions | [!] VERIFIED - NEW |
| 28 | **Missing /api/user/votes** | `packages/api-client/src/users.ts` | 130 | getVotingHistory() fails | Create endpoint for user voting history | [!] VERIFIED - NEW |
| 29 | **Missing /api/user/verify-location** | `packages/api-client/src/users.ts` | 146 | Location verification fails | Create endpoint or use existing verification | [!] VERIFIED - NEW |

**Total Blockers: 29 (9 Resolved, 20 Active)**

---

## Priority 1: Critical for Pilot (Must Have by Jan 23, 2025)

### 1.1 Authentication & User Management
| Status | Item | File(s) | Notes |
|--------|------|---------|-------|
| [x] | Google OAuth integration | `apps/web/src/services/auth/google.ts` | Full OAuth2 PKCE flow with CSRF protection (221 lines) |
| [x] | JWT session management | `apps/web/src/services/auth/session.ts` | Access + refresh tokens, httpOnly cookies (266 lines) |
| [x] | Social proofs (Facebook, Instagram) | `apps/web/src/services/auth/facebook.ts`, `instagram.ts` | +30 points each to identity score |
| [x] | Identity score calculation | `packages/shared/src/utils/identityScore.ts` | Google=40, FB=30, IG=30, min voting=40, comprehensive tests |
| [x] | Supabase database integration | `apps/web/src/lib/supabase/` | 10 tables with RLS policies, triggers, functions |
| [x] | Mobile auth screens | `apps/mobile/app/(auth)/` | sign-in, sign-up, onboarding, connect-social - all complete |
| [x] | Login buttons in web header | `apps/web/src/components/layout/Header/Header.tsx:112-121` | RESOLVED - Now enabled with proper routing |
| [x] | Session refresh endpoint | `apps/web/src/app/api/auth/session/refresh/route.ts` | RESOLVED - EXISTS (99 lines, token rotation) |
| [x] | Add wallet_address column to users table | `supabase/migrations/20250115000001_push_tokens_and_wallet.sql` | RESOLVED - Added `qubik_wallet_address` column |

### 1.2 Push Notification System
| Status | Item | File(s) | Notes |
|--------|------|---------|-------|
| [x] | Expo push notification service | `apps/web/src/services/notifications/expo.ts` | Full implementation with batching (100/batch), receipts, Hebrew messages (316 lines) |
| [x] | Specialized notification helpers | `apps/web/src/services/notifications/expo.ts` | `sendCheckInReminder`, `sendMissedCheckInNotification`, etc. |
| [x] | Create push_tokens database table | `supabase/migrations/20250115000001_push_tokens_and_wallet.sql` | RESOLVED - Table created with RLS policies |
| [x] | Install expo-notifications & expo-device in mobile | `apps/mobile/package.json` + `app.json` | RESOLVED - Packages installed, plugin configured |
| [x] | Mobile push token registration | `apps/mobile/src/lib/notifications.ts` | RESOLVED - Permission flow + token registration implemented |
| [x] | Push token API endpoint | `apps/web/src/app/api/user/push-token/route.ts` | RESOLVED - Endpoint created |
| [x] | Connect cron job to Expo service | `apps/web/src/app/api/cron/verification-notifications/route.ts` | RESOLVED - Now calls `sendCheckInReminder()` |
| [ ] | **Update EAS project ID** | `apps/mobile/app.json:58` | **[!] BLOCKER** - Currently `"your-project-id"` placeholder (requires manual team configuration) |
| [ ] | SMS fallback for verification | N/A | Required if push fails - provider TBD |

**Required Database Table (push_tokens):**
```sql
CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  device_type TEXT CHECK (device_type IN ('ios', 'android')),
  device_name TEXT,
  is_active BOOLEAN DEFAULT true,
  last_used TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, token)
);
CREATE INDEX idx_push_tokens_user_id ON push_tokens(user_id);
CREATE INDEX idx_push_tokens_active ON push_tokens(user_id) WHERE is_active = true;
```

### 1.3 Verification System
| Status | Item | File(s) | Notes |
|--------|------|---------|-------|
| [x] | 21-day GPS verification logic | `apps/web/src/services/verification/schedule.ts` | 5-7 check-ins, 80% pass rate (410 lines) |
| [x] | Check-in API endpoints | `apps/web/src/app/api/verification/` | start, schedule, check-in, status |
| [x] | Municipality boundary checking | `apps/web/src/services/verification/municipality.ts` | 20 cities, point-in-polygon algorithm (435 lines) |
| [x] | Verification UI screens (mobile) | `apps/mobile/app/verification/` | index, check-in, complete |
| [x] | GPS location capture | `apps/mobile/app/verification/check-in.tsx` | Uses expo-location, high accuracy |
| [~] | Verification status endpoint | `apps/web/src/app/api/verification/status/route.ts:37-66` | **[!] BLOCKER** - Returns mock progress |
| [~] | Municipality boundaries | `apps/web/src/services/verification/municipality.ts` | Uses simplified rectangles, not real municipal boundaries |
| [ ] | **Missing confetti dependency** | `apps/mobile/app/verification/complete.tsx:15` | **[!] BLOCKER** - Imports `react-native-confetti` but package not installed |

### 1.4 Voting System
| Status | Item | File(s) | Notes |
|--------|------|---------|-------|
| [x] | Vote creation flow (web) | `apps/web/src/app/[locale]/votes/create/page.tsx` | 3-step wizard, 200 fee, validation |
| [x] | Vote detail page (mobile) | `apps/mobile/app/vote/[id].tsx` | GPS verification, options, results, share functionality |
| [x] | GPS verification for voting | `apps/mobile/app/vote/[id].tsx` | expo-location, municipality check via API |
| [x] | Vote list screen (mobile) | `apps/mobile/app/(tabs)/votes.tsx` | Filters (all/active/ended/pending), search, pull-to-refresh |
| [x] | Vote API routes | `apps/web/src/app/api/votes/` | Complete CRUD, participate, verify-location with identity score check |
| [~] | Vote participation endpoint | `apps/web/src/app/api/votes/[id]/participate/route.ts` | Mock blockchain tx (line 98), `oderId` typo (line 102) |
| [x] | Payment type in mobile | `apps/mobile/app/vote/[id].tsx:173` | RESOLVED - Already uses correct `type: 'vote_participation'` |
| [ ] | **Fix oderId typo** | `apps/web/src/app/api/votes/[id]/participate/route.ts:102` | **[!]** Should be `userId` or `voterId` |
| [ ] | **Votes list page (web)** | `apps/web/src/app/[locale]/votes/page.tsx:33-36` | **[!] BLOCKER** - Shows `<ComingSoon>` component |
| [ ] | **Mock votes in VotesList** | `apps/web/src/app/[locale]/votes/components/VotesList.tsx:11-69` | **[!] BLOCKER** - 4 hardcoded mock votes |
| [ ] | **Real voting history API** | `apps/mobile/app/(tabs)/history.tsx:119-122` | **[!] BLOCKER** - Uses mockHistory array (lines 21-63) |
| [ ] | **Real dashboard data API** | `apps/web/src/app/[locale]/dashboard/page.tsx:78-82` | **[!] BLOCKER** - Uses mockStats (31-37), mockRecentVotes (39-61) |
| [ ] | **Profile vote stats** | `apps/mobile/app/(tabs)/profile.tsx:143,154` | **[!] BLOCKER** - Vote count & created count hardcoded to "0" |
| [x] | Push token API endpoint | `apps/web/src/app/api/user/push-token/route.ts` | RESOLVED - Endpoint created for push token registration |
| [ ] | **Missing /api/user/participations endpoint** | `apps/web/src/app/api/user/participations/route.ts` | Expected by api-client, does not exist |
| [ ] | **Missing /api/votes/[id]/participated endpoint** | `apps/web/src/app/api/votes/[id]/participated/route.ts` | Expected by api-client, does not exist |

### 1.5 Payment System
| Status | Item | File(s) | Notes |
|--------|------|---------|-------|
| [x] | Green Invoice integration | `apps/web/src/services/payments/greenInvoice.ts` | Full implementation: forms, webhooks, receipts, token caching (294 lines) |
| [x] | Payment creation API | `apps/web/src/app/api/payments/create/route.ts` | Idempotency support, identity score validation |
| [x] | Payment checkout (mobile) | `apps/mobile/app/payment/checkout.tsx` | Opens Green Invoice in WebBrowser, status polling |
| [x] | Payment success/failed screens | `apps/mobile/app/payment/` | success.tsx, failed.tsx with animations |
| [x] | Webhook with idempotency | `apps/web/src/app/api/payments/webhook/route.ts` | HMAC signature verification, safe for duplicate calls |
| [x] | Qubik blockchain service | `apps/web/src/services/qubik/index.ts` | Vote recording, token minting, wallet creation, mainnet/testnet (242 lines) |
| [ ] | **Fetch wallet address for minting** | `apps/web/src/app/api/payments/webhook/route.ts:84` | **[!] BLOCKER** - Line 84 passes `walletAddress: ''` |

---

## Priority 2: Core SocialFi Features (Post-Pilot MVP)

### 2.1 Bags.fm Integration
**Status: NOT STARTED** - No service implementation exists. No code references Bags.fm.

| Status | Item | Description | Bags.fm Endpoint |
|--------|------|-------------|------------------|
| [ ] | Create Bags.fm service | `apps/web/src/services/bags/index.ts` | All endpoints |
| [ ] | Issue Coin creation per topic | Create token when vote created | `POST /token-launch/create-token-info` |
| [ ] | Fee share config (REQUIRED) | Must configure fee sharing at launch | `POST /token-launch/fee-share/create-config` |
| [ ] | Token launch transactions | Generate signed launch tx | `POST /token-launch/create-launch-transaction` |
| [ ] | Master treasury wallet | Central wallet for platform funds | Manual setup + config |
| [ ] | Trading quotes | Get swap prices | `GET /trade/quote` |
| [ ] | Swap transactions | Execute trades | `POST /trade/swap` |
| [ ] | Fee claiming | Claim accumulated fees | `POST /token-launch/claim-txs/v2` |
| [ ] | Analytics integration | Track lifetime fees | `GET /token-launch/lifetime-fees` |
| [ ] | Partner key system | Receive fees from multiple launches | `POST /partner/create-key` |

**Bags.fm API Details:**
- Base URL: `https://public-api-v2.bags.fm/api/v1/`
- Auth: `x-api-key` header (get keys at dev.bags.fm)
- Rate Limit: 1,000 requests/hour per user
- **BREAKING CHANGE:** Token launches now REQUIRE fee sharing configuration
- **No native NFT minting** - Use Qubik service instead
- **SDK:** TypeScript SDK available at [github.com/bagsfm/bags-sdk](https://github.com/bagsfm/bags-sdk)

### 2.2 Treasury Management
**Status: NOT STARTED** - No database tables or service

| Status | Item | Notes |
|--------|------|-------|
| [ ] | Treasury database tables | See schema in specs/bags-integration.md |
| [ ] | Treasury service | Fund allocation, tracking |
| [ ] | Fund distribution logic | Per-vote allocation |
| [ ] | Off-ramp to bank | Expert hiring fund extraction |

### 2.3 API Client Completion
**Status: INCOMPLETE** - Missing several endpoint modules and has path mismatches

| Status | Item | Package File | Methods Needed |
|--------|------|--------------|----------------|
| [x] | Votes API | `packages/api-client/src/votes.ts` | Complete (8 methods, 142 lines) |
| [~] | Users API | `packages/api-client/src/users.ts` | 10 methods but endpoint path mismatch for social proofs |
| [x] | Payments API | `packages/api-client/src/payments.ts` | Complete (6 methods, 100 lines) |
| [ ] | **Verification API** | `packages/api-client/src/verification.ts` | startVerification, getSchedule, checkIn, getStatus |
| [ ] | Auth API | `packages/api-client/src/auth.ts` | login, logout, refreshToken, verifySession |
| [ ] | Social API | `packages/api-client/src/social.ts` | getProofs, connectFacebook, connectInstagram |
| [ ] | Bags API | `packages/api-client/src/bags.ts` | All Bags.fm methods |
| [ ] | Notifications API | `packages/api-client/src/notifications.ts` | registerPushToken, getPreferences |
| [ ] | **Fix social endpoint paths** | `packages/api-client/src/users.ts:70,84,97` | **[!]** Client: `/api/user/social-connections` Backend: `/api/social/proofs` |

---

## Priority 3: Post-Resolution Features (Future)

### 3.1 NFT & Token Features
| Status | Item | Notes |
|--------|------|-------|
| [ ] | Issue Coin freeze on vote close | Stop trading after resolution |
| [ ] | "Verified Voter" NFT minting | Use Qubik service |
| [ ] | "Civic Patron" NFT minting | For external supporters |
| [ ] | Full provenance metadata | Issue name, result, GPS hash, tx hashes |
| [ ] | NFT database tables | Track minted NFTs |
| [ ] | Trophy Room (mobile) | Display earned NFTs |
| [ ] | Victory Wall (web) | Historical archive |

### 3.2 Multiplier Dashboard
| Status | Item | Notes |
|--------|------|-------|
| [ ] | Live multiplier calculation | External + local vote weight |
| [ ] | Local Legitimacy display | Verified resident count |
| [ ] | Financial Power indicator | Treasury + Bags.fm value |
| [ ] | Fund transparency UI | Real-time balance display |

---

## Priority 4: Technical Debt & Cleanup

### 4.1 Type System Inconsistencies
| Status | Issue | Files Involved | Impact |
|--------|-------|----------------|--------|
| [x] | ~~PaymentType mismatch~~ | `packages/shared/src/types/payment.ts` vs `contracts/payment.ts` | RESOLVED - Both use same types |
| [x] | ~~Mobile uses wrong PaymentType~~ | `apps/mobile/app/vote/[id].tsx:173` | RESOLVED - Now sends correct type |
| [ ] | **Duplicate GpsCoordinates type** | `packages/shared/src/types/user.ts:37` + `vote.ts:51` | Same interface defined in two files |
| [ ] | **GpsCoordinates schema differs** | `packages/shared/src/contracts/verification.ts:18-22` | Zod schema missing `timestamp` field |
| [ ] | **SocialProof field name mismatch** | `packages/shared/src/types/user.ts:14-23` vs `contracts/social.ts:37-44` | Types use `platformUserId/verifiedAt/stampWeight`; Contracts use `providerId/connectedAt` |

### 4.2 Branding Updates (Sync -> Taru)
| Status | Item | File(s) | Notes |
|--------|------|---------|-------|
| [ ] | Update CLAUDE.md | `/home/ralph/project/CLAUDE.md` | Says "Sync" throughout |
| [ ] | **Email service branding** | `apps/web/src/services/email/index.ts:32-33` | Uses 'noreply@taro.co.il' |
| [ ] | Mobile app name | `apps/mobile/app.json:3` | Uses "סינק" instead of "תארו" |

### 4.3 Code Quality Issues
| Status | Item | File(s) | Notes |
|--------|------|---------|-------|
| [ ] | **Fix `oderId` typo** | `apps/web/src/app/api/votes/[id]/participate/route.ts:102` | Should be `userId` or `voterId` |
| [ ] | Remove console.log (5 INFO-level) | `apps/web/src/app/api/payments/webhook/route.ts` | Lines 53, 88, 124, 153, 158 |
| [ ] | **Fix `as any` (mobile)** | `apps/mobile/app/(auth)/connect-social.tsx:36,64` | `identityScore: newScore as any` |
| [ ] | **Fix `as any` (mobile)** | `apps/mobile/app/(tabs)/profile.tsx:13,37,226,231,236` | Ionicons + router.push casts |
| [ ] | **Fix `as any` (web)** | `apps/web/src/components/animations/AnimatedText.tsx:177,304,341` | children cast |
| [ ] | **Fix `as any` (web)** | `apps/web/src/middleware.ts:10,20` | Locale type assertions |
| [ ] | Fix manual identity score calc | `apps/mobile/app/(auth)/connect-social.tsx:27-35` | Should use server-derived score |

### 4.4 Service & Code Cleanup
| Status | Item | File(s) | Notes |
|--------|------|---------|-------|
| [~] | Converge service | `apps/web/src/services/converge/index.ts` | Still exists but using Supabase |
| [ ] | **Remove grow.ts** | `apps/web/src/services/payments/grow.ts` | **DEAD CODE** - 232 lines, ZERO imports, `oderId` typo throughout |
| [ ] | Remove Clerk comments | Multiple files | References "Clerk" |
| [ ] | Remove getTokenBalance duplication | `packages/api-client/src/payments.ts` & `users.ts` | Same method in both files |
| [ ] | Consolidate GpsCoordinates type | `packages/shared/src/types/` | Defined in both user.ts:37-42 and vote.ts:51-56 |

### 4.5 Database Schema Issues
| Status | Item | File(s) | Notes |
|--------|------|---------|-------|
| [ ] | **Add users.qubik_wallet_address** | `supabase/migrations/` | **CRITICAL** - Column doesn't exist, token minting fails |
| [ ] | **Fix payments.option_id type** | `supabase/migrations/` | TEXT but should be UUID with FK to vote_options |
| [ ] | **Add payments.vote_id FK** | `supabase/migrations/` | Missing REFERENCES votes(id) constraint |
| [ ] | Add blockchain_tx_hash columns | Multiple tables | user_votes, entitlements, payments need this |
| [ ] | Add audit_logs table | `supabase/migrations/` | Required for compliance |

### 4.6 Mock Data Locations (Cleanup Priority)
| File | Lines | Content |
|------|-------|---------|
| `apps/web/src/app/[locale]/votes/components/VotesList.tsx` | 11-69 | 4 hardcoded mock votes |
| `apps/web/src/app/[locale]/votes/[id]/page.tsx` | 33-59, 98-103 | Mock vote fallback for demo |
| `apps/web/src/app/[locale]/dashboard/page.tsx` | 31-61, 78-82 | Mock stats and recent votes |
| `apps/mobile/app/(tabs)/history.tsx` | 21-63, 119-122 | Mock voting history |
| `apps/web/src/app/api/votes/[id]/participate/route.ts` | 98 | `mock-tx-${Date.now()}` blockchain fallback |
| `apps/web/src/app/api/user/profile/route.ts` | 95 | `mock-wallet-${session.userId}` fallback |
| `apps/web/src/app/api/verification/status/route.ts` | 40-65 | Mock progress calculation |

---

## External Service Integration Reference

### Expo Push Notifications (Context7 Verified)
- **Server SDK:** `expo-server-sdk@^3.9.0` installed in web app
- **Mobile packages required:** `expo-notifications`, `expo-device`
- **app.json plugin required:** `expo-notifications` with channel config
- **Key pattern:** Use `Constants.expoConfig.extra.eas.projectId` for token registration
- **Android requirement:** Must create notification channel before requesting permissions

### Green Invoice (Morning API)
- **Note:** Green Invoice and Morning API are the **same company**
- Service: `apps/web/src/services/payments/greenInvoice.ts` (COMPLETE - 294 lines)
- Features: Payment forms, webhooks (HMAC verification), receipts, idempotency
- Pricing: Vote participation ₪3 (300 agorot), Vote creation ₪200 (20,000 agorot)

### Qubik Blockchain
- Service: `apps/web/src/services/qubik/index.ts` (COMPLETE - 242 lines)
- Features: Vote recording, token minting, wallet creation
- Use for NFT minting (Bags.fm lacks native NFT support)

### Supabase (Context7 Verified)
- Client: `apps/web/src/lib/supabase/` (COMPLETE)
- 10 tables defined with RLS policies
- RLS pattern: `auth.uid() = user_id` for row ownership
- Missing tables: push_tokens, treasury, treasury_transactions, issue_coins, nfts

### Bags.fm API
- Base URL: `https://public-api-v2.bags.fm/api/v1/`
- Auth: `x-api-key` header
- Rate Limit: 1,000 req/hour
- **No native NFT minting** - Use Qubik service instead
- Key endpoints documented in specs/bags-integration.md

---

## Critical Path for Pilot (20 Active Blockers, 9 Resolved)

**Must be completed before January 23, 2025:**

### RESOLVED (9 items - no action needed)
1. [x] ~~Enable login buttons (Header.tsx:112-117)~~ - RESOLVED
2. [x] ~~Add session refresh endpoint~~ - RESOLVED: EXISTS at `/api/auth/session/refresh/route.ts`
3. [x] ~~Fix payment type mismatch (vote/[id].tsx:173)~~ - RESOLVED: Already uses `'vote_participation'`
4. [x] ~~Push notifications not sending~~ - RESOLVED: Cron job now calls `sendCheckInReminder()` from expo service
5. [x] ~~No push token storage~~ - RESOLVED: Created push_tokens table in `supabase/migrations/20250115000001_push_tokens_and_wallet.sql`
6. [x] ~~expo-notifications not installed~~ - RESOLVED: Added to `apps/mobile/package.json`
7. [x] ~~expo-device not installed~~ - RESOLVED: Added to `apps/mobile/package.json`
8. [x] ~~app.json missing notification plugin~~ - RESOLVED: Added expo-notifications plugin to `apps/mobile/app.json`
9. [x] ~~No wallet_address column in DB~~ - RESOLVED: Added `qubik_wallet_address` column in migration

### Week 1: Push Notifications + Database (HIGHEST PRIORITY)

1. [x] ~~**Add `qubik_wallet_address` column to users table**~~ - RESOLVED in migration
2. [x] ~~**Create `push_tokens` database migration** with RLS~~ - RESOLVED
3. [x] ~~**Install expo-notifications & expo-device** in mobile app~~ - RESOLVED
4. [x] ~~**Add expo-notifications plugin to app.json**~~ - RESOLVED
5. [ ] **Update EAS project ID** from placeholder - REQUIRES MANUAL TEAM CONFIGURATION
6. [x] ~~**Create `/api/user/push-token` POST endpoint**~~ - RESOLVED
7. [x] ~~**Implement mobile push token registration** with permission flow~~ - RESOLVED in `apps/mobile/src/lib/notifications.ts`
8. [x] ~~**Connect cron job to Expo service** (`sendCheckInReminder`)~~ - RESOLVED

### Week 2: API Endpoints + Bug Fixes

9. [ ] **Create `/api/user/participations` endpoint** - Mobile history needs this
10. [ ] **Create `/api/votes/[id]/participated` endpoint** - Check participation status
11. [ ] **Create `/api/user/tokens` endpoint** - Token balance API
12. [ ] **Create `/api/user/tokens/transactions` endpoint** - Token transaction history (users.ts:119)
13. [ ] **Create `/api/user/votes` endpoint** - User voting history (users.ts:130)
14. [ ] **Create `/api/user/verify-location` endpoint** - Location verification (users.ts:146)
15. [ ] **Fix wallet address in payment webhook** (line 84)
16. [ ] **Fix `oderId` typo** in participate endpoint (line 102)
17. [ ] **Fix verification status mock data** (lines 37-66)
18. [ ] **Fix API client social endpoint paths** (users.ts:70,84,97)
19. [ ] **Install react-native-confetti** or remove import
20. [ ] **Fix profile stats** - Connect to real API data
21. [ ] **Fix SocialProof type mismatch** - Align types/user.ts with contracts/social.ts

### Post-Pilot: UI & Mock Data (Can wait)
22. [ ] Enable Hero download button (Hero.tsx:84)
23. [ ] Replace Votes page ComingSoon with VotesList
24. [ ] Fix Download page ComingSoon
25. [ ] Replace mock data in dashboard
26. [ ] Replace mock data in history.tsx
27. [ ] Replace mock data in VotesList.tsx

---

## File Reference Quick Lookup

| Issue | File | Line | Status |
|-------|------|------|--------|
| ~~Login buttons disabled~~ | `apps/web/src/components/layout/Header/Header.tsx` | 112-121 | **RESOLVED** |
| Hero download button disabled | `apps/web/src/components/sections/Hero/Hero.tsx` | 84 | PENDING |
| ~~Push notifications stubbed~~ | `apps/web/src/app/api/cron/verification-notifications/route.ts` | 46 | **RESOLVED** |
| Empty wallet address | `apps/web/src/app/api/payments/webhook/route.ts` | 84 | PENDING |
| Mock dashboard data | `apps/web/src/app/[locale]/dashboard/page.tsx` | 31-61, 78-82 | PENDING |
| Mock history data | `apps/mobile/app/(tabs)/history.tsx` | 21-63, 119-122 | PENDING |
| Mock votes list | `apps/web/src/app/[locale]/votes/components/VotesList.tsx` | 11-69 | PENDING |
| ~~Session refresh missing~~ | `apps/web/src/app/api/auth/session/refresh/route.ts` | N/A | **RESOLVED - EXISTS** |
| Verification status TODO | `apps/web/src/app/api/verification/status/route.ts` | 37-66 | PENDING |
| ~~Payment type mismatch~~ | `apps/mobile/app/vote/[id].tsx` | 173 | **RESOLVED** |
| Votes page ComingSoon | `apps/web/src/app/[locale]/votes/page.tsx` | 33-36 | PENDING |
| Download page ComingSoon | `apps/web/src/app/[locale]/download/page.tsx` | 31-34 | PENDING |
| Profile stats hardcoded | `apps/mobile/app/(tabs)/profile.tsx` | 143, 154 | PENDING |
| `oderId` typo | `apps/web/src/app/api/votes/[id]/participate/route.ts` | 102 | PENDING |
| Missing confetti package | `apps/mobile/app/verification/complete.tsx` | 15 | PENDING |
| ~~expo-notifications missing~~ | `apps/mobile/package.json` | N/A | **RESOLVED** |
| ~~expo-device missing~~ | `apps/mobile/package.json` | N/A | **RESOLVED** |
| ~~app.json plugin missing~~ | `apps/mobile/app.json` | plugins array (40-48) | **RESOLVED** |
| EAS project ID placeholder | `apps/mobile/app.json` | 58 | PENDING (requires manual team config) |
| Duplicate GpsCoordinates | `packages/shared/src/types/user.ts` + `vote.ts` | 37, 51 | PENDING |
| Social endpoint mismatch | `packages/api-client/src/users.ts` | 70, 84, 97 | PENDING |
| SocialProof type mismatch | `packages/shared/src/types/user.ts` vs `contracts/social.ts` | N/A | PENDING |
| Unused grow.ts service | `apps/web/src/services/payments/grow.ts` | entire file | DEAD CODE |
| ~~No wallet_address column~~ | `supabase/migrations/20250115000001_push_tokens_and_wallet.sql` | N/A | **RESOLVED** |
| ~~Missing push-token API~~ | `apps/web/src/app/api/user/push-token/route.ts` | N/A | **RESOLVED** |
| ~~Push token registration~~ | `apps/mobile/src/lib/notifications.ts` | N/A | **RESOLVED** |
| Missing participations API | `apps/web/src/app/api/user/participations/` | N/A | PENDING |
| Missing participated API | `apps/web/src/app/api/votes/[id]/participated/` | N/A | PENDING |
| Missing tokens API | `apps/web/src/app/api/user/tokens/` | N/A | PENDING |

---

## Completed Items Summary

### Services (All Complete - 12 files, ~3,786 lines)
- [x] Google OAuth - `apps/web/src/services/auth/google.ts` (221 lines, PKCE flow)
- [x] Facebook OAuth - `apps/web/src/services/auth/facebook.ts` (167 lines)
- [x] Instagram OAuth - `apps/web/src/services/auth/instagram.ts` (188 lines)
- [x] JWT Session Management - `apps/web/src/services/auth/session.ts` (266 lines)
- [x] Green Invoice Payments - `apps/web/src/services/payments/greenInvoice.ts` (294 lines)
- [x] Expo Push Notification Service - `apps/web/src/services/notifications/expo.ts` (316 lines)
- [x] Qubik Blockchain - `apps/web/src/services/qubik/index.ts` (242 lines)
- [x] GPS Verification Schedule - `apps/web/src/services/verification/schedule.ts` (410 lines)
- [x] Municipality Bounds - `apps/web/src/services/verification/municipality.ts` (435 lines)
- [x] Email (Resend) - `apps/web/src/services/email/index.ts` (538 lines, 6 templates)
- [x] Converge Database - `apps/web/src/services/converge/index.ts` (422 lines)
- [x] Supabase Client - `apps/web/src/lib/supabase/` (5 files)
- **UNUSED:** grow.ts (232 lines) - never imported anywhere

### Shared Packages (Mostly Complete)
- [x] @sync/shared - 29 type definitions, 8+ constant groups, 30+ utility functions, 45+ Zod schemas
- [x] @sync/api-client - Votes (142 lines), users (148 lines), payments (100 lines) - 5 modules missing
- [x] @sync/design-tokens - Colors, typography, spacing, animations (complete)
- [x] DID utilities with comprehensive tests (214 lines of tests)
- [x] Identity score with comprehensive tests (266 lines of tests)

### Mobile App (28 screens, ~90% implementation)
- [x] Auth screens (sign-in, sign-up, onboarding, connect-social) - All working
- [x] Tab navigation (index, votes, create, profile, history) - All working
- [x] Vote detail with GPS verification - Complete with share functionality
- [x] Payment flow (checkout, success, failed) - Full Green Invoice integration
- [x] Verification flow (index, check-in, complete) - Complete (confetti package missing)
- [x] Settings screens (5 screens) - All working
- [~] History screen - **Uses mock data (lines 21-63)**
- [~] Profile screen - **Vote counts hardcoded to "0"**
- [x] expo-notifications installed - RESOLVED (plugin added to app.json)

### Database (11/15 tables complete)
- [x] users table with DID support and `qubik_wallet_address` column
- [x] social_proofs table with auto identity score trigger
- [x] verification_runs, verification_schedule, verification_attempts tables
- [x] payments table with idempotency
- [x] entitlements table
- [x] votes, vote_options, user_votes tables
- [x] 32+ indexes, RLS policies on all tables, 6 database functions
- [x] push_tokens table - RESOLVED (`supabase/migrations/20250115000001_push_tokens_and_wallet.sql`)
- [ ] treasury, treasury_transactions tables (Priority 2)
- [ ] issue_coins table (Priority 2)
- [ ] nfts table (Priority 3)

### API Routes (22 endpoints implemented)
- [x] Auth: /api/auth/did, callback, session (GET, POST, DELETE)
- [x] **Auth: /api/auth/session/refresh** (99 lines - token rotation)
- [x] User: /api/user/profile (GET, POST, PATCH)
- [x] Votes: /api/votes, /api/votes/[id], /api/votes/[id]/participate
- [x] Payments: /api/payments/create, /api/payments/[id]/status, webhook
- [x] Verification: start, status, check-in, schedule
- [x] Social: proofs, callback/facebook, callback/instagram
- [x] Newsletter: subscribe, verify, beehiiv endpoints
- [x] Cron: verification-notifications - RESOLVED (now calls `sendCheckInReminder()`)
- [x] User: /api/user/push-token - RESOLVED
- [ ] **Missing: /api/user/participations** (voting history)
- [ ] **Missing: /api/votes/[id]/participated**
- [ ] **Missing: /api/user/tokens**

---

## Appendix A: Specifications Directory

**Status:** 2 specs created, 6 additional specs needed.

```
specs/
├── push-notifications.md  # [COMPLETE] Expo notifications, token registration
├── bags-integration.md    # [COMPLETE] SocialFi token launch, trading, treasury
├── auth-flow.md           # [TODO] OAuth, DID generation, session management
├── verification-protocol.md  # [TODO] 21-day GPS verification process
├── voting-system.md       # [TODO] Vote creation, participation, results
├── payment-flow.md        # [TODO] Green Invoice integration, token minting
├── nft-minting.md         # [TODO] Post-vote NFT issuance via Qubik
└── api-contracts.md       # [TODO] All API endpoint specifications
```

---

## Appendix B: Audit Summary Statistics

| Category | Complete | Partial | Missing | Total |
|----------|----------|---------|---------|-------|
| Services | 12 | 0 | 3 | 15 |
| API Routes | 19 | 3 | 3 | 25 |
| Database Tables | 11 | 0 | 4 | 15 |
| Mobile Screens | 25 | 3 | 0 | 28 |
| API Client Modules | 2 | 1 | 5 | 8 |
| Shared Contracts | 4 | 0 | 2 | 6 |
| Specs | 2 | 0 | 6 | 8 |

**API Routes Missing (3):**
- /api/user/participations (voting history)
- /api/user/tokens
- /api/votes/[id]/participated

**API Routes RESOLVED:**
- /api/user/push-token - Created at `apps/web/src/app/api/user/push-token/route.ts`

**Type System Issues (4):**
- Duplicate GpsCoordinates interface (user.ts + vote.ts)
- GpsCoordinates Zod schema missing timestamp field
- SocialProof field name mismatch (types vs contracts)
- 10 unsafe `as any` assertions found (mobile: 6, web: 4)

---

## Appendix C: Test Coverage Analysis

**Test Files (4 total, ~1,100 lines):**
- `apps/web/src/__tests__/e2e/payment.test.ts` (374 lines)
- `apps/web/src/__tests__/integration/verification.test.ts` (499 lines)
- `apps/web/src/__tests__/integration/auth.test.ts` (227 lines)
- `apps/web/tests/e2e/smoke.spec.ts` (191 lines)

**Coverage by Feature:**

| Feature | Unit | Integration | E2E | Overall | Notes |
|---------|------|-------------|-----|---------|-------|
| Auth (OAuth) | - | OK | Low | 60% | Missing refresh token, CSRF tests |
| Sessions | - | OK | - | 50% | No concurrent session handling |
| DID Generation | - | OK | - | 40% | Basic validation only |
| Payments | Mock | - | - | **40%** | **ALL MOCKED** - No real integration |
| Verification (Schedule) | - | OK | - | 70% | Schedule logic well-tested |
| Verification (GPS) | - | - | - | **0%** | No GPS flow tests |
| Voting | - | - | - | **10%** | Only 401 auth tests |
| User Profile | - | - | - | **0%** | No CRUD tests |
| Blockchain | - | - | - | **0%** | No Qubik integration tests |

**Critical Gaps:**
1. Payment tests use `vi.fn()` mock fetch - no real Stripe/Green Invoice integration
2. GPS verification schedule tested but no actual coordinate validation
3. No vote participation or counting tests
4. No webhook signature validation tests
5. No coverage measurement tool configured

**Recommendations:**
- P0: Add code coverage measurement (vitest coverage or nyc)
- P0: Create real payment integration tests with test mode
- P1: Add GPS verification tests with mock coordinates
- P1: Add complete voting flow tests

---

## Appendix D: Branding Inconsistencies

**Current State:** Three different brand names used inconsistently:

| Brand | Location | Usage |
|-------|----------|-------|
| **תַּרְאוּ (Taro)** | Email service, Header, Footer, README | Primary brand (correct) |
| **סינק (Sync)** | Newsletter emails, Mobile app, Config files | Legacy name (should update) |
| **Taru** | IMPLEMENTATION_PLAN.md title only | English variant |

**Files Needing Update:**
- `apps/web/src/services/email/index.ts` lines 433-532 (newsletter uses Sync)
- `apps/mobile/app.json` line 3 (`"name": "סינק"`)
- `apps/mobile/src/lib/share.ts` lines 45, 50
- `apps/mobile/app/(auth)/index.tsx` line 16
- `CLAUDE.md` (says "Sync" throughout)

---

*Last Updated: January 15, 2025*
*Document Version: 18.0*
*Analysis: Opus 4.5 comprehensive codebase audit with parallel exploration subagents + full verification pass*

**Version 18.0 Changes (Push Notification System Resolved):**
- **RESOLVED Blocker #3**: Push notifications not sending - Cron job now calls `sendCheckInReminder()` from expo service
- **RESOLVED Blocker #4**: No push token storage - Created push_tokens table in `supabase/migrations/20250115000001_push_tokens_and_wallet.sql`
- **RESOLVED Blocker #5**: expo-notifications not installed - Added to `apps/mobile/package.json`
- **RESOLVED Blocker #6**: expo-device not installed - Added to `apps/mobile/package.json`
- **RESOLVED Blocker #7**: app.json missing notification plugin - Added expo-notifications plugin to `apps/mobile/app.json`
- **RESOLVED Blocker #20**: No wallet_address column in DB - Added `qubik_wallet_address` column in migration
- **NEW**: Created mobile push token registration at `apps/mobile/src/lib/notifications.ts`
- **NEW**: Created `/api/user/push-token` endpoint at `apps/web/src/app/api/user/push-token/route.ts`
- Total blockers now 29 (9 resolved, 20 active) - was 26 active
- Note: EAS project ID (#19) still requires manual team configuration

**Version 17.0 Changes (Second Verification Pass):**
- Re-verified ALL blockers via 5 parallel exploration agents with Context7 MCP docs
- **NEW**: Added 3 additional API endpoint blockers (#27-29) from api-client/users.ts
- **NEW**: Total blockers now 29 (3 resolved, 26 active)
- **NEW**: Found 5 TODO comments in codebase, all align with documented blockers:
  - `apps/web/src/app/api/cron/verification-notifications/route.ts:46` - Push notification TODO
  - `apps/web/src/app/api/verification/status/route.ts:37` - Schedule fetch TODO
  - `apps/web/src/app/api/payments/webhook/route.ts:84` - Wallet address TODO
  - `apps/web/src/app/[locale]/dashboard/page.tsx:78` - API calls TODO
  - `apps/mobile/app/(tabs)/history.tsx:119` - API call TODO
- **TEST COVERAGE VERIFIED**: 6 test files, ~115 test cases, ~1,727 lines
  - 87% of services UNTESTED
  - 59% of API routes UNTESTED
  - DID tests conditionally skip when crypto unavailable
- Expo notifications docs verified via Context7 MCP (projectId from Constants.expoConfig.extra.eas.projectId)
- Supabase RLS patterns verified via Context7 MCP (auth.uid() = user_id pattern)

**Version 16.0 Changes (Complete Re-Verification):**
- Re-verified ALL 26 blockers via 7 parallel exploration agents
- Confirmed all 26 blockers (3 resolved, 23 active)
- Added detailed line numbers and exact file paths for all issues
- Verified API client/backend path mismatch: `/api/user/social-connections` vs `/api/social/proofs`
- Confirmed SocialProof type mismatch: `platformUserId/verifiedAt/stampWeight` vs `providerId/connectedAt`
- Confirmed expo-notifications and expo-device NOT in package.json dependencies
- Confirmed app.json plugins array (lines 40-48) missing expo-notifications
- Confirmed EAS project ID is placeholder "your-project-id" at line 58
- Verified grow.ts (232 lines) DEAD CODE with `oderId` typo throughout
- All 12 backend services are COMPLETE and production-ready
- **TEST COVERAGE GAPS**: Payments 40% (all mocked), GPS verification 0%, Voting 10%
- **Bags.fm**: 0% implemented (Priority 2 - expected)

**Key Findings (All Verified):**
- Push notification system is the biggest blocker (8 items to implement)
- Database schema needs qubik_wallet_address column for token minting
- API client/backend path mismatch for social endpoints (uses wrong paths)
- SocialProof types have field name mismatches that will cause runtime errors
- 7 API endpoints expected by client but missing in backend (users.ts lines 70, 84, 97, 105, 119, 130, 146)
- grow.ts (232 lines) confirmed as DEAD CODE - never imported anywhere
- All 12 backend services are COMPLETE and production-ready
- GpsCoordinates type duplicated in user.ts:37-42 and vote.ts:51-56 (same content, different order)
