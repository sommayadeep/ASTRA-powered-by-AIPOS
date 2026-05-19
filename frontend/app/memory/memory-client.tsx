"use client";

import { FormEvent, useEffect, useState } from "react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type MemoryItem = {
  id: number;
  user_id: string;
  memory_text: string;
  importance_score: number;
  created_at: string;
};

export default function MemoryClient() {
  const [userId, setUserId] = useState("demo-user");
  const [memoryText, setMemoryText] = useState("");
  const [importanceScore, setImportanceScore] = useState("0.8");
  const [summary, setSummary] = useState("");
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void refreshMemories();
  }, []);

  async function refreshMemories(currentUserId = userId) {
    try {
      const response = await fetch(`${apiBaseUrl}/memory?user_id=${encodeURIComponent(currentUserId)}`);
      if (!response.ok) {
        return;
      }
      const data: { items: MemoryItem[] } = await response.json();
      setMemories(data.items ?? []);

      const summaryResponse = await fetch(`${apiBaseUrl}/memory/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: currentUserId }),
      });
      if (summaryResponse.ok) {
        const summaryData: { summary: string } = await summaryResponse.json();
        setSummary(summaryData.summary);
      }
    } catch {
      setMemories([]);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedMemory = memoryText.trim();
    if (!trimmedMemory || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${apiBaseUrl}/memory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId.trim() || "demo-user",
          memory_text: trimmedMemory,
          importance_score: Number.parseFloat(importanceScore) || 0.5,
        }),
      });

      if (!response.ok) {
        throw new Error(`Save failed with ${response.status}`);
      }

      setMemoryText("");
      await refreshMemories(userId.trim() || "demo-user");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
        <h2 className="text-xl font-semibold">Memory profile</h2>
        <p className="mt-3 text-sm leading-7 text-neutral-300">
          Store long-term preferences and context so ASTRA can personalize future responses.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm text-neutral-300">User ID</span>
            <input
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-white/30"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm text-neutral-300">Importance score</span>
            <input
              value={importanceScore}
              onChange={(event) => setImportanceScore(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-white/30"
            />
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
        <h2 className="text-xl font-semibold">Add memory</h2>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <textarea
            value={memoryText}
            onChange={(event) => setMemoryText(event.target.value)}
            rows={4}
            placeholder="Example: User is preparing for AI/ML interviews and prefers Python."
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-white/30"
          />
          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-2xl bg-white px-4 py-3 font-medium text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save memory"}
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
        <h2 className="text-xl font-semibold">Memory summary</h2>
        <p className="mt-3 text-sm leading-7 text-neutral-300">{summary || "No memory summary available yet."}</p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
        <h2 className="text-xl font-semibold">Saved memories</h2>
        <div className="mt-5 space-y-3">
          {memories.length ? memories.map((memory) => (
            <article key={memory.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm leading-7 text-neutral-200">{memory.memory_text}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-neutral-500">
                Score {memory.importance_score} · {memory.created_at}
              </p>
            </article>
          )) : (
            <p className="text-sm text-neutral-400">No memories saved yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
