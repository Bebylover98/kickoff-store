
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';

function formatNPR(amount: number) {
  return `NPR ${amount.toLocaleString('en-US')}`;
}

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });

  if (!order || order.customerId !== session.user.id) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-xl">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-cyan-400 font-medium">Order placed successfully</p>
        <h1 className="text-2xl font-bold text-white mt-1">Thank you, {order.contactName}!</h1>
        <p className="text-white/60 mt-2 text-sm">
          We will contact you at {order.contactPhone} to confirm delivery and collect payment.
        </p>

        <div className="mt-6 border-t border-white/10 pt-4">
          <p className="text-white/60 text-sm mb-2">Order status</p>
          <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-sm text-white uppercase">
            {order.status}
          </span>
        </div>

        <div className="mt-6 border-t border-white/10 pt-4">
          <p className="text-white/60 text-sm mb-3">Items</p>
          <ul className="space-y-2">
            {order.items.map((it) => (
              <li key={it.id} className="flex justify-between text-white/80 text-sm">
                <span>{it.quantity} x {it.product.name}</span>
                <span>{formatNPR(it.unitPrice * it.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between mt-4 pt-4 border-t border-white/10 font-bold text-white">
            <span>Total</span>
            <span>{formatNPR(order.total)}</span>
          </div>
        </div>

        <div className="mt-6 border-t border-white/10 pt-4 text-sm text-white/60">
          <p>{order.addressLine1}{order.addressLine2 ? `, ${order.addressLine2}` : ''}</p>
          <p>{order.city}, {order.state}{order.postalCode ? ` ${order.postalCode}` : ''}, {order.country}</p>
          {order.notes && <p className="italic mt-1">Note: {order.notes}</p>}
        </div>

        <div className="mt-6 flex gap-3">
          <Link href="/orders" className="flex-1 text-center rounded-full border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/5 transition">
            View all orders
          </Link>
          <Link href="/shop" className="flex-1 text-center rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}