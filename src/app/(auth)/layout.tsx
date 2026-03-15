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

const authMarkets = ["Ghana", "UK", "US", "Canada", "Europe", "Remote"] as const;

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mesh-bg relative min-h-screen overflow-hidden">
      <FloatingAccent className="left-[-10rem] top-10 h-72 w-72 bg-slate-950/10" duration={14} />
      <FloatingAccent className="right-[-7rem] top-24 h-80 w-80 bg-slate-400/25" duration={16} y={18} x={14} />

      <PageIntro>
        <div className="mx-auto grid min-h-screen max-w-[1360px] items-center gap-6 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1.02fr)_480px] lg:gap-10 lg:px-8 lg:py-8">
          <section className="lg:hidden">
            <EntranceCard>
              <div className="surface-card rounded-[34px] border border-white/70 p-5">
                <Logo />
                <Badge className="mt-5 w-fit border border-slate-200 bg-white/80 text-slate-700">Global-first career tooling</Badge>
                <h1 className="serif-display mt-5 text-4xl leading-tight text-slate-950">
                  One trusted profile. Country-aware resumes. A stronger shot at getting hired.
                </h1>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  BorderlessCV helps early-career professionals turn scattered experience into recruiter-trustworthy resumes, tailored versions, and a cleaner application pipeline.
                </p>
              </div>
            </EntranceCard>
          </section>

          <section className="relative hidden overflow-hidden rounded-[42px] border border-white/10 bg-[linear-gradient(180deg,rgba(4,9,22,0.98),rgba(14,23,41,0.98))] p-8 text-white shadow-[0_36px_90px_rgba(15,23,42,0.26)] lg:block xl:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.02),transparent_58%)]" />
            <motion.div
              className="absolute -left-8 top-20 h-48 w-48 rounded-full bg-white/6 blur-3xl"
              animate={{ y: [0, -14, 0], x: [0, 8, 0] }}
              transition={{ duration: 10, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
            />
            <motion.div
              className="absolute bottom-10 right-8 h-64 w-64 rounded-full bg-emerald-100/8 blur-3xl"
              animate={{ y: [0, 12, 0], x: [0, -10, 0] }}
              transition={{ duration: 12, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
            />

            <div className="relative z-10">
              <motion.div initial="hidden" animate="visible" variants={staggerContainer(0.05, 0.1)}>
                <motion.div variants={fadeUp(16)}>
                  <Logo className="[&_span:first-child]:text-slate-300 [&_.serif-display]:text-white" />
                </motion.div>

                <motion.div className="mt-12 space-y-5" variants={fadeUp(18)}>
                  <Badge className="w-fit bg-white/8 text-slate-200 ring-1 ring-white/10">Recruiter-trustworthy resume system</Badge>
                  <h1 className="serif-display max-w-[12ch] text-[3.6rem] leading-[0.94] tracking-[-0.04em] text-white">
                    One trusted profile. Country-aware resumes. A better shot at getting hired.
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-slate-300">
                    BorderlessCV helps students and early-career professionals turn scattered achievements into recruiter-trustworthy resumes, tailored versions, and a clean application pipeline.
                  </p>
                </motion.div>

                <motion.div className="mt-8 flex flex-wrap gap-2.5" variants={fadeUp(18)}>
                  {authMarkets.map((market, index) => (
                    <motion.div
                      key={market}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.28, delay: 0.28 + index * 0.05 }}
                      whileHover={{ y: -2 }}
                    >
                      <Badge className="bg-white/7 px-3 py-1.5 text-slate-100 ring-1 ring-white/10">{market}</Badge>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div className="mt-10 grid gap-4 xl:grid-cols-3" variants={staggerContainer(0.12, 0.08)}>
                  {authBenefits.map((benefit) => {
                    const Icon = benefit.icon;

                    return (
                      <motion.div key={benefit.title} variants={fadeUp(16)}>
                        <HoverCard className="h-full">
                          <div className="auth-panel-card h-full rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
                            <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-white/8 text-white ring-1 ring-white/10">
                              <Icon className="h-5 w-5" />
                            </div>
                            <h3 className="mt-5 text-lg font-semibold text-white">{benefit.title}</h3>
                            <p className="mt-2 text-sm leading-7 text-slate-300">{benefit.description}</p>
                          </div>
                        </HoverCard>
                      </motion.div>
                    );
                  })}
                </motion.div>

                <motion.div className="mt-8 flex items-center gap-3 rounded-[28px] border border-white/10 bg-white/5 p-5 text-slate-200" variants={fadeUp(16)}>
                  <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-white text-slate-950">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">Built for low-experience candidates</p>
                    <p className="mt-1 text-sm leading-7 text-slate-300">
                      Projects, internships, leadership, volunteer work, and coursework are treated as real hiring evidence.
                    </p>
                  </div>
                </motion.div>

                <motion.div className="mt-8" variants={fadeUp(16)}>
                  <MotionButtonWrap className="w-fit">
                    <Button asChild variant="secondary" className="bg-white text-slate-950 shadow-[0_16px_30px_rgba(0,0,0,0.18)]">
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

          <section className="mx-auto w-full max-w-xl lg:max-w-none">{children}</section>
        </div>
      </PageIntro>
    </div>
  );
}
