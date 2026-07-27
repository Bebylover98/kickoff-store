import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

function formatNPR(amount: number) {
  return `NPR ${amount.toLocaleString('en-US')}`;
}

export const dynamic = 'force-dynamic';

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;

  if (!sessionId) {
    notFound();
  }

  const order = await prisma.order.findFirst({
    where: { stripeSessionId: sessionId },
    include: { items: { include: { product: true } } },
  });

  if (!order) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-slate-100">
      <div className="mx-auto max-w-4xl rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-10 shadow-2xl backdrop-blur">
        <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Order confirmed</p>
        <h1 className="mt-4 text-4xl font-semibold">Thanks for your purchase.</h1>
        <p className="mt-4 text-lg text-slate-300">Your Stripe payment succeeded and the order has been recorded in the database.</p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950/60 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Order ID</p>
              <p className="mt-2 font-mono text-sm">{order.id}</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Total</p>
              <p className="mt-2 text-xl font-semibold">{formatNPR(order.total)}</p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-sm text-slate-400">Qty {item.quantity}</p>
                </div>
                <p className="text-sm text-slate-300">{formatNPR(item.unitPrice)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/shop" className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-slate-200">Continue shopping</Link>
          <Link href="/" className="rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950">Return home</Link>
        </div>
      </div>
    </main>
  );
}
