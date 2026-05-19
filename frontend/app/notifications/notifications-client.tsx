"use client";

import { FormEvent, useEffect, useState } from "react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type NotificationItem = {
  id: number;
  user_id: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
};

export default function NotificationsClient() {
  const [userId, setUserId] = useState("demo-user");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void refreshNotifications();
  }, []);

  async function refreshNotifications(currentUserId = userId) {
    try {
      const response = await fetch(`${apiBaseUrl}/notifications?user_id=${encodeURIComponent(currentUserId)}`);
      if (!response.ok) {
        return;
      }
      const data: { items: NotificationItem[] } = await response.json();
      setNotifications(data.items ?? []);
    } catch {
      setNotifications([]);
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !body.trim() || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${apiBaseUrl}/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId.trim() || "demo-user",
          title,
          body,
        }),
      });
      if (!response.ok) {
        throw new Error(`Create failed with ${response.status}`);
      }
      setTitle("");
      setBody("");
      await refreshNotifications(userId.trim() || "demo-user");
    } finally {
      setIsSaving(false);
    }
  }

  async function markAsRead(notificationId: number) {
    try {
      const response = await fetch(`${apiBaseUrl}/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId.trim() || "demo-user" }),
      });
      if (response.ok) {
        await refreshNotifications(userId.trim() || "demo-user");
      }
    } catch {
      // no-op for now
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
        <h2 className="text-xl font-semibold">Create notification</h2>
        <form onSubmit={handleCreate} className="mt-5 space-y-4">
          <input
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            placeholder="User ID"
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-white/30"
          />
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Notification title"
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-white/30"
          />
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={4}
            placeholder="Notification body"
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-white/30"
          />
          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-2xl bg-white px-4 py-3 font-medium text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Create notification"}
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
        <h2 className="text-xl font-semibold">Notifications</h2>
        <div className="mt-5 space-y-3">
          {notifications.length ? notifications.map((notification) => (
            <article key={notification.id} className={`rounded-2xl border p-4 ${notification.is_read ? "border-white/10 bg-white/5" : "border-emerald-400/30 bg-emerald-400/10"}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium text-neutral-100">{notification.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-neutral-300">{notification.body}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-neutral-400">
                    {notification.is_read ? "Read" : "New"}
                  </span>
                  {!notification.is_read ? (
                    <button
                      type="button"
                      onClick={() => markAsRead(notification.id)}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-200"
                    >
                      Mark read
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          )) : (
            <p className="text-sm text-neutral-400">No notifications yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
