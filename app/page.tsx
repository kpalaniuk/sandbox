import { auth } from "@clerk/nextjs/server";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { ArrowRight, Camera, Users, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="safe-top px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Sandbox</h1>
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <UserButton />
          ) : (
            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-ocean text-cream rounded-lg font-medium tap-target">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-20">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-display font-bold text-balance leading-tight">
              Relive the trip<br />
              <span className="text-ocean">without the cleanup</span>
            </h2>
            <p className="text-lg md:text-xl text-midnight/60 max-w-xl mx-auto">
              Automatically aggregate photos, videos, expenses, and memories from your shared adventures—all in one beautiful timeline.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto py-8">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-full bg-ocean/10 flex items-center justify-center">
                <Camera className="w-6 h-6 text-ocean" />
              </div>
              <span className="text-sm font-medium">Auto-sync media</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-full bg-terracotta/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-terracotta" />
              </div>
              <span className="text-sm font-medium">Collaborate</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-full bg-sunset/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-sunset" />
              </div>
              <span className="text-sm font-medium">Timeline</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-full bg-cyan/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-cyan" />
              </div>
              <span className="text-sm font-medium">Split bills</span>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isSignedIn ? (
              <>
                <Link 
                  href="/sandboxes/new" 
                  className="px-8 py-4 bg-midnight text-cream rounded-xl font-semibold flex items-center gap-2 hover:bg-ocean transition-colors tap-target"
                >
                  Create Sandbox
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  href="/sandboxes" 
                  className="px-8 py-4 bg-cream text-midnight border-2 border-midnight/20 rounded-xl font-semibold hover:border-ocean transition-colors tap-target"
                >
                  View My Sandboxes
                </Link>
              </>
            ) : (
              <SignInButton mode="modal">
                <button className="px-8 py-4 bg-midnight text-cream rounded-xl font-semibold flex items-center gap-2 hover:bg-ocean transition-colors tap-target">
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </button>
              </SignInButton>
            )}
          </div>

          <p className="text-sm text-midnight/40 pt-4">
            Free to use · No credit card required
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="safe-bottom px-4 py-6 text-center text-sm text-midnight/40">
        Built by{" "}
        <a href="https://kyle.palaniuk.net" className="underline hover:text-ocean">
          Kyle Palaniuk
        </a>
        {" "}+ Jasper 🤖
      </footer>
    </div>
  );
}
