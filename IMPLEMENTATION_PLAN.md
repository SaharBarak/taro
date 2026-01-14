# Taru Implementation Plan

Target: Late January 2025 pilot with full vision

## Priority 1: Mobile GPS Verification Flow (CRITICAL PATH)
- [ ] expo-location setup with background location permissions
- [ ] 2-week vicinity challenge logic (8 of 14 days minimum)
- [ ] Municipality boundary configuration (GeoJSON polygons)
- [ ] Push notification system for verification prompts
- [ ] SMS fallback integration for users who disable notifications
- [ ] Verification status tracking in Supabase
- [ ] Verification UI screens (progress, check-in, complete)

## Priority 2: Auth & User Management
- [ ] Replace SEL-DID with Supabase Auth
- [ ] User profile with municipality selection
- [ ] Verification status display
- [ ] Social connections (for future reputation)

## Priority 3: Payment Integration (Morning API)
- [ ] Morning API integration for Israeli payments
- [ ] ₪3 vote payment flow
- [ ] ₪100-200 topic creation payment
- [ ] Payment receipts and history
- [ ] Webhook handling for payment confirmation

## Priority 4: Bags.fm Integration (Taru Proxy)
Reference: https://docs.bags.fm/
- [ ] Master treasury wallet setup on Bags.fm
- [ ] Issue Coin creation per topic
- [ ] Internal share allocation via Bags.fm API
- [ ] Batch sync of internal transactions to chain
- [ ] External supporter buy-in flow
- [ ] Social Multiplier tracking

## Priority 5: Voting System
- [ ] Topic creation flow (₪100-200 fee)
- [ ] Creator = Topic Lead assignment
- [ ] 3-week discussion period timer
- [ ] Voting window (opens after deliberation)
- [ ] Vote casting with GPS + Payment verification
- [ ] Real-time results display
- [ ] Vote history

## Priority 6: Execution Fund & Off-Ramp
- [ ] Fund vault per issue (₪2 per vote accumulation)
- [ ] Fund value display (Local + Multiplier)
- [ ] Off-ramp to bank for expert hiring
- [ ] Expert assignment and tracking

## Priority 7: Post-Resolution NFTs
- [ ] Issue Coin freeze on vote close
- [ ] NFT minting on Bags.fm (native)
- [ ] "Verified Voter" NFT for residents
- [ ] "Civic Patron" NFT for supporters
- [ ] Full provenance metadata:
  - Issue name, vote date, result
  - Voter type, municipality
  - Fund raised, expert hired
  - Blockchain tx hashes, GPS proof hash

## Priority 8: Trophy Room & Victory Wall
- [ ] Mobile: Trophy Room component (user's NFT collection)
- [ ] Web: Victory Wall (historical archive of resolved issues)
- [ ] NFT utility: reputation points, founding member status

## Priority 9: Multiplier Dashboard (Web)
- [ ] Local Legitimacy display (verified resident count)
- [ ] Financial Power indicator (fund value)
- [ ] Live issue tracking
- [ ] External supporter onboarding

## Discovered Issues
(To be populated during development)

## Technical Debt
- [ ] Remove SEL-DID code (now using Supabase Auth)
- [ ] Update CLAUDE.md to reflect Taru (not Sync)

## Completed
(Items move here when done)


## External Service Docs
- Bags.fm: https://docs.bags.fm/
- Supabase: https://supabase.com/docs
- Morning API: (need to add)
- Expo Location: https://docs.expo.dev/versions/latest/sdk/location/
