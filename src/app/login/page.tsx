import Link from 'next/link';

export default function LoginPage() {
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-slate-100">
      <div className="w-full max-w-2xl space-y-6 rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">KickOff Store</p>
          <h1 className="mt-2 text-3xl font-semibold">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-400">Sign in to view your orders and saved addresses, or create a customer account to make checkout faster.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <form action="/api/auth/signin/credentials" method="POST" className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/50 p-5">
            <h2 className="text-xl font-semibold">Sign in</h2>
            <input name="email" type="email" required placeholder="Email" className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3" />
            <input name="password" type="password" required placeholder="Password" className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3" />
            <button className="w-full rounded-xl bg-amber-500 px-4 py-3 font-semibold text-slate-950">Continue</button>
          </form>

          <form action="/api/auth/signin/credentials" method="POST" className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/50 p-5">
            <h2 className="text-xl font-semibold">Create account</h2>
            <input name="name" required placeholder="Full name" className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3" />
            <input name="email" type="email" required placeholder="Email" className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3" />
            <input name="password" type="password" required placeholder="Password" className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3" />
            <button className="w-full rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 font-semibold text-amber-300">Create account</button>
          </form>
        </div>

        {googleEnabled ? (
          <a href="/api/auth/signin/google" className="block w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-center font-semibold text-slate-100">Continue with Google</a>
        ) : (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-200">Google sign-in will be available once GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set.</div>
        )}

        <div className="text-sm text-slate-400">
          Admin access remains available at <Link href="/admin/products" className="text-amber-300">/admin/products</Link>.
        </div>
      </div>
    </main>
  );
}
