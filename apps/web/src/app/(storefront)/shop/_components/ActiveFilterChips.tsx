'use client';

import React from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { SPRING_SNAPPY } from '@/lib/motion';

export interface FilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}

interface ActiveFilterChipsProps {
  chips: FilterChip[];
  onClearAll: () => void;
}

export function ActiveFilterChips({ chips, onClearAll }: ActiveFilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      <span className="text-xs font-medium text-text-muted mr-1">Active filters:</span>
      <AnimatePresence mode="popLayout">
        {chips.map((chip) => (
          <motion.button
            key={chip.key}
            layout
            type="button"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={SPRING_SNAPPY}
            onClick={chip.onRemove}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-xs font-medium text-brand-700 hover:bg-brand-100 transition-colors"
          >
            <span>{chip.label}</span>
            <X className="w-3 h-3" />
          </motion.button>
        ))}
      </AnimatePresence>
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs font-semibold text-text-muted hover:text-brand-600 underline underline-offset-2 ml-1 transition-colors"
      >
        Clear all
      </button>
    </div>
  );
}
