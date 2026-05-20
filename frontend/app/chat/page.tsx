"use client";

import { useEffect, useState } from "react";
import ChatClient, { Message } from "./chat-client";

type Conversation = { id: string; title: string; messages: Message[] };

const STORAGE_KEY = "aipos_conversations";

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Conversation[];
  } catch {
    return [];
  }
}

function saveConversations(items: Conversation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

const initialAssistant = {
  role: "assistant" as const,
  content:
    "ASTRA Core is ready. Ask for a plan, a document summary, or a deeper explanation.",
};

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([initialAssistant]);
  const [documents, setDocuments] = useState<{ name: string; chunks: number }[]>([]);

  useEffect(() => {
    const loaded = loadConversations();
    if (loaded.length) {
      setConversations(loaded);
      setCurrentId(loaded[0].id);
      setMessages(loaded[0].messages);
    }
    // fetch indexed documents
    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/documents`);
        if (!res.ok) return;
        const data = await res.json();
        setDocuments(data.items || []);
      } catch {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    // persist current conversation
    if (!currentId) return;
    const idx = conversations.findIndex((c) => c.id === currentId);
    const updated = [...conversations];
    const title = messages.find((m) => m.role === "user")?.content?.slice(0, 60) || "New chat";
    const conv: Conversation = { id: currentId, title, messages };
    if (idx >= 0) {
      updated[idx] = conv;
    } else {
      updated.unshift(conv);
    }
    setConversations(updated);
    saveConversations(updated);
  }, [messages]);

  function newChat() {
    const id = String(Date.now());
    const conv: Conversation = { id, title: "New chat", messages: [initialAssistant] };
    const updated = [conv, ...conversations];
    setConversations(updated);
    saveConversations(updated);
    setCurrentId(id);
    setMessages(conv.messages);
  }

  function openConversation(id: string) {
    const conv = conversations.find((c) => c.id === id);
    if (conv) {
      setCurrentId(id);
      setMessages(conv.messages);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-neutral-100">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl gap-6 lg:grid-cols-[0.28fr_1fr]">
        <aside className="rounded-2xl border border-white/10 bg-neutral-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Threads</p>
              <h2 className="mt-2 text-lg font-semibold">Recent</h2>
            </div>
            <button onClick={newChat} className="rounded-full bg-white px-3 py-1 text-sm text-black">
              New Chat
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {conversations.length === 0 && (
              <p className="text-sm text-neutral-400">No ASTRA threads yet — click New to begin.</p>
            )}
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => openConversation(c.id)}
                className={`w-full text-left rounded-xl px-3 py-2 transition ${
                  c.id === currentId ? "bg-white text-black" : "hover:bg-white/5 text-neutral-200"
                }`}
              >
                <div className="text-sm font-medium truncate">{c.title || "New chat"}</div>
                <div className="text-xs text-neutral-400 truncate">{c.messages.slice(-1)[0]?.content?.slice(0, 80)}</div>
              </button>
            ))}
          </div>

          <div className="mt-6 border-t border-white/5 pt-4">
            <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">ASTRA Docs</p>
            <div className="mt-3 space-y-2">
              {documents.length === 0 && <p className="text-sm text-neutral-500">No documents indexed.</p>}
              {documents.map((d) => (
                <button
                  key={d.name}
                  onClick={() => {
                    // start a new user message asking about this document
                    const q = `ASTRA, summarize the document: ${d.name}`;
                    const next: Message[] = [...messages, { role: "user", content: q }];
                    setMessages(next);
                  }}
                  className="w-full text-left rounded-md px-3 py-2 text-sm text-neutral-200 hover:bg-white/5"
                >
                  <div className="font-medium truncate">{d.name}</div>
                  <div className="text-xs text-neutral-400">{d.chunks} chunks</div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div>
          <ChatClient messages={messages} setMessages={setMessages} />
        </div>
      </div>
    </main>
  );
}
