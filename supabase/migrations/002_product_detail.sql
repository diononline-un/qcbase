-- QCBase Database Migration 002: Product Detail & Comments
-- Adds: product descriptions, creator preferences, comments, comment votes

-- ============================================================
-- Products: Add description
-- ============================================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;

-- ============================================================
-- Creator Settings: New columns
-- ============================================================
ALTER TABLE creator_settings ADD COLUMN IF NOT EXISTS preferred_agent TEXT;
ALTER TABLE creator_settings ADD COLUMN IF NOT EXISTS disable_platform_refs BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE creator_settings ADD COLUMN IF NOT EXISTS recommendation_weights JSONB DEFAULT '{"price_bias": 0.3, "brand_bias": 0.2, "category_bias": 0.3, "ctr_bias": 0.2}'::jsonb;

-- ============================================================
-- Comment Votes (GL/RL per user per product)
-- ============================================================
CREATE TABLE IF NOT EXISTS comment_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('gl', 'rl')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_comment_votes_product_id ON comment_votes(product_id);

-- ============================================================
-- Product Comments
-- ============================================================
CREATE TABLE IF NOT EXISTS product_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES product_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_comments_product_id ON product_comments(product_id);
CREATE INDEX idx_product_comments_user_id ON product_comments(user_id);
CREATE INDEX idx_product_comments_parent_id ON product_comments(parent_id);

-- ============================================================
-- Comment Mentions
-- ============================================================
CREATE TABLE IF NOT EXISTS comment_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES product_comments(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
  UNIQUE(comment_id, mentioned_user_id)
);

CREATE INDEX idx_comment_mentions_comment_id ON comment_mentions(comment_id);
CREATE INDEX idx_comment_mentions_mentioned_user_id ON comment_mentions(mentioned_user_id);
