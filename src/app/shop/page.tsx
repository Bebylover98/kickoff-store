import Link from 'next/link';
import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function toPriceValue(value: string | undefined) {
  const parsed = Number(value ?? '0');
  return Number.isFinite(parsed) ? parsed : 0;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string; minPrice?: string; maxPrice?: string }>;
}) {
  const params = await searchParams;
  const sport = params.sport ?? 'all';
  const minPrice = toPriceValue(params.minPrice);
  const maxPrice = toPriceValue(params.maxPrice);

  const where: Prisma.ProductWhereInput = { isActive: true };

  if (sport !== 'all') {
    where.sport = sport.toUpperCase() as Prisma.ProductWhereInput['sport'];
  }

  if (minPrice > 0 || maxPrice > 0) {
    where.price = {};
    if (minPrice > 0) {
      where.price.gte = minPrice * 100;
    }
    if (maxPrice > 0) {
      where.price.lte = maxPrice * 100;
    }
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.2),_transparent_40%)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-20 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.35em] text-amber-400">KickOff Shop</p>
            <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Browse premium jerseys by sport and budget.</h1>
            <p className="mt-6 text-lg text-slate-400">Every piece is sourced from the Prisma catalog so the storefront stays in sync with your admin updates.</p>
          </div>
          <Link href="/admin/products" className="rounded-full border border-amber-400/40 bg-amber-500/10 px-5 py-3 text-sm font-semibold text-amber-300">Manage inventory</Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <form className="grid gap-4 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur md:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm text-slate-300">
            <span>Sport</span>
            <select name="sport" defaultValue={sport} className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3">
              <option value="all">All sports</option>
              <option value="football">Football</option>
              <option value="cricket">Cricket</option>
              <option value="basketball">Basketball</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-300">
            <span>Min price</span>
            <input name="minPrice" type="number" defaultValue={minPrice || ''} min="0" className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3" />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-300">
            <span>Max price</span>
            <input name="maxPrice" type="number" defaultValue={maxPrice || ''} min="0" className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3" />
          </label>
          <button className="rounded-xl bg-amber-500 px-4 py-3 font-semibold text-slate-950 md:col-span-3">Apply filters</button>
        </form>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
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
                  <Link href={`/products/${product.slug}`} className="text-sm font-semibold text-amber-300">View details</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
