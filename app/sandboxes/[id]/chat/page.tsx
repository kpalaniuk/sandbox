"use client";

import { useState, useEffect, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { SandboxNav } from "../SandboxNav";
import { Send, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
}

export default function ChatPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });

    // Load messages via API (bypasses RLS)
    loadMessages();

    // Realtime listener for new messages
    const channel = supabase
      .channel(`chat-${id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `sandbox_id=eq.${id}`,
      }, (payload) => {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.find((m) => m.id === payload.new.id)) return prev;
          return [...prev, payload.new as Message];
        });
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  async function loadMessages() {
    const res = await fetch(`/api/sandboxes/${id}/messages`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "instant" }), 50);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const content = newMessage.trim();
    if (!content) return;

    setSending(true);
    setError("");
    setNewMessage("");

    const res = await fetch(`/api/sandboxes/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Failed to send");
      setNewMessage(content); // restore
    }
    // Realtime will add the message to state
    setSending(false);
  }

  return (
    <div className="min-h-screen bg-sand flex flex-col" style={{ paddingBottom: "8rem" }}>
      <header className="safe-top px-4 py-4 bg-cream border-b border-midnight/10 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-lg font-display font-bold">Chat</h1>
          <p className="text-xs text-midnight/40">{messages.length} message{messages.length !== 1 ? "s" : ""}</p>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-16 text-midnight/40">
            <p className="text-2xl mb-2">👋</p>
            <p>No messages yet. Say hi!</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.user_id === currentUserId;
          return (
            <div key={msg.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
              <div className="w-8 h-8 rounded-full bg-ocean/20 flex items-center justify-center text-xs font-bold text-ocean flex-shrink-0 mt-1">
                {isMe ? "Me" : "A"}
              </div>
              <div className={`max-w-[75%] flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMe ? "bg-ocean text-cream rounded-tr-sm" : "bg-cream text-midnight rounded-tl-sm"
                }`}>
                  {msg.content}
                </div>
                <span className="text-xs text-midnight/30 px-1">
                  {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </main>

      {/* Input — fixed above bottom nav */}
      <div className="fixed bottom-16 left-0 right-0 bg-cream border-t border-midnight/10 px-4 py-3 z-10">
        <div className="max-w-2xl mx-auto">
          {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
          <form onSubmit={sendMessage} className="flex gap-3">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2.5 bg-sand border-2 border-midnight/10 rounded-full focus:border-ocean focus:outline-none text-sm"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="w-10 h-10 bg-ocean text-cream rounded-full flex items-center justify-center disabled:opacity-40 hover:bg-midnight transition-colors flex-shrink-0"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>

      <SandboxNav sandboxId={id} />
    </div>
  );
}
