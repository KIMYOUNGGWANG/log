import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-04-22.dahlia",
});

type PlanType = "text" | "voice";

function getPriceId(planType: PlanType, locale: string): string | undefined {
  if (planType === "voice") {
    return locale === "en"
      ? process.env.STRIPE_VOICE_PRICE_ID_USD
      : process.env.STRIPE_VOICE_PRICE_ID;
  }
  return locale === "en"
    ? process.env.STRIPE_PRICE_ID_USD
    : process.env.STRIPE_PRICE_ID;
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const planType: PlanType = body.planType === "voice" ? "voice" : "text";

    // Detect locale from Accept-Language header
    const headerStore = await headers();
    const acceptLang = headerStore.get("accept-language") || "";
    const locale = acceptLang.startsWith("ko") ? "ko" : "en";
    const currency = locale === "ko" ? "krw" : "usd";

    const priceId = getPriceId(planType, locale);

    if (!priceId) {
      // Fallback to default price IDs
      const fallbackPriceId = planType === "voice"
        ? process.env.STRIPE_VOICE_PRICE_ID
        : process.env.STRIPE_PRICE_ID;

      if (!fallbackPriceId) {
        console.error(`Price ID not configured for plan: ${planType}, locale: ${locale}`);
        return NextResponse.json({ error: "Price not configured" }, { status: 500 });
      }
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId || (planType === "voice" ? process.env.STRIPE_VOICE_PRICE_ID : process.env.STRIPE_PRICE_ID) as string, quantity: 1 }],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/scenarios?canceled=true`,
      client_reference_id: user.id,
      customer_email: user.email,
      metadata: {
        plan_type: planType === "voice" ? "voice_monthly" : "text_monthly",
        currency,
      },
    });

    if (session.url) {
      return NextResponse.json({ url: session.url });
    }

    return NextResponse.json({ error: "Failed to create Stripe session" }, { status: 500 });
  } catch (err: unknown) {
    console.error("[checkout]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
