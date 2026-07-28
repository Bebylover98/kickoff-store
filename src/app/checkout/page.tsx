'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';

function formatNPR(amount: number) {
  return `NPR ${amount.toLocaleString('en-US')}`;
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({
    contactName: '',
    contactPhone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Nepal',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
  productId: i.productId,
  quantity: i.quantity,
  size: i.size,
  fitType: i.fitType,
  partnerSize: i.partnerSize,
})),
          ...form,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.');
        return;
      }
      setOrderPlaced(true);
      clearCart();
      router.push(`/orders/${data.id}`);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (status === 'loading') {
    return <div className="container mx-auto px-4 py-20 text-center text-white/60">Loading...</div>;
  }

  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-sm text-center">
        <h1 className="text-xl font-bold text-white mb-2">Please sign in to check out</h1>
        <p className="text-white/60 text-sm mb-6">You need an account to place an order so we can contact you about delivery.</p>
        <div className="flex flex-col gap-3">
          <Link href="/login?callbackUrl=/checkout" className="rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 px-6 py-3 font-medium text-white hover:opacity-90 transition">
            Log In
          </Link>
          <Link href="/register?callbackUrl=/checkout" className="rounded-full border border-white/10 px-6 py-3 font-medium text-white/80 hover:bg-white/5 transition">
            Sign Up
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !orderPlaced) {
    return <div className="container mx-auto px-4 py-20 text-center text-white/60">Your cart is empty.</div>;
  }

  if (orderPlaced) {
    return <div className="container mx-auto px-4 py-20 text-center text-white/60">Placing your order...</div>;
  }
  return (
    <div className="container mx-auto px-4 py-10 max-w-xl">
      <h1 className="text-2xl font-bold text-white mb-6">Checkout</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required placeholder="Full name" value={form.contactName}
          onChange={(e) => update('contactName', e.target.value)}
          className="w-full rounded bg-white/5 border border-white/10 px-4 py-2 text-white" />
        <input required placeholder="Phone number" value={form.contactPhone}
          onChange={(e) => update('contactPhone', e.target.value)}
          className="w-full rounded bg-white/5 border border-white/10 px-4 py-2 text-white" />
        <input required placeholder="Address line 1" value={form.addressLine1}
          onChange={(e) => update('addressLine1', e.target.value)}
          className="w-full rounded bg-white/5 border border-white/10 px-4 py-2 text-white" />
        <input placeholder="Address line 2 (optional)" value={form.addressLine2}
          onChange={(e) => update('addressLine2', e.target.value)}
          className="w-full rounded bg-white/5 border border-white/10 px-4 py-2 text-white" />
        <div className="grid grid-cols-2 gap-4">
          <input required placeholder="City" value={form.city}
            onChange={(e) => update('city', e.target.value)}
            className="rounded bg-white/5 border border-white/10 px-4 py-2 text-white" />
          <input required placeholder="State/Province" value={form.state}
            onChange={(e) => update('state', e.target.value)}
            className="rounded bg-white/5 border border-white/10 px-4 py-2 text-white" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input placeholder="Postal code (optional)" value={form.postalCode}
            onChange={(e) => update('postalCode', e.target.value)}
            className="rounded bg-white/5 border border-white/10 px-4 py-2 text-white" />
          <input required placeholder="Country" value={form.country}
            onChange={(e) => update('country', e.target.value)}
            className="rounded bg-white/5 border border-white/10 px-4 py-2 text-white" />
        </div>
        <textarea placeholder="Delivery notes (optional)" value={form.notes}
          onChange={(e) => update('notes', e.target.value)}
          className="w-full rounded bg-white/5 border border-white/10 px-4 py-2 text-white" />

        <div className="flex items-center justify-between pt-2">
          <span className="text-white/60">Total</span>
          <span className="text-xl font-bold text-white">{formatNPR(subtotal)}</span>
        </div>
        <p className="text-white/40 text-sm">Payment is collected by cash or local payment method on delivery/pickup - no online payment needed.</p>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button disabled={submitting} type="submit"
          className="w-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 px-6 py-3 font-medium text-white hover:opacity-90 transition disabled:opacity-50">
          {submitting ? 'Placing order...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
}
