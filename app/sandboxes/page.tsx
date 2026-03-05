import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";
import Link from "next/link";
import { Plus, MapPin, Calendar, Users } from "lucide-react";
import { format } from "date-fns";

export default async function SandboxesPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data: sandboxes } = await supabaseAdmin
    .from("sandboxes")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-sand pb-20">
      <header className="safe-top px-4 py-6 bg-cream border-b border-midnight/10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">My Sandboxes</h1>
            <p className="text-sm text-midnight/50 mt-0.5">{user.email}</p>
          </div>
          <Link
            href="/sandboxes/new"
            className="flex items-center gap-2 px-4 py-2 bg-midnight text-cream rounded-lg font-medium hover:bg-ocean transition-colors"
          >
            <Plus className="w-4 h-4" />
            New
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {!sandboxes || sandboxes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-midnight/40 mb-4">No sandboxes yet</p>
            <Link
              href="/sandboxes/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-midnight text-cream rounded-lg font-medium hover:bg-ocean transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create your first sandbox
            </Link>
          </div>
        ) : (
          sandboxes.map((sandbox) => (
            <Link
              key={sandbox.id}
              href={`/sandboxes/${sandbox.id}`}
              className="block bg-cream rounded-2xl p-5 hover:shadow-md transition-shadow"
            >
              <h2 className="text-lg font-display font-semibold mb-2">{sandbox.title}</h2>
              {sandbox.description && (
                <p className="text-sm text-midnight/60 mb-3">{sandbox.description}</p>
              )}
              <div className="flex flex-wrap gap-3 text-sm text-midnight/50">
                {sandbox.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {sandbox.location}
                  </span>
                )}
                {sandbox.start_time && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {format(new Date(sandbox.start_time), "MMM d, yyyy")}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {sandbox.state || "active"}
                </span>
              </div>
            </Link>
          ))
        )}
      </main>
    </div>
  );
}
