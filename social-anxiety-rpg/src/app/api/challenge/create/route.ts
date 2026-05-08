import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Assign a random scenario for the challenge
    const { data: scenario } = await supabase
      .from('scenarios')
      .select('id')
      .limit(1)
      .single();

    if (!scenario) {
      return NextResponse.redirect(new URL('/challenge?error=NoScenarios', req.url));
    }

    const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    const { error } = await supabase
      .from('group_challenges')
      .insert({
        creator_id: user.id,
        scenario_id: scenario.id,
        invite_code: inviteCode
      });

    if (error) {
      console.error('[challenge-create]', error);
      return NextResponse.redirect(new URL('/challenge?error=CreateFailed', req.url));
    }

    return NextResponse.redirect(new URL('/challenge?success=true', req.url), 303);
  } catch (err) {
    console.error('[challenge-create]', err);
    return NextResponse.redirect(new URL('/challenge?error=Internal', req.url), 303);
  }
}
