import Link from "next/link";
import { ArrowRight, Globe2, Layers3, ShieldCheck, Sparkles, Target } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getServerAuthSession } from "@/lib/auth";

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
];

export default async function HomePage() {
  const session = await getServerAuthSession();

  return (
    <div className="mesh-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
        <header className="surface-card flex items-center justify-between rounded-[32px] border border-white/70 px-5 py-4 lg:px-7">
          <Logo />
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost">
              <Link href={session?.user ? "/dashboard" : "/sign-in"}>{session?.user ? "Dashboard" : "Sign in"}</Link>
            </Button>
            <Button asChild>
              <Link href={session?.user ? "/resumes" : "/sign-up"}>
                {session?.user ? "Open builder" : "Start free"}
              </Link>
            </Button>
          </div>
        </header>

        <section className="grid gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div className="space-y-8">
            <Badge variant="accent" className="w-fit">
              Resume builder + AI + application tracker
            </Badge>
            <div className="space-y-5">
              <h1 className="serif-display balance-text max-w-4xl text-5xl leading-tight text-slate-950 lg:text-7xl">
                BorderlessCV helps early-career talent apply across borders with confidence.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Build one verified master profile, generate ATS-friendly resume versions for different countries and jobs, write grounded cover letters, and track applications without leaving the product.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href={session?.user ? "/dashboard" : "/sign-up"}>
                  Build your first resume
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="#features">See how it works</Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                "2-3 polished templates, not a noisy template marketplace",
                "Better support for students, graduates, and low-experience candidates",
                "Private by default with opt-in public profiles",
              ].map((item) => (
                <div key={item} className="rounded-[24px] bg-white/80 p-4 text-sm leading-7 text-slate-600 shadow-sm ring-1 ring-white/70">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <Card className="rounded-[40px] bg-white/90">
            <CardContent className="space-y-5 p-6 lg:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="section-label">Why it works</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">The hiring workflow, not just templates</h2>
                </div>
                <ShieldCheck className="h-8 w-8 text-[var(--accent)]" />
              </div>
              <div className="space-y-4">
                {[
                  "Capture personal details, education, internships, projects, leadership, awards, skills, languages, and links in one master profile.",
                  "Create base resumes for different target countries, then duplicate and tailor versions to specific job descriptions.",
                  "Use AI to sharpen phrasing from your own facts only. When proof is thin, BorderlessCV keeps the language modest.",
                  "Generate cover letters and track application status without losing which version you used.",
                ].map((item, index) => (
                  <div key={item} className="flex gap-4 rounded-[24px] border border-slate-100 bg-slate-50/80 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">{index + 1}</div>
                    <p className="text-sm leading-7 text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="features" className="space-y-6 py-8 lg:py-12">
          <div className="space-y-3">
            <p className="section-label">Core product</p>
            <h2 className="text-3xl font-semibold text-slate-950 lg:text-4xl">Built for getting hired, not just looking polished</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="rounded-[32px] bg-white/90">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-800">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{feature.description}</p>
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
