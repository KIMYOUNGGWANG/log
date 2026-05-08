"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export function Navbar({ user }: { user: User | null }) {
  const router = useRouter();
  const supabase = createClient();

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
              Scenarios
            </Link>
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Log out
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
