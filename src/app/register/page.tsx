'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Lock, Eye, EyeOff, Phone, CheckCircle,
  AlertCircle, Loader2, ArrowRight, Sparkles
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

const registerSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(7, 'Phone number is required'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const PasswordStrength = ({ password }: { password: string }) => {
  const getStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    return score;
  };
  const strength = getStrength(password);
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1'];
  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: i < strength ? colors[i] : 'transparent' }}
              initial={{ width: 0 }}
              animate={{ width: i < strength ? '100%' : 0 }}
              transition={{ duration: 0.4 }}
            />
          </div>
        ))}
      </div>
      <p className="text-xs font-medium" style={{ color: strength > 0 ? colors[strength - 1] : 'rgba(255,255,255,0.4)' }}>
        {strength > 0 ? labels[strength - 1] : 'Enter a password'}
      </p>
    </div>
  );
};

// Simple inline Google "G" logo (lucide-react doesn't ship brand icons)
const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M23.766 12.276c0-.818-.074-1.606-.21-2.364H12.24v4.472h6.482a5.54 5.54 0 0 1-2.402 3.632v3.016h3.886c2.274-2.094 3.56-5.176 3.56-8.756z"/>
    <path fill="#34A853" d="M12.24 24c3.24 0 5.956-1.074 7.944-2.904l-3.886-3.016c-1.078.724-2.458 1.152-4.058 1.152-3.122 0-5.766-2.108-6.71-4.942H1.516v3.108C3.492 21.3 7.552 24 12.24 24z"/>
    <path fill="#FBBC05" d="M5.53 14.29a7.22 7.22 0 0 1 0-4.58V6.602H1.516a11.996 11.996 0 0 0 0 10.796l4.014-3.108z"/>
    <path fill="#EA4335" d="M12.24 4.77c1.762 0 3.344.606 4.588 1.796l3.444-3.444C18.19 1.186 15.474 0 12.24 0 7.552 0 3.492 2.7 1.516 6.602L5.53 9.71c.944-2.834 3.588-4.94 6.71-4.94z"/>
  </svg>
);

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<{ x: number; y: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, touchedFields, isValid },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const password = watch('password');
  const formValues = watch();

  // Generate particle positions only on the client, after mount
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

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setServerError('');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok) {
        setServerError(result.error || 'Registration failed.');
        setIsLoading(false);
        return;
      }

      setIsSubmitted(true);
      setIsLoading(false);
      setTimeout(() => {
        router.push(`/verify?email=${encodeURIComponent(data.email)}`);
      }, 1800);
    } catch (err) {
      setServerError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  const signInWithGoogle = () => {
    setIsGoogleLoading(true);
    signIn('google', { callbackUrl: '/' });
  };

  const totalFields = 4;
  const filledFields = Object.values(formValues).filter(v => v !== '' && v !== undefined).length;
  const progress = Math.round((filledFields / totalFields) * 100);

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
              Join the <br />
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                squad
              </span>{' '}
              today.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="text-lg text-white/50 max-w-md mx-auto lg:mx-0"
            >
              Create your account for faster checkout, order tracking, and exclusive drops.
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
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Create account</h2>
                  <div className="flex items-center gap-2 text-sm text-white/40">
                    <span>Progress</span>
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-purple-400 to-cyan-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Google sign-in */}
                <motion.button
                  type="button"
                  onClick={signInWithGoogle}
                  disabled={isGoogleLoading}
                  className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-white transition-all hover:bg-white/10 disabled:opacity-60"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isGoogleLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <GoogleIcon />
                      Continue with Google
                    </>
                  )}
                </motion.button>

                <div className="mb-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-xs uppercase tracking-wide text-white/30">or</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                    <input
                      {...register('name')}
                      placeholder="Full Name"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
                    />
                    {errors.name && touchedFields.name && (
                      <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-1 flex items-center gap-1 text-xs text-rose-400">
                        <AlertCircle className="h-3 w-3" /> {errors.name.message}
                      </motion.p>
                    )}
                  </div>

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
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                    <input
                      {...register('phone')}
                      placeholder="Phone Number"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
                    />
                    {errors.phone && touchedFields.phone && (
                      <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-1 flex items-center gap-1 text-xs text-rose-400">
                        <AlertCircle className="h-3 w-3" /> {errors.phone.message}
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
                    {password && <PasswordStrength password={password} />}
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
                        Register <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </motion.button>

                  <p className="text-center text-sm text-white/40">
                    Already have an account?{' '}
                    <Link href="/login" className="text-cyan-400 hover:underline">Sign in</Link>
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
              <h3 className="text-xl font-semibold">Details submitted successfully!</h3>
              <p className="mt-1 text-white/60">Check your email and enter the verification code.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
