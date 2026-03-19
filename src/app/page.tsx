"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Globe2, Layers3, ShieldCheck, Sparkles, Target } from "lucide-react";

import { FloatingAccent, HoverCard, MotionButtonWrap, PageIntro, Reveal } from "@/components/motion/motion-primitives";
import { Logo } from "@/components/shared/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { FloatingPaths } from "@/components/ui/background-paths";

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
  "2–3 polished templates, not a noisy marketplace",
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
    <div className="relative min-h-screen overflow-hidden bg-[var(--background)] transition-colors duration-500">
      <div className="absolute inset-0 z-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      <PageIntro className="relative z-10 block">
        <div className="mx-auto max-w-[1360px] px-4 py-4 sm:px-6 lg:px-8 lg:py-8">

          {/* ── Nav header ──────────────────────────────────────── */}
          <header className="surface-card relative flex flex-col gap-4 rounded-[36px] border border-[var(--border)] px-4 py-4 backdrop-blur-xl transition-all sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
            <Logo className="min-w-0" />
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-end lg:w-auto items-center">
              <ThemeToggle />
              <MotionButtonWrap className="w-full sm:w-auto">
                <Button asChild variant="ghost" className="w-full sm:w-auto">
                  <Link href="/sign-in">Sign in</Link>
                </Button>
              </MotionButtonWrap>
              <MotionButtonWrap className="w-full sm:w-auto">
                <Button
                  asChild
                  className="w-full font-bold sm:w-auto"
                >
                  <Link href="/sign-up">Start for free</Link>
                </Button>
              </MotionButtonWrap>
            </div>
          </header>

          {/* ── Main content ────────────────────────────────────── */}
          <main className="pb-16 pt-20 sm:pt-28 lg:pb-28 lg:pt-32">
            
            {/* ── Centered Hero ─────────────────────────────────────────── */}
            <section className="flex flex-col items-center relative text-center">
              <motion.div
                className="space-y-9 flex flex-col items-center max-w-4xl"
                initial="hidden"
                animate="visible"
                variants={staggerContainer(0.08, 0.1)}
              >
                <motion.div variants={fadeUp(16)}>
                  <Badge className="w-fit border border-[var(--border)] bg-[var(--muted)] px-4 py-2 text-[var(--muted-foreground)] shadow-sm backdrop-blur-md">
                    Resume builder · AI · Application tracker
                  </Badge>
                </motion.div>

                <motion.div className="space-y-6 flex flex-col items-center" variants={fadeUp(20)}>
                  <p className="section-label mx-auto">Global resume operating system</p>
                  <h1 className="serif-display max-w-[11.6ch] text-[3.4rem] leading-[0.91] tracking-[-0.05em] text-[var(--navy)] sm:text-[4.6rem] lg:text-[5.5rem] xl:text-[6.2rem]">
                    BorderlessCV helps early-career talent apply across borders.
                  </h1>
                  <p className="max-w-2xl text-[1.05rem] leading-[1.85] text-[var(--muted-foreground)] sm:text-[1.1rem]">
                    Build one verified master profile, create country-aware resume versions, write grounded cover letters, and track applications without leaving the product.
                  </p>
                </motion.div>

                <motion.div className="flex flex-col gap-3 sm:flex-row justify-center w-full" variants={fadeUp(18)}>
                  <MotionButtonWrap className="w-full sm:w-auto">
                    <Button
                      asChild
                      size="lg"
                      className="group w-full font-bold sm:w-auto"
                    >
                      <Link href="/sign-up">
                        Build your first resume
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </MotionButtonWrap>
                  <MotionButtonWrap className="w-full sm:w-auto">
                    <Button asChild size="lg" variant="ghost" className="w-full sm:w-auto">
                      <Link href="#features">See how it works</Link>
                    </Button>
                  </MotionButtonWrap>
                </motion.div>

                {/* Country market pills */}
                <motion.div className="flex flex-wrap justify-center gap-2 pt-4" variants={fadeUp(20)}>
                  {marketBadges.map((badge, index) => (
                    <motion.div
                      key={badge.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.28, delay: 0.15 + index * 0.06 }}
                      whileHover={{ y: -3, scale: 1.03 }}
                    >
                      <Badge className="gap-1.5 border border-[var(--primary)]/10 bg-[var(--accent-soft)] px-3.5 py-2 text-[0.78rem] font-medium text-[var(--primary)] shadow-[0_2px_8px_rgba(255,126,95,0.08)] backdrop-blur-sm">
                        <span className="text-sm leading-none">{badge.flag}</span>
                        {badge.label}
                      </Badge>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Trust signals */}
                <motion.div className="grid gap-3 sm:grid-cols-3 pt-6 w-full max-w-5xl" variants={fadeUp(18)}>
                  {trustSignals.map((item) => (
                    <div
                      key={item}
                      className="flex items-start text-left gap-3 rounded-[16px] border border-[var(--border)] bg-[var(--card)]/75 p-4 text-sm leading-[1.75] text-[var(--foreground)] shadow-[0_4px_12px_rgba(61,52,54,0.04)] backdrop-blur-xl transition-all"
                    >
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--primary)]">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                      {item}
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            </section>

            {/* ── Scroll Animation Section ──────────────────────────────────────── */}
            <section className="relative w-full z-20 -mt-10 lg:-mt-24 pointer-events-none md:pointer-events-auto">
              <div className="pointer-events-auto">
                <ContainerScroll
                  titleComponent={
                    <div className="space-y-4 mb-8">
                      <p className="section-label">Why it works</p>
                      <h2 className="text-[2.2rem] md:text-[3rem] font-semibold leading-tight tracking-[-0.02em] text-[var(--navy)] dark:text-white">
                        The hiring workflow, <br/> not just templates
                      </h2>
                    </div>
                  }
                >
                  <div className="relative h-full w-full overflow-hidden bg-white/95 dark:bg-[var(--card)] p-5 sm:p-8 flex flex-col items-center justify-center">
                    <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[var(--accent-soft)]/50 via-white/20 dark:via-transparent to-transparent" />
                    <div className="w-full max-w-3xl space-y-4">
                      {workflowSteps.map((step, index) => (
                        <div key={step.title}>
                          <HoverCard hoverY={-2}>
                            <div className="rounded-[16px] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[0_4px_12px_rgba(61,52,54,0.03)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(61,52,54,0.06)] sm:p-5">
                              <div className="flex items-start gap-4">
                                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-[0.85rem] font-bold text-white shadow-sm">
                                  {index + 1}
                                </div>
                                <div className="min-w-0 pt-0.5 text-left">
                                  <p className="section-label hidden sm:block">{step.eyebrow}</p>
                                  <h3 className="mt-1.5 text-[0.975rem] font-semibold leading-snug text-[var(--navy)]">{step.title}</h3>
                                  <p className="mt-1.5 text-[0.82rem] leading-[1.75] text-[var(--muted-foreground)]">{step.description}</p>
                                </div>
                              </div>
                            </div>
                          </HoverCard>
                        </div>
                      ))}
                    </div>
                  </div>
                </ContainerScroll>
              </div>
            </section>

            {/* ── Divider ─────────────────────────────────────────── */}
            <Reveal className="my-14 sm:my-18 lg:my-22" amount={0.1}>
              <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-300/80 dark:via-slate-700/80 to-transparent" />
            </Reveal>

            {/* ── Features grid ───────────────────────────────────── */}
            <section id="features" className="space-y-10 relative z-10 max-w-6xl mx-auto">
              <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between px-4 sm:px-0">
                <div className="max-w-3xl space-y-4">
                  <p className="section-label">Core product</p>
                  <h2 className="max-w-[13ch] text-[1.9rem] font-semibold leading-tight tracking-[-0.025em] text-[var(--navy)] dark:text-white sm:text-[2.3rem] lg:text-[2.65rem]">
                    Built for getting hired, not just looking polished
                  </h2>
                </div>
                <div className="surface-card max-w-xl p-5">
                  <p className="text-sm leading-7 text-[var(--muted-foreground)]">
                    One master profile, multiple country-aware resume versions, grounded AI assistance, and a lightweight application system that keeps every submission traceable.
                  </p>
                </div>
              </Reveal>

              <motion.div
                className="grid gap-5 px-4 sm:px-0 md:grid-cols-2 xl:grid-cols-4"
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
                        <div className="group h-full rounded-[16px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm transition-all duration-300 hover:shadow-[0_8px_24px_rgba(255,126,95,0.10)]">
                          {/* Icon container with hover state */}
                          <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-[12px] bg-[var(--muted)] text-[var(--muted-foreground)] transition-all duration-300 group-hover:bg-[var(--accent-soft)] group-hover:text-[var(--primary)] group-hover:shadow-[0_4px_12px_rgba(255,126,95,0.20)]">
                            <Icon className="relative h-5 w-5" />
                          </div>
                          <div className="mt-6 space-y-2.5">
                            <h3 className="text-[1.05rem] font-semibold leading-snug tracking-[-0.01em] text-[var(--navy)]">
                              {feature.title}
                            </h3>
                            <p className="text-[0.83rem] leading-[1.8] text-[var(--muted-foreground)]">{feature.description}</p>
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
