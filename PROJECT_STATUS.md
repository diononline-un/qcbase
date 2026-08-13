---
status: in-development
progress: 65
version: "0.1.0"
tags: [proxy-shopping, nextjs, supabase, saas]
scope: "QCBase ist ein zentralisierter Creator-Hub für Proxy-Shopping (Ersatz für Link-Spreadsheets) mit Multi-Agent-Checkout, QC-Bildern und Multi-Tenant-Routing."
last_updated: "2026-08-13"
next_steps:
  - App lokal starten (Docker DB + npm run dev) und alle Kernrouten gegen Checkliste verifizieren
  - Agent-URL-Patterns für die 9 generischen Agenten verifizieren/korrigieren (nur GTBuy + ACBuy sind real)
  - Paddle-Checkout-Integration: console.log-Placeholder durch echtes Paddle.js ersetzten
  - Cron-Scheduling für den OOS-Check-Route aktivieren (Route existiert, kein Scheduler)
  - Collection-Detailseite bauen (Items anzeigen/verwalten)
---

# Aktueller Stand
- Next.js 16 App mit Landing Page, Creator Hub, Explore-Feed, Login und Creator-Dashboard (Dark Mode) läuft
- Custom PBKDF2-Auth (statt Supabase Auth) mit Sessions, 2 Testuser vorhanden
- 11 Agenten-Integrationen, URL-Parser (Weidian/Taobao/1688), CSV-Import und Collections CRUD umgesetzt
- DB: Docker Postgres + Mailpit, 9 Tabellen, 3 Migrationen; Playwright-Scraping für CNFans/Mulebuy, Rest Stubs
- Offen: Custom-Domain-Routing, Paddle-Billing, OOS-Cron-Scheduler, 9 Agent-URLs unverifiziert, nur 8 Parser-Tests
