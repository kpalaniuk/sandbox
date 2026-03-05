"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { SandboxNav } from "../SandboxNav";
import { UserCircle, Crown, Edit2, Eye, Loader2, UserPlus, Check, X } from "lucide-react";

interface Participant {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
  owner:       <Crown      className="w-4 h-4 text-sunset" />,
  editor:      <Edit2      className="w-4 h-4 text-ocean" />,
  contributor: <UserCircle className="w-4 h-4 text-midnight/40" />,
  viewer:      <Eye        className="w-4 h-4 text-midnight/30" />,
};

export default function PeoplePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("contributor");
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    createSupabaseBrowserClient().auth.getUser().then(({ data }) =>
      setCurrentUserId(data.user?.id || null)
    );
    loadPeople();
  }, [id]);

  async function loadPeople() {
    setLoading(true);
    const res = await fetch(`/api/sandboxes/${id}/participants`);
    if (res.ok) setParticipants(await res.json());
    setLoading(false);
  }

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setInviteResult(null);
    const res = await fetch(`/api/sandboxes/${id}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    });
    const data = await res.json();
    if (res.ok) {
      setInviteResult({ ok: true, msg: `${data.email} added as ${inviteRole}` });
      setInviteEmail("");
      loadPeople();
    } else {
      setInviteResult({ ok: false, msg: data.error || "Failed to invite" });
    }
    setInviting(false);
  }

  return (
    <div className="min-h-screen bg-sand pb-24">
      <header className="safe-top px-4 py-4 bg-cream border-b border-midnight/10 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-display font-bold">People</h1>
            <p className="text-xs text-midnight/40">
              {participants.length} participant{participants.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => { setShowInvite(!showInvite); setInviteResult(null); }}
            className="flex items-center gap-2 px-3 py-2 bg-midnight text-cream rounded-lg text-sm font-medium hover:bg-ocean transition-colors"
          >
            <UserPlus className="w-4 h-4" /> Invite
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        {showInvite && (
          <form onSubmit={sendInvite} className="bg-cream rounded-2xl p-4 space-y-3">
            <h2 className="font-semibold text-sm">Invite by email</h2>
            <input
              type="email" value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="andrew.zappala@gmail.com"
              required
              className="w-full px-4 py-2.5 bg-sand border-2 border-midnight/10 rounded-lg focus:border-ocean focus:outline-none text-sm"
            />
            <div className="flex gap-3">
              <select
                value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
                className="flex-1 px-3 py-2.5 bg-sand border-2 border-midnight/10 rounded-lg focus:border-ocean focus:outline-none text-sm"
              >
                <option value="contributor">Contributor — upload &amp; chat</option>
                <option value="editor">Editor — edit everything</option>
                <option value="viewer">Viewer — read only</option>
              </select>
              <button
                type="submit" disabled={inviting || !inviteEmail}
                className="px-4 py-2.5 bg-ocean text-cream rounded-lg text-sm font-medium hover:bg-midnight transition-colors disabled:opacity-50 flex items-center gap-2 flex-shrink-0"
              >
                {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
              </button>
            </div>
            {inviteResult && (
              <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
                inviteResult.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
              }`}>
                {inviteResult.ok ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                {inviteResult.msg}
              </div>
            )}
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-midnight/30" />
          </div>
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
                  {p.user_id === currentUserId ? "You" : "Member"}
                </p>
                <p className="text-xs text-midnight/40 capitalize">{p.role}</p>
              </div>
              <div className="flex-shrink-0">
                {ROLE_ICONS[p.role] ?? ROLE_ICONS.contributor}
              </div>
            </div>
          ))
        )}
      </main>

      <SandboxNav sandboxId={id} />
    </div>
  );
}
