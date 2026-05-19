import TasksClient from "./tasks-client";

export default function TasksPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-neutral-100">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-white/10 bg-neutral-900 p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-neutral-400">Tasks</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Task manager workspace</h1>
          <p className="mt-4 max-w-2xl text-neutral-300">
            Create tasks, prioritize work, and move items across a lightweight Kanban board.
          </p>
        </header>

        <TasksClient />
      </div>
    </main>
  );
}
