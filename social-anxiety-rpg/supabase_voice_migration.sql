-- Phase 2: Voice AI Plan Migration

-- 1. Add voice_minutes_used to subscriptions table
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS voice_minutes_used INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS voice_minutes_cap INTEGER NOT NULL DEFAULT 120;

-- 2. Create voice_sessions table for per-session logging
CREATE TABLE IF NOT EXISTS voice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  scenario_id UUID REFERENCES scenarios(id),
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RLS for voice_sessions
ALTER TABLE voice_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own voice sessions"
  ON voice_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own voice sessions"
  ON voice_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own voice sessions"
  ON voice_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- 4. Function: reset voice_minutes_used on subscription renewal
CREATE OR REPLACE FUNCTION reset_voice_minutes()
RETURNS TRIGGER AS $$
BEGIN
  -- Reset minutes when subscription is renewed (new period start)
  IF NEW.current_period_end <> OLD.current_period_end THEN
    NEW.voice_minutes_used := 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_subscription_renewal
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION reset_voice_minutes();
