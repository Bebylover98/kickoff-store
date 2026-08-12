import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Package, ArrowRight, ShoppingBag, Clock, CheckCircle2, Truck, XCircle } from 'lucide-react';

function formatNPR(amount: number) {
  return `NPR ${amount.toLocaleString('en-US')}`;
}

const statusConfig: Record<string, { icon: typeof Clock; color: string; bg: string }> = {
  PENDING: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
  PAID: { icon: CheckCircle2, color: 'text-cyan-400', bg: 'bg-cyan-400/10 border-cyan-400/20' },
  SHIPPED: { icon: Truck, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
  CANCELLED: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
  COMPLETED: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' },
};

export const dynamic = 'force-dynamic';

export default async function OrdersListPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  if (session.user.role === 'admin') redirect('/admin/orders');

  const orders = await prisma.order.findMany({
    where: { customerId: session.user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/10">
          <ShoppingBag className="h-9 w-9 text-white/60" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">No orders yet</h1>
        <p className="text-white/50 text-sm mb-8">
          When you place an order, it&apos;ll show up here so you can track it.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 px-6 py-3 font-medium text-white hover:opacity-90 transition"
        >
          Start shopping
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Your Orders</h1>
        <p className="text-white/40 text-sm mt-1">
          {orders.length} order{orders.length !== 1 ? 's' : ''} placed
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const cfg = statusConfig[order.status] ?? statusConfig.PENDING;
          const StatusIcon = cfg.icon;
          const previewItems = order.items.slice(0, 3);
          const extraCount = order.items.length - previewItems.length;

          return (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="group block rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/[0.08] hover:border-white/20"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/10">
                    <Package className="h-5 w-5 text-white/70" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium truncate">
                      {previewItems.map((it) => it.product.name).join(', ')}
                      {extraCount > 0 && (
                        <span className="text-white/40"> +{extraCount} more</span>
                      )}
                    </p>
                    <p className="text-white/40 text-sm mt-1">
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                      {' Â· '}
                      {order.items.reduce((sum, it) => sum + it.quantity, 0)} item
                      {order.items.reduce((sum, it) => sum + it.quantity, 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-white font-bold">{formatNPR(order.total)}</p>
                  <span
                    className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide ${cfg.bg} ${cfg.color}`}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end text-sm text-white/30 group-hover:text-white/60 transition">
                View details
                <ArrowRight className="h-3.5 w-3.5 ml-1 transition group-hover:translate-x-0.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
