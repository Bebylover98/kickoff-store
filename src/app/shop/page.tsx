import Link from 'next/link';
import Image from 'next/image';
import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import AuroraBackground from '@/components/AuroraBackground';
import StoreNav from '@/components/StoreNav';

export const dynamic = 'force-dynamic';

function formatNPR(amount: number) {
  return `NPR ${amount.toLocaleString('en-US')}`;
}

const sportLabels: Record<string, string> = {
  FOOTBALL: 'Football',
  CRICKET: 'Cricket',
  BASKETBALL: 'Basketball',
};

function toPriceValue(value: string | undefined) {
  const parsed = Number(value ?? '0');
  return Number.isFinite(parsed) ? parsed : 0;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string; minPrice?: string; maxPrice?: string; q?: string }>;
}) {
  const params = await searchParams;
  const sport = params.sport ?? 'all';
  const minPrice = toPriceValue(params.minPrice);
  const maxPrice = toPriceValue(params.maxPrice);
  const query = (params.q ?? '').trim();

  const where: Prisma.ProductWhereInput = { isActive: true };

  if (sport !== 'all') {
    where.sport = sport.toUpperCase() as Prisma.ProductWhereInput['sport'];
  }

  if (minPrice > 0 || maxPrice > 0) {
    where.price = {};
    if (minPrice > 0) {
      where.price.gte = minPrice;
    }
    if (maxPrice > 0) {
      where.price.lte = maxPrice;
    }
  }

  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { brand: { contains: query, mode: 'insensitive' } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <AuroraBackground>
      <StoreNav />

      <section className="border-b border-white/5">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-sm font-medium text-white/70 backdrop-blur-sm mb-4">
            <span>KickOff Shop</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            Browse premium gear by{' '}
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              sport
            </span>{' '}
            and budget.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/50">
            Every piece is sourced from the live catalog, so the storefront always stays in sync with admin updates.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        <form className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm text-white/60 md:col-span-3">
            <span>Search</span>
            <input
              name="q"
              type="text"
              placeholder="Search by name, brand, or description"
              defaultValue={query}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-white/60">
            <span>Sport</span>
            <select
              name="sport"
              defaultValue={sport}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all"
            >
              <option value="all" className="bg-[#09090B]">All sports</option>
              <option value="football" className="bg-[#09090B]">Football</option>
              <option value="cricket" className="bg-[#09090B]">Cricket</option>
              <option value="basketball" className="bg-[#09090B]">Basketball</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-white/60">
            <span>Min price (NPR)</span>
            <input
              name="minPrice"
              type="number"
              defaultValue={minPrice || ''}
              min="0"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-white/60">
            <span>Max price (NPR)</span>
            <input
              name="maxPrice"
              type="number"
              defaultValue={maxPrice || ''}
              min="0"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all"
            />
          </label>
          <button className="rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 px-4 py-3 font-semibold text-white shadow-lg shadow-purple-500/25 hover:scale-[1.01] transition-transform md:col-span-3">
            Apply filters
          </button>
        </form>
      </section>

      <section className="container mx-auto px-4 pb-20">
        {products.length === 0 ? (
          <p className="text-white/40">No products match these filters yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="group overflow-hidden rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm hover:border-white/20 transition-all"
              >
                <div className="relative h-32 sm:h-56 w-full overflow-hidden">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold">{product.name}</h2>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/60">
                      {sportLabels[product.sport] ?? product.sport}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-white/40 line-clamp-2">{product.description}</p>
                  <div className="mt-5 flex items-center justify-between gap-2">
                    <span className="text-lg font-bold text-cyan-400">{formatNPR(product.price)}</span>
                    
                    <Link
                      href={`/products/${product.slug}`}
                      className="rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 px-4 py-2 text-sm font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </AuroraBackground>
  );
}
