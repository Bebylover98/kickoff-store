import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

async function createAddress(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user?.email) {
    redirect('/login');
  }

  const customer = await prisma.customer.findUnique({ where: { email: session.user.email ?? '' } });
  if (!customer) {
    redirect('/login');
  }

  await prisma.address.create({
    data: {
      customerId: customer.id,
      label: String(formData.get('label') ?? 'Home'),
      fullName: String(formData.get('fullName') ?? ''),
      line1: String(formData.get('line1') ?? ''),
      line2: String(formData.get('line2') ?? ''),
      city: String(formData.get('city') ?? ''),
      state: String(formData.get('state') ?? ''),
      postalCode: String(formData.get('postalCode') ?? ''),
      country: String(formData.get('country') ?? ''),
      isDefault: formData.get('isDefault') === 'on',
    },
  });

  redirect('/account');
}

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const customer = await prisma.customer.findUnique({
    where: { email: session.user.email ?? '' },
    include: {
      addresses: { orderBy: { createdAt: 'desc' } },
      orders: {
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { product: true } } },
      },
    },
  });

  if (!customer) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-amber-400">Customer account</p>
            <h1 className="mt-2 text-3xl font-semibold">{customer.name ?? customer.email}</h1>
            <p className="mt-2 text-sm text-slate-400">Your order history and saved addresses are ready here.</p>
          </div>
          <Link href="/" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">Back to shop</Link>
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Saved addresses</h2>
            <span className="text-sm text-slate-400">{customer.addresses.length} saved</span>
          </div>

          <form action={createAddress} className="mt-6 grid gap-4 rounded-2xl border border-white/10 bg-slate-950/50 p-5 md:grid-cols-2">
            <input name="label" placeholder="Label" className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3" />
            <input name="fullName" required placeholder="Full name" className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3" />
            <input name="line1" required placeholder="Address line 1" className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 md:col-span-2" />
            <input name="line2" placeholder="Address line 2" className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 md:col-span-2" />
            <input name="city" required placeholder="City" className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3" />
            <input name="state" required placeholder="State" className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3" />
            <input name="postalCode" required placeholder="Postal code" className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3" />
            <input name="country" required placeholder="Country" className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3" />
            <label className="flex items-center gap-3 text-sm text-slate-300 md:col-span-2">
              <input name="isDefault" type="checkbox" className="h-4 w-4" />
              Set as default address
            </label>
            <button className="rounded-xl bg-amber-500 px-4 py-3 font-semibold text-slate-950 md:col-span-2">Save address</button>
          </form>

          {customer.addresses.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No addresses saved yet. Guest checkout remains available for anyone who prefers not to create an account.</p>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {customer.addresses.map((address) => (
                <div key={address.id} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                  <p className="font-medium">{address.label}</p>
                  <p className="mt-2 text-sm text-slate-400">{address.fullName}</p>
                  <p className="text-sm text-slate-400">{address.line1}</p>
                  {address.line2 ? <p className="text-sm text-slate-400">{address.line2}</p> : null}
                  <p className="text-sm text-slate-400">{address.city}, {address.state} {address.postalCode}</p>
                  <p className="text-sm text-slate-400">{address.country}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
          <h2 className="text-xl font-semibold">Order history</h2>
          {customer.orders.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No orders yet. Check out a jersey to see your history here.</p>
          ) : (
            <div className="mt-6 space-y-4">
              {customer.orders.map((order) => (
                <div key={order.id} className="rounded-2xl border border-white/10 bg-slate-950/50 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{order.status}</p>
                      <p className="mt-2 font-medium">Order {order.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                      <p className="mt-2 font-semibold">${(order.total / 100).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                        <span>{item.product.name}</span>
                        <span className="text-slate-400">Qty {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
