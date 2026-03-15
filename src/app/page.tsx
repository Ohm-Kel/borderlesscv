"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Globe2, Layers3, ShieldCheck, Sparkles, Target } from "lucide-react";

import { FloatingAccent, HoverCard, MotionButtonWrap, PageIntro, Reveal } from "@/components/motion/motion-primitives";
import { Logo } from "@/components/shared/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fadeUp, staggerContainer } from "@/lib/motion";

const marketBadges = [
  { label: "Ghana", flag: "🇬🇭" },
  { label: "UK", flag: "🇬🇧" },
  { label: "US", flag: "🇺🇸" },
  { label: "Canada", flag: "🇨🇦" },
  { label: "Europe", flag: "🇪🇺" },
  { label: "Remote", flag: "🌐" },
] as const;

const workflowSteps = [
  {
    eyebrow: "Master profile",
    title: "Capture verified experience once",
    description: "Keep education, projects, internships, leadership, and skills in one grounded source of truth.",
  },
  {
    eyebrow: "Country-aware format",
    title: "Switch structure by target market",
    description: "Adapt section order, emphasis, and recruiter guidance for Ghana, the UK, the US, Canada, Europe, and remote roles.",
  },
  {
    eyebrow: "AI with guardrails",
    title: "Tailor each resume without inventing facts",
    description: "Sharpen bullets, summaries, and wording using only evidence that already exists in the profile.",
  },
  {
    eyebrow: "Application memory",
    title: "Track what you sent and what happened",
    description: "Keep resume versions, cover letters, deadlines, and follow-up status inside the same workflow.",
  },
] as const;

const trustSignals = [
  "2–3 polished templates, not a noisy template marketplace",
  "Built for students, graduates, and low-experience professionals",
  "Private by default — public profiles only when you opt in",
] as const;

const features = [
  {
    icon: Globe2,
    title: "Global-first resume guidance",
    description: "Country-aware defaults for Ghana, UK, US, Canada, Europe, and remote applications.",
  },
  {
    icon: Sparkles,
    title: "AI that stays factual",
    description: "Rewrite bullets, summaries, and cover letters without inventing achievements, tools, or metrics.",
  },
  {
    icon: Layers3,
    title: "Resume versioning built in",
    description: "Create tailored versions for jobs and markets while keeping one trusted master profile.",
  },
  {
    icon: Target,
    title: "Application tracking included",
    description: "Track resume versions, opportunities, and hiring stages from one private workspace.",
  },
] as const;

