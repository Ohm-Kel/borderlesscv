import Link from "next/link";
import { ArrowRight, Globe2, Layers3, ShieldCheck, Sparkles, Target } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const workflowSteps = [
  {
    label: "Master profile",
    title: "Capture verified experience once",
    description: "Keep education, projects, internships, leadership, and skills in one factual source of truth.",
  },
  {
    label: "Country logic",
    title: "Switch format by target market",
    description: "Adjust structure and guidance for Ghana, UK, US, Canada, Europe, and remote applications.",
  },
  {
    label: "Tailored versions",
    title: "Match each role without inventing facts",
    description: "Rewrite, reorder, and export job-specific resume versions while preserving the underlying truth.",
  },
  {
    label: "Application tracking",
    title: "Track what you sent and what happened",
    description: "Keep resume versions, cover letters, deadlines, and follow-ups in the same workspace.",
  },
] as const;

const valueProps = [
  "2-3 polished templates, not a noisy template marketplace",
  "Built for students, graduates, and low-experience applicants",
  "Private by default, with opt-in public profiles only",
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

const marketLabels = ["Ghana", "United Kingdom", "United States", "Canada", "Europe", "Remote"] as const;

export default function HomePage() {
  return (
    <div className="mesh-bg min-h-screen">
      <div className="mx-auto max-w-[1320px] px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
        <header className="surface-card flex flex-col gap-4 rounded-[32px] border border-white/70 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-7">
          <Logo className="min-w-0" />
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-end lg:w-auto">
            <Button asChild variant="ghost" className="w-full sm:w-auto">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/sign-up">Start free</Link>
            </Button>
          </div>
        </header>

        <section className="grid gap-8 pb-10 pt-10 md:gap-10 xl:grid-cols-[minmax(0,1.08fr)_430px] xl:items-start xl:pt-16">
          <div className="space-y-8">
            <Badge className="w-fit border border-slate-200 bg-white/85 text-slate-700 shadow-sm">
              Resume builder + AI + application tracker
            </Badge>

            <div className="space-y-6">
              <div className="space-y-3">
                <p className="section-label">Global resume operating system</p>
                <h1 className="serif-display balance-text max-w-[12ch] text-[3.4rem] leading-[0.92] tracking-[-0.04em] text-slate-950 sm:text-[4.4rem] lg:text-[5.35rem] xl:text-[6rem]">
                  BorderlessCV helps early-career talent apply across borders with confidence.
                </h1>
              </div>

              <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Build one verified master profile, generate ATS-friendly resume versions for different countries and jobs, write grounded cover letters, and track applications without leaving the product.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/sign-up">
                  Build your first resume
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
                <Link href="#features">See how it works</Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {valueProps.map((item) => (
                <div key={item} className="rounded-[26px] bg-white/85 p-5 text-sm leading-7 text-slate-600 shadow-sm ring-1 ring-white/70">
                  {item}
                </div>
              ))}
            </div>

            <div className="surface-card rounded-[32px] border border-white/70 p-5 sm:p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-xl">
                  <p className="section-label">Designed for real applications</p>
                  <p className="mt-3 text-base leading-8 text-slate-600">
                    BorderlessCV is structured for recruiter trust: clear chronology, grounded AI help, export-ready resumes, and one place to manage the entire application workflow.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {marketLabels.map((market) => (
                    <Badge key={market} className="border border-slate-200 bg-slate-950 px-3 py-1.5 text-white">
                      {market}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Card className="overflow-hidden rounded-[36px] bg-white/92">
            <CardContent className="space-y-6 p-5 sm:p-6 lg:p-7">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <p className="section-label">Why it works</p>
                  <h2 className="max-w-[13ch] text-3xl font-semibold leading-tight text-slate-950">
                    The hiring workflow, not just templates
                  </h2>
                  <p className="text-sm leading-7 text-slate-500">
                    A focused system for early-career applicants who need stronger positioning, not more template noise.
                  </p>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] bg-slate-950 text-white">
                  <ShieldCheck className="h-6 w-6" />
                </div>
              </div>

              <div className="space-y-3">
                {workflowSteps.map((step, index) => (
                  <div key={step.title} className="rounded-[26px] border border-slate-200 bg-slate-50/90 p-4 sm:p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="section-label">{step.label}</p>
                        <h3 className="mt-2 text-lg font-semibold text-slate-950">{step.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-slate-600">{step.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-[26px] bg-slate-950 p-5 text-white">
                  <p className="section-label !text-slate-300">Guardrails</p>
                  <p className="mt-3 text-base leading-7">
                    AI only rewrites from facts you already provided. When proof is thin, the app keeps the language modest.
                  </p>
                </div>
                <div className="rounded-[26px] border border-slate-200 bg-white p-5">
                  <p className="section-label">Built for low-experience users</p>
                  <p className="mt-3 text-base leading-7 text-slate-600">
                    Projects, internships, school leadership, volunteer work, and certifications are treated as real hiring evidence.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="features" className="space-y-8 pb-14 pt-4 sm:pb-20 lg:pt-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <p className="section-label">Core product</p>
              <h2 className="max-w-[14ch] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl lg:text-[2.7rem]">
                Built for getting hired, not just looking polished
              </h2>
            </div>
            <div className="surface-card max-w-xl rounded-[28px] border border-white/70 p-5">
              <p className="text-sm leading-7 text-slate-600">
                Keep one factual profile, generate job-specific resume versions, export polished PDFs, and manage application follow-through in the same product.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="h-full rounded-[32px] bg-white/92">
                  <CardContent className="flex h-full flex-col space-y-5 p-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-slate-100 text-slate-900">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-[1.35rem] font-semibold leading-tight text-slate-950">{feature.title}</h3>
                      <p className="text-sm leading-7 text-slate-600">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
