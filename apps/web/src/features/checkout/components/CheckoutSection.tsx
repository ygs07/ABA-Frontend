'use client';

import React from 'react';
import { Check, Pencil } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { accordionVariants, SPRING_SNAPPY } from '@/lib/motion';

interface CheckoutSectionProps {
  stepNumber: number;
  currentStep: number;
  title: string;
  summary?: React.ReactNode;
  onEdit?: () => void;
  children: React.ReactNode;
}

export function CheckoutSection({
  stepNumber,
  currentStep,
  title,
  summary,
  onEdit,
  children,
}: CheckoutSectionProps) {
  const isCompleted = currentStep > stepNumber;
  const isActive = currentStep === stepNumber;

  return (
    <section
      aria-labelledby={`checkout-step-${stepNumber}`}
      className={`rounded-xl border transition-colors duration-200 overflow-hidden bg-white ${
        isActive
          ? 'border-brand-300 shadow-sm'
          : isCompleted
            ? 'border-border'
            : 'border-border/70 opacity-75'
      }`}
    >
      <div className="px-5 py-4 flex items-center justify-between gap-4 bg-surface-1/40">
        <div className="flex items-center gap-3 min-w-0">
          <motion.div
            layout
            transition={SPRING_SNAPPY}
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border ${
              isCompleted
                ? 'bg-brand-600 border-brand-600 text-white'
                : isActive
                  ? 'bg-brand-50 border-brand-600 text-brand-700'
                  : 'bg-white border-border text-text-muted'
            }`}
          >
            {isCompleted ? <Check className="w-3.5 h-3.5" /> : stepNumber}
          </motion.div>

          <div className="min-w-0">
            <h2
              id={`checkout-step-${stepNumber}`}
              className={`text-sm sm:text-base font-bold truncate ${
                isActive || isCompleted ? 'text-text' : 'text-text-muted'
              }`}
            >
              {title}
            </h2>
            {isCompleted && summary ? (
              <p className="text-xs text-text-muted truncate mt-0.5">{summary}</p>
            ) : null}
          </div>
        </div>

        {isCompleted && onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 px-2.5 py-1 rounded-full hover:bg-brand-50 transition-colors shrink-0"
          >
            <Pencil className="w-3 h-3" />
            Edit
          </button>
        ) : null}
      </div>

      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            key={`step-body-${stepNumber}`}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={accordionVariants}
            className="border-t border-border"
          >
            <div className="p-5 md:p-7">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
