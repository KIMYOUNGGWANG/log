/**
 * 사회불안 노출치료 RPG — 전체 타입 정의
 * PRD 02_DATA_MODEL.md 기반
 */

// ─── Users ───────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  locale: "ko" | "en";
  display_name: string | null;
  avatar_url: string | null;
  current_level: number;
  subscription_status: "free" | "active" | "cancelled";
  created_at: string;
}

// ─── Scenarios ───────────────────────────────────────────────
export type ScenarioCategory =
  | "cafe"
  | "phone"
  | "workplace"
  | "date"
  | "networking"
  | "interview"
  | "presentation"
  | "conflict"
  | "advanced"
  | "social";

export interface Scenario {
  id: string;
  locale: "ko" | "en";
  category: ScenarioCategory;
  title: string;
  description: string;
  level: number;
  npc_name: string;
  npc_personality: string;
  opening_line: string;
  max_turns: number;
  is_free: boolean;
  order_index: number;
  system_prompt: string | null;
  created_at: string;
}

// ─── Sessions ────────────────────────────────────────────────
export type SessionStatus = "in_progress" | "completed" | "abandoned";
export type SessionMode = "text" | "voice";

export interface Session {
  id: string;
  user_id: string;
  scenario_id: string;
  anxiety_before: number; // 0~21
  anxiety_after: number | null; // 0~21
  turns_count: number;
  status: SessionStatus;
  score: number | null; // 0~100
  ai_feedback: string | null;
  mode: SessionMode;
  created_at: string;
  completed_at: string | null;
}

// ─── Messages ────────────────────────────────────────────────
export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  turn_number: number;
  created_at: string;
}

// ─── User Memories ───────────────────────────────────────────
export type MemoryType = "pattern" | "insight" | "preference";

export interface UserMemory {
  id: string;
  user_id: string;
  memory_type: MemoryType;
  content: string;
  source_session_id: string | null;
  updated_at: string;
}

// ─── GAD-7 ───────────────────────────────────────────────────
export type GAD7ScoreType = "quick" | "full";

export interface GAD7Score {
  id: string;
  user_id: string;
  score_type: GAD7ScoreType;
  total_score: number; // 0~21
  answers: number[];
  session_id: string | null;
  created_at: string;
}

// ─── Subscriptions ───────────────────────────────────────────
export type SubscriptionTier = "basic" | "voice";
export type SubscriptionStatus = "active" | "cancelled" | "past_due";

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  tier: SubscriptionTier;
  amount: number;
  currency: "KRW" | "USD";
  status: SubscriptionStatus;
  current_period_end: string;
  created_at: string;
}

// ─── Badges ──────────────────────────────────────────────────
export type BadgeConditionType = "category_clear" | "level_up" | "streak";

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  condition_type: BadgeConditionType;
  condition_value: Record<string, unknown>;
  locale: "ko" | "en";
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badges?: Badge;
}

// ─── Chat API ────────────────────────────────────────────────
export interface ScenarioContext {
  title: string;
  npcRole: string;
  systemPrompt: string;
}

export interface ChatRequestBody {
  messages: Array<{ role: MessageRole; content: string }>;
  scenarioContext: ScenarioContext;
}

// ─── Session Save ────────────────────────────────────────────
export interface SaveSessionInput {
  scenarioId: string;
  preAnxiety: number;
  postAnxiety: number;
  preAnswers: number[];
  postAnswers: number[];
  messages: Array<{ role: string; content: string }>;
  mode: SessionMode;
}

export interface SaveSessionResult {
  success: boolean;
  sessionId: string;
}
