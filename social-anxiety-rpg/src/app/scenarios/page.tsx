import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

function detectLocale(acceptLang: string | null): "ko" | "en" {
  if (!acceptLang) return "ko";
  if (acceptLang.startsWith("ko")) return "ko";
  return "en";
}

export default async function ScenariosPage() {
  const supabase = await createClient();
  const headerStore = await headers();
  const locale = detectLocale(headerStore.get("accept-language"));
  const isKo = locale === "ko";

  // Get scenarios filtered by locale
  const { data: scenarios, error } = await supabase
    .from("scenarios")
    .select("*")
    .eq("locale", locale)
    .order("order_index", { ascending: true });

  const { data: packs } = await supabase
    .from("scenario_packs")
    .select("*");

  if (error) {
    console.error("Failed to fetch scenarios:", error);
  }

  // Get user and subscription
  const { data: { user } } = await supabase.auth.getUser();
  let hasActiveSubscription = false;
  let purchasedPackIds: string[] = [];

  if (user) {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (sub) hasActiveSubscription = true;

    const { data: purchases } = await supabase
      .from("user_purchases")
      .select("pack_id")
      .eq("user_id", user.id);

    if (purchases) {
      purchasedPackIds = purchases.map((p) => p.pack_id);
    }
  }

  const scenarioList = scenarios || [];
  const packList = packs || [];

  const CATEGORY_LABELS: Record<string, Record<string, string>> = {
    ko: { cafe: "카페", phone: "전화", workplace: "직장", date: "소개팅", networking: "네트워킹", interview: "면접", presentation: "발표", conflict: "갈등", advanced: "고난이도", social: "사교" },
    en: { cafe: "Cafe", phone: "Phone", workplace: "Workplace", date: "Dating", networking: "Networking", interview: "Interview", presentation: "Presentation", conflict: "Conflict", advanced: "Advanced", social: "Social" },
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isKo ? "시나리오 선택" : "Choose a Scenario"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isKo ? "오늘 연습할 상황과 난이도를 선택해주세요." : "Pick a situation and difficulty level to practice today."}
        </p>
      </div>

      {packList.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">
            {isKo ? "✨ 스페셜 시나리오 팩" : "✨ Special Scenario Packs"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {packList.map((pack) => {
              const isPurchased = purchasedPackIds.includes(pack.id);
              return (
                <Card key={pack.id} className="border-primary/30 bg-primary/5">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant={isPurchased ? "secondary" : "default"}>
                          {isPurchased ? (isKo ? "보유 중" : "Owned") : (isKo ? "일회성 구매" : "One-time")}
                        </Badge>
                        <CardTitle className="mt-2">{pack.title}</CardTitle>
                      </div>
                      <div className="text-lg font-bold">
                        {isKo ? `₩${pack.price_krw?.toLocaleString()}` : `$${(pack.price_usd || 9.99).toFixed(2)}`}
                      </div>
                    </div>
                    <CardDescription className="mt-2">{pack.description}</CardDescription>
                    {!isPurchased && !hasActiveSubscription && (
                      <form action="/api/checkout-pack" method="POST" className="mt-4">
                        <input type="hidden" name="packId" value={pack.id} />
                        <input type="hidden" name="priceId" value={pack.stripe_price_id} />
                        <button type="submit" className="w-full bg-primary text-primary-foreground py-2 rounded-md font-semibold text-sm hover:bg-primary/90 transition-colors">
                          {isKo ? "팩 구매하기" : "Buy Pack"}
                        </button>
                      </form>
                    )}
                    {(isPurchased || hasActiveSubscription) && (
                      <div className="mt-4 text-sm font-medium text-green-600">
                        ✅ {isKo ? "자유롭게 이용 가능합니다" : "Available to use"}
                      </div>
                    )}
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">
          {isKo ? "일반 시나리오" : "All Scenarios"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {scenarioList.map((scenario) => {
            const isPackPurchased = scenario.pack_id && purchasedPackIds.includes(scenario.pack_id);
            const isLocked = !scenario.is_free && !hasActiveSubscription && !isPackPurchased;

            return (
              <Link
                href={isLocked ? "/dashboard" : `/scenarios/${scenario.id}`}
                key={scenario.id}
                className={isLocked ? "pointer-events-none opacity-50" : ""}
              >
                <Card className={`h-full transition-colors ${isLocked ? "bg-muted" : "hover:border-primary cursor-pointer"}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant={scenario.is_free ? "default" : "secondary"}>
                        {isLocked
                          ? (isKo ? "🔒 잠김" : "🔒 Locked")
                          : scenario.is_free
                            ? (isKo ? "무료" : "Free")
                            : isPackPurchased
                              ? (isKo ? "팩 포함" : "Pack")
                              : (isKo ? "구독 전용" : "Subscribers")}
                      </Badge>
                      <span className="text-xs font-semibold text-muted-foreground">Lv.{scenario.level}</span>
                    </div>
                    <CardTitle className="mt-2">{scenario.title}</CardTitle>
                    <CardDescription>
                      {CATEGORY_LABELS[locale]?.[scenario.category] || scenario.category}
                      {scenario.npc_name && ` · ${scenario.npc_name}`}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
          {scenarioList.length === 0 && (
            <div className="text-muted-foreground col-span-2">
              {isKo ? "시나리오가 없습니다." : "No scenarios available."}
            </div>
          )}
        </div>
      </div>

      {!hasActiveSubscription && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle>{isKo ? "모든 시나리오 해제하기" : "Unlock All Scenarios"}</CardTitle>
            <CardDescription>
              {isKo
                ? "월 ₩12,900으로 25개의 다양한 시나리오를 마음껏 연습하세요."
                : "Get unlimited access to all 25 scenarios for $9.99/month."}
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
