import NotesClient from "./notes-client";

export default function NotesPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-neutral-100">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-white/10 bg-neutral-900 p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-neutral-400">Notes</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">ASTRA Notes workspace</h1>
          <p className="mt-4 max-w-2xl text-neutral-300">
            Capture knowledge, auto-categorize it, and search your notes like a premium ASTRA knowledge layer.
          </p>
        </header>

        <NotesClient />
      </div>
    </main>
  );
}
