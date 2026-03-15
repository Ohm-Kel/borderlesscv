import type { ReactNode } from "react";

import { Logo } from "@/components/shared/logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mesh-bg min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-4 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
        <section className="hidden rounded-[40px] bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(30,41,59,0.95))] p-10 text-white shadow-[0_40px_80px_rgba(15,23,42,0.18)] lg:block">
          <Logo className="[&_span:first-child]:text-slate-300 [&_.serif-display]:text-white" />
          <div className="mt-16 max-w-2xl">
            <p className="section-label !text-slate-300">Global-first career tooling</p>
            <h1 className="serif-display mt-4 text-5xl leading-tight">
              One trusted profile. Country-aware resumes. A better shot at getting hired.
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              BorderlessCV helps students and early-career professionals turn scattered achievements into recruiter-trustworthy resumes, tailored versions, and a clean application pipeline.
            </p>
          </div>
          <div className="mt-14 grid gap-4 sm:grid-cols-2">
            {[
              "ATS-friendly templates for Ghana, UK, US, Canada, Europe, and remote roles",
              "AI rewriting that only transforms user-provided facts",
              "Version control for resume tailoring across jobs and countries",
              "Application tracking and cover letters in the same product",
            ].map((item) => (
              <div key={item} className="rounded-[28px] border border-white/10 bg-white/5 p-5 text-sm leading-7 text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </section>
        <section className="mx-auto w-full max-w-xl">{children}</section>
      </div>
    </div>
  );
}
