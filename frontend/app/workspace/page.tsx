"use client";

import Link from "next/link";

export default function WorkspacePage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-neutral-100">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.06),_rgba(255,255,255,0.02))] p-6 shadow-[0_0_60px_rgba(255,255,255,0.04)]">
          <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Unified AI operating space</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-300">
            This workspace brings conversation, files, tasks, and memory into one calm view.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/chat" className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black">
              New Chat
            </Link>
            <Link href="/documents" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-100">
              Files
            </Link>
            <Link href="/settings" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-100">
              Settings
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["Conversation-first", "Ask questions, upload files, and generate outputs in one flow."],
            ["Auto-orchestration", "ASTRA routes work into notes, tasks, and memory automatically."],
            ["Readable outputs", "Markdown, sections, summaries, and action chips are optimized for clarity."],
            ["Premium UI", "Dark, calm, high-contrast surfaces with soft glow and compact hierarchy."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-medium">{title}</h2>
              <p className="mt-2 text-sm leading-7 text-neutral-300">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}