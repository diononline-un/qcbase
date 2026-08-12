-- QCBase Seed Data
-- 20+ Demo-Produkte mit Bildern, Bewertungen, Comments, Collections
-- Creator: 00000000-0000-0000-0000-000000000001 (creator@qcbase.site)
-- User:    00000000-0000-0000-0000-000000000002 (user@qcbase.site)

\set creator_id '00000000-0000-0000-0000-000000000001'
\set user_id    '00000000-0000-0000-0000-000000000002'

-- ============================================================
-- Produkte (Streetwear, Sneakers, Accessories)
-- ============================================================
INSERT INTO products (source_url, normalized_url, platform, item_id, title, description, sizes, agent_cached_price)
VALUES
  ('https://weidian.com/item.html?itemID=100001', 'weidian:100001', 'weidian', '100001', 'Balenciaga Logo Hoodie Black', 'Premium heavyweight cotton hoodie with embroidered logo across chest. Oversized fit, ribbed cuffs.', 'XS, S, M, L, XL', 89.00),
  ('https://weidian.com/item.html?itemID=100002', 'weidian:100002', 'weidian', '100002', 'Gallery Dept Paint Flare Jeans', 'Hand-painted denim with signature Gallery Dept distressing. Straight leg, paint splatter details.', '30, 32, 34, 36', 125.00),
  ('https://weidian.com/item.html?itemID=100003', 'weidian:100003', 'weidian', '100003', 'Essentials Fear of God Hoodie', 'Minimal design with reflective 3M branding. Cotton-polyester blend, dropped shoulders.', 'S, M, L, XL, 2XL', 55.00),
  ('https://weidian.com/item.html?itemID=100004', 'weidian:100004', 'weidian', '100004', 'Nike Dunk Low Panda Retro', 'Classic black and white colorway. Leather upper, padded collar, rubber outsole.', '40, 41, 42, 43, 44, 45', 79.00),
  ('https://weidian.com/item.html?itemID=100005', 'weidian:100005', 'weidian', '100005', 'Ralph Lauren Cable Knit Sweater', 'Classic cable knit pattern with embroidered pony logo. 100% cotton, preppy aesthetic.', 'M, L, XL', 68.00),
  ('https://weidian.com/item.html?itemID=100006', 'weidian:100006', 'weidian', '100006', 'Stone Island Ghost Overshirt', 'Technical fabric overshirt with removable compass badge. Water-resistant, hidden pockets.', 'S, M, L, XL', 145.00),
  ('https://weidian.com/item.html?itemID=100007', 'weidian:100007', 'weidian', '100007', 'Jordan 1 High Travis Scott Mocha', 'Reverse swoosh design with premium suede and leather. Cactus Jack branding on tongue.', '40, 41, 42, 43, 44, 45', 165.00),
  ('https://weidian.com/item.html?itemID=100008', 'weidian:100008', 'weidian', '100008', 'Arc''teryx Beta LT Jacket', 'Gore-Tex 3L waterproof shell. Helmet-compatible hood, pit zips, packable design.', 'S, M, L, XL', 199.00),
  ('https://weidian.com/item.html?itemID=100009', 'weidian:100009', 'weidian', '100009', 'Chrome Hearts Cross Tee', 'Signature gothic cross print on heavyweight cotton. Made in USA quality reproduction.', 'S, M, L, XL', 45.00),
  ('https://weidian.com/item.html?itemID=100010', 'weidian:100010', 'weidian', '100010', 'Stussy World Tour Tee', 'Classic Stussy world tour graphic on front and back. Pigment dyed for vintage look.', 'M, L, XL, 2XL', 32.00),
  ('https://weidian.com/item.html?itemID=100011', 'weidian:100011', 'weidian', '100011', 'New Balance 990v6 Grey Day', 'Made in USA premium running shoe. ENCAP midsole, pigskin suede upper, reflective details.', '41, 42, 43, 44, 45', 135.00),
  ('https://weidian.com/item.html?itemID=100012', 'weidian:100012', 'weidian', '100012', 'Carhartt Detroit Jacket WIP', 'Hamilton brown duck canvas jacket with blanket lining. Diamond-quilted, corduroy collar.', 'S, M, L, XL', 98.00),
  ('https://weidian.com/item.html?itemID=100013', 'weidian:100013', 'weidian', '100013', 'Vivienne Westwood Pearl Necklace', 'Layered pearl choker with signature Saturn orb pendant. Gold-tone hardware, adjustable chain.', 'One Size', 38.00),
  ('https://weidian.com/item.html?itemID=100014', 'weidian:100014', 'weidian', '100014', 'Supreme Box Logo Hoodie FW24', 'Seasonal box logo release. Heavyweight 400gsm cotton crossgrain fleece.', 'M, L, XL', 110.00),
  ('https://weidian.com/item.html?itemID=100015', 'weidian:100015', 'weidian', '100015', 'Casablanca Tennis Club Shirt', 'Silk-blend camp collar shirt with vibrant palm print. Mother of pearl buttons.', 'S, M, L, XL', 72.00),
  ('https://taobao.com/item.html?id=200001', 'taobao:200001', 'taobao', '200001', 'Rimowa Cabin Plus Silver', 'Aluminum-magnesium alloy carry-on. Multiwheel system, TSA-approved locks, flex divider.', 'One Size', 280.00),
  ('https://taobao.com/item.html?id=200002', 'taobao:200002', 'taobao', '200002', 'Yeezy Slide Bone White', 'Injection-molded EVA foam slide. Contoured footbed with deep heel cup for comfort.', '40, 41, 42, 43, 44, 45', 28.00),
  ('https://taobao.com/item.html?id=200003', 'taobao:200003', 'taobao', '200003', 'Nocta Hot Step 2 White', 'Drake-designed Nike sneaker. Leather upper with reflective 3M piping, gel midsole.', '41, 42, 43, 44, 45', 95.00),
  ('https://taobao.com/item.html?id=200004', 'taobao:200004', 'taobao', '200004', 'Ami Paris Heart Logo Beanie', 'Merino wool blend beanie with signature Ami de Coeur heart intarsia. Ribbed knit.', 'One Size', 22.00),
  ('https://taobao.com/item.html?id=200005', 'taobao:200005', 'taobao', '200005', 'Dior B23 High Top Oblique', 'Dior Oblique jacquard canvas upper. Calfskin trim, rubber sole with logo detail.', '40, 41, 42, 43, 44', 195.00),
  ('https://taobao.com/item.html?id=200006', 'taobao:200006', 'taobao', '200006', 'Maison Margiela Tabi Boots', 'Signature split-toe boot in smooth leather. White stitch detail at back, stacked heel.', '40, 41, 42, 43', 210.00),
  ('https://taobao.com/item.html?id=200007', 'taobao:200007', 'taobao', '200007', 'Burberry Vintage Check Scarf', 'Classic cashmere blend scarf in archive beige check pattern. Fringed edges.', 'One Size', 85.00),
  ('https://taobao.com/item.html?id=200008', 'taobao:200008', 'taobao', '200008', 'Jacquemus Le Chiquito Bag', 'Mini leather shoulder bag with gold-tone logo lettering. Adjustable strap, flap closure.', 'One Size', 155.00),
  ('https://taobao.com/item.html?id=200009', 'taobao:200009', 'taobao', '200009', 'Palm Angels Track Jacket', 'Classic track jacket with contrast taping. Logo embroidery on chest and back. Nylon shell.', 'S, M, L, XL', 88.00),
  ('https://taobao.com/item.html?id=200010', 'taobao:200010', 'taobao', '200010', 'Rhude Rhecess Low Sneaker', 'Distressed leather low-top with bamboo charm. Vintage wash treatment, gum sole.', '41, 42, 43, 44, 45', 118.00)
