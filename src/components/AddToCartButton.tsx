'use client';
import { useState } from 'react';
import { useCart } from '@/lib/cart-context';

type Props = {
  productId: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  inStock: number;
};

export default function AddToCartButton({ productId, name, slug, price, imageUrl, inStock }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  if (inStock <= 0) {
    return (
      <button disabled className="rounded-full bg-white/10 px-6 py-3 text-white/40 cursor-not-allowed">
        Out of stock
      </button>
    );
  }

  return (
    <button
      onClick={() => {
        addItem({ productId, name, slug, price, imageUrl, inStock }, 1);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
      className="rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 px-6 py-3 font-medium text-white hover:opacity-90 transition"
    >
      {added ? 'Added ✓' : 'Add to Cart'}
    </button>
  );
}