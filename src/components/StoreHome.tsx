'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Heart, Minus, Plus, Truck, Shield,
  Award, RefreshCw, ArrowRight, Sparkles, Eye, Share2, X,
} from 'lucide-react';
import StoreNav from './StoreNav';
import { useCart } from '@/lib/cart-context';

type Product = {
  id: string;
  name: string;
  slug: string;
  sport: string;
  brand: string;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string;
  featured: boolean;
  inStock: number;
};
function formatNPR(amount: number) {
  return `NPR ${amount.toLocaleString('en-US')}`;
}

const sportLabels: Record<string, string> = {
  FOOTBALL: 'Football',
  CRICKET: 'Cricket',
  BASKETBALL: 'Basketball',
};

export default function StoreHome({ products }: { products: Product[] }) {
  const {
    items: cart,
    addItem,
    removeItem,
    updateQuantity: updateCartQuantity,
    itemCount: totalItems,
    subtotal: totalPrice,
  } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedSport, setSelectedSport] = useState('All');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<{ x: number; y: number }[]>([]);
  const [isDesktop, setIsDesktop] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.sport)))];

  useEffect(() => {
    // Only enable heavy decorative effects (particles, mouse-follow glow)
    // on devices with a fine pointer and enough width - i.e. real desktops.
    // This is the single biggest fix for mobile lag: on phones, none of
    // this JS-driven animation work runs at all.
    const desktopQuery = window.matchMedia('(pointer: fine) and (min-width: 1024px)');
    setIsDesktop(desktopQuery.matches);

    if (!desktopQuery.matches) return;

    setParticles(
      Array.from({ length: 12 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
      }))
    );

    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const addToCart = (product: Product) => {
    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        imageUrl: product.imageUrl,
        inStock: product.inStock,
      },
      1
    );
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    removeItem(productId);
  };

  const updateQuantity = (productId: string, delta: number) => {
    const current = cart.find((item) => item.productId === productId);
    if (!current) return;
    updateCartQuantity(productId, current.quantity + delta);
  };

  const filteredProducts = selectedSport === 'All' ? products : products.filter((p) => p.sport === selectedSport);
  const heroProducts = products.slice(0, 4);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#09090B] text-white font-sans antialiased overflow-x-hidden">
      <div className="fixed inset-0 -z-10">
        {/* Static gradient blobs on mobile (no JS animation cost), animated only on desktop */}
        <div className="absolute top-[-30%] left-[-10%] h-[70%] w-[60%] rounded-full bg-gradient-to-r from-purple-600/20 via-blue-500/15 to-cyan-400/20 blur-[80px] md:blur-[120px]">
          {isDesktop && (
            <motion.div
              className="h-full w-full"
              animate={{ x: [0, 30, -20, 0], y: [0, -20, 30, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </div>
        <div className="absolute bottom-[-20%] right-[-10%] h-[60%] w-[50%] rounded-full bg-gradient-to-l from-blue-600/20 via-violet-500/15 to-purple-400/20 blur-[80px] md:blur-[120px]">
          {isDesktop && (
            <motion.div
              className="h-full w-full"
              animate={{ x: [0, -30, 20, 0], y: [0, 30, -20, 0] }}
              transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </div>

        {isDesktop && (
          <>
            <motion.div
              className="absolute top-1/2 left-1/2 h-[50%] w-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[100px]"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            />
            {particles.map((p, i) => (
              <motion.div
                key={i}
                className="absolute h-1 w-1 rounded-full bg-white/15"
                initial={{ x: p.x, y: p.y }}
                animate={{
                  x: [null, Math.random() * window.innerWidth],
                  y: [null, Math.random() * window.innerHeight],
                }}
                transition={{ duration: 20 + Math.random() * 30, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
          </>
        )}
      </div>

      {isDesktop && (
        <motion.div
          className="pointer-events-none fixed h-[500px] w-[500px] rounded-full bg-gradient-to-r from-purple-500/8 via-blue-500/8 to-cyan-400/8 blur-[80px]"
          animate={{ x: mousePosition.x - 250, y: mousePosition.y - 250 }}
          transition={{ type: 'tween', ease: 'easeOut', duration: 0.6 }}
        />
      )}

      <StoreNav />

      <section className="relative overflow-hidden border-b border-white/5">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-sm font-medium text-white/70 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span>New Season Collection</span>
              </div>
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                Gear Up for{' '}
                <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">Victory</span>
              </h1>
              <p className="max-w-md text-lg text-white/50">Premium jerseys, training gear, and accessories for champions. Elevate your game with Kickoff Store.</p>
              <div className="flex flex-wrap gap-4">
                <Link href="/shop" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 px-6 py-3 font-semibold shadow-lg shadow-purple-500/25">
                  Shop Now <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/shop" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold backdrop-blur-sm">
                  <Eye className="h-4 w-4" /> Explore
                </Link>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.8, type: 'spring' }} className="relative flex items-center justify-center">
              <div className="relative grid grid-cols-2 gap-4">
                {heroProducts.map((product, i) => (
                  <Link key={product.id} href={`/products/${product.slug}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      whileHover={{ y: -8, scale: 1.02 }}
                      className="flex flex-col items-center rounded-2xl bg-white/5 p-4 backdrop-blur-sm border border-white/10 cursor-pointer"
                    >
                      <div className="relative h-24 w-24 mb-2">
                        <Image src={product.imageUrl} alt={product.name} fill sizes="96px" className="rounded-xl object-cover" />
                      </div>
                      <p className="text-sm font-medium text-center">{product.name}</p>
                      <p className="text-sm text-cyan-400">{formatNPR(product.price)}</p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Premium Collection</h2>
            <p className="text-sm text-white/40">Curated for performance and style</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedSport(cat)}
                className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                  selectedSport === cat
                    ? 'bg-gradient-to-r from-purple-500 to-cyan-400 text-white'
                    : 'border border-white/10 bg-white/5 text-white/50 hover:text-white'
                }`}
              >
                {cat === 'All' ? 'All' : sportLabels[cat] ?? cat}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <p className="text-white/40">No products yet â€” add some from /admin/products.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index, 8) * 0.05 }}
                whileHover={{ y: -8 }}
                className="group relative rounded-2xl bg-white/5 p-4 backdrop-blur-sm border border-white/5 hover:border-white/20 transition-all"
              >
                {product.featured && (
                  <span className="absolute left-4 top-4 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 px-3 py-1 text-xs font-semibold z-10">
                    Featured
                  </span>
                )}
                <button className="absolute right-4 top-4 rounded-full bg-black/30 p-2 text-white/40 backdrop-blur-sm transition hover:bg-white/10 hover:text-white z-10">
                  <Heart className="h-4 w-4" />
                </button>
                <Link href={`/products/${product.slug}`}>
                  <div className="relative h-48 overflow-hidden rounded-xl">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </Link>
                <div className="mt-4 space-y-2">
                  <p className="text-xs uppercase tracking-wide text-white/30">{sportLabels[product.sport] ?? product.sport} Â· {product.brand}</p>
                  <h3 className="font-semibold">{product.name}</h3>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xl font-bold text-cyan-400">{formatNPR(product.price)}</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => addToCart(product)}
                      disabled={product.inStock <= 0}
                      className="rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 px-4 py-2 text-sm font-semibold shadow-lg shadow-purple-500/20 transition hover:shadow-purple-500/40 disabled:opacity-40"
                    >
                      {product.inStock > 0 ? 'Add to Cart' : 'Out of stock'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-white/5 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Truck, label: 'Free Shipping', desc: 'On orders over NPR 5,000' },
              { icon: Shield, label: 'Secure Payment', desc: '100% protected' },
              { icon: RefreshCw, label: 'Easy Returns', desc: '30-day guarantee' },
              { icon: Award, label: 'Premium Quality', desc: 'Authentic products' },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4 rounded-2xl bg-white/5 p-4 backdrop-blur-sm border border-white/5">
                <div className="rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-400/20 p-3">
                  <feature.icon className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <p className="font-semibold">{feature.label}</p>
                  <p className="text-sm text-white/40">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">KICKOFF</h3>
              <p className="mt-2 text-sm text-white/40">Premium sports gear for champions.</p>
              <div className="mt-4 flex gap-3">
                <a href="https://wa.me/9779706769170" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="rounded-full bg-white/5 p-2 text-white/40 hover:bg-white/10 hover:text-white transition">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.004 2C6.486 2 2 6.486 2 12.004c0 1.891.52 3.66 1.426 5.174L2 22l4.94-1.395a9.94 9.94 0 0 0 5.064 1.383h.005c5.516 0 10.001-4.487 10.001-10.006C22.01 6.486 17.524 2 12.004 2zm0 18.19h-.004a8.19 8.19 0 0 1-4.174-1.148l-.3-.178-3.098.874.826-3.02-.195-.31a8.176 8.176 0 0 1-1.257-4.404c0-4.523 3.68-8.203 8.206-8.203 2.192 0 4.252.854 5.802 2.404a8.15 8.15 0 0 1 2.401 5.803c0 4.524-3.68 8.182-8.207 8.182z"/></svg>
                </a>
                <a href="https://www.instagram.com/kickoff45store?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="rounded-full bg-white/5 p-2 text-white/40 hover:bg-white/10 hover:text-white transition">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="https://www.facebook.com/share/1BEXAQ7cdz/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="rounded-full bg-white/5 p-2 text-white/40 hover:bg-white/10 hover:text-white transition">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.02 3.657 9.184 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.91h-2.33V22c4.78-.756 8.437-4.92 8.437-9.94z"/></svg>
                </a>
                <a href="https://www.tiktok.com/@kickoff45store?_r=1&_t=ZS-98k2be8JqKu" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="rounded-full bg-white/5 p-2 text-white/40 hover:bg-white/10 hover:text-white transition">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold">Shop</h4>
              <ul className="mt-3 space-y-2 text-sm text-white/40">
                <li><Link href="/shop" className="hover:text-white transition">All Products</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Support</h4>
              <ul className="mt-3 space-y-2 text-sm text-white/40">
                <li><Link href="https://wa.me/9779706769170" className="hover:text-white transition">Contact:9706769170</Link></li>
                <li><Link href="/returns" className="hover:text-white transition">Returns</Link></li>
                <li><Link href="/terms" className="hover:text-white transition">Terms</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition">Privacy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Newsletter</h4>
              <p className="mt-2 text-sm text-white/40">Get updates on new drops.</p>
              <div className="mt-3 flex">
                <input type="email" placeholder="Enter email" className="flex-1 rounded-l-xl border border-white/10 bg-white/5 px-4 py-2 text-sm placeholder:text-white/30 focus:border-cyan-400/50 focus:outline-none" />
                <button className="rounded-r-xl bg-gradient-to-r from-purple-500 to-cyan-400 px-4 py-2 text-sm font-semibold">Subscribe</button>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-white/5 pt-8 text-center text-sm text-white/30">
            <p>Â© 2025 Kickoff Store. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {isCartOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}>
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 20 }} className="absolute right-0 top-0 h-full w-full max-w-md bg-[#09090B] border-l border-white/10 p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" /> Cart ({totalItems})
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="rounded-full p-2 hover:bg-white/5">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {cart.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center text-white/40">
                  <ShoppingBag className="h-12 w-12 mb-4 opacity-30" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="flex-1 space-y-3 overflow-y-auto max-h-[60vh]">
                    {cart.map((item) => (
                      <div key={`${item.productId}-${item.size ?? ""}-${item.fitType ?? ""}`} className="flex items-center gap-4 rounded-xl bg-white/5 p-3">
                        <div className="relative h-12 w-12 shrink-0">
                          <Image src={item.imageUrl} alt={item.name} fill sizes="48px" className="rounded-lg object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-cyan-400">{formatNPR(item.price)}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <button onClick={() => updateQuantity(item.productId, -1)} className="rounded-full bg-white/10 p-1 hover:bg-white/20">
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-sm">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.productId, 1)} className="rounded-full bg-white/10 p-1 hover:bg-white/20">
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(item.productId)} className="text-white/30 hover:text-red-400 transition">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 border-t border-white/10 pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-cyan-400">{formatNPR(totalPrice)}</span>
                    </div>
                    <Link href="/checkout" className="mt-4 block w-full text-center rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 py-3 font-semibold shadow-lg shadow-purple-500/25">
                      Checkout <ArrowRight className="inline h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}