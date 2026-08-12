-- QCBase Database Migration 003: Star Ratings, Social Links, Campaigns
-- Replaces: GL/RL comment_votes with 1-5 star product_ratings
-- Adds: Social media links, best agent, banner URLs, platform campaigns

-- ============================================================
-- Drop old GL/RL votes table
-- ============================================================
DROP TABLE IF EXISTS comment_votes CASCADE;

-- ============================================================
-- Star Ratings (1-5 per user per product)
-- ============================================================
CREATE TABLE product_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_product_ratings_product_id ON product_ratings(product_id);
CREATE INDEX idx_product_ratings_user_id ON product_ratings(user_id);

-- ============================================================
-- Creator Settings: Social links & banners
-- ============================================================
ALTER TABLE creator_settings ADD COLUMN IF NOT EXISTS social_instagram TEXT;
ALTER TABLE creator_settings ADD COLUMN IF NOT EXISTS social_tiktok TEXT;
ALTER TABLE creator_settings ADD COLUMN IF NOT EXISTS social_discord TEXT;
ALTER TABLE creator_settings ADD COLUMN IF NOT EXISTS social_website TEXT;
ALTER TABLE creator_settings ADD COLUMN IF NOT EXISTS best_agent TEXT;
ALTER TABLE creator_settings ADD COLUMN IF NOT EXISTS banner_left_url TEXT;
ALTER TABLE creator_settings ADD COLUMN IF NOT EXISTS banner_right_url TEXT;

-- ============================================================
-- Platform Campaigns (QCBase ads on creator pages)
-- ============================================================
CREATE TABLE IF NOT EXISTS platform_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  banner_url TEXT,
  target_url TEXT,
  creator_id UUID REFERENCES user_accounts(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
