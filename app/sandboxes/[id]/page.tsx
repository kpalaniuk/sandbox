import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, Calendar, Users } from "lucide-react";
import { format } from "date-fns";
import { SandboxNav } from "./SandboxNav";
import { Timeline } from "./Timeline";

export default async function SandboxPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { id } = params;

  const { data: sandbox } = await supabaseAdmin
    .from("sandboxes").select("*").eq("id", id).single();
  if (!sandbox) redirect("/sandboxes");

  const { data: participants } = await supabaseAdmin
    .from("participants").select("*").eq("sandbox_id", id);

  const { data: mediaItems } = await supabaseAdmin
    .from("media_items").select("*").eq("sandbox_id", id).order("timestamp", { ascending: false });

  const { data: messages } = await supabaseAdmin
    .from("messages").select("*").eq("sandbox_id", id).order("created_at", { ascending: false }).limit(50);

  const { data: expenses } = await supabaseAdmin
    .from("expenses").select("*").eq("sandbox_id", id).order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-sand pb-20">
      <header className="safe-top px-4 py-5 bg-cream border-b border-midnight/10 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-3">
            <Link href="/sandboxes" className="text-midnight/60 hover:text-midnight">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-display font-bold">{sandbox.title}</h1>
              {sandbox.description && (
                <p className="text-sm text-midnight/60">{sandbox.description}</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-midnight/50">
            {sandbox.location && (
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{sandbox.location}</span>
            )}
            {sandbox.start_time && (
              <span>
                {format(new Date(sandbox.start_time), "MMM d")}
                {sandbox.end_time && ` – ${format(new Date(sandbox.end_time), "MMM d, yyyy")}`}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {participants?.length || 0} {participants?.length === 1 ? "person" : "people"}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <Timeline
          sandboxId={id}
          mediaItems={mediaItems || []}
          messages={messages || []}
          expenses={expenses || []}
        />
      </main>

      <SandboxNav sandboxId={id} />
    </div>
  );
}
