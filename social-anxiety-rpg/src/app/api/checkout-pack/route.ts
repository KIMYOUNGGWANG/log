import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-04-22.dahlia',
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { packId, priceId } = await req.json();

    if (!packId || !priceId) {
      return NextResponse.json({ error: 'Missing packId or priceId' }, { status: 400 });
    }

    // Check if already purchased
    const { data: existingPurchase } = await supabase
      .from('user_purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('pack_id', packId)
      .single();

    if (existingPurchase) {
      return NextResponse.json({ error: 'Already purchased' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/scenarios?pack_success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/scenarios?canceled=true`,
      client_reference_id: user.id,
      customer_email: user.email,
      metadata: { 
        type: 'pack_purchase',
        pack_id: packId 
      },
    });

    if (session.url) {
      return NextResponse.json({ url: session.url });
    }

    return NextResponse.json({ error: 'Failed to create Stripe session' }, { status: 500 });
  } catch (err: unknown) {
    console.error('[checkout-pack]', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
