"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Conversation = { id: string; title: string; messages: { role: string; content: string }[] };

const STORAGE_KEY = "aipos_conversations";

export default function HistoryPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setConversations(raw ? (JSON.parse(raw) as Conversation[]) : []);
    } catch {
      setConversations([]);
    }
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-neutral-100">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">History</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Recent conversations</h1>
          <p className="mt-3 text-sm leading-7 text-neutral-300">Browse your saved ASTRA threads from the browser.</p>
          <div className="mt-5 flex gap-2">
            <Link href="/chat" className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black">
              New Chat
            </Link>
            <Link href="/workspace" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-100">
              Workspace
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          {conversations.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5 text-sm text-neutral-300">
              No saved conversations yet.
            </div>
          ) : (
            conversations.map((conversation) => (
              <Link
                key={conversation.id}
                href="/chat"
                className="block rounded-2xl border border-white/10 bg-neutral-900 p-5 transition hover:bg-white/5"
              >
                <div className="text-lg font-medium">{conversation.title || "New chat"}</div>
                <div className="mt-2 line-clamp-2 text-sm text-neutral-400">
                  {conversation.messages.slice(-1)[0]?.content ?? "No preview available."}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}