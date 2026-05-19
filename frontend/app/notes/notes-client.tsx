"use client";

import { FormEvent, useEffect, useState } from "react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type NoteItem = {
  id: number;
  user_id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
};

export default function NotesClient() {
  const [userId, setUserId] = useState("demo-user");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [searchResults, setSearchResults] = useState<NoteItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void refreshNotes();
  }, []);

  async function refreshNotes(currentUserId = userId) {
    try {
      const response = await fetch(`${apiBaseUrl}/notes?user_id=${encodeURIComponent(currentUserId)}`);
      if (!response.ok) {
        return;
      }
      const data: { items: NoteItem[] } = await response.json();
      setNotes(data.items ?? []);
    } catch {
      setNotes([]);
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (!trimmedTitle || !trimmedContent || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${apiBaseUrl}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId.trim() || "demo-user",
          title: trimmedTitle,
          content: trimmedContent,
        }),
      });

      if (!response.ok) {
        throw new Error(`Create note failed with ${response.status}`);
      }

      setTitle("");
      setContent("");
      await refreshNotes(userId.trim() || "demo-user");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/notes/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId.trim() || "demo-user", query: trimmedQuery }),
      });
      if (!response.ok) {
        return;
      }
      const data: { items: NoteItem[] } = await response.json();
      setSearchResults(data.items ?? []);
    } catch {
      setSearchResults([]);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
        <h2 className="text-xl font-semibold">Create note</h2>
        <form onSubmit={handleCreate} className="mt-5 space-y-4">
          <input
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            placeholder="User ID"
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-white/30"
          />
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Note title"
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-white/30"
          />
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={6}
            placeholder="Capture thoughts, summaries, and action items here."
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-white/30"
          />
          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-2xl bg-white px-4 py-3 font-medium text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save note"}
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
        <h2 className="text-xl font-semibold">Search notes</h2>
        <form onSubmit={handleSearch} className="mt-5 space-y-4">
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search notes by keyword"
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-white/30"
          />
          <button
            type="submit"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-white transition hover:bg-white/10"
          >
            Search
          </button>
        </form>
        {searchResults.length ? (
          <div className="mt-5 space-y-3">
            {searchResults.map((note) => (
              <article key={note.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="font-medium text-neutral-100">{note.title}</p>
                <p className="mt-2 text-sm leading-7 text-neutral-300">{note.content}</p>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <section className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
        <h2 className="text-xl font-semibold">Recent notes</h2>
        <div className="mt-5 space-y-3">
          {notes.length ? notes.map((note) => (
            <article key={note.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium">{note.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-neutral-300">{note.content}</p>
                </div>
                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.2em] text-neutral-400">
                  {note.category}
                </span>
              </div>
            </article>
          )) : (
            <p className="text-sm text-neutral-400">No notes saved yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
