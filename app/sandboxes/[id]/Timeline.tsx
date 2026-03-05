"use client";

import { MediaItem, Message, Expense } from "@/lib/types";
import { format } from "date-fns";
import { ImageIcon, Video, DollarSign, MessageCircle } from "lucide-react";

interface TimelineProps {
  sandboxId: string;
  mediaItems: MediaItem[];
  messages: Message[];
  expenses: Expense[];
}

export function Timeline({ sandboxId, mediaItems, messages, expenses }: TimelineProps) {
  // Combine and sort all items by timestamp
  const allItems = [
    ...mediaItems.map((item) => ({ ...item, itemType: "media" as const, sortTime: new Date(item.timestamp) })),
    ...messages.map((item) => ({ ...item, itemType: "message" as const, sortTime: new Date(item.created_at) })),
    ...expenses.map((item) => ({ ...item, itemType: "expense" as const, sortTime: new Date(item.created_at) })),
  ].sort((a, b) => b.sortTime.getTime() - a.sortTime.getTime());

  if (allItems.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-ocean/10 flex items-center justify-center">
          <ImageIcon className="w-10 h-10 text-ocean" />
        </div>
        <h2 className="text-2xl font-display font-bold mb-2">No content yet</h2>
        <p className="text-midnight/60 max-w-md mx-auto">
          Start uploading photos, sharing messages, or adding expenses to build your timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {allItems.map((item, idx) => {
        // Render different item types
        if (item.itemType === "media") {
          const media = item as MediaItem;
          return (
            <div key={`media-${media.id}`} className="bg-cream rounded-2xl overflow-hidden">
              {media.type === "photo" && media.url && (
                <div className="aspect-[4/3] bg-midnight/5 relative">
                  <img
                    src={media.url}
                    alt={media.caption || "Photo"}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {media.type === "video" && (
                <div className="aspect-video bg-midnight/5 flex items-center justify-center">
                  <Video className="w-12 h-12 text-midnight/20" />
                </div>
              )}
              <div className="p-4">
                {media.caption && <p className="text-midnight/80">{media.caption}</p>}
                <p className="text-sm text-midnight/40 mt-2">
                  {format(new Date(media.timestamp), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>
          );
        }

        if (item.itemType === "message") {
          const message = item as Message;
          return (
            <div key={`message-${message.id}`} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-ocean/10 flex items-center justify-center flex-shrink-0">
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
              <div className="w-8 h-8 rounded-full bg-cyan/10 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-4 h-4 text-cyan" />
              </div>
              <div className="flex-1 bg-cream rounded-2xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{expense.description || "Expense"}</p>
                    <p className="text-sm text-midnight/60 mt-1">
                      ${expense.amount.toFixed(2)} {expense.currency}
                      {expense.splits.length > 1 && ` · Split ${expense.splits.length} ways`}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      expense.status === "settled"
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
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
