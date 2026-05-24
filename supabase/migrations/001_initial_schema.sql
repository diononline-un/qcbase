-- QCBase Database Schema V4
-- Migration 001: Initial Schema Setup

-- Enums
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'creator', 'admin');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_tier AS ENUM ('free', 'creator', 'creator_plus', 'reseller');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- Auth Tables (standalone, no Supabase dependency)
-- ============================================================

CREATE TABLE IF NOT EXISTS user_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  username TEXT,
  role user_role NOT NULL DEFAULT 'user',
  tier subscription_tier NOT NULL DEFAULT 'free',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_sessions_token ON user_sessions(token);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);

-- ============================================================
-- Creator Settings
-- ============================================================

CREATE TABLE IF NOT EXISTS creator_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL UNIQUE REFERENCES user_accounts(id) ON DELETE CASCADE,
  subdomain TEXT UNIQUE,
  custom_domain TEXT UNIQUE,
  theme JSONB DEFAULT '{}'::jsonb,
  banner_url TEXT,
  affiliate_codes JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Products (deduplicated product database)
-- ============================================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url TEXT NOT NULL,
  normalized_url TEXT NOT NULL UNIQUE,
  platform TEXT,
  item_id TEXT,
  title TEXT,
  sizes TEXT,
  agent_cached_price NUMERIC(10, 2),
  is_oos BOOLEAN NOT NULL DEFAULT false,
  last_scraped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_platform ON products(platform);
CREATE INDEX idx_products_item_id ON products(item_id);
CREATE INDEX idx_products_normalized_url ON products(normalized_url);

-- ============================================================
-- Product Images
-- ============================================================

CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_qc BOOLEAN NOT NULL DEFAULT false,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);

-- ============================================================
-- Creator Items (mapping creators to products)
-- ============================================================

CREATE TABLE IF NOT EXISTS creator_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category TEXT,
  custom_title TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(creator_id, product_id)
);

CREATE INDEX idx_creator_items_creator_id ON creator_items(creator_id);

-- ============================================================
-- Click Events (analytics)
-- ============================================================

CREATE TABLE IF NOT EXISTS click_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_click_events_creator_id ON click_events(creator_id);

-- ============================================================
-- User Collections (personal lists)
-- ============================================================

CREATE TABLE IF NOT EXISTS user_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES user_collections(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(collection_id, product_id)
);
