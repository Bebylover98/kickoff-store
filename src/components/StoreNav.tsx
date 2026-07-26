'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

export default function StoreNav() {
  const { data: session, status } = useSession();

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
          <div className="flex items-center gap-4 text-sm">
            <Link href="/shop" className="text-white/60 hover:text-white transition">Shop</Link>
            <Link href="/account" className="text-white/60 hover:text-white transition">Account</Link>
            <Link href="/orders" className="text-white/60 hover:text-white transition">Orders</Link>

            {status === 'loading' ? null : session?.user ? (
              <div className="flex items-center gap-3">
                <span className="text-white/80">
                  Hi, {session.user.name?.split(' ')[0] ?? session.user.email}
                </span>
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
        </div>
      </div>
    </nav>
  );
}