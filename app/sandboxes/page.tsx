import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Sandbox } from "@/lib/types";
import Link from "next/link";
import { Plus, Calendar, Users, MapPin } from "lucide-react";
import { format } from "date-fns";

export default async function SandboxesPage() {
  const { userId } = auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch user's sandboxes (owned or participating)
  const { data: participantSandboxes } = await supabase
    .from("participants")
    .select("sandbox_id")
    .eq("user_id", userId);

  const sandboxIds = participantSandboxes?.map((p) => p.sandbox_id) || [];

  const { data: sandboxes } = await supabase
    .from("sandboxes")
    .select("*")
    .in("id", sandboxIds)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-sand">
      {/* Header */}
      <header className="safe-top px-4 py-6 border-b border-midnight/10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <Link href="/" className="text-2xl font-display font-bold">
              Sandbox
            </Link>
            <p className="text-sm text-midnight/60 mt-1">Your shared adventures</p>
          </div>
          <Link
            href="/sandboxes/new"
            className="flex items-center gap-2 px-4 py-2 bg-ocean text-cream rounded-lg font-medium tap-target"
          >
            <Plus className="w-5 h-5" />
            New
          </Link>
        </div>
      </header>

      {/* Sandboxes list */}
      <main className="max-w-4xl mx-auto px-4 py-8 safe-bottom">
        {!sandboxes || sandboxes.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-ocean/10 flex items-center justify-center">
              <Calendar className="w-10 h-10 text-ocean" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-2">No sandboxes yet</h2>
            <p className="text-midnight/60 mb-6 max-w-md mx-auto">
              Create your first sandbox to start capturing memories from your next trip or event.
            </p>
            <Link
              href="/sandboxes/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-midnight text-cream rounded-lg font-semibold hover:bg-ocean transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Sandbox
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sandboxes.map((sandbox: Sandbox) => (
              <Link
                key={sandbox.id}
                href={`/sandboxes/${sandbox.id}`}
                className="block p-6 bg-cream rounded-2xl border-2 border-midnight/10 hover:border-ocean transition-colors"
              >
                <h3 className="font-display font-bold text-xl mb-2">{sandbox.title}</h3>
                {sandbox.description && (
                  <p className="text-midnight/60 text-sm mb-4 line-clamp-2">{sandbox.description}</p>
                )}
                <div className="flex flex-wrap gap-3 text-sm text-midnight/60">
                  {sandbox.start_time && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(sandbox.start_time), "MMM d, yyyy")}
                    </div>
                  )}
                  {sandbox.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {sandbox.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {sandbox.privacy}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
