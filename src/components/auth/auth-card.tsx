"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { motion } from "framer-motion";

import { EntranceCard } from "@/components/motion/motion-primitives";
import { Logo } from "@/components/shared/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fadeUp, staggerContainer } from "@/lib/motion";

export function AuthCard({
  title,
  description,
  footer,
  children,
}: {
  title: string;
  description: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <EntranceCard>
      <Card className="overflow-hidden rounded-[16px] border-[var(--border)] bg-white shadow-sm backdrop-blur-2xl">

        <CardHeader className="relative space-y-6 border-b border-[var(--border)] bg-white px-7 pb-7 pt-7 lg:px-9">
          <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/70 to-transparent" />

          <motion.div initial="hidden" animate="visible" variants={staggerContainer(0.04, 0.08)}>

            {/* Brand + Secure badge row */}
            <motion.div className="flex flex-wrap items-center justify-between gap-3" variants={fadeUp(14)}>
              <Logo />
              {/* Secure access — prominent dark pill */}
              <div className="flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-[0.7rem] font-bold tracking-wide text-[var(--accent-dark)] shadow-sm">
                <LockKeyhole className="h-3 w-3 stroke-[3]" />
                Secure access
              </div>
            </motion.div>

            {/* Eyebrow + title + description */}
            <motion.div className="mt-6 space-y-3" variants={fadeUp(18)}>
              <p className="section-label">Resume intelligence for global applications</p>
              <CardTitle className="serif-display max-w-[15ch] text-[1.9rem] leading-tight tracking-[-0.02em] text-[var(--navy)] sm:text-[2.1rem]">
                {title}
              </CardTitle>
              <CardDescription className="max-w-lg text-[0.87rem] leading-[1.8] text-slate-500">
                {description}
              </CardDescription>
            </motion.div>
          </motion.div>
        </CardHeader>

        {/* ── Card content ────────────────────────────────────── */}
        <CardContent className="space-y-6 px-7 pb-7 pt-6 lg:px-9 lg:pb-9">
          {/* Left-accent info banner */}
          <div className="flex items-start gap-3 rounded-r-[12px] rounded-l-[4px] border border-[var(--border)] border-l-[var(--accent)] bg-[var(--accent-soft)] py-3 pl-4 pr-5">
            <div className="min-w-0">
              <p className="text-[0.8rem] font-semibold text-slate-800">One profile, every market</p>
              <p className="mt-0.5 text-[0.78rem] leading-[1.75] text-slate-500">
                Generate country-aware resumes, tailored versions, cover letters, and application history from the same verified facts.
              </p>
            </div>
          </div>

          {children}

          {footer ? (
            <div className="border-t border-[var(--border)] pt-5 pb-2 text-center text-sm text-slate-500">{footer}</div>
          ) : null}
        </CardContent>
      </Card>
    </EntranceCard>
  );
}

export function AuthFooterLink({
  text,
  href,
  label,
}: {
  text: string;
  href: string;
  label: string;
}) {
  return (
    <p className="text-[0.84rem] text-slate-500">
      {text}{" "}
      <motion.span whileHover={{ y: -1 }} className="inline-block">
        <Link href={href} className="font-semibold text-[var(--navy)] underline-offset-2 transition hover:text-[var(--accent)] hover:underline">
          {label}
        </Link>
      </motion.span>
    </p>
  );
}
