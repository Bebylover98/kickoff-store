'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/lib/cart-context';

export default function StoreNav() {
  const { data: session, status } = useSession();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#09090B]/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              KICKOFF
            </span>
            <span className="text-xs font-medium text-white/40">STORE</span>
          </Link>

          <div className="hidden md:flex items-center gap-4 text-sm">
            <Link href="/shop" className="text-white/60 hover:text-white transition">Shop</Link>
            <Link href="/account" className="text-white/60 hover:text-white transition">Account</Link>
            <Link href="/orders" className="text-white/60 hover:text-white transition">Orders</Link>
            {session?.user?.role === 'admin' && (
              <Link href="/admin/products" className="text-white/60 hover:text-white transition">Admin</Link>
            )}
            {session?.user?.role !== 'admin' && (
              <Link href="/cart" className="relative text-white/60 hover:text-white transition">
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-white">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}
            {status === 'loading' ? null : session?.user ? (
              <div className="flex items-center gap-3">
                <Link
                  href={session.user.role === 'admin' ? '/admin/products' : '/account'}
                  className="text-white/80 hover:text-white transition"
                >
                  Hi, {session.user.name?.split(' ')[0] ?? session.user.email}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 hover:bg-white/10 transition"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link href="/login" className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 hover:bg-white/10 transition">
                Sign in
              </Link>
            )}
          </div>

          <button
            className="md:hidden text-white/80 p-2"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden flex flex-col gap-3 pb-4 text-sm">
            <Link href="/shop" onClick={() => setMenuOpen(false)} className="text-white/60 hover:text-white transition">Shop</Link>
            <Link href="/account" onClick={() => setMenuOpen(false)} className="text-white/60 hover:text-white transition">Account</Link>
            <Link href="/orders" onClick={() => setMenuOpen(false)} className="text-white/60 hover:text-white transition">Orders</Link>
            {session?.user?.role === 'admin' && (
              <Link href="/admin/products" onClick={() => setMenuOpen(false)} className="text-white/60 hover:text-white transition">Admin</Link>
            )}
            {session?.user?.role !== 'admin' && (
              <Link href="/cart" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-white/60 hover:text-white transition">
                <ShoppingBag className="h-5 w-5" />
                <span>Cart{itemCount > 0 ? ' (' + itemCount + ')' : ''}</span>
              </Link>
            )}
            {status === 'loading' ? null : session?.user ? (
              <>
                <Link
                  href={session.user.role === 'admin' ? '/admin/products' : '/account'}
                  onClick={() => setMenuOpen(false)}
                  className="text-white/80 hover:text-white transition"
                >
                  Hi, {session.user.name?.split(' ')[0] ?? session.user.email}
                </Link>
                <button
                  onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }); }}
                  className="w-fit rounded-full border border-white/10 bg-white/5 px-4 py-1.5 hover:bg-white/10 transition"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} className="w-fit rounded-full border border-white/10 bg-white/5 px-4 py-1.5 hover:bg-white/10 transition">
                Sign in
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}