# 📂 QCBase – Master Project Requirements Document (PRD)

**Repository:** `https://github.com/diononline-un/qcbase`
**Project Name:** QCBase
**Primary Goal:** Entwicklung eines hochperformanten, zentralisierten Creator-Hubs für Proxy-Shopping (Ersatz für unübersichtliche Link-Spreadsheets).
**Target Audience:** Proxy-Shopping Creator (TikTok, Insta), deren Communities und Sourcing-Agents.

---

## 1. Competitive Context & Baseline (Für OpenCode)

Um zu verstehen, was wir bauen, musst du wissen, was wir ersetzen:

- **Die Konkurrenz (Baseline):** Plattformen wie `mulebuylinks.xyz` oder einfache Google Sheets.
- **Der Schwachpunkt:** Sie sind langsam, voller toter (Out-of-Stock) Links, erfordern manuelle Pflege und bieten keine nativen QC-Bilder-Galerien. Der Link-Converter von Konkurrenten nutzt oft primitive URL-Zusammensetzungen.
- **Unser Ziel:** Wir bauen ein SaaS-Produkt, das wie ein moderner E-Commerce-Shop (z. B. Asos) aussieht. Daten werden automatisiert gecached, tote Links automatisch entfernt und QC-Bilder direkt von den Agenten-Servern gestreamt.

---

## 2. Reference Codebases & Assets (WICHTIG für Parsing & Logik)

Erfinde das Rad nicht neu! Nutze zwingend diese Referenzen für die Core-Logik:

1. **URL Parsing & Regex:** Beziehe dich auf das Open-Source-Repo `cachho/jadeship-browser-extension` auf GitHub. Nutze deren kampferprobte TypeScript-Logik/Regex, um Artikel-IDs aus Taobao, 1688, Weidian und Short-Links (wie `weidian.info`) fehlerfrei zu extrahieren.
2. **Agent-Abstraction & Shipping Calc:** Nutze die Architektur aus der mitgelieferten `ReFlow Parcel Optimizer Extension` (falls im Repo vorhanden). Speziell das Agent-Interface aus `content/agents/` und die 8-stufige Versandkostenberechnung aus `optimizer.js`.

---

## 3. System Architecture & Tech Stack

Dieses System ist auf Skalierbarkeit, schnelle Ladezeiten und Multi-Tenancy ausgelegt.

- **Frontend / Fullstack:** Next.js (App Router, React).
- **Datenbank & Backend-Services:** Supabase (PostgreSQL, Auth, Row Level Security).
- **Styling & UI:** Tailwind CSS, Shadcn/ui (für minimalistisches Design).
- **Tracking & Analytics:** PostHog (Event-Tracking, Click-Outs).
- **Payment & MoR:** Paddle (globale Tax-Compliance und Subscription Management).
- **Scraping / Automatisierung:** Playwright / TypeScript (Node.js) oder Python – fokussiert auf das Scraping von *Agenten-Seiten*, NICHT der Ursprungsseiten.

---

## 4. Database Schema (Supabase PostgreSQL)

Die Datenbank muss folgende Struktur (inkl. RLS Policies) abbilden:

| Table Name | Core Columns | Description |
| :--- | :--- | :--- |
| `profiles` | `id` (FK auth), `username`, `role` (user/creator/admin), `tier` | Zentrales Nutzerprofil und SaaS-Tier (Free, Creator, Creator+, Reseller). |
| `creator_settings` | `creator_id`, `subdomain`, `custom_domain`, `theme` | UI-Settings und Affiliate-IDs des Creators. |
| `products` | `id`, `source_url` (Base), `agent_cached_price`, `title`, `status` | Dedublizierte Produktdatenbank (Single Source of Truth). |
| `product_images` | `id`, `product_id`, `url`, `is_qc` (boolean) | Speichert QC-Bilder und Produkt-Thumbnails. |
| `creator_items` | `id`, `creator_id`, `product_id`, `category` | Mapping: Welcher Creator listet welches Produkt in seinem Hub. |

---

## 5. Core Engine Specifications (Für OpenCode)

### 5.1. Routing & Multi-Tenancy (Next.js Middleware)

Das System nutzt eine Single-Tenant-Architektur mit dynamischem Routing:

