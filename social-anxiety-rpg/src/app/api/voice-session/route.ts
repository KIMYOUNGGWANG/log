import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { scenarioId, durationSeconds } = await req.json();

    if (!scenarioId || typeof durationSeconds !== 'number') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // 1. Insert session record
    const { error: sessionError } = await supabase
      .from('voice_sessions')
      .insert({
        user_id: user.id,
        scenario_id: scenarioId,
        duration_seconds: durationSeconds,
        ended_at: new Date().toISOString(),
      });

    if (sessionError) {
      console.error('[voice-session] Error inserting session:', sessionError);
      // Non-fatal, continue to update minutes
    }

    // 2. Update used minutes in subscription
    // We get the current subscription to add minutes. Wait, duration is in seconds.
    // Let's calculate minutes used (round up).
    const minutesUsed = Math.ceil(durationSeconds / 60);

    if (minutesUsed > 0) {
      // Fetch current usage
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('voice_minutes_used')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .eq('plan_type', 'voice_monthly')
        .single();

      if (sub) {
        const newUsed = (sub.voice_minutes_used || 0) + minutesUsed;
        await supabase
          .from('subscriptions')
          .update({ voice_minutes_used: newUsed })
          .eq('user_id', user.id)
          .eq('plan_type', 'voice_monthly');
      }
    }

    // 3. Auto-grant "목소리의 용기" badge on first voice session
    const { count: sessionCount } = await supabase
      .from('voice_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (sessionCount === 1) {
      // First voice session — grant badge
      const { data: voiceBadge } = await supabase
        .from('badges')
        .select('id')
        .eq('condition_type', 'voice_first_session')
        .single();

      if (voiceBadge) {
        await supabase
          .from('user_badges')
          .upsert({
            user_id: user.id,
            badge_id: voiceBadge.id,
            earned_at: new Date().toISOString(),
          }, { onConflict: 'user_id,badge_id' })
          .then(({ error }) => {
            if (error) console.error('[voice-session] Badge grant error:', error);
            else console.log('[voice-session] 🎤 Badge "목소리의 용기" granted!');
          });
      }
    }

    return NextResponse.json({ success: true, badgeGranted: sessionCount === 1 });
  } catch (err) {
    console.error('[voice-session]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
