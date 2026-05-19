"use client";

import { FormEvent, useEffect, useState } from "react";

type DocumentItem = {
  name: string;
  status: string;
  chunks: number;
  document_ids?: string[];
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function DocumentsClient() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isQuerying, setIsQuerying] = useState(false);

  useEffect(() => {
    void refreshDocuments();
  }, []);

  async function refreshDocuments() {
    try {
      const response = await fetch(`${apiBaseUrl}/documents`);
      if (!response.ok) {
        return;
      }
      const data: { items: DocumentItem[] } = await response.json();
      setDocuments(data.items ?? []);
    } catch {
      setDocuments([]);
    }
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFile || isUploading) {
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const response = await fetch(`${apiBaseUrl}/documents/upload`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Upload failed with ${response.status}`);
      }
      await refreshDocuments();
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleQuery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery || isQuerying) {
      return;
    }

    setIsQuerying(true);
    try {
      const response = await fetch(`${apiBaseUrl}/rag/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmedQuery, document_ids: documents.flatMap((document) => document.document_ids ?? []) }),
      });
      if (!response.ok) {
        throw new Error(`Query failed with ${response.status}`);
      }
      const data: { answer: string } = await response.json();
      setAnswer(data.answer);
    } finally {
      setIsQuerying(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
        <h2 className="text-xl font-semibold">Upload document</h2>
        <form onSubmit={handleUpload} className="mt-5 space-y-4">
          <input
            type="file"
            accept=".pdf,.docx,.txt,.md,.csv"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            className="block w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-neutral-300 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-black"
          />
          <button
            type="submit"
            disabled={!selectedFile || isUploading}
            className="w-full rounded-2xl bg-white px-4 py-3 font-medium text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? "ASTRA is indexing..." : "Index with ASTRA"}
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
        <h2 className="text-xl font-semibold">Ask across documents</h2>
        <form onSubmit={handleQuery} className="mt-5 space-y-4">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ask ASTRA a question about your uploaded files"
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-white/30"
          />
          <button
            type="submit"
            disabled={isQuerying}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isQuerying ? "ASTRA is reasoning..." : "Query ASTRA Docs"}
          </button>
        </form>
        {answer ? <p className="mt-4 text-sm leading-7 text-neutral-300">{answer}</p> : null}
      </section>

      <section className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
        <h2 className="text-xl font-semibold">Indexed files</h2>
        <div className="mt-5 space-y-3">
          {documents.length ? documents.map((document) => (
            <article key={document.name} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium">{document.name}</h3>
                  <p className="mt-1 text-sm text-neutral-400">{document.chunks} chunks</p>
                </div>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                  {document.status}
                </span>
              </div>
            </article>
          )) : (
            <p className="text-sm text-neutral-400">No documents indexed yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
