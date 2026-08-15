import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { optimizedImageUrl } from '@/lib/image-url';

function formatNPR(amount: number) {
  return `NPR ${amount.toLocaleString('en-US')}`;
}

async function updateOrderStatus(formData: FormData) {
  'use server';
  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? '');
  const allowed = ['PENDING', 'PAID', 'SHIPPED', 'CANCELLED', 'COMPLETED'];
  if (!allowed.includes(status)) return;
  await prisma.order.update({ where: { id }, data: { status: status as 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED' | 'COMPLETED' } });
  revalidatePath('/admin/orders');
}

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    where: { status: { not: 'COMPLETED' } },
    include: { items: { include: { product: true } }, customer: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-amber-400">Admin Console</p>
            <h1 className="mt-2 text-3xl font-semibold">Orders</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="/admin" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">Dashboard</a>
            <a href="/admin/products" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">Manage products</a>
            <a href="/admin/coupons" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">Coupons</a>
          </div>
        </div>

        {orders.length === 0 && <p className="text-slate-400">No orders yet.</p>}

        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-400">
                <span>{order.createdAt.toLocaleString()}</span>
                <span className="text-lg font-semibold text-white">{formatNPR(order.total)}</span>
              </div>
              <div className="mt-3 text-sm text-slate-200">
                <p><strong>{order.contactName}</strong> â€” {order.contactPhone}</p>
                <p>{order.addressLine1}{order.addressLine2 ? `, ${order.addressLine2}` : 
''
}</p>
                <p>{order.city}, {order.state}{order.postalCode ? ` ${order.postalCode}` : 
''
}, {order.country}</p>
                {order.notes && <p className="italic text-slate-400">Note: {order.notes}</p>}
                <p className="mt-1 text-slate-500">Account: {order.customer.email}</p>
              </div>
              <div className="mt-4 flex flex-col gap-3">
                {order.items.map((it) => (
                  <div key={it.id} className="flex items-center gap-3">
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-white/5">
                      <img
                        src={optimizedImageUrl(it.product.imageUrl, 96)}
                        alt={it.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="text-sm text-slate-300">{it.quantity} Ã— {it.product.name} ({formatNPR(it.unitPrice)} each)</p>
                  </div>
                ))}
              </div>
              <form action={updateOrderStatus} className="mt-4 flex items-center gap-3">
                <input type="hidden" name="id" value={order.id} />
                <select name="status" defaultValue={order.status} className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm">
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="COMPLETED">Completed</option>
                </select>
                <button className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition">Update</button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}