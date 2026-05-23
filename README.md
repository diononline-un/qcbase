# 📂 QCBase – Master Project Requirements Document (PRD)

**Repository:** `https://github.com/diononline-un/qcbase`  
**Project Name:** QCBase  
**Primary Goal:** Entwicklung eines hochperformanten, zentralisierten Creator-Hubs für Proxy-Shopping (Ersatz für unübersichtliche Link-Spreadsheets).  
**Target Audience:** Proxy-Shopping Creator (TikTok, Insta), deren Communities und Sourcing-Agents.

---

## 1. System Architecture & Tech Stack

Dieses System ist auf Skalierbarkeit, schnelle Ladezeiten und Multi-Tenancy ausgelegt. 

* **Frontend / Fullstack:** Next.js (App Router, React).
* **Datenbank & Backend-Services:** Supabase (PostgreSQL, Auth, Row Level Security).
* **Styling & UI:** Tailwind CSS, Shadcn/ui (für minimalistisches, Asos-ähnliches Design).
* **Tracking & Analytics:** PostHog (Event-Tracking, Click-Outs).
* **Payment & MoR:** Paddle (globale Tax-Compliance und Subscription Management).
* **Scraping / Automatisierung:** Playwright / TypeScript (Node.js) oder Python – fokussiert auf das Scraping von *Agenten-Seiten*, NICHT der Ursprungsseiten.

---

## 2. Database Schema (Supabase PostgreSQL)

Die Datenbank muss folgende Struktur (inkl. RLS Policies) abbilden:

| Table Name | Core Columns | Description |
| :--- | :--- | :--- |
| `profiles` | `id` (FK auth), `username`, `role` (user/creator/admin), `tier` | Zentrales Nutzerprofil und SaaS-Tier (Free, Creator, Creator+, Reseller). |
| `creator_settings` | `creator_id`, `subdomain`, `custom_domain`, `theme` | UI-Settings und Affiliate-IDs des Creators. |
| `products` | `id`, `source_url` (Base), `agent_cached_price`, `title`, `status` | Dedublizierte Produktdatenbank (Single Source of Truth). |
| `product_images` | `id`, `product_id`, `url`, `is_qc` (boolean) | Speichert QC-Bilder und Produkt-Thumbnails. |
| `creator_items` | `id`, `creator_id`, `product_id`, `category` | Mapping: Welcher Creator listet welches Produkt in seinem Hub. |
| `click_events` | `id`, `product_id`, `creator_id`, `timestamp` | (Optional) Raw-Data für Analytics, falls PostHog-Daten aggregiert werden sollen. |

---

## 3. Core Engine Specifications (Für OpenCode)

### 3.1. Routing & Multi-Tenancy (Next.js Middleware)
Das System nutzt eine Single-Tenant-Architektur mit dynamischem Routing:
* **Subdomains:** `creatorname.qcbase.site`
* **Custom Domains (Pro-Feature):** `links.creator.com` (via CNAME auf unseren Server).
* *Entwickler-Anweisung:* Erstelle eine `middleware.ts`, die den `Host`-Header ausliest, gegen die `creator_settings` Tabelle matcht und das korrekte Profil lädt. Die UI-Komponente bleibt dieselbe, nur die geladenen Daten (`creator_items`), Custom-Banner und Farben ändern sich dynamisch.

### 3.2. URL-Parser & Agent-Abstraction (Die Engine)
Das System speichert nur die reine *Source-URL* (z.B. Weidian, Taobao, 1688). 
* **Parsing:** Nutze robuste Regex-Pattern (Referenz: etablierte Open-Source-Lösungen wie die *jadeship-browser-extension*), um aus beliebigen Links (auch Short-Links und alten Pandabuy-Links) die reine Plattform und Item-ID zu extrahieren.
* **Agent-Configs:** Erstelle einen isolierten Ordner `/lib/agents/`. Jeder Agent (Mulebuy, CNFans, etc.) bekommt ein einheitliches Interface:
  ```typescript
  export interface AgentConfig {
    id: string;
    name: string;
    buildUrl: (sourceUrl: string, affiliateCode: string) => string;
  }
