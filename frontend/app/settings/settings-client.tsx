"use client";

import { FormEvent, useEffect, useState } from "react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type SettingsItem = {
  user_id: string;
  display_name: string;
  preferred_provider: string;
  theme: string;
  notifications_enabled: boolean;
  updated_at: string | null;
};

export default function SettingsClient() {
  const [userId, setUserId] = useState("demo-user");
  const [displayName, setDisplayName] = useState("");
  const [preferredProvider, setPreferredProvider] = useState("ollama");
  const [theme, setTheme] = useState("dark");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [settings, setSettings] = useState<SettingsItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void refreshSettings();
  }, []);

  async function refreshSettings(currentUserId = userId) {
    try {
      const response = await fetch(`${apiBaseUrl}/settings?user_id=${encodeURIComponent(currentUserId)}`);
      if (!response.ok) {
        return;
      }
      const data: SettingsItem = await response.json();
      setSettings(data);
      setDisplayName(data.display_name ?? "");
      setPreferredProvider(data.preferred_provider ?? "ollama");
      setTheme(data.theme ?? "dark");
      setNotificationsEnabled(Boolean(data.notifications_enabled));
    } catch {
      setSettings(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${apiBaseUrl}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId.trim() || "demo-user",
          display_name: displayName,
          preferred_provider: preferredProvider,
          theme,
          notifications_enabled: notificationsEnabled,
        }),
      });

      if (!response.ok) {
        throw new Error(`Save failed with ${response.status}`);
      }

      const data: SettingsItem = await response.json();
      setSettings(data);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
        <h2 className="text-xl font-semibold">Profile and ASTRA preferences</h2>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <input
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            placeholder="User ID"
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-white/30"
          />
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Display name"
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-white/30"
          />
          <select
            value={preferredProvider}
            onChange={(event) => setPreferredProvider(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-white/30"
          >
            <option value="ollama">Ollama</option>
            <option value="groq">Groq</option>
            <option value="gemini">Gemini</option>
            <option value="openrouter">OpenRouter</option>
            <option value="openai">OpenAI</option>
          </select>
          <select
            value={theme}
            onChange={(event) => setTheme(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-white/30"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="system">System</option>
          </select>
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-neutral-200">
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(event) => setNotificationsEnabled(event.target.checked)}
              className="h-4 w-4"
            />
            Enable notifications
          </label>
          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-2xl bg-white px-4 py-3 font-medium text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save settings"}
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
        <h2 className="text-xl font-semibold">Current settings</h2>
        {settings ? (
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              ["Display name", settings.display_name || "Not set"],
              ["Preferred provider", settings.preferred_provider],
              ["Theme", settings.theme],
              ["Notifications", settings.notifications_enabled ? "Enabled" : "Disabled"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <dt className="text-xs uppercase tracking-[0.25em] text-neutral-500">{label}</dt>
                <dd className="mt-2 text-sm text-neutral-200">{value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-4 text-sm text-neutral-400">No settings loaded yet.</p>
        )}
      </section>
    </div>
  );
}
