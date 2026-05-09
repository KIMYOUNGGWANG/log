"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { Globe } from "lucide-react";
import { useState, useEffect } from "react";

export function Navbar({ user }: { user: User | null }) {
  const router = useRouter();
  const supabase = createClient();
  const [locale, setLocale] = useState<"ko" | "en">("ko");

  useEffect(() => {
    const lang = navigator.language;
    setLocale(lang.startsWith("ko") ? "ko" : "en");
  }, []);

  const isKo = locale === "ko";

  const toggleLocale = () => {
    const next = isKo ? "en" : "ko";
    setLocale(next);
    document.documentElement.lang = next;
    // Store preference
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000`;
    router.refresh();
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleAppleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-screen-md mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-lg tracking-tight">
            🧠 RPG
          </Link>
          <nav className="flex items-center space-x-4 text-sm font-medium">
            <Link href="/scenarios" className="text-muted-foreground hover:text-foreground transition-colors">
              {isKo ? "시나리오" : "Scenarios"}
            </Link>
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              {isKo ? "대시보드" : "Dashboard"}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLocale}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
            title={isKo ? "Switch to English" : "한국어로 전환"}
          >
            <Globe size={14} />
            <span>{isKo ? "EN" : "KO"}</span>
          </button>
          {user ? (
            <Button variant="outline" size="sm" onClick={handleLogout}>
              {isKo ? "로그아웃" : "Log out"}
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={handleGoogleLogin}>
                Google
              </Button>
              <Button variant="outline" size="sm" onClick={handleAppleLogin}>
                Apple
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
