"use client";

import { useState } from "react";
import { MediaItem, Message, Expense } from "@/lib/types";
import { format } from "date-fns";
import { ImageIcon, Video, DollarSign, MessageCircle, Trash2 } from "lucide-react";

interface TimelineProps {
  sandboxId: string;
  mediaItems: MediaItem[];
  messages: Message[];
  expenses: Expense[];
}

export function Timeline({ sandboxId, mediaItems, messages, expenses }: TimelineProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [localMedia, setLocalMedia] = useState<MediaItem[]>(mediaItems);

  const allItems = [
    ...localMedia.map((i) => ({ ...i, itemType: "media" as const, sortTime: new Date(i.timestamp) })),
    ...messages.map((i) => ({ ...i, itemType: "message" as const, sortTime: new Date(i.created_at) })),
    ...expenses.map((i) => ({ ...i, itemType: "expense" as const, sortTime: new Date(i.created_at) })),
  ].sort((a, b) => b.sortTime.getTime() - a.sortTime.getTime());

  async function deleteMedia(mediaId: string) {
    if (!confirm("Delete this photo?")) return;
    setDeletingId(mediaId);
    try {
      const res = await fetch(`/api/sandboxes/${sandboxId}/media/${mediaId}`, { method: "DELETE" });
      if (res.ok) {
        setLocalMedia((prev) => prev.filter((m) => m.id !== mediaId));
      } else {
        alert("Failed to delete");
      }
    } finally {
      setDeletingId(null);
    }
  }

  if (allItems.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-ocean/10 flex items-center justify-center">
          <ImageIcon className="w-10 h-10 text-ocean" />
        </div>
        <h2 className="text-2xl font-display font-bold mb-2">No content yet</h2>
        <p className="text-midnight/60 max-w-sm mx-auto">
          Upload photos, chat, or add expenses to build your timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {allItems.map((item) => {
        if (item.itemType === "media") {
          const media = item as MediaItem;
          const isBlob = media.url?.startsWith("blob:");
          const isDeleting = deletingId === media.id;

          return (
            <div key={`media-${media.id}`} className="bg-cream rounded-2xl overflow-hidden relative group">
              <button
                onClick={() => deleteMedia(media.id)}
                disabled={isDeleting}
                className="absolute top-3 right-3 z-10 w-8 h-8 bg-midnight/60 text-cream rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-40"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {isBlob ? (
                <div className="aspect-[4/3] bg-midnight/5 flex flex-col items-center justify-center gap-3 p-6">
                  <ImageIcon className="w-10 h-10 text-midnight/20" />
                  <p className="text-sm text-midnight/40 text-center">
                    Temporary URL — photo can no longer be displayed.
                  </p>
                  <button onClick={() => deleteMedia(media.id)} className="text-sm text-red-500 underline">
                    Remove it
                  </button>
                </div>
              ) : media.type === "photo" && media.url ? (
                <div className="bg-midnight/5">
                  <img
                    src={media.url}
                    alt={media.caption || "Photo"}
                    className="w-full object-cover max-h-[70vh]"
                  />
                </div>
              ) : media.type === "video" ? (
                <div className="aspect-video bg-midnight/5 flex items-center justify-center">
                  <Video className="w-12 h-12 text-midnight/20" />
                </div>
              ) : null}

              <div className="p-4">
                {media.caption && <p className="text-midnight/80 font-medium">{media.caption}</p>}
                <p className="text-sm text-midnight/40 mt-1">
                  {format(new Date(media.timestamp), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>
          );
        }

        if (item.itemType === "message") {
          const msg = item as Message;
          return (
            <div key={`message-${msg.id}`} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-ocean/10 flex items-center justify-center flex-shrink-0 mt-1">
                <MessageCircle className="w-4 h-4 text-ocean" />
              </div>
              <div className="flex-1 bg-cream rounded-2xl p-4">
                <p className="text-midnight/80">{msg.content}</p>
                <p className="text-sm text-midnight/40 mt-2">
                  {format(new Date(msg.created_at), "MMM d 'at' h:mm a")}
                </p>
              </div>
            </div>
          );
        }

        if (item.itemType === "expense") {
          const exp = item as Expense;
          return (
            <div key={`expense-${exp.id}`} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan/10 flex items-center justify-center flex-shrink-0 mt-1">
                <DollarSign className="w-4 h-4 text-cyan" />
              </div>
              <div className="flex-1 bg-cream rounded-2xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{exp.description || "Expense"}</p>
                    <p className="text-sm text-midnight/60 mt-0.5">${exp.amount?.toFixed(2)}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded flex-shrink-0 ${
                    exp.status === "settled" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {exp.status}
                  </span>
                </div>
                <p className="text-sm text-midnight/40 mt-2">
                  {format(new Date(exp.created_at), "MMM d 'at' h:mm a")}
                </p>
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
