import type { Transition, Variants } from "framer-motion";

export const smoothEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const pageTransition: Transition = {
  duration: 0.2,
  ease: "easeOut",
};

export const pageTransitionVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: pageTransition,
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.15,
      ease: "easeIn",
    },
  },
};

export function staggerContainer(delayChildren = 0, staggerChildren = 0.1): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        delayChildren,
        staggerChildren,
      },
    },
  };
}

export function fadeUp(distance = 24): Variants {
  return {
    hidden: {
      opacity: 0,
      y: distance,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.38,
        ease: smoothEase,
      },
    },
  };
}

export function fadeIn(duration = 0.3): Variants {
  return {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration,
        ease: smoothEase,
      },
    },
  };
}

export function scaleIn(delay = 0): Variants {
  return {
    hidden: {
      opacity: 0,
      scale: 0.96,
      y: 12,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        delay,
        duration: 0.34,
        ease: smoothEase,
      },
    },
  };
}
