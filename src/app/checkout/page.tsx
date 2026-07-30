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
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ESEWA' | 'KHALTI'>('COD');
  const [paymentNotice, setPaymentNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);

  const total = appliedCoupon ? Math.max(subtotal - appliedCoupon.discountAmount, 0) : subtotal;

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function selectPayment(method: 'COD' | 'ESEWA' | 'KHALTI') {
    setPaymentMethod(method);
    if (method === 'ESEWA' || method === 'KHALTI') {
      setPaymentNotice('This payment system will be available after a few days. Please use Cash on Delivery for now.');
    } else {
      setPaymentNotice('');
    }
  }

  async function applyCoupon() {
    setCouponError('');
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput, subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error ?? 'Invalid coupon.');
        setAppliedCoupon(null);
        return;
      }
      setAppliedCoupon({ code: data.code, discountAmount: data.discountAmount });
    } catch {
      setCouponError('Something went wrong. Please try again.');
    } finally {
      setApplyingCoupon(false);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (items.length === 0) return;
    if (paymentMethod !== 'COD') {
      setPaymentNotice('This payment system will be available after a few days. Please use Cash on Delivery for now.');
      return;
    }
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
          couponCode: appliedCoupon?.code ?? null,
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
        <div className="grid grid-cols-2 gap-4">
          <input required placeholder="City" value={form.city}
            onChange={(e) => update('city', e.target.value)}
            className="rounded bg-white/5 border border-white/10 px-4 py-2 text-white" />
          <input required placeholder="State/Province" value={form.state}
            onChange={(e) => update('state', e.target.value)}
            className="rounded bg-white/5 border border-white/10 px-4 py-2 text-white" />
        </div>
        <input required placeholder="Country" value={form.country}
          onChange={(e) => update('country', e.target.value)}
          className="w-full rounded bg-white/5 border border-white/10 px-4 py-2 text-white" />
        <textarea placeholder="Delivery notes (optional)" value={form.notes}
          onChange={(e) => update('notes', e.target.value)}
          className="w-full rounded bg-white/5 border border-white/10 px-4 py-2 text-white" />

        <div>
          <p className="text-white/60 text-sm mb-2">Payment method</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => selectPayment('COD')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                paymentMethod === 'COD'
                  ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white'
                  : 'border border-white/10 bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              Cash on Delivery
            </button>
            <button
              type="button"
              onClick={() => selectPayment('ESEWA')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                paymentMethod === 'ESEWA'
                  ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white'
                  : 'border border-white/10 bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              eSewa
            </button>
            <button
              type="button"
              onClick={() => selectPayment('KHALTI')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                paymentMethod === 'KHALTI'
                  ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white'
                  : 'border border-white/10 bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              Khalti
            </button>
          </div>
          {paymentNotice && (
            <p className="mt-2 text-sm text-amber-400">{paymentNotice}</p>
          )}
        </div>

        <div>
          <p className="text-white/60 text-sm mb-2">Discount code</p>
          {appliedCoupon ? (
            <div className="flex items-center justify-between rounded bg-white/5 border border-cyan-400/30 px-4 py-2">
              <span className="text-cyan-400 text-sm font-medium">{appliedCoupon.code} applied — -{formatNPR(appliedCoupon.discountAmount)}</span>
              <button type="button" onClick={removeCoupon} className="text-white/40 hover:text-red-400 text-sm">Remove</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                placeholder="Enter code"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="flex-1 rounded bg-white/5 border border-white/10 px-4 py-2 text-white uppercase"
              />
              <button
                type="button"
                onClick={applyCoupon}
                disabled={applyingCoupon}
                className="rounded bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition disabled:opacity-50"
              >
                {applyingCoupon ? 'Checking...' : 'Apply'}
              </button>
            </div>
          )}
          {couponError && <p className="mt-1 text-sm text-red-400">{couponError}</p>}
        </div>

        <div className="space-y-1 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-white/60">Subtotal</span>
            <span className="text-white">{formatNPR(subtotal)}</span>
          </div>
          {appliedCoupon && (
            <div className="flex items-center justify-between">
              <span className="text-white/60">Discount</span>
              <span className="text-cyan-400">-{formatNPR(appliedCoupon.discountAmount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-white/60 font-medium">Total</span>
            <span className="text-xl font-bold text-white">{formatNPR(total)}</span>
          </div>
        </div>
        <p className="text-white/40 text-sm">Payment is collected by cash or local payment method on delivery/pickup - no online payment needed.</p>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button disabled={submitting || paymentMethod !== 'COD'} type="submit"
          className="w-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 px-6 py-3 font-medium text-white hover:opacity-90 transition disabled:opacity-50">
          {submitting ? 'Placing order...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
}