- **Subdomains:** `creatorname.qcbase.site`
- **Custom Domains (Pro-Feature):** `links.creator.com` (via CNAME auf unseren Server).
- *Entwickler-Anweisung:* Erstelle eine `middleware.ts`, die den `Host`-Header ausliest, gegen die `creator_settings` Tabelle matcht und das korrekte Profil lädt. Die UI-Komponente bleibt dieselbe, nur die geladenen Daten, Banner und Farben ändern sich dynamisch.

### 5.2. URL-Parser & Agent-Abstraction (Die Engine)

Das System speichert nur die reine *Source-URL* (z.B. Weidian, Taobao, 1688).

- **Parsing:** Nutze die Jadeship-Referenz (siehe Kap. 2).
- **Agent-Configs:** Erstelle einen isolierten Ordner `/lib/agents/`. Jeder Agent (Mulebuy, CNFans, etc.) bekommt ein einheitliches Interface:

```typescript
export interface AgentConfig {
  id: string;
  name: string;
  buildUrl: (sourceUrl: string, affiliateCode: string) => string;
}
```

Wenn ein User "Checkout" klickt, wird die Agenten-URL inkl. Affiliate-Code on-the-fly generiert.

### 5.3. Scraping-Strategie (Agent-First)

Um IP-Bans auf chinesischen Marktplätzen zu umgehen:

- **Logik:** Der Scraper loggt sich über dedizierte QCBase-Accounts bei Agenten (z.B. CNFans) ein.
- Er sucht dort nach der `source_url` und extrahiert den Preis, OOS-Check und zieht sich direkt die QC-Bilder von deren Servern.
- *Entwickler-Anweisung:* Implementiere robustes Error-Handling und Fallback-Agenten, falls ein Scrape-Versuch fehlschlägt. Der Job muss Load-Balanced über Proxies laufen.

### 5.4. Tracking & Analytics (PostHog)

- Integration von PostHog auf der Client-Seite.
- Key-Events: `search_query_entered`, `item_viewed`, und vor allem `click_out_to_agent` (wichtigste Metrik zur Messung der Kaufabsicht).

---

## 6. Monetization & Feature Gating (Paddle Integration)

Das System nutzt 4 Tiers, basierend auf `profiles.tier`.

### Tier 1: Free (Market Grab)

**Features:** Auto-OOS Scrubber (globale Bereinigung toter Links), Auto-QC (Standard 3 Bilder), QCBase-Ad-Banner im Feed. Routing über einen Standard-Agenten.

### Tier 2: Creator

**Features:** Multi-Agent-Dropdown, Audience Capture (Mail/Discord Popups), Basic Analytics (Click-Outs), UI-Customization (Akzentfarben/eigenes Banner).

### Tier 3: Creator+

**Features:** Custom Domain Routing (via CNAME), Ad-Override (eigene Werbebanner setzen), Drag&Drop QC-Curation.

### Tier 4: Reseller / Data Pro

**Features:** Kein eigener Hub. Zugang zum globalen "Missed Opportunities" Dashboard und anonymisierten Such-Trends.

---

## 7. Development Roadmap (Action Plan)

### Phase 1: Foundation & Setup

- [ ] Initialisierung Next.js App Router (Tailwind, Shadcn).
- [ ] Setup Supabase (Projekt anlegen, Tabellen & RLS, Types exportieren).
- [ ] Implementierung der Next.js Middleware für CNAME-Routing.

### Phase 2: Core Logic & Parsers

- [ ] `/lib/agents/` Struktur aufbauen (Link-Builder Interfaces).
- [ ] URL-Parser Utility anhand Jadeship-Repo implementieren.
- [ ] Datenbank-CRUD-Routen für das Hinzufügen von Links.

### Phase 3: Scraping & Automation Pipeline

- [ ] Playwright-Script für das Scraping von Agenten-Seiten (Preise + QC).
- [ ] Cron-Job / Worker Setup für "Out of Stock" (OOS) Checks.

### Phase 4: Tracking, Payment & Launch

- [ ] PostHog Integration (`click_out_to_agent`).
- [ ] Paddle Billing Integration (Webhook-Handling für Tier-Upgrades).
- [ ] Creator-Dashboard UI (Analytics, Link- und Theme-Management).