RETURNING id, title;

-- ============================================================
-- Produkt-Bilder (reuse Pics + assign dominant_colors)
-- ============================================================
DO $$
DECLARE
  p RECORD;
  img INTEGER;
BEGIN
  FOR p IN SELECT id, row_number() OVER () AS rn FROM products ORDER BY created_at DESC LIMIT 25 LOOP
    img := (p.rn % 6);
    IF img = 0 THEN img := 6; END IF;

    -- Non-QC image
    INSERT INTO product_images (product_id, url, is_qc, "order", dominant_color)
    VALUES (p.id,
      CASE img
        WHEN 1 THEN '/products/wdseller1183518863-2eee0000019d9b20bfc80a23b4f4_2560_2560.jpg'
        WHEN 2 THEN '/products/wdseller1183518863-143a0000019d9b1fc3fa0a2303ee_1125_1125.jpg'
        WHEN 3 THEN '/products/compressed_image_1777690134310.jpg'
        WHEN 4 THEN '/products/compressed_image_1777690151535.jpg'
        WHEN 5 THEN '/products/compressed_image_1777690168111.jpg'
        ELSE '/products/compressed_image_1777690185026.jpg'
      END, false, 0,
      CASE img
        WHEN 1 THEN '#8d8988'
        WHEN 2 THEN '#a39d99'
        WHEN 3 THEN '#606263'
        WHEN 4 THEN '#63a56c'
        WHEN 5 THEN '#609b67'
        ELSE '#5c8f66'
      END);

    -- QC image (use the next cycled image)
    INSERT INTO product_images (product_id, url, is_qc, "order", dominant_color)
    VALUES (p.id,
      CASE (img % 6) + 1
        WHEN 1 THEN '/products/wdseller1183518863-2eee0000019d9b20bfc80a23b4f4_2560_2560.jpg'
        WHEN 2 THEN '/products/wdseller1183518863-143a0000019d9b1fc3fa0a2303ee_1125_1125.jpg'
        WHEN 3 THEN '/products/compressed_image_1777690134310.jpg'
        WHEN 4 THEN '/products/compressed_image_1777690151535.jpg'
        WHEN 5 THEN '/products/compressed_image_1777690168111.jpg'
        ELSE '/products/compressed_image_1777690185026.jpg'
      END, true, 1,
      CASE (img % 6) + 1
        WHEN 1 THEN '#8d8988'
        WHEN 2 THEN '#a39d99'
        WHEN 3 THEN '#606263'
        WHEN 4 THEN '#63a56c'
        WHEN 5 THEN '#609b67'
        ELSE '#5c8f66'
      END);
  END LOOP;
