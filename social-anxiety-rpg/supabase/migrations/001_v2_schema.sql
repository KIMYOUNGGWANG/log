-- ============================================================================
-- Social Anxiety RPG v2 — Schema Migration
-- 기존 테이블 유지 + 새 테이블 추가 + 컬럼 확장
-- ============================================================================

-- 1. scenarios 테이블 확장
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'ko';
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS npc_name TEXT;
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS npc_personality TEXT;
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS opening_line TEXT;
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS max_turns INTEGER DEFAULT 15;
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- 2. sessions 테이블 (새 정규화 구조)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  anxiety_before INTEGER NOT NULL DEFAULT 0 CHECK (anxiety_before BETWEEN 0 AND 21),
  anxiety_after INTEGER CHECK (anxiety_after BETWEEN 0 AND 21),
  turns_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  score INTEGER CHECK (score BETWEEN 0 AND 100),
  ai_feedback TEXT,
  mode TEXT DEFAULT 'text' CHECK (mode IN ('text', 'voice')),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_scenario ON sessions(scenario_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created ON sessions(user_id, created_at DESC);

-- 3. messages 테이블 (정규화된 대화 기록)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  turn_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);

-- 4. user_memories 테이블 (세션 메모리 AI)
CREATE TABLE IF NOT EXISTS user_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL CHECK (memory_type IN ('pattern', 'insight', 'preference')),
  content TEXT NOT NULL,
  source_session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_memories_user ON user_memories(user_id);

-- 5. gad7_scores 테이블 (GAD-7 측정 이력)
CREATE TABLE IF NOT EXISTS gad7_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score_type TEXT NOT NULL CHECK (score_type IN ('quick', 'full')),
  total_score INTEGER NOT NULL CHECK (total_score BETWEEN 0 AND 21),
  answers JSONB NOT NULL DEFAULT '[]',
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gad7_user ON gad7_scores(user_id, created_at DESC);

-- 6. subscriptions 테이블 확장
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'KRW';

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE gad7_scores ENABLE ROW LEVEL SECURITY;

-- sessions: 본인 데이터만
CREATE POLICY "Users can view own sessions" ON sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- messages: 본인 세션의 메시지만
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (
    session_id IN (SELECT id FROM sessions WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can insert own messages" ON messages
  FOR INSERT WITH CHECK (
    session_id IN (SELECT id FROM sessions WHERE user_id = auth.uid())
  );

-- user_memories: 본인 메모리만
CREATE POLICY "Users can view own memories" ON user_memories
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own memories" ON user_memories
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own memories" ON user_memories
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own memories" ON user_memories
  FOR DELETE USING (auth.uid() = user_id);

-- gad7_scores: 본인 점수만
CREATE POLICY "Users can view own gad7" ON gad7_scores
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own gad7" ON gad7_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);
