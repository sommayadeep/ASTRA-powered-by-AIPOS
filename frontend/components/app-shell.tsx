"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

const navigationItems = [
  { href: "/chat", label: "New Chat" },
  { href: "/workspace", label: "Workspace" },
  { href: "/documents", label: "Files" },
  { href: "/history", label: "History" },
  { href: "/settings", label: "Settings" },
];

export default function AppShell({ children }: { children?: ReactNode }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-neutral-100">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[260px_1fr]">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-[260px] border-r border-white/10 bg-[#111111] px-4 py-4 transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0 lg:px-4 ${
            mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="flex items-center justify-between gap-3 lg:block">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">ASTRA powered by AIPOS</p>
              <h1 className="mt-2 text-xl font-semibold tracking-tight">ASTRA Workspace</h1>
            </div>
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-neutral-200 lg:hidden"
            >
              Close
            </button>
          </div>

          <nav className="mt-6 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`rounded-xl px-3 py-2.5 text-sm transition ${
                    isActive
                      ? "bg-white text-black"
                      : "text-neutral-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-neutral-400">
              Free-first AI stack with local Ollama and Groq fallback.
          </div>
        </aside>

        {mobileNavOpen ? (
          <button
            type="button"
            aria-label="Close navigation overlay"
            onClick={() => setMobileNavOpen(false)}
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          />
        ) : null}

        <div className="min-w-0">
          <header className="border-b border-white/10 bg-[#0f0f0f] px-4 py-4 lg:px-8">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setMobileNavOpen((value) => !value)}
                className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-200 lg:hidden"
              >
                Menu
              </button>

              <div className="hidden min-w-0 flex-1 px-4 lg:block">
                <div className="mx-auto max-w-2xl rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-neutral-500">
                  Ask ASTRA or start a thread...
                </div>
              </div>

              <Link
                href="/chat"
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-neutral-200"
              >
                New thread
              </Link>
            </div>
          </header>

          <main className="px-4 py-4 sm:px-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
