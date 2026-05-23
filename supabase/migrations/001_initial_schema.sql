-- QCBase Database Schema
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

-- Profiles Table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  role user_role NOT NULL DEFAULT 'user',
  tier subscription_tier NOT NULL DEFAULT 'free',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Creator Settings
CREATE TABLE IF NOT EXISTS public.creator_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  subdomain TEXT UNIQUE,
  custom_domain TEXT UNIQUE,
  theme JSONB DEFAULT '{}'::jsonb,
  banner_url TEXT,
  affiliate_codes JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Products (deduplicated product database)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url TEXT NOT NULL,
  normalized_url TEXT NOT NULL UNIQUE,
  platform TEXT,
  item_id TEXT,
  title TEXT,
  agent_cached_price NUMERIC(10, 2),
  is_oos BOOLEAN NOT NULL DEFAULT false,
  last_scraped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_platform ON public.products(platform);
CREATE INDEX IF NOT EXISTS idx_products_item_id ON public.products(item_id);
CREATE INDEX IF NOT EXISTS idx_products_normalized_url ON public.products(normalized_url);

-- Product Images
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_qc BOOLEAN NOT NULL DEFAULT false,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);

-- Creator Items (mapping creators to products)
CREATE TABLE IF NOT EXISTS public.creator_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category TEXT,
  custom_title TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(creator_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_creator_items_creator_id ON public.creator_items(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_items_product_id ON public.creator_items(product_id);

-- Click Events (analytics)
CREATE TABLE IF NOT EXISTS public.click_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_click_events_creator_id ON public.click_events(creator_id);
CREATE INDEX IF NOT EXISTS idx_click_events_product_id ON public.click_events(product_id);
CREATE INDEX IF NOT EXISTS idx_click_events_timestamp ON public.click_events(timestamp);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DO $$ BEGIN
  CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TRIGGER set_updated_at_creator_settings
    BEFORE UPDATE ON public.creator_settings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TRIGGER set_updated_at_products
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role, tier)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1)),
    'user',
    'free'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- RLS Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.click_events ENABLE ROW LEVEL SECURITY;

-- profiles: users can read all profiles, update their own
DO $$ BEGIN
  CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- creator_settings: public can read, creator can update own
DO $$ BEGIN
  CREATE POLICY "Creator settings are viewable by everyone" ON public.creator_settings
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Creator can update own settings" ON public.creator_settings
    FOR UPDATE USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Creator can insert own settings" ON public.creator_settings
    FOR INSERT WITH CHECK (auth.uid() = creator_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- products: anyone can read, authenticated users can insert
DO $$ BEGIN
  CREATE POLICY "Products are viewable by everyone" ON public.products
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can insert products" ON public.products
    FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can update products" ON public.products
    FOR UPDATE TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- product_images: anyone can read, authenticated can insert
DO $$ BEGIN
  CREATE POLICY "Product images are viewable by everyone" ON public.product_images
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can insert product images" ON public.product_images
    FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can update product images" ON public.product_images
    FOR UPDATE TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- creator_items: anyone can read, creator can manage own
DO $$ BEGIN
  CREATE POLICY "Creator items are viewable by everyone" ON public.creator_items
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Creator can insert own items" ON public.creator_items
    FOR INSERT WITH CHECK (auth.uid() = creator_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Creator can update own items" ON public.creator_items
    FOR UPDATE USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Creator can delete own items" ON public.creator_items
    FOR DELETE USING (auth.uid() = creator_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- click_events: authenticated can insert, creators can read own
DO $$ BEGIN
  CREATE POLICY "Authenticated users can insert click events" ON public.click_events
    FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Creators can read own click events" ON public.click_events
    FOR SELECT USING (auth.uid() = creator_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;
