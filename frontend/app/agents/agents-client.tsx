"use client";

import { FormEvent, useState } from "react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type AgentResult = {
  agent: string;
  output: string;
  metadata: Record<string, unknown>;
};

export default function AgentsClient() {
  const [userId, setUserId] = useState("demo-user");
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState<AgentResult[]>([]);
  const [finalResponse, setFinalResponse] = useState("");
  const [requestedAgents, setRequestedAgents] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || isRunning) {
      return;
    }

    setIsRunning(true);
    try {
      const response = await fetch(`${apiBaseUrl}/agents/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmedPrompt, user_id: userId.trim() || "demo-user" }),
      });
      if (!response.ok) {
        throw new Error(`Agent workflow failed with ${response.status}`);
      }
      const data: { requested_agents: string[]; results: AgentResult[]; final_response: string } = await response.json();
      setRequestedAgents(data.requested_agents ?? []);
      setResults(data.results ?? []);
      setFinalResponse(data.final_response ?? "");
      setPrompt("");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
        <h2 className="text-xl font-semibold">Run ASTRA agent workflow</h2>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <input
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            placeholder="User ID"
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-white/30"
          />
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={4}
            placeholder="Example: Research AI startups and make a study roadmap."
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-white/30"
          />
          <button
            type="submit"
            disabled={isRunning}
            className="w-full rounded-2xl bg-white px-4 py-3 font-medium text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRunning ? "ASTRA is orchestrating..." : "Execute workflow"}
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
        <h2 className="text-xl font-semibold">Requested agents</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {requestedAgents.length ? requestedAgents.map((agent) => (
            <span key={agent} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-200">
              {agent}
            </span>
          )) : (
            <p className="text-sm text-neutral-500">No workflow run yet.</p>
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {results.map((result) => (
          <article key={result.agent} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">{result.agent}</p>
            <p className="mt-4 text-sm leading-7 text-neutral-200">{result.output}</p>
          </article>
        ))}
      </section>

      {finalResponse ? (
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Final response</h2>
          <p className="mt-4 text-sm leading-7 text-neutral-200">{finalResponse}</p>
        </section>
      ) : null}
    </div>
  );
}
