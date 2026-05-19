const stats = [
  { label: "Active chats", value: "12" },
  { label: "Documents indexed", value: "48" },
  { label: "Tasks due today", value: "7" },
  { label: "Memories stored", value: "26" },
];

const modules = [
  "ASTRA Core",
  "ASTRA Docs",
  "ASTRA Tasks",
  "ASTRA Notes",
  "ASTRA Memory",
  "ASTRA Agents",
  "Settings",
  "Notifications",
  "ASTRA Intelligence Layer",
];

const shortcuts = [
  { href: "/chat", label: "Open chat" },
  { href: "/documents", label: "Open ASTRA Docs" },
  { href: "/memory", label: "ASTRA Memory" },
  { href: "/tasks", label: "ASTRA Tasks" },
  { href: "/notes", label: "ASTRA Notes" },
  { href: "/settings", label: "Settings" },
  { href: "/notifications", label: "Notifications" },
  { href: "/analytics", label: "ASTRA Intelligence Layer" },
  { href: "/agents", label: "ASTRA Forge" },
  { href: "/login", label: "Auth flow" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">AIPOS powered by ASTRA</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Your ASTRA workspace</h1>
        <p className="mt-3 max-w-2xl text-neutral-400">
          Jump back into ASTRA Core, upload documents, review tasks, or open notes. Keep the
          important things one click away.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {shortcuts.map((shortcut) => (
            <a
              key={shortcut.href}
              href={shortcut.href}
              className="rounded-full border border-white/10 bg-black/20 px-3.5 py-2 text-sm text-neutral-200 transition hover:bg-white/10"
            >
              {shortcut.label}
            </a>
          ))}
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-neutral-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg font-medium">ASTRA modules</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {modules.map((module) => (
              <div key={module} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-neutral-200">
                {module}
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg font-medium">Status</h2>
          <ul className="mt-4 space-y-3 text-sm text-neutral-300">
            <li className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
              <span>Chat</span>
              <span className="text-emerald-400">Live</span>
            </li>
            <li className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
              <span>Documents</span>
              <span className="text-emerald-400">Ready</span>
            </li>
            <li className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
              <span>Agents</span>
              <span className="text-emerald-400">Online</span>
            </li>
          </ul>
        </aside>
      </section>
    </div>
  );
}
