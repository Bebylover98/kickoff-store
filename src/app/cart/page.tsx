'use client';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';

function formatNPR(paisa: number) {
  return `NPR ${(paisa / 100).toLocaleString('en-US')}`;
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-white/60">Your cart is empty.</p>
        <Link href="/shop" className="mt-4 inline-block text-cyan-400 hover:underline">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">Your Cart</h1>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-4 border-b border-white/10 pb-4">
            <img src={item.imageUrl} alt={item.name} className="h-16 w-16 rounded object-cover" />
            <div className="flex-1">
              <p className="text-white">{item.name}</p>
              <p className="text-white/50 text-sm">{formatNPR(item.price)} each</p>
            </div>
            <input
              type="number"
              min={1}
              max={item.inStock}
              value={item.quantity}
              onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
              className="w-16 rounded bg-white/5 border border-white/10 px-2 py-1 text-white"
            />
            <button onClick={() => removeItem(item.productId)} className="text-white/40 hover:text-red-400">
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between">
        <span className="text-white/60">Subtotal</span>
        <span className="text-xl font-bold text-white">{formatNPR(subtotal)}</span>
      </div>
      <Link
        href="/checkout"
        className="mt-6 block text-center rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 px-6 py-3 font-medium text-white hover:opacity-90 transition"
      >
        Proceed to Checkout
      </Link>
    </div>
  );
}