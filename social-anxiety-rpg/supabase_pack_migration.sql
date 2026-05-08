-- Phase 2: Scenario Pack Migration

-- 1. Create scenario_packs table
CREATE TABLE IF NOT EXISTS scenario_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price_krw INTEGER NOT NULL DEFAULT 9900,
  stripe_price_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add pack_id to scenarios to group them into packs
ALTER TABLE scenarios
  ADD COLUMN IF NOT EXISTS pack_id UUID REFERENCES scenario_packs(id);

-- 3. Create user_purchases table for one-time purchases
CREATE TABLE IF NOT EXISTS user_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  pack_id UUID REFERENCES scenario_packs(id) NOT NULL,
  stripe_checkout_session_id TEXT,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, pack_id)
);

-- 4. RLS Policies
ALTER TABLE scenario_packs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view scenario packs" ON scenario_packs FOR SELECT USING (true);

ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own purchases" ON user_purchases FOR SELECT USING (auth.uid() = user_id);

-- Insert dummy packs for testing
INSERT INTO scenario_packs (id, title, description, price_krw, stripe_price_id)
VALUES 
  ('00000000-0000-0000-0000-000000000001', '회식 마스터팩', '직장 내 다양한 회식 상황을 대비하는 5개 시나리오 팩', 9900, 'price_pack_1_dummy'),
  ('00000000-0000-0000-0000-000000000002', '면접 완전정복팩', '다양한 직군과 상황에 맞춘 면접 대비 5개 시나리오 팩', 9900, 'price_pack_2_dummy')
ON CONFLICT DO NOTHING;
