---
active: true
iteration: 2
max_iterations: 30
completion_promise: null
started_at: "2026-01-09T10:23:05Z"
---

# URGENT: IMPLEMENT BAGS.FM INTEGRATION NOW

Bags.fm is ESSENTIAL for the payment flow - it was incorrectly marked as Priority 2 but it is actually P0 CRITICAL.

## Your task:
Implement the full Bags.fm integration from `specs/bags-integration.md`:

1. **Types** - Create `packages/shared/src/types/bags.ts`
2. **Contracts** - Create `packages/shared/src/contracts/bags.ts` (Zod schemas)
3. **Service** - Create `apps/web/src/services/bags/index.ts`
4. **Database** - Create migration for treasury, treasury_transactions, issue_coins, issue_coin_holdings tables
5. **API Client** - Create `packages/api-client/src/bags.ts`
6. **API Routes** - Create treasury and issue-coin endpoints
7. **Environment** - Add BAGS_* variables to .env.example

The spec at `specs/bags-integration.md` has ALL the details - API endpoints, types, database schema, everything.

DO NOT SKIP THIS. This is the #1 priority.
