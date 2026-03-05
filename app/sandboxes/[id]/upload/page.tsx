"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Loader2, ImageIcon } from "lucide-react";
import Link from "next/link";
import { SandboxNav } from "../SandboxNav";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function UploadPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setProgress("Uploading...");

    try {
      const supabase = createSupabaseBrowserClient();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload file to Supabase Storage
      const ext = file.name.split(".").pop();
      const fileName = `${id}/${user.id}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("sandbox-media")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("sandbox-media")
        .getPublicUrl(fileName);

      setProgress("Saving...");

      // Save to media_items via API
      const res = await fetch(`/api/sandboxes/${id}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: file.type.startsWith("video") ? "video" : "photo",
          url: publicUrl,
          thumbnail_url: publicUrl,
          caption,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      router.push(`/sandboxes/${id}`);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      alert(msg);
      setUploading(false);
      setProgress("");
    }
  };

  return (
    <div className="min-h-screen bg-sand pb-24">
      <header className="safe-top px-4 py-5 bg-cream border-b border-midnight/10">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link href={`/sandboxes/${id}`} className="text-midnight/60 hover:text-midnight">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-display font-bold">Upload Media</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleUpload} className="space-y-5">
          {/* File picker */}
          <label className="block cursor-pointer">
            <div className="border-2 border-dashed border-midnight/20 rounded-2xl p-8 text-center hover:border-ocean transition-colors">
              {preview ? (
                <div className="space-y-3">
                  <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg object-cover" />
                  <button type="button" onClick={() => { setFile(null); setPreview(null); }}
                    className="text-sm text-ocean underline">
                    Change file
                  </button>
                </div>
              ) : (
                <div>
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 text-midnight/20" />
                  <p className="font-semibold text-midnight/80 mb-1">Choose a photo or video</p>
                  <p className="text-sm text-midnight/40">Tap to browse</p>
                </div>
              )}
            </div>
            <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
          </label>

          {file && (
            <>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Caption (optional)</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a caption..."
                  rows={2}
                  className="w-full px-4 py-3 bg-cream border-2 border-midnight/10 rounded-lg focus:border-ocean focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-4 bg-ocean text-cream rounded-lg font-semibold hover:bg-midnight transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading
                  ? <><Loader2 className="w-5 h-5 animate-spin" />{progress}</>
                  : <><Upload className="w-5 h-5" />Upload</>
                }
              </button>
            </>
          )}
        </form>
      </main>

      <SandboxNav sandboxId={id} />
    </div>
  );
}
