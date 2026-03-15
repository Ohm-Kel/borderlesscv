"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { LockKeyhole, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import { EntranceCard } from "@/components/motion/motion-primitives";
import { Logo } from "@/components/shared/logo";
import { Badge } from "@/components/ui/badge";
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
      <Card className="overflow-hidden rounded-[36px] border-white/75 bg-white/92 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
        <CardHeader className="relative space-y-6 border-b border-slate-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.88))] px-6 pb-7 pt-6 lg:px-8">
          <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/80 to-transparent" />
          <motion.div initial="hidden" animate="visible" variants={staggerContainer(0.04, 0.08)}>
            <motion.div className="flex flex-wrap items-center justify-between gap-3" variants={fadeUp(14)}>
              <Logo />
              <Badge className="border border-slate-200 bg-white/80 px-3 py-1.5 text-slate-700 shadow-sm">
                <LockKeyhole className="mr-1 h-3.5 w-3.5" />
                Secure access
              </Badge>
            </motion.div>

            <motion.div className="space-y-3" variants={fadeUp(18)}>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Sparkles className="h-4 w-4 text-slate-400" />
                Resume intelligence for global applications
              </div>
              <CardTitle className="max-w-[14ch] text-[2rem] leading-tight tracking-[-0.03em] text-slate-950 sm:text-[2.2rem]">
                {title}
              </CardTitle>
              <CardDescription className="max-w-lg text-sm leading-7 text-slate-600">{description}</CardDescription>
            </motion.div>
          </motion.div>
        </CardHeader>

        <CardContent className="space-y-6 px-6 pb-6 pt-6 lg:px-8 lg:pb-8">
          <div className="rounded-[30px] border border-slate-200/80 bg-slate-50/80 p-4 text-sm leading-7 text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
            Use one trusted profile to generate country-aware resumes, tailored versions, cover letters, and application history.
          </div>
          {children}
          {footer ? <div className="border-t border-slate-100 pt-2 text-sm text-slate-500">{footer}</div> : null}
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
    <p className="text-sm text-slate-500">
      {text}{" "}
      <motion.span whileHover={{ y: -1 }} className="inline-block">
        <Link href={href} className="font-semibold text-slate-950 transition hover:text-[var(--accent)]">
          {label}
        </Link>
      </motion.span>
    </p>
  );
}
