import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-04-22.dahlia',
});

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook Error:', message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  const supabase = await createClient();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id;
    const planType = (session.metadata?.plan_type as string) || 'text_monthly';

    if (userId) {
      if (session.metadata?.type === 'pack_purchase') {
        const packId = session.metadata.pack_id;
        if (packId) {
          const { error } = await supabase
            .from('user_purchases')
            .upsert({
              user_id: userId,
              pack_id: packId,
              stripe_checkout_session_id: session.id,
            }, { onConflict: 'user_id,pack_id' });

          if (error) {
            console.error('[payment] DB pack purchase failed:', error);
            return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
          }
        }
      } else {
        const planType = (session.metadata?.plan_type as string) || 'text_monthly';
        const { error } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            status: 'active',
            plan_type: planType,
            voice_minutes_used: 0,
            voice_minutes_cap: 120,
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          }, { onConflict: 'user_id' });

        if (error) {
          console.error('[payment] DB upsert failed:', error);
          return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
        }
      }
    }
  }

  // Reset voice minutes on subscription renewal
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = invoice.customer as string;

    if (invoice.billing_reason === 'subscription_cycle') {
      // Look up user by Stripe customer ID (requires customer_id column or separate lookup)
      // For now, we reset via DB function trigger (defined in SQL migration)
      console.log('[payment] Subscription renewed for customer:', customerId);
    }
  }

  return NextResponse.json({ ok: true });
}
