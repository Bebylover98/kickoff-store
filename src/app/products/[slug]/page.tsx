
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AddToCartButton from '@/components/AddToCartButton';

function formatNPR(amount: number) {
  return `NPR ${amount.toLocaleString('en-US')}`;
}

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let product;
  try {
    product = await prisma.product.findUnique({
      where: { slug },
    });
  } catch {
    product = null;
  }
  if (!product) {
    notFound();
  }
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.2),_transparent_40%)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-16 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.35em] text-amber-400">Product detail</p>
            <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">{product.name}</h1>
            <p className="mt-6 text-lg text-slate-400">{product.description}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-slate-300">{product.sport}</div>
              <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-slate-300">{product.brand}</div>
              <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-slate-300">{product.inStock} in stock</div>
            </div>
          </div>
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur">
            <div className="relative h-[420px] w-full overflow-hidden rounded-2xl">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 576px"
                priority
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Price</p>
            <div className="mt-2 flex items-end gap-3">
              <span className="text-4xl font-semibold">{formatNPR(product.price)}</span>
              {product.compareAtPrice ? <span className="text-lg text-slate-500 line-through">{formatNPR(product.compareAtPrice)}</span> : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/shop" className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-slate-200">Back to shop</Link>
            <AddToCartButton
              productId={product.id}
              name={product.name}
              slug={product.slug}
              price={product.price}
              imageUrl={product.imageUrl}
              inStock={product.inStock}
            />
          </div>
        </div>
      </section>
    </main>
  );
}