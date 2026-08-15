'use client';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';

export default function OrderConfirmAnimation() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative h-24 w-full max-w-sm overflow-hidden rounded-full bg-white/5 border border-white/10">
        <div className="absolute bottom-3 left-0 right-0 h-0.5 bg-white/10" />
        <motion.div
          className="absolute bottom-2 flex items-end gap-1"
          initial={{ x: '-20%' }}
          animate={{ x: '120%' }}
          transition={{ duration: 2.2, ease: 'easeInOut', repeat: Infinity }}
        >
          <div className="relative flex h-10 w-16 items-center justify-center rounded-md bg-gradient-to-r from-purple-500 to-cyan-400 shadow-lg shadow-purple-500/30">
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Package className="h-5 w-5 text-white" />
            </motion.div>
          </div>
          <div className="h-3 w-3 rounded-full bg-white/30" />
          <div className="h-3 w-3 rounded-full bg-white/30" />
        </motion.div>
      </div>
      <motion.p
        className="mt-6 text-lg font-semibold text-white"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Placing your order...
      </motion.p>
      <p className="mt-1 text-sm text-white/40">Hang tight, we're confirming everything.</p>
    </div>
  );
}
