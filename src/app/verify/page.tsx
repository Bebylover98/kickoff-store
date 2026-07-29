'use client';

import React, { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Mail, AlertCircle, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

function VerifyForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [verified, setVerified] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      setVerified(true);
      setLoading(false);
      setTimeout(() => router.push('/login?verified=true'), 1500);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendMessage('');
    setError('');
    try {
      const res = await fetch('/api/verify/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || 'Could not resend code');
      } else {
        setResendMessage('A new code has been sent.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setResending(false);
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#09090B] text-white font-sans antialiased flex items-center justify-center px-4">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-30%] left-[-10%] h-[70%] w-[60%] rounded-full bg-gradient-to-r from-purple-600/30 via-blue-500/20 to-cyan-400/30 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[60%] w-[50%] rounded-full bg-gradient-to-l from-blue-600/30 via-violet-500/20 to-purple-400/30 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl shadow-purple-500/10 p-8"
      >
        {verified ? (
          <div className="text-center py-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400/20"
            >
              <CheckCircle className="h-8 w-8 text-cyan-400" />
            </motion.div>
            <h3 className="text-xl font-semibold">Email verified!</h3>
            <p className="mt-1 text-white/60">Redirecting you to sign in...</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400/10">
                <Mail className="h-6 w-6 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-semibold">Verify your email</h2>
              <p className="mt-1 text-sm text-white/50">
                We sent a 6-digit code to <span className="text-white/80">{email}</span>
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit code"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-center text-lg tracking-[0.3em] text-white placeholder:text-white/30 placeholder:tracking-normal focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
                required
              />

              {error && (
                <p className="flex items-center gap-1 text-sm text-rose-400">
                  <AlertCircle className="h-4 w-4" /> {error}
                </p>
              )}
              {resendMessage && (
                <p className="text-sm text-cyan-400">{resendMessage}</p>
              )}

              <motion.button
                type="submit"
                disabled={loading || code.length !== 6}
                className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition-all hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Verify <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </motion.button>

              <p className="text-center text-sm text-white/40">
                Didn't get a code?{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-cyan-400 hover:underline disabled:opacity-50"
                >
                  {resending ? 'Sending...' : 'Resend code'}
                </button>
              </p>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyForm />
    </Suspense>
  );
}