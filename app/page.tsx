"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { ArrowRight, Camera, Users, Calendar, DollarSign, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
  }, []);

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.refresh();
    setUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="safe-top px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Sandbox</h1>
        {!loading && user && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-midnight/50 hidden sm:block">{user.email}</span>
            <button onClick={handleSignOut} className="p-2 text-midnight/40 hover:text-midnight">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-20">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-display font-bold leading-tight">
              Relive the trip<br />
              <span className="text-ocean">without the cleanup</span>
            </h2>
            <p className="text-lg md:text-xl text-midnight/60 max-w-xl mx-auto">
              Automatically aggregate photos, videos, expenses, and memories from your shared adventures—all in one beautiful timeline.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
            {[
              { Icon: Camera, label: "Media sync" },
              { Icon: Users, label: "Collaborate" },
              { Icon: Calendar, label: "Timeline" },
              { Icon: DollarSign, label: "Split bills" },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-ocean/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-ocean" />
                </div>
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!loading && (
              user ? (
                <>
                  <Link href="/sandboxes/new" className="px-8 py-4 bg-midnight text-cream rounded-xl font-semibold flex items-center gap-2 hover:bg-ocean transition-colors">
                    Create Sandbox <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link href="/sandboxes" className="px-8 py-4 bg-cream text-midnight border-2 border-midnight/20 rounded-xl font-semibold hover:border-ocean transition-colors">
                    My Sandboxes
                  </Link>
                </>
              ) : (
                <Link href="/sign-in" className="px-8 py-4 bg-midnight text-cream rounded-xl font-semibold flex items-center gap-2 hover:bg-ocean transition-colors">
                  Get Started <ArrowRight className="w-5 h-5" />
                </Link>
              )
            )}
          </div>
        </div>
      </main>

      <footer className="safe-bottom px-4 py-6 text-center text-sm text-midnight/40">
        Built by <a href="https://kyle.palaniuk.net" className="underline hover:text-ocean">Kyle</a> + Jasper 🤖
      </footer>
    </div>
  );
}
