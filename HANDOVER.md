# HANDOVER.md – Instructions for Next Agent

> **Incoming agent:** Read this file FIRST, then load [SESSION_SUMMARY.md](./SESSION_SUMMARY.md), [DECISIONS.md](./DECISIONS.md), [LEARNINGS.md](./LEARNINGS.md).
> **Project:** QCBase – Proxy-Shopping Creator Hub
> **Repo:** `https://github.com/diononline-un/qcbase` (branch: `main`)

## Mandatory Startup Sequence

```
STEP 1: Read HANDOVER.md (this file)
STEP 2: Read SESSION_SUMMARY.md → understand current state
STEP 3: Read DECISIONS.md → understand architecture choices
STEP 4: Read LEARNINGS.md → avoid repeating solved problems
STEP 5: Read AGENTS.md → Next.js 16 breaking changes
```

## Critical Context You Need

### Tech Stack
- **Next.js 16** (Turbopack, App Router) — NOT Next.js 14/15. See `AGENTS.md` and `node_modules/next/dist/docs/` for breaking changes.
- **Tailwind v4** (`@import "tailwindcss"`, `@theme inline` — NOT v3 `@tailwind base/components/utilities`)
- **shadcn/ui v4** (`@base-ui/react` — NOT Radix. No `asChild` prop)
- **Postgres via `postgres` npm** (NOT Supabase JS client for most queries)
- **Docker** `supabase/postgres:15.8.1.074` on port `54322`
- **Node.js 20**

### Database
- No Supabase Auth. Custom auth in `src/lib/auth/auth.ts`.
- `DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres` in `.env.local`
- If DB is down: `sg docker -c "docker compose up -d"` then `sleep 5`
- Tables: `user_accounts`, `creator_settings`, `products` (with `sizes TEXT`), `product_images`, `creator_items`, `click_events`, `user_collections`, `collection_items`
- No seed data currently. 2 test users only.

### Authentication
- Login: `POST /api/auth/login` with `{email, password}` → sets `session` cookie
- Logout: `POST /api/auth/logout`
- Session check: `cookies().get("session")?.value` → `getUserBySessionToken(token)`
- Dashboard protected by layout-level redirect (no middleware)
- Test creds: `creator@qcbase.site` / `test123` AND `user@qcbase.site` / `test123`

### The `admin.ts` Query Wrapper
- `createAdminClient()` returns chainable query builder mimicking Supabase JS API
- Supports: `.from().select().eq().order().limit().single()`
- Does NOT support: FK joins (`product:product_id(...)` syntax), `IN` clauses, `count: "exact"`, `head: true`
- For FK joins: do separate flat queries + JS Map lookups
- Multi-column strings MUST use `cols()` helper (built into wrapper)

### Agent URLs
- Use `buildAgentUrl(sourceUrl, agentId, affiliateCode)` from `@/lib/agents/registry`
- GTBuy format: `goods/details?id={itemId}&channel=WEIDIAN&inviteCode={code}`
- ACBuy format: `product?id={itemId}&u={code}&source=WD`
- Other agents: generic `item?url={encoded}&aff={code}` — UNVERIFIED. Test each before claiming they work.

## Common Pitfalls (Read Before Coding)

1. **Turbopack + Docker bind mounts:** Don't mount `./supabase/data` as host volume. Use Docker named volumes (`pgdata:`) instead. Otherwise Turbopack crashes on startup.

2. **Numeric columns are strings:** `agent_cached_price NUMERIC(10,2)` returns as `"42.00"` string. Always wrap with `Number()` before `.toFixed()`.

3. **Cookie access in API routes:** Don't use `request.cookies`. Use `import { cookies } from "next/headers"` + `await cookies()`.

4. **Connection pool hangs:** If DB is unreachable, the `postgres` module hangs for ~5s × 5 retries = ~25s. Set `connect_timeout: 5`. Mark DB pages with `export const dynamic = "force-dynamic"`.

5. **`@/` path alias:** Only works in Next.js/Turbopack context. NOT available in plain Node.js scripts.

6. **shadcn v4 components:** Check the actual component source in `src/components/ui/` before assuming Radix-like API. Base UI components use different prop names.

7. **Dashboard dark mode:** Dashboard layout sets `bg-zinc-950`. Text must use `text-white` or `text-zinc-*` explicitly (not inherited from light theme).

## File Modification Rules

- **Before editing any file:** Confirm the current design spec. The user has strong opinions on visual design (ASOS-like, terminal aesthetic, dark mode, monospace data).
- **Product cards:** No shadows, no borders, aspect-ratio `4/5`, QC hover swap, sizes badge.
- **Landing page:** Marquee ticker, Bento grid features, Trending teaser, Creator showcase.
- **Dashboard:** Dark mode (`bg-zinc-950`), monospace labels, zinc borders, no drop shadows.
- **Colors:** Use `zinc-50` through `zinc-950` palette. Status colors: `emerald-*` (GL), `rose-*` (OOS/RL).

## Starting the App

```bash
cd ./

# If Docker is down:
sudo systemctl start docker  # OR the user runs this manually
sg docker -c "docker compose up -d"

# Verify DB
sg docker -c "docker exec qcbase-db-1 pg_isready -U postgres"

# Start dev server
npm run dev
# → http://localhost:3000
```

## Before Declaring Done

- [ ] `npm run build` passes (TypeScript + Turbopack)
- [ ] `npm test` passes (vitest, 8 parser tests)
- [ ] All key routes return 200: `/`, `/login`, `/explore`, `/creator?creator=creator`
- [ ] `POST /api/auth/login` returns success with test credentials
- [ ] Cart system: add product, open agent, navigate prev/next
- [ ] Import page: upload CSV, verify products appear in DB
- [ ] Collections: create, list, delete
