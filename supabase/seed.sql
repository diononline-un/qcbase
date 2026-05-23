-- QCBase Seed Data
-- Creates test users, creators, products and links

-- Create test profiles (these need to exist in auth.users first in production)
-- For local dev, we can insert directly into profiles
DO $$
DECLARE
  v_user1 UUID := '11111111-1111-1111-1111-111111111111';
  v_user2 UUID := '22222222-2222-2222-2222-222222222222';
  v_user3 UUID := '33333333-3333-3333-3333-333333333333';
  v_product_id UUID;
BEGIN
  -- Only insert if profiles table is empty
  IF NOT EXISTS (SELECT 1 FROM public.profiles LIMIT 1) THEN
    -- For local dev, we need to set session for RLS bypass
    PERFORM set_config('request.jwt.claims', '{"role":"service_role"}', false);

    INSERT INTO public.profiles (id, username, role, tier, avatar_url) VALUES
      (v_user1, 'fashionhunter', 'creator', 'creator', 'https://api.dicebear.com/9.x/avataaars/svg?seed=fashion'),
      (v_user2, 'sneakerdealer', 'creator', 'creator_plus', 'https://api.dicebear.com/9.x/avataaars/svg?seed=sneaker'),
      (v_user3, 'luxuryfinds', 'creator', 'free', 'https://api.dicebear.com/9.x/avataaars/svg?seed=luxury');

    INSERT INTO public.creator_settings (creator_id, subdomain, theme, banner_url, affiliate_codes) VALUES
      (
        v_user1, 'fashionhunter',
        '{"primaryColor": "#8B5CF6", "backgroundColor": "#0F0F0F"}'::jsonb,
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop',
        '{"mulebuy": "fashion001", "cnfans": "fh_cnfans"}'::jsonb
      ),
      (
        v_user2, 'sneakerdealer',
        '{"primaryColor": "#F97316", "backgroundColor": "#0F0F0F"}'::jsonb,
        'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1200&h=400&fit=crop',
        '{"mulebuy": "sneaker001"}'::jsonb
      ),
      (
        v_user3, 'luxuryfinds',
        '{"primaryColor": "#EC4899", "backgroundColor": "#0F0F0F"}'::jsonb,
        'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1200&h=400&fit=crop',
        '{}'::jsonb
      );

    -- Insert products
    INSERT INTO public.products (id, source_url, normalized_url, platform, item_id, title, agent_cached_price) VALUES
      (gen_random_uuid(), 'https://weidian.com/item.html?itemID=123456789', 'weidian:123456789', 'weidian', '123456789', 'Balenciaga Logo Hoodie (Batch A)', 45.00),
      (gen_random_uuid(), 'https://weidian.com/item.html?itemID=234567890', 'weidian:234567890', 'weidian', '234567890', 'Nike Dunk Low Panda (FK Batch)', 28.50),
      (gen_random_uuid(), 'https://item.taobao.com/item.htm?id=345678901', 'taobao:345678901', 'taobao', '345678901', 'Arc''teryx Beta LT Jacket (RepCourier)', 52.00),
      (gen_random_uuid(), 'https://item.taobao.com/item.htm?id=456789012', 'taobao:456789012', 'taobao', '456789012', 'Essentials FOG Hoodie (SYTM)', 18.00),
      (gen_random_uuid(), 'https://weidian.com/item.html?itemID=567890123', 'weidian:567890123', 'weidian', '567890123', 'Yeezy Slide Bone (LW Batch)', 12.00),
      (gen_random_uuid(), 'https://weidian.com/item.html?itemID=678901234', 'weidian:678901234', 'weidian', '678901234', 'Supreme Box Logo Tee (TeenageClub)', 15.00),
      (gen_random_uuid(), 'https://detail.1688.com/offer/789012345.html', '1688:789012345', '1688', '789012345', 'Carhartt Cargopants (WTG Batch)', 22.00),
      (gen_random_uuid(), 'https://item.taobao.com/item.htm?id=890123456', 'taobao:890123456', 'taobao', '890123456', 'Stone Island Crewneck (TopStoney)', 35.00),
      (gen_random_uuid(), 'https://weidian.com/item.html?itemID=901234567', 'weidian:901234567', 'weidian', '901234567', 'Louis Vuitton Belt (Brother Sam)', 25.00),
      (gen_random_uuid(), 'https://item.taobao.com/item.htm?id=102345678', 'taobao:102345678', 'taobao', '102345678', 'Moncler Maya Jacket (TMX)', 68.00),
      (gen_random_uuid(), 'https://weidian.com/item.html?itemID=112345678', 'weidian:112345678', 'weidian', '112345678', 'Jordan 4 Bred (GX Batch)', 42.00),
      (gen_random_uuid(), 'https://weidian.com/item.html?itemID=122345678', 'weidian:122345678', 'weidian', '122345678', 'Gallery Dept Tee (Chaosmade)', 11.00),
      (gen_random_uuid(), 'https://item.taobao.com/item.htm?id=132345678', 'taobao:132345678', 'taobao', '132345678', 'Bottega Veneta Puddle Boots', 38.00),
      (gen_random_uuid(), 'https://detail.1688.com/offer/142345678.html', '1688:142345678', '1688', '142345678', 'Ralph Lauren Cable Knit (CloudShop)', 16.00),
      (gen_random_uuid(), 'https://weidian.com/item.html?itemID=152345678', 'weidian:152345678', 'weidian', '152345678', 'Chrome Hearts Beanie', 8.00);
  END IF;
