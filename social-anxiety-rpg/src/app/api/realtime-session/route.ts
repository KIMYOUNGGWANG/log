import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const VOICE_MINUTES_CAP = 120;

export async function POST(req: Request) {
  const supabase = await createClient();

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Check voice subscription and usage
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, plan_type, voice_minutes_used, voice_minutes_cap, current_period_end')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  const isFreeTrialRequest = (await req.json().catch(() => ({}))).freeTrial === true;

  if (!isFreeTrialRequest) {
    // Must be a voice_monthly subscriber
    if (!subscription || subscription.plan_type !== 'voice_monthly') {
      return NextResponse.json(
        { error: 'Voice plan subscription required', code: 'VOICE_PLAN_REQUIRED' },
        { status: 403 }
      );
    }

    const minutesCap = subscription.voice_minutes_cap ?? VOICE_MINUTES_CAP;
    if (subscription.voice_minutes_used >= minutesCap) {
      return NextResponse.json(
        { error: 'Monthly voice minutes exhausted', code: 'MINUTES_EXHAUSTED' },
        { status: 403 }
      );
    }
  }

  // 3. Request ephemeral token from OpenAI Realtime API
  const openAIResponse = await fetch('https://api.openai.com/v1/realtime/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini-realtime-preview',
      voice: 'alloy',
    }),
  });

  if (!openAIResponse.ok) {
    const errorText = await openAIResponse.text();
    console.error('[realtime-session] OpenAI error:', errorText);
    return NextResponse.json({ error: 'Failed to create realtime session' }, { status: 500 });
  }

  const session = await openAIResponse.json();

  return NextResponse.json({
    client_secret: session.client_secret,
    remaining_minutes: isFreeTrialRequest
      ? 3
      : (subscription?.voice_minutes_cap ?? VOICE_MINUTES_CAP) - (subscription?.voice_minutes_used ?? 0),
  });
}
