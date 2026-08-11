import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

async function createCoupon(formData: FormData) {
  'use server';
  const code = String(formData.get('code') ?? '').trim().toUpperCase();
  const discountType = String(formData.get('discountType') ?? 'PERCENT');
  const discountValue = Number(formData.get('discountValue') ?? 0);
  const minOrderAmount = Number(formData.get('minOrderAmount') ?? 0);
  const usageLimitRaw = String(formData.get('usageLimit') ?? '');
  const usageLimit = usageLimitRaw ? Number(usageLimitRaw) : null;
  const expiresAtRaw = String(formData.get('expiresAt') ?? '');
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null;

  if (!code || !discountValue) return;

  await prisma.coupon.create({
    data: { code, discountType, discountValue, minOrderAmount, usageLimit, expiresAt },
  });
  revalidatePath('/admin/coupons');
}

async function toggleCoupon(formData: FormData) {
  'use server';
  const id = String(formData.get('id') ?? '');
  const active = String(formData.get('active') ?? '') === 'true';
  await prisma.coupon.update({ where: { id }, data: { active: !active } });
  revalidatePath('/admin/coupons');
}

async function deleteCoupon(formData: FormData) {
  'use server';
  const id = String(formData.get('id') ?? '');
  await prisma.coupon.delete({ where: { id } });
  revalidatePath('/admin/coupons');
}

export const dynamic = 'force-dynamic';

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-amber-400">Admin Console</p>
            <h1 className="mt-2 text-3xl font-semibold">Discount Codes</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="/admin" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">Dashboard</a>
            <a href="/admin/products" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">Products</a>
            <a href="/admin/orders" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">Orders</a>
          </div>
        </div>

        <form action={createCoupon} className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur space-y-4">
          <h2 className="text-lg font-semibold">Create new coupon</h2>
          <div className="grid grid-cols-2 gap-4">
            <input required name="code" placeholder="Code (e.g. WELCOME10)" className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm uppercase" />
            <select name="discountType" className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm">
              <option value="PERCENT">Percent (%)</option>
              <option value="FIXED">Fixed amount (NPR)</option>
            </select>
            <input required name="discountValue" type="number" placeholder="Discount value" className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm" />
            <input name="minOrderAmount" type="number" placeholder="Min order amount (optional)" className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm" />
            <input name="usageLimit" type="number" placeholder="Usage limit (optional)" className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm" />
            <input name="expiresAt" type="date" className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm" />
          </div>
          <button className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition">Create Coupon</button>
        </form>

        <div className="flex flex-col gap-3">
          {coupons.length === 0 && <p className="text-slate-400">No coupons yet.</p>}
          {coupons.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div>
                <p className="font-semibold">{c.code} — {c.discountType === 'PERCENT' ? `${c.discountValue}%` : `NPR ${c.discountValue}`} off</p>
                <p className="text-xs text-slate-400">
                  {c.usedCount} used{c.usageLimit ? ` / ${c.usageLimit}` : ''} · {c.active ? 'Active' : 'Disabled'}
                  {c.expiresAt ? ` · Expires ${new Date(c.expiresAt).toLocaleDateString()}` : ''}
                  {c.minOrderAmount ? ` · Min order NPR ${c.minOrderAmount}` : ''}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <form action={toggleCoupon}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="active" value={String(c.active)} />
                  <button className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10 transition">
                    {c.active ? 'Disable' : 'Enable'}
                  </button>
                </form>
                <form action={deleteCoupon}>
                  <input type="hidden" name="id" value={c.id} />
                  <button className="rounded-full border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
