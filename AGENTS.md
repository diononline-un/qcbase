<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:qcbase-session-handover -->
# QCBase Session Handover

**ALWAYS read these 4 files in order before doing any work:**

1. **[HANDOVER.md](./HANDOVER.md)** — Critical context, startup sequence, common pitfalls
2. **[SESSION_SUMMARY.md](./SESSION_SUMMARY.md)** — What was built, current state, known bugs
3. **[DECISIONS.md](./DECISIONS.md)** — Why things were built this way
4. **[LEARNINGS.md](./LEARNINGS.md)** — Problems encountered and their solutions

**Tech stack gotchas:**
- Next.js 16 (Turbopack, `proxy.ts` not `middleware.ts`)
- Tailwind v4 (`@import "tailwindcss"` syntax)
- shadcn/ui v4 (`@base-ui/react`, not Radix — no `asChild`)
- Direct Postgres via `postgres` npm (not Supabase JS client)
- Custom PBKDF2 auth (not Supabase Auth)

**Before editing any file:** Check `node_modules/next/dist/docs/` for breaking API changes.
<!-- END:qcbase-session-handover -->
