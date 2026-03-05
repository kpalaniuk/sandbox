"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { SandboxNav } from "../SandboxNav";
import { UserCircle, Crown, Edit2, Eye, Loader2 } from "lucide-react";

interface Participant {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
  owner: <Crown className="w-4 h-4 text-sunset" />,
  editor: <Edit2 className="w-4 h-4 text-ocean" />,
  contributor: <UserCircle className="w-4 h-4 text-midnight/40" />,
  viewer: <Eye className="w-4 h-4 text-midnight/30" />,
};

export default function PeoplePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id || null));
    loadPeople();
  }, [id]);

  async function loadPeople() {
    const { data } = await supabase
      .from("participants")
      .select("*")
      .eq("sandbox_id", id)
      .order("created_at", { ascending: true });
    setParticipants(data || []);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-sand pb-24">
      <header className="safe-top px-4 py-4 bg-cream border-b border-midnight/10 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-lg font-display font-bold">People</h1>
          <p className="text-xs text-midnight/40">{participants.length} participant{participants.length !== 1 ? "s" : ""}</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-midnight/30" /></div>
        ) : participants.length === 0 ? (
          <div className="text-center py-12 text-midnight/40">
            <UserCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No participants yet</p>
          </div>
        ) : (
          participants.map((p) => (
            <div key={p.id} className="bg-cream rounded-2xl p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-ocean/15 flex items-center justify-center flex-shrink-0">
                <UserCircle className="w-6 h-6 text-ocean/60" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">
                  {p.user_id === currentUserId ? "You" : `User ${p.user_id.substring(0, 8)}…`}
                </p>
                <p className="text-xs text-midnight/40 capitalize">{p.role}</p>
              </div>
              <div className="flex-shrink-0">
                {ROLE_ICONS[p.role] || ROLE_ICONS.contributor}
              </div>
            </div>
          ))
        )}

        <div className="mt-6 p-4 bg-ocean/5 border border-ocean/15 rounded-xl text-sm text-midnight/60">
          <p className="font-semibold text-midnight/80 mb-1">Invite someone</p>
          <p>Share this link and they can join the sandbox once you add them as a participant.</p>
          <button
            onClick={() => navigator.clipboard.writeText(window.location.origin + `/sandboxes/${id}`)}
            className="mt-2 text-ocean underline text-xs"
          >
            Copy sandbox link
          </button>
        </div>
      </main>

      <SandboxNav sandboxId={id} />
    </div>
  );
}
