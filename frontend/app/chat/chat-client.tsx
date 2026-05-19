"use client";

import { FormEvent, useState, ChangeEvent, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isDragging, setIsDragging] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexingFile, setIndexingFile] = useState<string | null>(null);
  const [userId, setUserId] = useState("demo-user");

  useEffect(() => {
    const savedUserId = typeof window !== "undefined" ? localStorage.getItem("aipos_user_id") : null;
    if (savedUserId) {
      setUserId(savedUserId);
    }
  }, []);

  async function sendPrompt(content: string) {
    if (!content || isSending) return;

    const nextMessages = [...messages, { role: "user", content } as Message];
    setMessages(nextMessages);
    setPrompt("");
    setIsSending(true);

    try {
      const response = await fetch(`${apiBaseUrl}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, user_id: userId }),
      });

      if (!response.ok) {
        throw new Error(`Chat request failed with ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        const fallbackData: { reply: string } = await (
          await fetch(`${apiBaseUrl}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: content, user_id: userId }),
          })
        ).json();
        setMessages([...nextMessages, { role: "assistant", content: fallbackData.reply }]);
        return;
      }

      const decoder = new TextDecoder();
      let accumulated = "";
      setMessages([...nextMessages, { role: "assistant", content: "" }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        accumulated += decoder.decode(value, { stream: true });
        setMessages([...nextMessages, { role: "assistant", content: accumulated }]);
      }
    } catch {
      setMessages([
        ...messages,
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || isSending) {
      return;
    }
    await sendPrompt(trimmedPrompt);
  }


  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleUpload(file);
  }

  async function handleUpload(file: File) {
    setIsIndexing(true);
    setIndexingFile(file.name);
    // show a lightweight indexing notice in the thread
    setMessages([...messages, { role: "assistant", content: `Indexing ${file.name}...` }]);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${apiBaseUrl}/documents/upload`, { method: "POST", body: form });
      if (!res.ok) throw new Error("upload failed");
      const data = await res.json();
      const successMsg = `Indexed by ASTRA: ${data.filename} (${data.chunks} chunks).`;
      setMessages((prev) => {
        // replace the last indexing notice with success message
        const copy = [...prev];
        const lastIdx = copy.map((m) => m.content).lastIndexOf(`Indexing ${file.name}...`);
        if (lastIdx >= 0) {
          copy[lastIdx] = { role: "assistant", content: successMsg };
          return copy;
        }
        return [...prev, { role: "assistant", content: successMsg }];
      });
      setLastUploaded(data.filename);
    } catch (err) {
      setMessages((prev) => {
        const failMsg = "ASTRA could not index that file right now.";
        const copy = [...prev];
        const lastIdx = copy.map((m) => m.content).lastIndexOf(`Indexing ${file.name}...`);
        if (lastIdx >= 0) {
          copy[lastIdx] = { role: "assistant", content: failMsg };
          return copy;
        }
        return [...prev, { role: "assistant", content: failMsg }];
      });
    } finally {
      setIsIndexing(false);
      setIndexingFile(null);
    }
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  async function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await handleUpload(file as File);
  }
  return (
    <section className="flex flex-col rounded-3xl border border-white/10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0.02))] p-4">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`flex-1 space-y-6 rounded-2xl border border-white/6 bg-gradient-to-b from-[#071018] to-[#0b0b0b] p-6 transition ${
          isDragging ? "ring-2 ring-white/20" : ""
        } overflow-auto`}
        style={{ maxWidth: 920, marginLeft: "auto", marginRight: "auto" }}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {messages.map((message, index) => (
            <motion.div
              key={`${message.role}-${index}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className={`w-full rounded-2xl px-5 py-4 shadow-sm ${
                message.role === "user"
                  ? "ml-auto max-w-[48%] bg-white text-black"
                  : "bg-gradient-to-br from-white/6 to-white/3 text-neutral-100"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="mb-2 text-xs uppercase tracking-[0.25em] opacity-60">{message.role === "user" ? "You" : "ASTRA"}</div>
                  <div className="prose prose-invert max-w-none text-sm leading-7">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                  </div>
                  {message.role === "assistant" ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => sendPrompt(`Create concise notes from the last response.`)}
                        className="rounded-full bg-white/6 px-3 py-1 text-xs text-neutral-100 hover:bg-white/8"
                      >
                        Create Notes
                      </button>
                      <button
                        type="button"
                        onClick={() => sendPrompt(`Create tasks from the last response and prioritize them.`)}
                        className="rounded-full bg-white/6 px-3 py-1 text-xs text-neutral-100 hover:bg-white/8"
                      >
                        Generate Tasks
                      </button>
                      <button
                        type="button"
                        onClick={() => sendPrompt(`Save the key points from the last response to memory.`)}
                        className="rounded-full bg-white/6 px-3 py-1 text-xs text-neutral-100 hover:bg-white/8"
                      >
                        Save to Memory
                      </button>
                      <button
                        type="button"
                        onClick={() => sendPrompt(`Summarize the last response in one paragraph.`)}
                        className="rounded-full bg-white/6 px-3 py-1 text-xs text-neutral-100 hover:bg-white/8"
                      >
                        Summarize
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 rounded-2xl border border-white/10 bg-neutral-900 p-4">
        <div className="mb-3 flex items-center gap-3">
          {isIndexing && indexingFile ? (
            <div className="inline-flex items-center gap-3 rounded-full bg-white/5 px-3 py-1 text-sm text-neutral-200">
              <div className="h-2 w-2 animate-pulse rounded-full bg-white/80" />
              <div>Indexing {indexingFile}</div>
            </div>
          ) : lastUploaded ? (
            <div className="inline-flex items-center gap-3 rounded-full bg-white/5 px-3 py-1 text-sm text-neutral-200">
              Indexed by ASTRA: {lastUploaded}
            </div>
          ) : null}
        </div>
        <label className="block text-sm text-neutral-300">Ask ASTRA</label>
        <div className="mt-3 flex gap-3">
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Ask ASTRA anything or reference a document..."
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendPrompt(prompt.trim());
              }
            }}
            className="flex-1 resize-none rounded-2xl border border-white/8 bg-black/25 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:ring-2 focus:ring-white/10"
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
