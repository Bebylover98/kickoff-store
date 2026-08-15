import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Star } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { optimizedImageUrl } from '@/lib/image-url';
import AddToCartButton from '@/components/AddToCartButton';
import ReviewForm from '@/components/ReviewForm';

function formatNPR(amount: number) {
  return `NPR ${amount.toLocaleString('en-US')}`;
}

export const revalidate = 30;

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let product;
  try {
    product = await prisma.product.findUnique({
      where: { slug },
      include: {
        reviews: {
          include: { customer: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  } catch {
    product = null;
  }
  if (!product) {
    notFound();
  }

  const reviewCount = product.reviews.length;
  const avgRating = reviewCount > 0
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : 0;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.2),_transparent_40%)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-16 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.35em] text-amber-400">Product detail</p>
            <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">{product.name}</h1>
            {reviewCount > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${avgRating >= star - 0.5 ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-slate-400">{avgRating.toFixed(1)} ({reviewCount} review{reviewCount === 1 ? '' : 's'})</span>
              </div>
            )}
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
                src={optimizedImageUrl(product.imageUrl, 800)}
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
            <Link href="/shop" className="mt-2 self-start h-fit inline-block rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-purple-500/30 transition-all hover:scale-[1.02]">Back to shop</Link>
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
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <h2 className="text-2xl font-semibold mb-6">Reviews {reviewCount > 0 ? `(${reviewCount})` : ''}</h2>
        <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
          <ReviewForm productId={product.id} />
          <div className="flex flex-col gap-4">
            {reviewCount === 0 && <p className="text-slate-400">No reviews yet. Be the first to review this product!</p>}
            {product.reviews.map((review) => (
              <div key={review.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-200">{review.customer.name ?? review.customer.email}</span>
                  <span className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="mt-1 flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3.5 w-3.5 ${review.rating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
                    />
                  ))}
                </div>
                {review.comment && <p className="mt-2 text-sm text-slate-400">{review.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
