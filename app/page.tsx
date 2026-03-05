"use client";

import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { ArrowRight, Camera, Users, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="safe-top px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Sandbox</h1>
        <div className="flex items-center gap-3">
          {isLoaded && (
            isSignedIn ? (
              <UserButton />
            ) : (
              <SignInButton mode="modal">
                <button className="px-4 py-2 bg-ocean text-cream rounded-lg font-medium">
                  Sign In
                </button>
              </SignInButton>
            )
          )}
        </div>
      </header>

      {/* Hero */}
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

          {/* Feature grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
            {[
              { Icon: Camera, color: "ocean", label: "Media sync" },
              { Icon: Users, color: "terracotta", label: "Collaborate" },
              { Icon: Calendar, color: "sunset", label: "Timeline" },
              { Icon: DollarSign, color: "cyan", label: "Split bills" },
            ].map(({ Icon, color, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-full bg-${color}/10 flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${color}`} />
                </div>
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isLoaded && isSignedIn ? (
              <>
                <Link
                  href="/sandboxes/new"
                  className="px-8 py-4 bg-midnight text-cream rounded-xl font-semibold flex items-center gap-2 hover:bg-ocean transition-colors"
                >
                  Create Sandbox <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/sandboxes"
                  className="px-8 py-4 bg-cream text-midnight border-2 border-midnight/20 rounded-xl font-semibold hover:border-ocean transition-colors"
                >
                  My Sandboxes
                </Link>
              </>
            ) : (
              <SignInButton mode="modal">
                <button className="px-8 py-4 bg-midnight text-cream rounded-xl font-semibold flex items-center gap-2 hover:bg-ocean transition-colors">
                  Get Started <ArrowRight className="w-5 h-5" />
                </button>
              </SignInButton>
            )}
          </div>

          <p className="text-sm text-midnight/40 pt-4">
            Free · No credit card required
          </p>
        </div>
      </main>

      <footer className="safe-bottom px-4 py-6 text-center text-sm text-midnight/40">
        Built by{" "}
        <a href="https://kyle.palaniuk.net" className="underline hover:text-ocean">
          Kyle Palaniuk
        </a>{" "}
        + Jasper 🤖
      </footer>
    </div>
  );
}
