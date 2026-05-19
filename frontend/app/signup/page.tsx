export default function SignupPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-neutral-100">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-3xl border border-white/10 bg-neutral-900 p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-neutral-400">Create account</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            Start building your ASTRA-powered productivity system.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-neutral-300">
            Save memory, organize work, and keep every chat and document connected to your profile.
          </p>
        </section>

        <section className="flex items-center rounded-3xl border border-white/10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0.02))] p-8">
          <div className="w-full max-w-md">
            <form className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm text-neutral-300">Name</span>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-white/30"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm text-neutral-300">Email</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-white/30"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm text-neutral-300">Password</span>
                <input
                  type="password"
                  placeholder="Create a password"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-white/30"
                />
              </label>

              <button className="w-full rounded-2xl bg-white px-4 py-3 font-medium text-black transition hover:bg-neutral-200">
                Create account
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-neutral-400">
              Already have an account? <a href="/login" className="text-white underline underline-offset-4">Log in</a>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
