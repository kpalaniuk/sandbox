"use client";

import { useState } from "react";
import { MediaItem, Message, Expense } from "@/lib/types";
import { format } from "date-fns";
import { ImageIcon, Video, DollarSign, MessageCircle, Trash2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

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
    ...localMedia.map((item) => ({ ...item, itemType: "media" as const, sortTime: new Date(item.timestamp) })),
    ...messages.map((item) => ({ ...item, itemType: "message" as const, sortTime: new Date(item.created_at) })),
    ...expenses.map((item) => ({ ...item, itemType: "expense" as const, sortTime: new Date(item.created_at) })),
  ].sort((a, b) => b.sortTime.getTime() - a.sortTime.getTime());

  async function deleteMedia(mediaId: string, url: string) {
    if (!confirm("Delete this photo?")) return;
    setDeletingId(mediaId);

    try {
      const supabase = createSupabaseBrowserClient();

      // Delete from storage if it's a Supabase URL
      if (url?.includes("sandbox-media")) {
        const path = url.split("/sandbox-media/")[1];
        if (path) await supabase.storage.from("sandbox-media").remove([path]);
      }

      // Delete from DB
      await supabase.from("media_items").delete().eq("id", mediaId);

      // Update local state
      setLocalMedia((prev) => prev.filter((m) => m.id !== mediaId));
    } catch (e) {
      alert("Failed to delete");
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
        <p className="text-midnight/60 max-w-md mx-auto">
          Start uploading photos to build your timeline.
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
              {/* Delete button */}
              <button
                onClick={() => deleteMedia(media.id, media.url)}
                disabled={isDeleting}
                className="absolute top-3 right-3 z-10 w-8 h-8 bg-midnight/60 text-cream rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {isBlob ? (
                <div className="aspect-[4/3] bg-midnight/5 flex flex-col items-center justify-center gap-2 p-4">
                  <ImageIcon className="w-10 h-10 text-midnight/20" />
                  <p className="text-sm text-midnight/40 text-center">
                    This photo was stored with a temporary URL and can no longer be displayed.
                  </p>
                  <button
                    onClick={() => deleteMedia(media.id, media.url)}
                    className="text-sm text-red-500 underline"
                  >
                    Remove it
                  </button>
                </div>
              ) : media.type === "photo" && media.url ? (
                <div className="aspect-[4/3] bg-midnight/5">
                  <img src={media.url} alt={media.caption || "Photo"} className="w-full h-full object-cover" />
                </div>
              ) : media.type === "video" ? (
                <div className="aspect-video bg-midnight/5 flex items-center justify-center">
                  <Video className="w-12 h-12 text-midnight/20" />
                </div>
              ) : null}

              <div className="p-4 flex items-start justify-between">
                <div>
                  {media.caption && <p className="text-midnight/80 font-medium">{media.caption}</p>}
                  <p className="text-sm text-midnight/40 mt-1">
                    {format(new Date(media.timestamp), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
            </div>
          );
        }

        if (item.itemType === "message") {
          const message = item as Message;
          return (
            <div key={`message-${message.id}`} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-ocean/10 flex items-center justify-center flex-shrink-0 mt-1">
                <MessageCircle className="w-4 h-4 text-ocean" />
              </div>
              <div className="flex-1 bg-cream rounded-2xl p-4">
                <p className="text-midnight/80">{message.content}</p>
                <p className="text-sm text-midnight/40 mt-2">
                  {format(new Date(message.created_at), "MMM d 'at' h:mm a")}
                </p>
              </div>
            </div>
          );
        }

        if (item.itemType === "expense") {
          const expense = item as Expense;
          return (
            <div key={`expense-${expense.id}`} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan/10 flex items-center justify-center flex-shrink-0 mt-1">
                <DollarSign className="w-4 h-4 text-cyan" />
              </div>
              <div className="flex-1 bg-cream rounded-2xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{expense.description || "Expense"}</p>
                    <p className="text-sm text-midnight/60 mt-1">
                      ${expense.amount?.toFixed(2)}
                      {expense.splits?.length > 1 && ` · Split ${expense.splits.length} ways`}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    expense.status === "settled" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {expense.status}
                  </span>
                </div>
                <p className="text-sm text-midnight/40 mt-2">
                  {format(new Date(expense.created_at), "MMM d 'at' h:mm a")}
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