END $$;

-- ============================================================
-- Creator Items (Produkte zum Creator verlinken)
-- ============================================================
INSERT INTO creator_items (creator_id, product_id, category, custom_title, sort_order, is_pinned)
SELECT
  :'creator_id'::UUID,
  p.id,
  CASE (row_number() OVER (ORDER BY p.created_at)) % 5
    WHEN 0 THEN 'Hoodies & Sweaters'
    WHEN 1 THEN 'Denim & Pants'
    WHEN 2 THEN 'Sneakers'
    WHEN 3 THEN 'Accessories'
    ELSE 'Jackets & Outerwear'
  END,
  NULL,
  row_number() OVER (ORDER BY p.created_at) - 1,
  row_number() OVER (ORDER BY p.created_at) <= 3
FROM products p
ORDER BY p.created_at DESC
LIMIT 25;

-- ============================================================
-- Produkt-Bewertungen (Stars)
-- ============================================================
DO $$
DECLARE
  p RECORD;
BEGIN
  FOR p IN SELECT id FROM products LIMIT 25 LOOP
    INSERT INTO product_ratings (user_id, product_id, rating) VALUES (:'creator_id'::UUID, p.id, 5);
  END LOOP;
END $$;

-- ============================================================
-- Comments (Englisch) mit Mentions
-- ============================================================
DO $$
DECLARE
  p_id UUID;
  c_id UUID;
BEGIN
  SELECT id INTO p_id FROM products WHERE normalized_url = 'weidian:100001';
  INSERT INTO product_comments (product_id, user_id, content, language) VALUES (p_id, :'creator_id'::UUID, 'Best hoodie I have ever copped. The embroidery is flawless and the blank is super heavy. @user you need to get this one!', 'en') RETURNING id INTO c_id;
  INSERT INTO comment_mentions (comment_id, mentioned_user_id) VALUES (c_id, :'user_id'::UUID);

  SELECT id INTO p_id FROM products WHERE normalized_url = 'weidian:100003';
  INSERT INTO product_comments (product_id, user_id, content, language) VALUES (p_id, :'user_id'::UUID, 'Quality is insane for the price point. Fits oversized as expected. Shipping took 8 days via GTBuy.', 'en');

  SELECT id INTO p_id FROM products WHERE normalized_url = 'weidian:100007';
  INSERT INTO product_comments (product_id, user_id, content, language) VALUES (p_id, :'creator_id'::UUID, 'Suede quality is nearly 1:1 with retail. Reverse swoosh placement is perfect. GL 100%. @user what agent did you use?', 'en') RETURNING id INTO c_id;
  INSERT INTO comment_mentions (comment_id, mentioned_user_id) VALUES (c_id, :'user_id'::UUID);

  SELECT id INTO p_id FROM products WHERE normalized_url = 'weidian:100004';
  INSERT INTO product_comments (product_id, user_id, content, language) VALUES (p_id, :'user_id'::UUID, 'Clean pair but the toebox is slightly thick compared to retail. Still a solid GL for the price.', 'en');

  SELECT id INTO p_id FROM products WHERE normalized_url = 'weidian:100008';
  INSERT INTO product_comments (product_id, user_id, content, language) VALUES (p_id, :'creator_id'::UUID, 'Waterproofing actually works. Tested in heavy rain. Zippers are smooth and the fit is true to size.', 'en');

  SELECT id INTO p_id FROM products WHERE normalized_url = 'taobao:200005';
  INSERT INTO product_comments (product_id, user_id, content, language) VALUES (p_id, :'user_id'::UUID, 'Oblique pattern alignment is nearly perfect. Came with full packaging including dust bags. Premium experience.', 'en');
