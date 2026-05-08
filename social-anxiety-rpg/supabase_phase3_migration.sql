-- Phase 3 Migration: Global & Group Challenge

-- ================================================================
-- T2: Group Challenges
-- ================================================================
CREATE TABLE IF NOT EXISTS group_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES profiles(id) NOT NULL,
  scenario_id UUID REFERENCES scenarios(id) NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES group_challenges(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  score INTEGER,
  UNIQUE(challenge_id, user_id)
);

ALTER TABLE group_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_challenge_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view challenges they are part of" 
  ON group_challenges FOR SELECT 
  USING (
    creator_id = auth.uid() OR 
    id IN (SELECT challenge_id FROM group_challenge_participants WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view participants in their challenges" 
  ON group_challenge_participants FOR SELECT 
  USING (
    challenge_id IN (
      SELECT id FROM group_challenges WHERE creator_id = auth.uid()
    ) OR user_id = auth.uid()
  );

-- ================================================================
-- T3: Scenario Translations (i18n)
-- ================================================================
CREATE TABLE IF NOT EXISTS scenario_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID REFERENCES scenarios(id) NOT NULL,
  language_code TEXT NOT NULL CHECK (language_code IN ('ko', 'ja', 'en')),
  title TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT NOT NULL,
  UNIQUE(scenario_id, language_code)
);

ALTER TABLE scenario_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view translations" ON scenario_translations FOR SELECT USING (true);

-- Insert dummy translation for a scenario
INSERT INTO scenario_translations (scenario_id, language_code, title, description, system_prompt)
SELECT id, 'ja', title || ' (JA)', description || ' (JA)', system_prompt || ' (Reply in Japanese)'
FROM scenarios
ON CONFLICT DO NOTHING;
