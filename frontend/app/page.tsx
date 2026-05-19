export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0b0b0b] text-neutral-100">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.35em] text-neutral-500">AIPOS powered by ASTRA</p>
          <h1 className="mt-5 text-5xl font-semibold tracking-tight sm:text-7xl">
            One clean workspace for ASTRA Core, tasks, notes, and documents.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-400">
            Fast, minimal, and easy to use. Start a thread with ASTRA, upload a document, or open
            your tasks without digging through menus.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="/chat"
              className="rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-neutral-200"
            >
              Ask ASTRA
            </a>
            <a
              href="/dashboard"
              className="rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-neutral-100 transition hover:bg-white/5"
            >
              View workspace
            </a>
          </div>
        </div>

        <section className="mt-20 grid gap-4 sm:grid-cols-3">
          {[
            ["ASTRA Core", "Ask, plan, and get instant help."],
            ["ASTRA Docs", "Upload files and query them quickly."],
            ["ASTRA Notes", "Keep work and knowledge organized."],
          ].map(([title, description]) => (
            <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="text-base font-medium text-white">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-400">{description}</p>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
