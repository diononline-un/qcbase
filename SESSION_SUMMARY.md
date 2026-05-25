# SESSION_SUMMARY.md – Session Work Log

> **Dates:** 2026-05-23 to 2026-05-25  
> **Project:** QCBase – Proxy-Shopping Creator Hub  
> **Repo:** `https://github.com/diononline-un/qcbase`  
> **Branch:** `main`  
> **Last commit:** `bcc432e` – "Phase 5-6: Import Pipeline + Collections"
> **Linked docs:** [DECISIONS.md](./DECISIONS.md) | [LEARNINGS.md](./LEARNINGS.md) | [HANDOVER.md](./HANDOVER.md)

## Current State

- **Server:** `http://localhost:3000` (Next.js 16 dev, must restart after PC reboot)
- **Database:** Docker `supabase/postgres:15.8.1.074` on port `54322` (named volume `pgdata`)
- **DB Tables (9):** `user_accounts`, `user_sessions`, `creator_settings`, `products`, `product_images`, `creator_items`, `click_events`, `user_collections`, `collection_items`
- **DB Data:** 0 seed products (clean slate), 2 test users
- **Auth:** Custom PBKDF2-based auth (not Supabase Auth)
- **Test Users:** `creator@qcbase.site` / `test123` (creator tier), `user@qcbase.site` / `test123` (free tier)

## What Was Built This Session

### Phase 1-2: Initial Setup
- [x] Next.js 16 App Router + TypeScript + Tailwind v4
- [x] shadcn/ui v4 components (uses `@base-ui/react`, not Radix)
- [x] Docker Compose for local Supabase Postgres
- [x] Migration: `001_initial_schema.sql` (original with `profiles` table)
- [x] Landing page, Creator Hub, Login page
- [x] 11 Agent integrations (`/lib/agents/`)
- [x] URL parser (Weidian, Taobao, 1688, DHGate, Pandabuy)
- [x] Playwright scraping infrastructure (base, cnfans, mulebuy, image-scraper)
- [x] Server actions (CRUD products, profile settings)
- [x] Seed data from JZLIN'S SPREADSHEET.xlsx (1022 DHGate products) — **LATER REMOVED**
- [x] Creator Dashboard (analytics, links, theme, settings, billing)
- [x] PostHog provider (events wired in Phase 3)
- [x] Paddle webhook handler (placeholder)
- [x] Feature gating (4 tiers, `<FeatureGate>` component)

### Phase 3: Design Bugfixes + Polish
- [x] QC-Image hover swap on product cards (opacity transition)
- [x] OOS state: `opacity-40` + monospace `[OOS]` badge
- [x] Dual-font system: Geist Sans (UI) + Geist Mono (data/prices/IDs)
- [x] `--creator-accent` CSS variable injection per creator
- [x] Quick-View Modal replacement for old floating dialog
- [x] GL/RL voting buttons (functional with state)
- [x] `/explore` page with global aggregation + QCBase referral override
- [x] Loading skeleton grid for hub pages
- [x] Grid: `lg:grid-cols-5` (was `lg:grid-cols-4`)
- [x] Agent URL deduplication (use `/lib/agents/registry` not inline)
- [x] PostHog events: `click_out_to_agent`, `item_viewed`, `search_query_entered`
- [x] Dashboard analytics with real data (agent distribution, top products)
- [x] Feature gating: free tier sees 1 agent, creator+ sees 11

### Phase 4: V4 Rebuild (Database Reset)
- [x] Dropped all tables, recreated from scratch
- [x] `profiles` → `user_accounts` rename (12 files updated)
- [x] `user_accounts` + `user_sessions` added to migration
- [x] PBKDF2 password hashing (10k iterations, sha512, 64 bytes)
- [x] `sizes TEXT` column on `products`
- [x] `user_collections` + `collection_items` tables
- [x] Deleted product detail page route (`[creator]/product/[productId]`)
- [x] `ProductDetailModal` component (Dialog-based, working checkout, sizes display)
- [x] Login page: email/password form, register tab, dead imports removed
- [x] Landing page: Marquee ticker, Bento grid, Trending teaser, Creator showcase
- [x] Dashboard dark mode (`bg-zinc-950`)

