"use client";

import { FormEvent, useEffect, useState } from "react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type TaskItem = {
  id: number;
  user_id: string;
  title: string;
  priority: string;
  due_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export default function TasksClient() {
  const [userId, setUserId] = useState("demo-user");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void refreshTasks();
  }, []);

  async function refreshTasks(currentUserId = userId) {
    try {
      const response = await fetch(`${apiBaseUrl}/tasks?user_id=${encodeURIComponent(currentUserId)}`);
      if (!response.ok) {
        return;
      }
      const data: { items: TaskItem[] } = await response.json();
      setTasks(data.items ?? []);
    } catch {
      setTasks([]);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${apiBaseUrl}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId.trim() || "demo-user",
          title: trimmedTitle,
          priority,
          due_date: dueDate || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`Create failed with ${response.status}`);
      }

      setTitle("");
      setPriority("medium");
      setDueDate("");
      await refreshTasks(userId.trim() || "demo-user");
    } finally {
      setIsSaving(false);
    }
  }

  async function setTaskStatus(taskId: number, status: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/tasks/${taskId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId.trim() || "demo-user", status }),
      });

      if (response.ok) {
        await refreshTasks(userId.trim() || "demo-user");
      }
    } catch {
      // no-op for now
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
        <h2 className="text-xl font-semibold">Create task</h2>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              placeholder="User ID"
              className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-white/30"
            />
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-white/30"
            >
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
            </select>
          </div>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What needs to get done?"
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-white/30"
          />
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-white/30"
          />
          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-2xl bg-white px-4 py-3 font-medium text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Create task"}
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
        <h2 className="text-xl font-semibold">Task board</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {[
            ["todo", "To do"],
            ["doing", "In progress"],
            ["done", "Done"],
          ].map(([status, label]) => (
            <div key={status} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="text-sm uppercase tracking-[0.25em] text-neutral-400">{label}</h3>
              <div className="mt-4 space-y-3">
                {tasks.filter((task) => task.status === status).map((task) => (
                  <article key={task.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="font-medium text-neutral-100">{task.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-neutral-500">
                      {task.priority} priority
                    </p>
                    {task.due_date ? (
                      <p className="mt-2 text-sm text-neutral-400">Due {task.due_date}</p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {status !== "todo" ? (
                        <button
                          type="button"
                          onClick={() => setTaskStatus(task.id, "todo")}
                          className="rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-200"
                        >
                          Set todo
                        </button>
                      ) : null}
                      {status !== "doing" ? (
                        <button
                          type="button"
                          onClick={() => setTaskStatus(task.id, "doing")}
                          className="rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-200"
                        >
                          Set doing
                        </button>
                      ) : null}
                      {status !== "done" ? (
                        <button
                          type="button"
                          onClick={() => setTaskStatus(task.id, "done")}
                          className="rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-200"
                        >
                          Set done
                        </button>
                      ) : null}
                    </div>
                  </article>
                ))}
                {!tasks.some((task) => task.status === status) ? (
                  <p className="text-sm text-neutral-500">No tasks here yet.</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
