"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewSandboxPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    start_time: "",
    end_time: "",
    privacy: "private",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/sandboxes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const sandbox = await res.json();
      router.push(`/sandboxes/${sandbox.id}`);
    } else {
      setLoading(false);
      alert("Failed to create sandbox");
    }
  };

  return (
    <div className="min-h-screen bg-sand pb-20">
      <header className="safe-top px-4 py-5 bg-cream border-b border-midnight/10">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link href="/sandboxes" className="text-midnight/60 hover:text-midnight">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-display font-bold">New Sandbox</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Trip Name *</label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Scotland & Ireland 2026"
              required
              className="w-full px-4 py-3 bg-cream border-2 border-midnight/10 rounded-lg focus:border-ocean focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="A quick note about this trip..."
              rows={3}
              className="w-full px-4 py-3 bg-cream border-2 border-midnight/10 rounded-lg focus:border-ocean focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Location</label>
            <input
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="Scotland & Ireland"
              className="w-full px-4 py-3 bg-cream border-2 border-midnight/10 rounded-lg focus:border-ocean focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Start Date</label>
              <input
                type="date"
                value={form.start_time}
                onChange={(e) => set("start_time", e.target.value)}
                className="w-full px-4 py-3 bg-cream border-2 border-midnight/10 rounded-lg focus:border-ocean focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">End Date</label>
              <input
                type="date"
                value={form.end_time}
                onChange={(e) => set("end_time", e.target.value)}
                className="w-full px-4 py-3 bg-cream border-2 border-midnight/10 rounded-lg focus:border-ocean focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Privacy</label>
            <select
              value={form.privacy}
              onChange={(e) => set("privacy", e.target.value)}
              className="w-full px-4 py-3 bg-cream border-2 border-midnight/10 rounded-lg focus:border-ocean focus:outline-none"
            >
              <option value="private">Private (invite only)</option>
              <option value="link">Link sharing</option>
              <option value="public">Public</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-midnight text-cream rounded-lg font-semibold hover:bg-ocean transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</> : "Create Sandbox"}
          </button>
        </form>
      </main>
    </div>
  );
}
