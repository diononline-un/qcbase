# DECISIONS.md – Architecture & Design Decisions

> **Session:** 2026-05-23 to 2026-05-25
> **Project:** QCBase – Proxy-Shopping Creator Hub
> **Linked docs:** [LEARNINGS.md](./LEARNINGS.md) | [SESSION_SUMMARY.md](./SESSION_SUMMARY.md) | [HANDOVER.md](./HANDOVER.md)

## D1: Local-First Authentication

**Decision:** Custom auth module with `user_accounts` + `user_sessions` tables. No Supabase Auth (GoTrue).

**Rationale:**
- Docker runs bare Postgres (supabase/postgres image). Full Supabase stack (Kong, GoTrue) too complex for local dev.
- `crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512')` for password hashing.
- Session tokens stored in `httpOnly` cookies, validated on every request via `getUserBySessionToken()`.

**Trade-off:** Must switch to Supabase Auth when deploying to production. Session handling code lives in `src/lib/auth/auth.ts`.

**Files:** `src/lib/auth/auth.ts`, `src/app/api/auth/login/route.ts`, `src/app/api/auth/register/route.ts`, `src/app/api/auth/logout/route.ts`

## D2: Direct Postgres Adapter (No Supabase Client)

**Decision:** `src/lib/supabase/admin.ts` wraps `postgres` npm module with a Supabase-client-compatible chainable query builder.

**Rationale:**
- Supabase REST API requires Kong + PostgREST running. Without them, `@supabase/supabase-js` fails.
- Direct Postgres is faster for local dev. Same SQL, just wrapped.
- `createAdminClient()` auto-detects: if `DATABASE_URL` env var is set → direct Postgres. Otherwise → Supabase API.

**Critical implementation detail:** Multi-column strings (`"col1, col2, col3"`) must be split and quoted individually. The `cols()` helper handles this: `s.split(",").map(c => `"${c.trim()}"`).join(", ")`.

**Trade-off:** The wrapper is incomplete. Missing: proper `IN` clauses, foreign-key joins, `count` aggregation, complex `or`/`ilike` chains. Extend as needed.

**Files:** `src/lib/supabase/admin.ts` (the `wrapSql` function)

## D3: Modal over Page Navigation for Product Detail

**Decision:** Product cards trigger a `<Dialog>` modal instead of navigating to `/[creator]/product/[id]`.

**Rationale:**
- Keeps user on the hub feed. No page reload.
- Matches ASOS-style "quick view" UX.
- Checkout buttons, image carousel, tech specs all live in `ProductDetailModal`.
- Route `/[creator]/product/[productId]` was deleted.

**Trade-off:** No SEO for individual product pages. Acceptable for MVP since products are behind creator subdomains.

**Files:** `src/components/hub/product-detail-modal.tsx`, `src/components/hub/product-card.tsx`

## D4: Zustand Cart with Popup Agent Flow

**Decision:** `zustand` + `localStorage` persistence for cart state. Agent opens in `window.open` popup.

**Rationale:**
- Zustand is simpler than React Context for client-only state. No provider wrapping needed.
- `localStorage` persist ensures cart survives page reloads.
- Popup window (`window.open`) avoids iframe X-Frame-Options issues.
- Navigation bar (Prev/Next) stays in the main window, controls popup URL.

**Trade-off:** Popup can be blocked by browsers. Need user gesture (click) to trigger. Currently triggered from Cart dropdown or Cart launch page.

**Files:** `src/lib/stores/cart-store.ts`, `src/components/cart/cart-button.tsx`

## D5: Table Schema – `user_accounts` replaces `profiles`

**Decision:** Renamed `profiles` → `user_accounts`. All FKs updated. `creator_settings.creator_id`, `creator_items.creator_id`, `click_events.creator_id` now reference `user_accounts(id)`.

**Rationale:**
- Old schema tied `profiles` to `auth.users` FK (Supabase Auth dependency). Removed that dependency.
- `user_accounts` is self-contained. Has `email`, `password_hash`, `password_salt`, `username`, `role`, `tier`, `avatar_url`.
- Migration: 12 source files had `.from("profiles")` → replaced with `.from("user_accounts")`.

**Files affected:** `src/app/page.tsx`, `src/app/(hub)/[creator]/page.tsx`, `src/app/explore/page.tsx`, `src/app/(dashboard)/analytics/page.tsx`, `src/app/(dashboard)/settings/page.tsx`, `src/app/(dashboard)/billing/page.tsx`, `src/app/api/webhooks/paddle/route.ts`, `src/lib/actions/profile.ts`, `src/lib/supabase/types.ts`

## D6: `sizes` as TEXT Column (Not Normalized)

**Decision:** `products.sizes TEXT` – stores raw size string like `"36-45"` or `"2XS-3XL"`.

**Rationale:**
- No standardized size format across platforms (Weidian vs Taobao vs 1688).
- TEXT column is flexible. Displayed as-is on product tiles.
- Deferred normalization to post-MVP if filtering by size becomes necessary.

## D7: Next.js 16 Breaking Changes Handled

**Decision:** Adapted to Next.js 16 specifics encountered:
- `middleware.ts` → `proxy.ts` (deprecated convention)
- `cookies()` must be `await`ed (async Request APIs)
- Tailwind v4 syntax (`@import "tailwindcss"`, `@theme inline`)
- shadcn/ui v4 uses `@base-ui/react` instead of Radix (no `asChild` on DropdownMenuTrigger)
- `request.cookies` doesn't exist on `Request` type → use `import { cookies } from "next/headers"` instead

## D8: Agent URL Format (Real URLs vs Generic)

**Decision:** GTBuy and ACBuy use platform-specific URL structures, not generic `/item?url=` patterns.

**GTBuy:** `https://gtbuy.com/goods/details?id={itemId}&channel={PLATFORM}&inviteCode={code}`
**ACBuy:** `https://www.acbuy.com/product?id={itemId}&u={code}&source={platform_abbr}`

Other agents still use generic `/item?url={encoded}` until real URL patterns are known.

**Files:** `src/lib/agents/agents.ts` (gtbuy and acbuy entries updated)