export default function HomePage() {
  return (
    <div className="mesh-bg relative min-h-screen overflow-hidden">
      <FloatingAccent className="left-[-8rem] top-24 h-80 w-80 bg-slate-950/7" duration={12} y={20} x={18} />
      <FloatingAccent className="right-[-5rem] top-40 h-96 w-96 bg-emerald-100/60" duration={14} y={18} x={12} />
      <FloatingAccent className="bottom-12 left-1/2 h-64 w-64 -translate-x-1/2 bg-slate-300/30" duration={16} y={14} x={16} />

      <PageIntro>
        <div className="mx-auto max-w-[1360px] px-4 py-4 sm:px-6 lg:px-8 lg:py-8">

          {/* ── Nav header ──────────────────────────────────────── */}
          <header className="surface-card relative flex flex-col gap-4 rounded-[36px] border border-white/75 px-4 py-4 backdrop-blur-xl sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/70 to-transparent" />
            <Logo className="min-w-0" />
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-end lg:w-auto">
              <MotionButtonWrap className="w-full sm:w-auto">
                <Button asChild variant="ghost" className="w-full sm:w-auto">
                  <Link href="/sign-in">Sign in</Link>
                </Button>
              </MotionButtonWrap>
              <MotionButtonWrap className="w-full sm:w-auto">
                <Button
                  asChild
                  className="w-full bg-slate-950 shadow-[0_16px_32px_rgba(15,23,42,0.20)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.26)] sm:w-auto"
                >
                  <Link href="/sign-up">Start free</Link>
                </Button>
              </MotionButtonWrap>
            </div>
          </header>

          {/* ── Main content ────────────────────────────────────── */}
          <main className="pb-16 pt-12 sm:pt-16 lg:pb-28 lg:pt-20">
            <section className="grid gap-10 xl:grid-cols-[minmax(0,1.04fr)_508px] xl:items-start xl:gap-8">

              {/* Left column — hero */}
              <div className="relative">
                <motion.div
                  className="space-y-9"
                  initial="hidden"
                  animate="visible"
                  variants={staggerContainer(0.08, 0.1)}
                >
                  <motion.div variants={fadeUp(16)}>
                    <Badge className="w-fit border border-slate-200 bg-white/85 px-4 py-2 text-slate-600 shadow-sm">
                      Resume builder · AI · Application tracker
                    </Badge>
                  </motion.div>

                  <motion.div className="space-y-6" variants={fadeUp(20)}>
                    <p className="section-label">Global resume operating system</p>
                    <h1 className="serif-display max-w-[11.6ch] text-[3.4rem] leading-[0.91] tracking-[-0.05em] text-slate-950 sm:text-[4.6rem] lg:text-[5.5rem] xl:text-[6.2rem]">
                      BorderlessCV helps early-career talent apply across borders with confidence.
                    </h1>
                    <p className="max-w-2xl text-[1.05rem] leading-[1.85] text-slate-500 sm:text-[1.1rem]">
                      Build one verified master profile, create country-aware resume versions, write grounded cover letters, and track applications without leaving the product.
                    </p>
                  </motion.div>

                  <motion.div className="flex flex-col gap-3 sm:flex-row" variants={fadeUp(18)}>
                    <MotionButtonWrap className="w-full sm:w-auto">
                      <Button
                        asChild
                        size="lg"
                        className="w-full bg-slate-950 shadow-[0_18px_38px_rgba(15,23,42,0.20)] hover:shadow-[0_24px_48px_rgba(15,23,42,0.28)] sm:w-auto"
                      >
                        <Link href="/sign-up">
                          Build your first resume
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </MotionButtonWrap>
                    <MotionButtonWrap className="w-full sm:w-auto">
                      <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
                        <Link href="#features">See how it works</Link>
                      </Button>
                    </MotionButtonWrap>
                  </motion.div>

                  {/* Country market pills */}
                  <motion.div className="flex flex-wrap gap-2" variants={fadeUp(20)}>
                    {marketBadges.map((badge, index) => (
                      <motion.div
                        key={badge.label}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.28, delay: 0.15 + index * 0.06 }}
                        whileHover={{ y: -3, scale: 1.03 }}
                      >
                        <Badge className="gap-1.5 border border-slate-200/90 bg-white/90 px-3.5 py-2 text-[0.78rem] font-medium text-slate-700 shadow-[0_2px_8px_rgba(15,23,42,0.05)] backdrop-blur-sm">
                          <span className="text-sm leading-none">{badge.flag}</span>
                          {badge.label}
                        </Badge>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Trust signals */}
                  <motion.div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" variants={fadeUp(18)}>
                    {trustSignals.map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-3 rounded-[26px] border border-white/75 bg-white/75 p-4 text-sm leading-[1.75] text-slate-600 shadow-[0_12px_32px_rgba(15,23,42,0.05)] backdrop-blur-xl"
                      >
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white">
                          <Check className="h-3 w-3 stroke-[2.5]" />
                        </div>
                        {item}
                      </div>
                    ))}
                  </motion.div>
                </motion.div>
              </div>

              {/* Right column — workflow steps card */}
              <Reveal distance={28} className="relative">
                <div className="absolute inset-0 -z-10 rounded-[42px] bg-white/40 blur-2xl" />
                <div className="relative overflow-hidden rounded-[42px] border border-white/80 bg-white/82 p-5 shadow-[0_32px_80px_rgba(15,23,42,0.09),0_2px_4px_rgba(15,23,42,0.04)] backdrop-blur-2xl sm:p-6 lg:p-8">
                  <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-100/50 via-white/20 to-transparent" />
                  <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-slate-200/60 to-transparent" />

                  <div className="relative flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <p className="section-label">Why it works</p>
                      <h2 className="max-w-[14ch] text-[1.6rem] font-semibold leading-tight tracking-[-0.02em] text-slate-950">
                        The hiring workflow, not just templates
                      </h2>
                      <p className="max-w-md text-sm leading-7 text-slate-500">
                        Premium execution for candidates who need clarity, credibility, and version control — not more clutter.
                      </p>
                    </div>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] border border-white/60 bg-slate-950 text-white shadow-[0_14px_30px_rgba(15,23,42,0.20)]">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                  </div>

                  <motion.div
                    className="relative mt-7 space-y-3"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={staggerContainer(0.08, 0.1)}
                  >
                    {/* Connecting line behind number circles */}
                    <div className="absolute left-[calc(1.25rem+20px)] top-[3.2rem] h-[calc(100%-4.8rem)] w-px bg-gradient-to-b from-slate-200 via-slate-200/60 to-transparent" />

                    {workflowSteps.map((step, index) => (
                      <motion.div key={step.title} variants={fadeUp(18)}>
                        <HoverCard hoverY={-4}>
                          <div className="rounded-[26px] border border-slate-200/70 bg-white/85 p-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)] backdrop-blur-sm transition-shadow duration-300 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-5">
                            <div className="flex items-start gap-4">
                              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] bg-slate-950 text-[0.8rem] font-bold text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]">
                                <span className="absolute inset-[1.5px] rounded-[14px] border border-white/10" />
                                {index + 1}
                              </div>
                              <div className="min-w-0 pt-0.5">
                                <p className="section-label">{step.eyebrow}</p>
                                <h3 className="mt-1.5 text-[0.975rem] font-semibold leading-snug text-slate-950">{step.title}</h3>
                                <p className="mt-1.5 text-[0.82rem] leading-[1.75] text-slate-500">{step.description}</p>
                              </div>
                            </div>
                          </div>
                        </HoverCard>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </Reveal>
            </section>

            {/* ── Divider ─────────────────────────────────────────── */}
            <Reveal className="my-14 sm:my-18 lg:my-22" amount={0.1}>
              <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-300/80 to-transparent" />
            </Reveal>

            {/* ── Features grid ───────────────────────────────────── */}
            <section id="features" className="space-y-10">
              <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl space-y-4">
                  <p className="section-label">Core product</p>
                  <h2 className="max-w-[13ch] text-[1.9rem] font-semibold leading-tight tracking-[-0.025em] text-slate-950 sm:text-[2.3rem] lg:text-[2.65rem]">
                    Built for getting hired, not just looking polished
                  </h2>
                </div>
                <div className="surface-card max-w-xl rounded-[30px] border border-white/75 p-5">
                  <p className="text-sm leading-7 text-slate-600">
                    One master profile, multiple country-aware resume versions, grounded AI assistance, and a lightweight application system that keeps every submission traceable.
                  </p>
                </div>
              </Reveal>

              <motion.div
                className="grid gap-5 md:grid-cols-2 xl:grid-cols-4"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.18 }}
                variants={staggerContainer(0.06, 0.08)}
              >
                {features.map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <motion.div key={feature.title} variants={fadeUp(18)}>
                      <HoverCard className="h-full">
                        <div className="group h-full rounded-[34px] border border-slate-200/60 bg-white/94 p-6 shadow-[0_16px_44px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-shadow duration-300 hover:shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
                          {/* Icon container with gradient top-light */}
                          <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-[20px] bg-slate-100 text-slate-700 transition-all duration-300 group-hover:bg-slate-950 group-hover:text-white group-hover:shadow-[0_10px_24px_rgba(15,23,42,0.22)]">
                            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent" />
                            <Icon className="relative h-5 w-5" />
                          </div>
                          <div className="mt-6 space-y-2.5">
                            <h3 className="text-[1.05rem] font-semibold leading-snug tracking-[-0.01em] text-slate-950">
                              {feature.title}
                            </h3>
                            <p className="text-[0.83rem] leading-[1.8] text-slate-500">{feature.description}</p>
                          </div>
                        </div>
                      </HoverCard>
                    </motion.div>
                  );
                })}
              </motion.div>
            </section>
          </main>
        </div>
      </PageIntro>
    </div>
  );
}
