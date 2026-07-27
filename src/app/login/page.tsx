@'
'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, Eye, EyeOff, CheckCircle,
  AlertCircle, Loader2, ArrowRight, Sparkles
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === 'true';

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<{ x: number; y: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    setParticles(
      Array.from({ length: 40 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
      }))
    );
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setServerError('');
    try {
      const res = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        setServerError('Invalid email or password.');
        setIsLoading(false);
        return;
      }

      const session = await getSession();
      const role = (session?.user as { role?: string } | undefined)?.role;
      const admin = role === 'admin';
      setIsAdminLogin(admin);

      setIsSubmitted(true);
      setIsLoading(false);
      setTimeout(() => {
        router.push(admin ? '/admin/products' : '/');
        router.refresh();
      }, 1200);
    } catch (err) {
      setServerError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="relative min-h-screen w-full overflow-x-hidden bg-[#09090B] text-white font-sans antialiased">
      <div className="fixed inset-0 -z-10">
        <motion.div
          className="absolute top-[-30%] left-[-10%] h-[70%] w-[60%] rounded-full bg-gradient-to-r from-purple-600/30 via-blue-500/20 to-cyan-400/30 blur-[120px]"
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[-20%] right-[-10%] h-[60%] w-[50%] rounded-full bg-gradient-to-l from-blue-600/30 via-violet-500/20 to-purple-400/30 blur-[120px]"
          animate={{ x: [0, -30, 20, 0], y: [0, 30, -20, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 h-[50%] w-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[100px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-white/20"
            initial={{ x: p.x, y: p.y }}
            animate={{
              x: [null, Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000)],
              y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800), Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800)],
            }}
            transition={{ duration: 20 + Math.random() * 30, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <motion.div
        className="pointer-events-none fixed h-[600px] w-[600px] rounded-full bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-400/10 blur-[80px]"
        animate={{ x: mousePosition.x - 300, y: mousePosition.y - 300 }}
        transition={{ type: 'tween', ease: 'easeOut', duration: 0.6 }}
      />

      <div className="container mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="grid w-full grid-cols-1 gap-12 lg:grid-cols-2"
        >
          <div className="flex flex-col justify-center space-y-6 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="inline-flex items-center gap-2 self-center rounded-full bg-white/5 px-4 py-1.5 text-sm font-medium text-white/70 backdrop-blur-sm lg:self-start"
            >
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>KickOff Store</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
            >
              Welcome <br />
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                back.
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="text-lg text-white/50 max-w-md mx-auto lg:mx-0"
            >
              Sign in to view your orders, saved addresses, and pick up right where you left off.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6, type: 'spring' }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl shadow-purple-500/10">
              <div className="p-6 sm:p-8">
                <h2 className="mb-6 text-2xl font-semibold">Sign in</h2>

                {justRegistered && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-300"
                  >
                    <CheckCircle className="h-4 w-4" /> Account created — sign in below.
                  </motion.p>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                    <input
                      {...register('email')}
                      placeholder="Email Address"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
                    />
                    {errors.email && touchedFields.email && (
                      <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-1 flex items-center gap-1 text-xs text-rose-400">
                        <AlertCircle className="h-3 w-3" /> {errors.email.message}
                      </motion.p>
                    )}
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-12 text-sm text-white placeholder:text-white/30 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    {errors.password && touchedFields.password && (
                      <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-1 flex items-center gap-1 text-xs text-rose-400">
                        <AlertCircle className="h-3 w-3" /> {errors.password.message}
                      </motion.p>
                    )}
                  </div>

                  {serverError && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1 text-sm text-rose-400">
                      <AlertCircle className="h-4 w-4" /> {serverError}
                    </motion.p>
                  )}

                  <motion.button
                    type="submit"
                    disabled={isLoading || !isValid}
                    className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/40 disabled:opacity-70 disabled:hover:scale-100"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Sign In <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </motion.button>

                  <p className="text-center text-sm text-white/40">
                    New here?{' '}
                    <Link href="/register" className="text-cyan-400 hover:underline">Create an account</Link>
                  </p>

                  <p className="text-center text-xs text-white/30">
                    Admin access remains available at{' '}
                    <Link href="/admin/products" className="text-cyan-400/70 hover:underline">/admin/products</Link>
                  </p>
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              className="rounded-2xl bg-white/10 p-8 text-center backdrop-blur-xl border border-white/20 shadow-2xl"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400/20"
              >
                <CheckCircle className="h-8 w-8 text-cyan-400" />
              </motion.div>
              <h3 className="text-xl font-semibold">Signed in!</h3>
              <p className="mt-1 text-white/60">
                {isAdminLogin ? 'You can now sell your products.' : 'Taking you home...'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
'@ | Set-Content -Path "src\app\login\page.tsx" -Encoding utf8