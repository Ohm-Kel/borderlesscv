"use client";

import type { ReactNode } from "react";
import type { HTMLMotionProps, Transition, Variants } from "framer-motion";
import { motion, useReducedMotion } from "framer-motion";

import { fadeUp, pageTransition, pageTransitionVariants, scaleIn, smoothEase, staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";

type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
  distance?: number;
  once?: boolean;
  amount?: number;
};

export function Reveal({
  className,
  children,
  delay = 0,
  distance = 24,
  once = true,
  amount = 0.2,
  ...props
}: RevealProps) {
  const reduceMotion = useReducedMotion();
  const variants = fadeUp(distance);

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? undefined : "hidden"}
      whileInView={reduceMotion ? undefined : "visible"}
      viewport={reduceMotion ? undefined : { once, amount }}
      variants={variants}
      transition={reduceMotion ? undefined : { delay, duration: 0.38, ease: smoothEase }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

type StaggerProps = HTMLMotionProps<"div"> & {
  delayChildren?: number;
  staggerChildren?: number;
};

export function Stagger({
  className,
  children,
  delayChildren = 0,
  staggerChildren = 0.1,
  ...props
}: StaggerProps) {
  const reduceMotion = useReducedMotion();
  const variants = staggerContainer(delayChildren, staggerChildren);

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? undefined : "hidden"}
      whileInView={reduceMotion ? undefined : "visible"}
      viewport={reduceMotion ? undefined : { once: true, amount: 0.12 }}
      variants={variants}
      {...props}
    >
      {children}
    </motion.div>
  );
}

type HoverCardProps = HTMLMotionProps<"div"> & {
  hoverY?: number;
  hoverScale?: number;
};

export function HoverCard({
  className,
  children,
  hoverY = -6,
  hoverScale = 1.01,
  ...props
}: HoverCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: hoverY,
              scale: hoverScale,
              transition: {
                duration: 0.24,
                ease: smoothEase,
              },
            }
      }
      {...props}
    >
      {children}
    </motion.div>
  );
}

type FloatingAccentProps = HTMLMotionProps<"div"> & {
  duration?: number;
  y?: number;
  x?: number;
};

export function FloatingAccent({
  className,
  duration = 10,
  y = 16,
  x = 10,
  ...props
}: FloatingAccentProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn("pointer-events-none absolute blur-3xl", className)}
      animate={
        reduceMotion
          ? undefined
          : {
              y: [0, -y, 0],
              x: [0, x, 0],
            }
      }
      transition={
        reduceMotion
          ? undefined
          : {
              duration,
              ease: "easeInOut",
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "mirror",
            }
      }
      {...props}
    />
  );
}

type EntranceCardProps = HTMLMotionProps<"div"> & {
  delay?: number;
};

export function EntranceCard({ className, children, delay = 0, ...props }: EntranceCardProps) {
  const reduceMotion = useReducedMotion();
  const variants = scaleIn(delay);

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? undefined : "hidden"}
      animate={reduceMotion ? undefined : "visible"}
      variants={variants}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export const hoverTransition: Transition = {
  duration: 0.24,
  ease: smoothEase,
};

export const formFocusTransition: Transition = {
  duration: 0.22,
  ease: smoothEase,
};

export function animatedItemVariants(delay = 0): Variants {
  return {
    hidden: {
      opacity: 0,
      y: 18,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay,
        duration: 0.34,
        ease: smoothEase,
      },
    },
  };
}

export function MotionButtonWrap({ className, children }: { className?: string; children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -2,
              transition: hoverTransition,
            }
      }
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
    >
      {children}
    </motion.div>
  );
}

export function PageIntro({ className, children }: { className?: string; children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? undefined : "initial"}
      animate={reduceMotion ? undefined : "animate"}
      exit={reduceMotion ? undefined : "exit"}
      variants={{
        initial: pageTransitionVariants.initial,
        animate: pageTransitionVariants.animate,
        exit: pageTransitionVariants.exit,
      }}
      transition={reduceMotion ? undefined : pageTransition}
    >
      {children}
    </motion.div>
  );
}
