import type { Transition, Variants } from 'motion/react';

export const MOTION_EASE = [0.22, 1, 0.36, 1] as const;

export const SPRING_SNAPPY: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 30,
  mass: 0.8,
};

export const SPRING_GENTLE: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 24,
};

export const TWEEN_FAST: Transition = {
  duration: 0.2,
  ease: MOTION_EASE,
};

export const TWEEN_MEDIUM: Transition = {
  duration: 0.32,
  ease: MOTION_EASE,
};

export const fadeSlideUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: TWEEN_MEDIUM,
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: TWEEN_FAST,
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: TWEEN_MEDIUM,
  },
};

export const dropdownMenuVariants: Variants = {
  hidden: { opacity: 0, y: -6, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: TWEEN_FAST,
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.98,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

export const accordionVariants: Variants = {
  collapsed: { opacity: 0, height: 0, overflow: 'hidden' },
  expanded: {
    opacity: 1,
    height: 'auto',
    overflow: 'visible',
    transition: {
      height: { duration: 0.26, ease: MOTION_EASE },
      opacity: { duration: 0.2, delay: 0.04 },
    },
  },
};
