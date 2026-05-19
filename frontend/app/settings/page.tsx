import SettingsClient from "./settings-client";

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-neutral-100">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-white/10 bg-neutral-900 p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-neutral-400">Settings</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">ASTRA Workspace settings</h1>
          <p className="mt-4 max-w-2xl text-neutral-300">
            Configure your display name, preferred model provider, theme, and notification preferences.
          </p>
        </header>

        <SettingsClient />
      </div>
    </main>
  );
}
