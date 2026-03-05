"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Loader2, ImageIcon } from "lucide-react";
import Link from "next/link";
import { SandboxNav } from "../SandboxNav";

export default function UploadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);

    try {
      // For MVP: using placeholder - in production would upload to Supabase Storage
      const mockUrl = preview || "";
      
      const res = await fetch(`/api/sandboxes/${id}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: file.type.startsWith("video") ? "video" : "photo",
          url: mockUrl,
          caption,
        }),
      });

      if (!res.ok) throw new Error("Upload failed");

      router.push(`/sandboxes/${id}`);
    } catch (error) {
      console.error(error);
      alert("Upload failed");
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand pb-24">
      <header className="safe-top px-4 py-6 border-b border-midnight/10">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link
            href={`/sandboxes/${id}`}
            className="tap-target text-midnight/60 hover:text-midnight"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-display font-bold">Upload Media</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleUpload} className="space-y-6">
          {/* File input */}
          <div>
            <label className="block">
              <div className="border-2 border-dashed border-midnight/20 rounded-2xl p-8 text-center cursor-pointer hover:border-ocean transition-colors">
                {preview ? (
                  <div className="space-y-4">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setPreview(null);
                      }}
                      className="text-sm text-ocean underline"
                    >
                      Change file
                    </button>
                  </div>
                ) : (
                  <div>
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 text-midnight/20" />
                    <p className="font-semibold text-midnight/80 mb-1">
                      Choose a photo or video
                    </p>
                    <p className="text-sm text-midnight/40">
                      Or drag and drop
                    </p>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Caption */}
          {file && (
            <>
              <div>
                <label htmlFor="caption" className="block text-sm font-semibold mb-2">
                  Caption (optional)
                </label>
                <textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a caption..."
                  rows={3}
                  className="w-full px-4 py-3 bg-cream border-2 border-midnight/10 rounded-lg focus:border-ocean focus:outline-none resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={uploading}
                className="w-full py-4 bg-ocean text-cream rounded-lg font-semibold hover:bg-midnight transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload
                  </>
                )}
              </button>
            </>
          )}
        </form>

        <div className="mt-8 p-4 bg-cyan/5 border border-cyan/20 rounded-lg">
          <p className="text-sm text-midnight/60">
            <strong>MVP Note:</strong> For this demo, uploads are stored temporarily. 
            In production, files are uploaded to Supabase Storage with CDN delivery.
          </p>
        </div>
      </main>

      <SandboxNav sandboxId={id} />
    </div>
  );
}
