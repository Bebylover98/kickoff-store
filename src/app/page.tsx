import { prisma } from '@/lib/prisma';

export default async function Home() {
  let products: Array<{ id: string; slug: string; name: string; description: string; sport: string; price: number; inStock: number; imageUrl: string }> = [];

  try {
    products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });
  } catch {
    products = [];
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.2),_transparent_40%)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-20 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.35em] text-amber-400">Premium sportswear</p>
            <h1 className="mt-4 text-4xl font-semibold sm:text-6xl">Own the match in elite club jerseys.</h1>
            <p className="mt-6 text-lg text-slate-400">KickOff Store brings football, cricket, and basketball essentials into one refined shopping experience.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="/shop" className="rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950">Shop jerseys</a>
            <a href="/admin/products" className="rounded-full border border-amber-400/40 bg-amber-500/10 px-5 py-3 text-sm font-semibold text-amber-300">Open admin panel</a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <article key={product.id} className="overflow-hidden rounded-3xl border border-white/10 bg-white/10 backdrop-blur">
              <img src={product.imageUrl} alt={product.name} className="h-56 w-full object-cover" />
              <div className="p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold">{product.name}</h2>
                  <span className="rounded-full bg-slate-900/70 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-300">{product.sport}</span>
                </div>
                <p className="mt-3 text-sm text-slate-400">{product.description}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-lg font-semibold">${(product.price / 100).toFixed(2)}</span>
                  <a href={`/products/${product.slug}`} className="text-sm font-semibold text-amber-300">View details</a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
