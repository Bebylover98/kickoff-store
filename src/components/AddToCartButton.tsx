'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
type Props = {
  productId: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  inStock: number;
};
const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
export default function AddToCartButton({ productId, name, slug, price, imageUrl, inStock }: Props) {
  const { addItem } = useCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const [fitType, setFitType] = useState<'MALE' | 'FEMALE' | 'COUPLE'>('MALE');
  const [size, setSize] = useState('M');
  const [partnerSize, setPartnerSize] = useState('M');
  if (inStock <= 0) {
    return (
      <button disabled className="rounded-full bg-white/10 px-6 py-3 text-white/40 cursor-not-allowed">
        Out of stock
      </button>
    );
  }
  const finalPrice = fitType === 'COUPLE' ? price * 2 : price;
  function handleAdd() {
    addItem(
      {
        productId,
        name,
        slug,
        price: finalPrice,
        imageUrl,
        inStock,
        fitType,
        size,
        partnerSize: fitType === 'COUPLE' ? partnerSize : undefined,
      },
      1
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        {(['MALE', 'FEMALE', 'COUPLE'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFitType(option)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              fitType === option
                ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white'
                : 'border border-white/10 bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            {option === 'MALE' ? 'Male' : option === 'FEMALE' ? 'Female' : 'Couple (2 pcs)'}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex flex-col gap-1 text-sm text-white/60">
          <span>{fitType === 'COUPLE' ? 'His size' : 'Size'}</span>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
          >
            {SIZES.map((s) => (
              <option key={s} value={s} className="bg-[#09090B]">{s}</option>
            ))}
          </select>
        </label>
        {fitType === 'COUPLE' && (
          <label className="flex flex-col gap-1 text-sm text-white/60">
            <span>Her size</span>
            <select
              value={partnerSize}
              onChange={(e) => setPartnerSize(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
            >
              {SIZES.map((s) => (
                <option key={s} value={s} className="bg-[#09090B]">{s}</option>
              ))}
            </select>
          </label>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleAdd}
          className="w-fit rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 px-6 py-3 font-medium text-white hover:opacity-90 transition"
        >
          {added ? 'Added \u2713' : `Add to Cart${fitType === 'COUPLE' ? ' (2 pcs)' : ''}`}
        </button>
        <button
          onClick={() => {
            handleAdd();
            router.push('/checkout');
          }}
          className="w-fit rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-6 py-3 font-medium text-white hover:opacity-90 transition"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
