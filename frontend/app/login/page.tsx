export default function LoginPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-neutral-100">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-between rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(40,40,40,0.9),_rgba(10,10,10,1)_70%)] p-8 shadow-2xl shadow-black/30">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-neutral-400">ASTRA powered by AIPOS</p>
            <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight sm:text-6xl">
              Sign in to your ASTRA-powered productivity operating system.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-neutral-300">
              Use one account to access ASTRA Core, document intelligence, tasks, notes, memory,
              and agent workflows.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              ["Secure sessions", "JWT + protected routes"],
              ["Google OAuth", "Fast social sign-in"],
              ["Persistent memory", "Personalized ASTRA context"],
            ].map(([title, subtitle]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-medium text-white">{title}</p>
                <p className="mt-2 text-sm leading-6 text-neutral-400">{subtitle}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center rounded-3xl border border-white/10 bg-neutral-900 p-8">
          <div className="w-full max-w-md">
            <div className="flex gap-2 rounded-full border border-white/10 bg-black/30 p-1 text-sm">
              <button className="flex-1 rounded-full bg-white px-4 py-2 font-medium text-black">
                Log in
              </button>
              <button className="flex-1 rounded-full px-4 py-2 text-neutral-300 transition hover:bg-white/5">
                Sign up
              </button>
            </div>

            <form className="mt-8 space-y-4">
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
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-white/30"
                />
              </label>

              <button className="w-full rounded-2xl bg-white px-4 py-3 font-medium text-black transition hover:bg-neutral-200">
                Continue with email
              </button>

              <button className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-white transition hover:bg-white/10">
                Continue with Google
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-neutral-400">
              New here? <a href="/signup" className="text-white underline underline-offset-4">Create an account</a>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
