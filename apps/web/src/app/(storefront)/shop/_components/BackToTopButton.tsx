'use client';

import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { SPRING_SNAPPY } from '@/lib/motion';

export function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 600);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          aria-label="Back to top"
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          transition={SPRING_SNAPPY}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 h-11 px-4 rounded-full bg-brand-600 text-white shadow-lg hover:bg-brand-700 active:scale-95 transition-colors flex items-center gap-2 text-xs font-semibold"
        >
          <ArrowUp className="w-4 h-4" />
          <span className="hidden sm:inline">Top</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
