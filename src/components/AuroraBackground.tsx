'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function AuroraBackground({ children }: { children: React.ReactNode }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<{ x: number; y: number }[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 768px)').matches;
    setIsMobile(mobile);

    if (!mobile) {
      setParticles(
        Array.from({ length: 30 }, () => ({
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
    }
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen w-full overflow-x-hidden bg-[#09090B] text-white font-sans antialiased">
      <div className="fixed inset-0 -z-10">
        <motion.div
          className="absolute top-[-30%] left-[-10%] h-[70%] w-[60%] rounded-full bg-gradient-to-r from-purple-600/20 via-blue-500/15 to-cyan-400/20 blur-[60px] md:blur-[120px]"
          animate={isMobile ? undefined : { x: [0, 30, -20, 0], y: [0, -20, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[-20%] right-[-10%] h-[60%] w-[50%] rounded-full bg-gradient-to-l from-blue-600/20 via-violet-500/15 to-purple-400/20 blur-[60px] md:blur-[120px]"
          animate={isMobile ? undefined : { x: [0, -30, 20, 0], y: [0, 30, -20, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
        {!isMobile && (
          <motion.div
            className="absolute top-1/2 left-1/2 h-[50%] w-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[100px]"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        {!isMobile &&
          particles.map((p, i) => (
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
      </div>
      {!isMobile && (
        <motion.div
          className="pointer-events-none fixed h-[500px] w-[500px] rounded-full bg-gradient-to-r from-purple-500/8 via-blue-500/8 to-cyan-400/8 blur-[80px]"
          animate={{ x: mousePosition.x - 250, y: mousePosition.y - 250 }}
          transition={{ type: 'tween', ease: 'easeOut', duration: 0.6 }}
        />
      )}
      {children}
    </div>
  );
}