'use client';
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

export default function BuyNowButton({ productId, name, slug, price, imageUrl, inStock }: Props) {
  const { addItem } = useCart();
  const router = useRouter();

  if (inStock <= 0) return null;

  function handleBuyNow() {
    addItem(
      {
        productId,
        name,
        slug,
        price,
        imageUrl,
        inStock,
        fitType: 'MALE',
        size: 'M',
      },
      1
    );
    router.push('/checkout');
  }

  return (
    <button
      onClick={handleBuyNow}
      className="rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition"
    >
      Buy Now
    </button>
  );
}