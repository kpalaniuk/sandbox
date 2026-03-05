"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewSandboxPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    privacy: "private" as const,
    start_time: "",
    end_time: "",
    location: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);

    try {
      const res = await fetch("/api/sandboxes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to create sandbox");

      const { id } = await res.json();
      router.push(`/sandboxes/${id}`);
    } catch (error) {
      console.error(error);
      alert("Failed to create sandbox");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand">
      <header className="safe-top px-4 py-6 border-b border-midnight/10">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link
            href="/sandboxes"
            className="tap-target text-midnight/60 hover:text-midnight"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-display font-bold">New Sandbox</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 safe-bottom">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Weekend in Barcelona"
              className="w-full px-4 py-3 bg-cream border-2 border-midnight/10 rounded-lg focus:border-ocean focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="A quick getaway with friends to explore the city..."
              rows={3}
              className="w-full px-4 py-3 bg-cream border-2 border-midnight/10 rounded-lg focus:border-ocean focus:outline-none resize-none"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_time" className="block text-sm font-semibold mb-2">
                Start Date
              </label>
              <input
                type="date"
                id="start_time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-4 py-3 bg-cream border-2 border-midnight/10 rounded-lg focus:border-ocean focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="end_time" className="block text-sm font-semibold mb-2">
                End Date
              </label>
              <input
                type="date"
                id="end_time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-4 py-3 bg-cream border-2 border-midnight/10 rounded-lg focus:border-ocean focus:outline-none"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-semibold mb-2">
              Location
            </label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Barcelona, Spain"
              className="w-full px-4 py-3 bg-cream border-2 border-midnight/10 rounded-lg focus:border-ocean focus:outline-none"
            />
          </div>

          {/* Privacy */}
          <div>
            <label className="block text-sm font-semibold mb-3">Privacy</label>
            <div className="space-y-2">
              {[
                { value: "private", label: "Private", desc: "Only invited participants can view" },
                { value: "link", label: "Link", desc: "Anyone with the link can view" },
                { value: "public", label: "Public", desc: "Visible to everyone" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start gap-3 p-4 bg-cream border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.privacy === option.value
                      ? "border-ocean bg-ocean/5"
                      : "border-midnight/10 hover:border-midnight/20"
                  }`}
                >
                  <input
                    type="radio"
                    name="privacy"
                    value={option.value}
                    checked={formData.privacy === option.value}
                    onChange={(e) => setFormData({ ...formData, privacy: e.target.value as any })}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-sm text-midnight/60">{option.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !formData.title}
            className="w-full py-4 bg-midnight text-cream rounded-lg font-semibold hover:bg-ocean transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Sandbox"
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
