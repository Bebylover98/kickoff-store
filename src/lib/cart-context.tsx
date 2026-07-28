'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

export type CartItem = {
  productId: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  quantity: number;
  inStock: number;
  size?: string;
  fitType?: string;
  partnerSize?: string;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  removeItem: (productId: string, size?: string, fitType?: string) => void;
  updateQuantity: (productId: string, qty: number, size?: string, fitType?: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function sameLine(a: CartItem, productId: string, size?: string, fitType?: string) {
  return a.productId === productId && a.size === size && a.fitType === fitType;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const userId = session?.user?.id ?? 'guest';
  const storageKey = `kickoff-cart-${userId}`;

  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    setLoaded(false);
    try {
      const raw = localStorage.getItem(storageKey);
      setItems(raw ? JSON.parse(raw) : []);
    } catch {
      setItems([]);
    }
    setLoaded(true);
  }, [storageKey, status]);

  useEffect(() => {
    if (loaded) localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, loaded, storageKey]);

  function addItem(item: Omit<CartItem, 'quantity'>, qty = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => sameLine(i, item.productId, item.size, item.fitType));
      if (existing) {
        return prev.map((i) =>
          sameLine(i, item.productId, item.size, item.fitType)
            ? { ...i, quantity: Math.min(i.quantity + qty, i.inStock) }
            : i
        );
      }
      return [...prev, { ...item, quantity: Math.min(qty, item.inStock) }];
    });
  }

  function removeItem(productId: string, size?: string, fitType?: string) {
    setItems((prev) => prev.filter((i) => !sameLine(i, productId, size, fitType)));
  }

  function updateQuantity(productId: string, qty: number, size?: string, fitType?: string) {
    if (qty <= 0) return removeItem(productId, size, fitType);
    setItems((prev) =>
      prev.map((i) =>
        sameLine(i, productId, size, fitType) ? { ...i, quantity: Math.min(qty, i.inStock) } : i
      )
    );
  }

  function clearCart() {
    setItems([]);
  }

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}