END $$;

-- ============================================================
-- Collections
-- ============================================================
INSERT INTO user_collections (user_id, name, is_public) VALUES (:'creator_id'::UUID, 'Winter 2025 Haul', true);
INSERT INTO user_collections (user_id, name, is_public) VALUES (:'creator_id'::UUID, 'Sneaker Rotation', true);
INSERT INTO user_collections (user_id, name, is_public) VALUES (:'creator_id'::UUID, 'Accessories Wishlist', false);

DO $$
DECLARE
  c_winter UUID;
  c_sneaker UUID;
  c_acc UUID;
BEGIN
  SELECT id INTO c_winter FROM user_collections WHERE name = 'Winter 2025 Haul' AND user_id = :'creator_id'::UUID;
  SELECT id INTO c_sneaker FROM user_collections WHERE name = 'Sneaker Rotation' AND user_id = :'creator_id'::UUID;
  SELECT id INTO c_acc FROM user_collections WHERE name = 'Accessories Wishlist' AND user_id = :'creator_id'::UUID;

  INSERT INTO collection_items (collection_id, product_id, sort_order)
  SELECT c_winter, p.id, row_number() OVER () - 1
  FROM products p WHERE p.normalized_url IN ('weidian:100001', 'weidian:100003', 'weidian:100006', 'weidian:100012', 'weidian:100014')
  ORDER BY p.created_at;

  INSERT INTO collection_items (collection_id, product_id, sort_order)
  SELECT c_sneaker, p.id, row_number() OVER () - 1
  FROM products p WHERE p.normalized_url IN ('weidian:100004', 'weidian:100007', 'weidian:100011', 'taobao:200002', 'taobao:200010')
  ORDER BY p.created_at;

  INSERT INTO collection_items (collection_id, product_id, sort_order)
  SELECT c_acc, p.id, row_number() OVER () - 1
  FROM products p WHERE p.normalized_url IN ('weidian:100013', 'taobao:200004', 'taobao:200007', 'taobao:200008')
  ORDER BY p.created_at;
END $$;

-- ============================================================
-- Click Events (simulierte Klicks)
-- ============================================================
INSERT INTO click_events (product_id, creator_id, agent_id)
SELECT p.id, :'creator_id'::UUID, 'gtbuy'
FROM products p
WHERE p.normalized_url IN ('weidian:100001', 'weidian:100007', 'weidian:100004', 'taobao:200005', 'weidian:100008')
ORDER BY random();

INSERT INTO click_events (product_id, creator_id, agent_id)
SELECT p.id, :'creator_id'::UUID, 'acbuy'
FROM products p
WHERE p.normalized_url IN ('weidian:100003', 'weidian:100007', 'weidian:100004')
ORDER BY random();

INSERT INTO click_events (product_id, creator_id, agent_id)
SELECT p.id, :'creator_id'::UUID, 'superbuy'
FROM products p
WHERE p.normalized_url IN ('weidian:100001', 'weidian:100011', 'taobao:200005')
ORDER BY random();

INSERT INTO click_events (product_id, creator_id, agent_id)
SELECT p.id, :'creator_id'::UUID, 'cnfans'
FROM products p
WHERE p.normalized_url IN ('weidian:100007', 'weidian:100014')
ORDER BY random();
