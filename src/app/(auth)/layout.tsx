"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2, Globe2, Layers3, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { EntranceCard, FloatingAccent, HoverCard, MotionButtonWrap, PageIntro } from "@/components/motion/motion-primitives";
import { Logo } from "@/components/shared/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fadeUp, staggerContainer } from "@/lib/motion";

const authBenefits = [
  {
    icon: Globe2,
    title: "Country-aware output",
    description: "Tailor resumes for Ghana, the UK, the US, Canada, Europe, and remote opportunities.",
  },
  {
    icon: ShieldCheck,
    title: "Fact-based AI",
    description: "Rewrite and tailor from user-provided evidence only, with no fabricated metrics or claims.",
  },
  {
    icon: Layers3,
    title: "Versioned workflow",
    description: "Keep resume variants, cover letters, and application history tied to each opportunity.",
  },
] as const;

const authMarkets = [
  { label: "Ghana", flag: "🇬🇭" },
  { label: "UK", flag: "🇬🇧" },
  { label: "US", flag: "🇺🇸" },
  { label: "Canada", flag: "🇨🇦" },
  { label: "Europe", flag: "🇪🇺" },
  { label: "Remote", flag: "🌐" },
] as const;

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mesh-bg relative min-h-screen overflow-hidden">
      <FloatingAccent className="left-[-10rem] top-10 h-72 w-72 bg-slate-950/10" duration={14} />
      <FloatingAccent className="right-[-7rem] top-24 h-80 w-80 bg-slate-400/20" duration={16} y={18} x={14} />

      <PageIntro>
        <div className="mx-auto grid min-h-screen max-w-[1360px] items-center gap-6 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1.02fr)_488px] lg:gap-10 lg:px-8 lg:py-8">

          {/* ── Mobile header card (< lg) ──────────────────────── */}
          <section className="lg:hidden">
            <EntranceCard>
              <div className="surface-card rounded-[34px] border border-white/75 p-5">
                <Logo />
                <Badge className="mt-5 w-fit border border-slate-200 bg-white/85 text-slate-600 shadow-sm">
                  Global-first career tooling
                </Badge>
                <h1 className="serif-display mt-5 text-[2rem] leading-tight tracking-[-0.025em] text-[var(--navy)]">
                  One trusted profile. Country-aware resumes. A stronger shot at getting hired.
                </h1>
                <p className="mt-4 text-sm leading-7 text-slate-500">
                  BorderlessCV helps early-career professionals turn scattered experience into recruiter-trustworthy resumes, tailored versions, and a cleaner application pipeline.
                </p>
              </div>
            </EntranceCard>
          </section>

          {/* ── Dark left panel (≥ lg) ─────────────────────────── */}
          <section className="relative hidden overflow-hidden rounded-[44px] border border-white/8 bg-[linear-gradient(160deg,rgba(6,11,28,0.99)_0%,rgba(12,20,40,0.99)_100%)] p-9 text-white shadow-[0_40px_100px_rgba(5,10,25,0.32),0_2px_4px_rgba(0,0,0,0.12)] lg:block xl:p-11">

            {/* Radial highlight overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_100%_0%,rgba(255,255,255,0.07),transparent),linear-gradient(135deg,rgba(255,255,255,0.025),transparent_55%)]" />

            {/* Dot grid texture */}
            <div className="dot-grid absolute inset-0 opacity-100" />

            {/* Floating ambient glows */}
            <motion.div
              className="absolute -left-10 top-16 h-52 w-52 rounded-full bg-white/[0.04] blur-3xl"
              animate={{ y: [0, -16, 0], x: [0, 10, 0] }}
              transition={{ duration: 11, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
            />
            <motion.div
              className="absolute bottom-8 right-4 h-72 w-72 rounded-full bg-[var(--accent)]/[0.06] blur-3xl"
              animate={{ y: [0, 14, 0], x: [0, -12, 0] }}
              transition={{ duration: 13, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
            />

            {/* Content */}
            <div className="relative z-10">
              <motion.div initial="hidden" animate="visible" variants={staggerContainer(0.05, 0.1)}>

                {/* Brand mark */}
                <motion.div variants={fadeUp(16)}>
                  <Logo
                    className="[&_.serif-display]:text-white [&_span:first-child]:text-slate-400"
                  />
                </motion.div>

                {/* Hero copy */}
                <motion.div className="mt-12 space-y-5" variants={fadeUp(18)}>
                  <Badge className="w-fit border border-white/12 bg-white/[0.08] px-3.5 py-1.5 text-slate-200 backdrop-blur-sm">
                    Recruiter-trustworthy resume system
                  </Badge>
                  <h1 className="serif-display max-w-[12ch] text-[3.4rem] leading-[0.93] tracking-[-0.04em] text-white">
                    One trusted profile. Country-aware resumes. A better shot at getting hired.
                  </h1>
                  <p className="max-w-lg text-[1.02rem] leading-[1.85] text-slate-300/90">
                    BorderlessCV helps students and early-career professionals turn scattered achievements into recruiter-trustworthy resumes, tailored versions, and a clean application pipeline.
                  </p>
                </motion.div>

                {/* Market pills */}
                <motion.div className="mt-8 flex flex-wrap gap-2" variants={fadeUp(18)}>
                  {authMarkets.map((market, index) => (
                    <motion.div
                      key={market.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.28, delay: 0.3 + index * 0.055 }}
                      whileHover={{ y: -2 }}
                    >
                      <Badge className="gap-1.5 border border-white/12 bg-white/[0.09] px-3.5 py-1.5 text-[0.78rem] font-medium text-slate-100 backdrop-blur-sm">
                        <span className="text-sm leading-none">{market.flag}</span>
                        {market.label}
                      </Badge>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Thin rule */}
                <motion.div
                  className="mt-9 h-px w-full bg-gradient-to-r from-white/12 via-white/6 to-transparent"
                  variants={fadeUp(12)}
                />

                {/* Benefit cards */}
                <motion.div className="mt-7 grid gap-3.5 xl:grid-cols-3" variants={staggerContainer(0.12, 0.08)}>
                  {authBenefits.map((benefit) => {
                    const Icon = benefit.icon;

                    return (
                      <motion.div key={benefit.title} variants={fadeUp(16)}>
                        <HoverCard className="h-full" hoverY={-4}>
                          <div className="auth-panel-card h-full rounded-[26px] p-5">
                            <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-white/[0.10] text-white ring-1 ring-white/[0.14]">
                              <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                            </div>
                            <h3 className="mt-4 text-[0.9rem] font-semibold tracking-[-0.01em] text-white">{benefit.title}</h3>
                            <p className="mt-1.5 text-[0.78rem] leading-[1.75] text-slate-300/85">{benefit.description}</p>
                          </div>
                        </HoverCard>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* Low-experience callout */}
                <motion.div
                  className="mt-5 flex items-start gap-3.5 rounded-[24px] border border-white/10 bg-white/[0.055] p-5"
                  variants={fadeUp(16)}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-white text-[var(--navy)] shadow-[0_8px_20px_rgba(0,0,0,0.18)]">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[0.875rem] font-semibold text-white">Built for low-experience candidates</p>
                    <p className="mt-1 text-[0.78rem] leading-[1.75] text-slate-300/85">
                      Projects, internships, leadership, volunteer work, and coursework are treated as real hiring evidence.
                    </p>
                  </div>
                </motion.div>

                {/* CTA */}
                <motion.div className="mt-8" variants={fadeUp(16)}>
                  <MotionButtonWrap className="w-fit">
                    <Button
                      asChild
                      variant="secondary"
                      className="bg-white text-slate-950 shadow-[0_16px_36px_rgba(0,0,0,0.22)] hover:shadow-[0_20px_44px_rgba(0,0,0,0.28)]"
                    >
                      <Link href="/" className="inline-flex items-center gap-2">
                        Explore the product
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </MotionButtonWrap>
                </motion.div>

              </motion.div>
            </div>
          </section>

          {/* ── Right panel — auth form ────────────────────────── */}
          <section className="mx-auto w-full max-w-xl lg:max-w-none">{children}</section>
        </div>
      </PageIntro>
    </div>
  );
}
