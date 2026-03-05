import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, Calendar, Users } from "lucide-react";
import { format } from "date-fns";
import { SandboxNav } from "./SandboxNav";
import { Timeline } from "./Timeline";

export default async function SandboxPage({ params }: { params: { id: string } }) {
  const { userId } = auth();
  const { id } = params;
  
  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch sandbox
  const { data: sandbox, error: sandboxError } = await supabaseAdmin
    .from("sandboxes")
    .select("*")
    .eq("id", id)
    .single();

  if (sandboxError || !sandbox) {
    redirect("/sandboxes");
  }

  // Check if user is a participant
  const { data: participant } = await supabaseAdmin
    .from("participants")
    .select("*")
    .eq("sandbox_id", id)
    .eq("user_id", userId)
    .single();

  if (!participant && sandbox.privacy === "private") {
    redirect("/sandboxes");
  }

  // Fetch media items
  const { data: mediaItems } = await supabaseAdmin
    .from("media_items")
    .select("*")
    .eq("sandbox_id", id)
    .order("timestamp", { ascending: false });

  // Fetch participants
  const { data: participants } = await supabaseAdmin
    .from("participants")
    .select("*")
    .eq("sandbox_id", id);

  // Fetch recent messages
  const { data: messages } = await supabaseAdmin
    .from("messages")
    .select("*")
    .eq("sandbox_id", id)
    .order("created_at", { ascending: false })
    .limit(50);

  // Fetch expenses
  const { data: expenses } = await supabaseAdmin
    .from("expenses")
    .select("*")
    .eq("sandbox_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-sand pb-20">
      {/* Header */}
      <header className="safe-top px-4 py-6 bg-cream border-b border-midnight/10 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/sandboxes"
              className="tap-target text-midnight/60 hover:text-midnight"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold">{sandbox.title}</h1>
              {sandbox.description && (
                <p className="text-sm text-midnight/60 mt-1">{sandbox.description}</p>
              )}
            </div>
          </div>
          
          {/* Meta info */}
          <div className="flex flex-wrap gap-3 text-sm text-midnight/60">
            {sandbox.location && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {sandbox.location}
              </div>
            )}
            {sandbox.start_time && (
              <div>
                {format(new Date(sandbox.start_time), "MMM d")}
                {sandbox.end_time && ` - ${format(new Date(sandbox.end_time), "MMM d, yyyy")}`}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {participants?.length || 0} {participants?.length === 1 ? "person" : "people"}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Timeline
          sandboxId={id}
          mediaItems={mediaItems || []}
          messages={messages || []}
          expenses={expenses || []}
        />
      </main>

      {/* Bottom navigation */}
      <SandboxNav sandboxId={id} />
    </div>
  );
}