END $$;

-- Link products to creators
DO $$
DECLARE
  v_fashion UUID;
  v_sneaker UUID;
  v_luxury UUID;
BEGIN
  SELECT id INTO v_fashion FROM public.profiles WHERE username = 'fashionhunter' LIMIT 1;
  SELECT id INTO v_sneaker FROM public.profiles WHERE username = 'sneakerdealer' LIMIT 1;
  SELECT id INTO v_luxury FROM public.profiles WHERE username = 'luxuryfinds' LIMIT 1;

  IF NOT EXISTS (SELECT 1 FROM public.creator_items LIMIT 1) THEN
    PERFORM set_config('request.jwt.claims', '{"role":"service_role"}', false);

    -- fashionhunter: products 1-8
    FOR i IN 0..7 LOOP
      INSERT INTO public.creator_items (creator_id, product_id, category, sort_order, is_pinned)
      SELECT v_fashion, id, (ARRAY['Hoodies', 'Sneakers', 'Jackets', 'Hoodies', 'Slides', 'T-Shirts', 'Pants', 'Knitwear'])[i+1],
             i, CASE WHEN i < 3 THEN true ELSE false END
      FROM public.products ORDER BY created_at OFFSET i LIMIT 1;
    END LOOP;

    -- sneakerdealer: products 2,5,9,11 (sneaker/slide focused)
    FOR i IN ARRAY[1,4,8,10]::int[] LOOP
      INSERT INTO public.creator_items (creator_id, product_id, category, sort_order, is_pinned)
      SELECT v_sneaker, id, 'Sneakers', i, i < 3
      FROM public.products ORDER BY created_at OFFSET i LIMIT 1;
    END LOOP;

    -- luxuryfinds: products 3,9,10,13,15 (luxury focused)
    FOR i IN ARRAY[2,8,9,12,14]::int[] LOOP
      INSERT INTO public.creator_items (creator_id, product_id, category, sort_order, is_pinned)
      SELECT v_luxury, id, 'Luxury', i, false
      FROM public.products ORDER BY created_at OFFSET i LIMIT 1;
    END LOOP;

    -- Reset role
    PERFORM set_config('request.jwt.claims', '', false);
  END IF;
END $$;
