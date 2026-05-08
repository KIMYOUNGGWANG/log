-- Supabase Schema for Social Anxiety RPG
-- Execute this script in your Supabase SQL Editor

-- 1. User extension (Profiles)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  nickname TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Scenario
CREATE TABLE scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL, -- e.g., 'cafe', 'dining', 'interview'
  title TEXT NOT NULL,
  description TEXT,
  level INTEGER NOT NULL, -- 1 to 5
  is_free BOOLEAN DEFAULT false,
  system_prompt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ScenarioSession
CREATE TABLE scenario_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  scenario_id UUID REFERENCES scenarios(id) NOT NULL,
  turns_json JSONB DEFAULT '[]'::jsonb,
  pre_anxiety INTEGER NOT NULL CHECK (pre_anxiety >= 1 AND pre_anxiety <= 10),
  post_anxiety INTEGER CHECK (post_anxiety >= 1 AND post_anxiety <= 10),
  is_completed BOOLEAN DEFAULT false,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  ai_feedback TEXT,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. UserProgress
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  scenario_id UUID REFERENCES scenarios(id) NOT NULL,
  best_score INTEGER,
  play_count INTEGER DEFAULT 0,
  is_cleared BOOLEAN DEFAULT false,
  cleared_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, scenario_id)
);

-- 5. Badge
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  condition_type TEXT NOT NULL,
  condition_value JSONB,
  icon_url TEXT NOT NULL
);

-- 6. UserBadge
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  badge_id UUID REFERENCES badges(id) NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- 7. Subscription
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT NOT NULL, -- 'active', 'canceled', 'expired'
  plan_type TEXT NOT NULL, -- 'text_monthly', 'voice_monthly'
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) setup
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Scenarios and Badges are public read-only
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Scenarios are readable by everyone" ON scenarios FOR SELECT USING (true);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Badges are readable by everyone" ON badges FOR SELECT USING (true);

-- Users can only read and update their own data
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own sessions" ON scenario_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON scenario_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON scenario_sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
