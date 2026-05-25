# LEARNINGS.md – Problems Encountered & Solutions

> **Session:** 2026-05-23 to 2026-05-25
> **Linked docs:** [DECISIONS.md](./DECISIONS.md) | [SESSION_SUMMARY.md](./SESSION_SUMMARY.md) | [HANDOVER.md](./HANDOVER.md)

## L1: Turbopack Watches `supabase/data` → Permission Denied Crash

**Symptom:** `next dev` crashes with `Unable to watch /home/.../supabase/data - Permission denied`. Docker creates `supabase/data/` owned by UID 105 (postgres container user). Turbopack's file watcher can't read it.

**Fix:** Moved `supabase/` directory outside the Next.js project root. Later switched to Docker named volumes (`pgdata:`) instead of bind mounts, so `supabase/data/` doesn't exist on the host filesystem at all.

**Lesson:** Docker bind mounts for databases inside Next.js projects break Turbopack. Use named volumes or keep the data dir outside the project root.

**Files:** `docker-compose.yml` (uses `pgdata:` named volume)

## L2: `postgres` npm Module Returns `numeric` as Strings

**Symptom:** `TypeError: price.toFixed is not a function`. Postgres `NUMERIC(10,2)` columns are returned as strings by the `postgres` npm module (not parsed to JS Number).

**Fix:** Wrap all price references with `Number(price).toFixed(2)` in UI components.

**Affected files:** `product-card.tsx`, `product-detail-modal.tsx`, `explore-card.tsx`

**Lesson:** Always assume numeric columns from Postgres are strings when using the `postgres` npm module. TypeScript types showing `number` are misleading.

## L3: `sqlClient(columns)` Treats Multi-Column String as Single Identifier

**Symptom:** `column "creator_id, theme, banner_url, affiliate_codes" does not exist`. The `postgres` tagged template literal `sqlClient(columns)` quotes the ENTIRE string as a single SQL identifier.

**Fix:** Created `cols()` helper that splits by comma and individually quotes each column: `s.split(",").map(c => `"${c.trim()}"`).join(", ")`. Then pass result to `sqlClient.unsafe(cols(columns))`.

**Also:** `sqlClient(col)` with a column name containing commas or special chars breaks. Use `ident()` helper for single identifiers.

**Affected file:** `src/lib/supabase/admin.ts` (the `wrapSql` function)

**Lesson:** Never pass comma-separated column lists to `postgres` tagged template literals. Use `.unsafe()` with properly quoted individual identifiers.

## L4: `select().order().order()` Chain Broken in DB Adapter

**Symptom:** `.order(...).order is not a function` on the hub page. The direct Postgres wrapper's `order` method didn't return another `order` method for chaining.

**Fix:** Added nested `order` to both the `select → order` and `eq → order` return objects. Now `.order("pinned").order("sort_order")` works.

**Also:** Added `limit` directly to the `select → order` return (was only available in nested `order → order → limit`).

**Affected file:** `src/lib/supabase/admin.ts` (lines ~87-104)

**Lesson:** Supabase query builder chains are deeply nested. Each method must return an object with ALL possible subsequent methods for the chain to work.

## L5: Supabase Nested Select Syntax (`product:product_id(...)`) Not Supported

**Symptom:** Foreign-key relation syntax like `product:product_id (id, title)` returns empty data through the direct Postgres wrapper.

**Fix:** Replaced nested selects with separate flat queries + JS lookup maps:
```ts
const { data: items } = await admin.from("creator_items").select("id, product_id")
const { data: products } = await admin.from("products").select("id, title, ...")
const productMap = new Map(products.map(p => [p.id, p]))
items.forEach(item => { item.product = productMap.get(item.product_id) })
```

**Affected files:** `src/app/(hub)/[creator]/page.tsx`, `src/app/explore/page.tsx`

**Lesson:** The direct Postgres wrapper doesn't support Supabase's FK-join syntax. Use separate queries + Map lookups.

## L6: Connection Pool Hangs When DB Unavailable

**Symptom:** `next build` hangs indefinitely when DB is down. Postgres module retries connection with default timeout. `AggregateError: ECONNREFUSED` thrown but the pool creation doesn't fail fast.

**Fix:** 
1. Added `connect_timeout: 5` to postgres config
2. Marked all DB-dependent pages with `export const dynamic = "force-dynamic"` so they're not pre-rendered at build time
3. Wrapped DB calls in try/catch on the landing page

**Affected files:** `src/lib/supabase/admin.ts`, `src/app/page.tsx`, `src/app/explore/page.tsx`

**Lesson:** Build-time DB access is dangerous. Always mark DB-dependent pages as dynamic. Set aggressive connection timeouts.

## L7: `@/` Path Alias Works in Next.js but NOT in Node.js

**Symptom:** `Error: Cannot find module '@/lib/agents/registry'` when running `node -e "require('@/lib/...')"`.

**Reason:** `@/` → `./src/` is a TypeScript `paths` alias resolved by Turbopack/Next.js, not by Node.js.

**Lesson:** Don't use `@/` imports in standalone scripts or `node -e` tests. Use relative paths or register the alias with `tsx`/`ts-node`.

## L8: `request.cookies` Not on Next.js 16 `Request` Type

**Symptom:** `Property 'cookies' does not exist on type 'Request'` in API route handlers.

**Fix:** Use `import { cookies } from "next/headers"` and `await cookies()` instead of `request.cookies`.

**Affected file:** `src/app/api/auth/logout/route.ts`

**Lesson:** Next.js 16 API routes: use `next/headers` for cookie access, not `request.cookies`.

## L9: shadcn/ui v4 Uses `@base-ui/react` Not Radix

**Symptom:** `Property 'asChild' does not exist on type 'IntrinsicAttributes & Props<unknown>'` on `<DropdownMenuTrigger asChild>`.

**Fix:** Removed `asChild` and Button wrapper. Styled `DropdownMenuTrigger` directly with className. In v4, the trigger renders its own button element.

**Affected files:** `src/components/hub/agent-dropdown.tsx`, `src/components/ui/dropdown-menu.tsx`

**Lesson:** shadcn/ui v4 migration from Radix to Base UI changes the component API. `asChild` is gone. Style triggers directly.

## L10: Explore Page Images Were `[] as any[]`

**Symptom:** `/explore` page showed only placeholder icons. All product cards had no images.

**Root cause:** In a previous refactor to simplify the explore page, the imageMap fetching code was deleted and replaced with `images: [] as any[]`. The product_images query was accidentally removed.

**Fix:** Added back `admin.from("product_images").select(...)` and built `imageMap` from the results.

**Affected file:** `src/app/explore/page.tsx`

**Lesson:** When simplifying data-fetching code, verify that ALL data sources are still queried. A missing `images` query silently breaks the UI.
