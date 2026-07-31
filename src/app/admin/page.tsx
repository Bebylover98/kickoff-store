import { prisma } from '@/lib/prisma';

function formatNPR(amount: number) {
  return `NPR ${amount.toLocaleString('en-US')}`;
}

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [orders, products, coupons] = await Promise.all([
    prisma.order.findMany({ include: { items: { include: { product: true } } }, orderBy: { createdAt: 'desc' } }),
    prisma.product.findMany(),
    prisma.coupon.findMany(),
  ]);

  const totalSales = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.total, 0);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'PENDING').length;

  const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
  for (const order of orders) {
    if (order.status === 'CANCELLED') continue;
    for (const item of order.items) {
      const key = item.productId;
      if (!productSales[key]) {
        productSales[key] = { name: item.product.name, qty: 0, revenue: 0 };
      }
      productSales[key].qty += item.quantity;
      productSales[key].revenue += item.unitPrice * item.quantity;
    }
  }
  const topProducts = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 5);

  const recentOrders = orders.slice(0, 5);
  const activeCoupons = coupons.filter((c) => c.active).length;
  const lowStock = products.filter((p) => p.isActive && p.inStock <= 5);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-amber-400">Admin Console</p>
            <h1 className="mt-2 text-3xl font-semibold">Dashboard</h1>
          </div>
          <div className="flex gap-2">
            <a href="/admin/products" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">Products</a>
            <a href="/admin/orders" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">Orders</a>
            <a href="/admin/coupons" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">Coupons</a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
            <p className="text-xs uppercase tracking-wide text-slate-400">Total Sales</p>
            <p className="mt-1 text-2xl font-semibold">{formatNPR(totalSales)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
            <p className="text-xs uppercase tracking-wide text-slate-400">Total Orders</p>
            <p className="mt-1 text-2xl font-semibold">{totalOrders}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
            <p className="text-xs uppercase tracking-wide text-slate-400">Pending Orders</p>
            <p className="mt-1 text-2xl font-semibold text-amber-400">{pendingOrders}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
            <p className="text-xs uppercase tracking-wide text-slate-400">Active Coupons</p>
            <p className="mt-1 text-2xl font-semibold">{activeCoupons}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
            <h2 className="text-lg font-semibold mb-4">Top Products</h2>
            {topProducts.length === 0 && <p className="text-slate-400 text-sm">No sales yet.</p>}
            <div className="flex flex-col gap-3">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-slate-200">{p.name}</span>
                  <span className="text-slate-400">{p.qty} sold · {formatNPR(p.revenue)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
            {recentOrders.length === 0 && <p className="text-slate-400 text-sm">No orders yet.</p>}
            <div className="flex flex-col gap-3">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-200">{o.contactName}</span>
                  <span className="text-slate-400">{formatNPR(o.total)} · {o.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {lowStock.length > 0 && (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6">
            <h2 className="text-lg font-semibold mb-4 text-red-400">Low Stock Alert</h2>
            <div className="flex flex-col gap-2">
              {lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-200">{p.name}</span>
                  <span className="text-red-400">{p.inStock} left</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
