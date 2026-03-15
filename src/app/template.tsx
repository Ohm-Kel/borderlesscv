"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

import { pageTransitionVariants } from "@/lib/motion";

export default function RootTemplate({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={pathname} initial="initial" animate="animate" exit="exit" variants={pageTransitionVariants}>
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
