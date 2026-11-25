'use client';

import React from 'react';
import { MotionConfig, motion, type HTMLMotionProps } from 'motion/react';
import {
  fadeSlideUp,
  staggerContainer,
  staggerItem,
  TWEEN_MEDIUM,
} from '@/lib/motion';

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

interface FadeInProps extends HTMLMotionProps<'div'> {
  delay?: number;
}

export function FadeIn({ children, delay = 0, className, ...props }: FadeInProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeSlideUp}
      transition={{ ...TWEEN_MEDIUM, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface ScrollRevealProps extends HTMLMotionProps<'div'> {
  delay?: number;
}

export function ScrollReveal({
  children,
  delay = 0,
  className,
  ...props
}: ScrollRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ ...TWEEN_MEDIUM, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerGrid({
  children,
  className,
  ...props
}: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  ...props
}: HTMLMotionProps<'div'>) {
  return (
    <motion.div variants={staggerItem} className={className} {...props}>
      {children}
    </motion.div>
  );
}