### Phase 5-6: Import + Collections
- [x] CSV import pipeline (`src/lib/actions/import.ts`)
- [x] Import page with file upload + paste URLs
- [x] Collections CRUD (create, delete, list)
- [x] Dashboard sidebar: Import + Collections links
- [x] Textarea shadcn/ui component added

## What Is NOT Done

- [ ] Full Supabase stack (Kong, GoTrue, PostgREST) — using direct Postgres instead
- [ ] Custom domain CNAME routing in proxy.ts (basic Host header parsing exists)
- [ ] Agent scrapers beyond CNFans + Mulebuy (others are stubs)
- [ ] Cron job scheduling (API routes exist but no scheduler configured)
- [ ] Paddle.js client-side SDK integration (checkout is a console.log placeholder)
- [ ] Test coverage beyond parser (8 parser tests pass with vitest)
- [ ] Error boundaries (`error.tsx`) for hub and explore pages
- [ ] Explore page trending algorithm (always returns 0 clicks — no data yet)
- [ ] Image scraping pipeline actually tested with real Playwright
- [ ] Proper agent URL patterns for all 11 agents (only GTBuy + ACBuy are correct)
- [ ] Collection detail page (view/manage items in a collection)
- [ ] Server not running as daemon/systemd service

## Known Bugs

1. **Agent URL patterns outdated:** Only GTBuy and ACBuy use real URL formats. Other 9 agents use generic `/item?url=` which may not work.
2. **Explore counts always 0:** `clickMap` is built from `click_events` table which is empty. Trending sort does nothing.
3. **Image scraper silently fails:** Fire-and-forget pattern swallows all Playwright errors.
4. **Product card links:** Cards use `onClick` → modal, not `<Link>` — no right-click "Open in new tab" support.
5. **Cart popup may be blocked:** `window.open` without direct user click context (the cart dropdown button click may not count as "user gesture" for popup blocking).

## Running the App

```bash
# 1. Start Docker (if not running)
sudo systemctl start docker    # or: systemctl start docker.socket

# 2. Start database
cd /home/diono/Projects/qcbase
sg docker -c "docker compose up -d"

# 3. Start dev server
npm run dev
# → http://localhost:3000

# 4. Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"creator@qcbase.site","password":"test123"}'
```

## Key File Index

| File | Purpose |
|------|---------|
| `src/lib/supabase/admin.ts` | Direct Postgres query wrapper (chainable, Supabase-compatible API) |
| `src/lib/auth/auth.ts` | PBKDF2 auth: register, login, session management |
| `src/lib/agents/agents.ts` | 11 agent configs with `buildUrl` per agent |
| `src/lib/agents/registry.ts` | Agent lookup + `buildAgentUrl()` |
| `src/lib/stores/cart-store.ts` | Zustand cart with localStorage persistence |
| `src/proxy.ts` | Multi-tenant routing (subdomain + custom domain) |
| `src/components/hub/product-detail-modal.tsx` | Quick-view modal (image carousel, checkout, voting) |
| `src/components/hub/product-card.tsx` | Product tile card (hover QC swap, sizes badge) |
| `src/components/hub/creator-hub-header.tsx` | Sticky header with search, cart, filter pills |
| `src/components/cart/cart-button.tsx` | Cart dropdown with agent launcher |
| `src/lib/actions/import.ts` | Batch CSV/link import server action |
| `src/app/explore/page.tsx` | Global explore feed |
| `supabase/migrations/001_initial_schema.sql` | Full DB schema (must be run manually via psql for new DB) |
| `docker-compose.yml` | Postgres + Mailpit containers |
