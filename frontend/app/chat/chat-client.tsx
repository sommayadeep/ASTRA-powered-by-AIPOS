"use client";

import { FormEvent, useState, ChangeEvent } from "react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

type Props = {
  messages: Message[];
  setMessages: (m: Message[]) => void;
};

export default function ChatClient({ messages, setMessages }: Props) {
  const [prompt, setPrompt] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [lastUploaded, setLastUploaded] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || isSending) {
      return;
    }

    const nextMessages = [...messages, { role: "user", content: trimmedPrompt } as Message];
    setMessages(nextMessages);
    setPrompt("");
    setIsSending(true);

    try {
      const response = await fetch(`${apiBaseUrl}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmedPrompt }),
      });

      if (!response.ok) {
        throw new Error(`Chat request failed with ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        const fallbackData: { reply: string } = await (await fetch(`${apiBaseUrl}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmedPrompt }),
        })).json();
        setMessages([...nextMessages, { role: "assistant", content: fallbackData.reply }]);
        return;
      }

      const decoder = new TextDecoder();
      let accumulated = "";
      setMessages([...nextMessages, { role: "assistant", content: "" }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        accumulated += decoder.decode(value, { stream: true });
        setMessages([...nextMessages, { role: "assistant", content: accumulated }]);
      }
    } catch {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            "ASTRA is offline right now. Start the FastAPI server and set the provider credentials to use the live engine.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }


  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch(`${apiBaseUrl}/documents/upload`, { method: "POST", body: form });
      if (!res.ok) throw new Error("upload failed");
      const data = await res.json();
      const msg = `ASTRA indexed ${data.filename} (${data.chunks} chunks). You can now ask ASTRA about it.`;
      setMessages([...messages, { role: "assistant", content: msg }]);
      setLastUploaded(data.filename);
    } catch (err) {
      setMessages([...messages, { role: "assistant", content: "ASTRA could not index that file right now." }]);
    }
  }
  return (
    <section className="flex flex-col rounded-3xl border border-white/10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0.02))] p-4">
      <div className="flex-1 space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`max-w-3xl rounded-2xl px-4 py-3 ${
              message.role === "user" ? "ml-auto bg-white text-black" : "bg-white/5 text-neutral-100"
            }`}
          >
            <p className="mb-1 text-xs uppercase tracking-[0.25em] opacity-60">
              {message.role === "user" ? "User" : "ASTRA Response"}
            </p>
            <p className="text-sm leading-7">{message.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 rounded-2xl border border-white/10 bg-neutral-900 p-4">
        <label className="block text-sm text-neutral-300">Ask ASTRA</label>
        <div className="mt-3 flex gap-3">
          <input
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            type="text"
            placeholder="Ask ASTRA anything or reference a document..."
            className="flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-white/30"
          />
          <label className="flex items-center gap-2">
            <input type="file" onChange={handleFileChange} className="hidden" />
            <span className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-200">Upload</span>
          </label>

          <button
            type="submit"
            disabled={isSending}
            className="rounded-2xl bg-white px-5 py-3 font-medium text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSending ? "ASTRA is reasoning..." : "Send"}
          </button>
        </div>
      </form>
    </section>
  );
}
