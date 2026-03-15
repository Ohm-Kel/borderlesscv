"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Award, Briefcase, Check, CircleHelp, GraduationCap, Loader2, MoveRight } from "lucide-react";
import { toast } from "sonner";

import { LinkEditor } from "@/components/shared/profile-aux-editors";
import { TagEditor } from "@/components/shared/tag-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { LinkEntry } from "@/lib/validations/profile";

const countries = [
  { value: "GHANA", label: "Ghana", flag: "🇬🇭" },
  { value: "UK", label: "UK", flag: "🇬🇧" },
  { value: "USA", label: "US", flag: "🇺🇸" },
  { value: "CANADA", label: "Canada", flag: "🇨🇦" },
  { value: "EUROPE", label: "Europe", flag: "🇪🇺" },
  { value: "REMOTE", label: "Remote", flag: "🌐" },
] as const;

const experienceLevels = [
  {
    value: "STUDENT",
    label: "Student",
    description: "Prioritize education, coursework, student leadership, and projects.",
    icon: GraduationCap,
  },
  {
    value: "GRADUATE",
    label: "Recent graduate",
    description: "Balance internships, projects, and education for early-career relevance.",
    icon: Award,
  },
  {
    value: "EARLY_CAREER",
    label: "Early career",
    description: "Bring work experience and proven execution higher in the layout.",
    icon: Briefcase,
  },
] as const;

const onboardingSteps = [
  { number: 1, title: "Your identity", description: "Name, headline, location, and contact links." },
  { number: 2, title: "Target markets", description: "Countries and roles you're applying to." },
  { number: 3, title: "Career stage", description: "How your resume should prioritize sections." },
] as const;

const stepHeadings = [
  {
    eyebrow: "Step 1 of 3",
    title: "Let's build your foundation",
    description: "Start with verified facts. You can tailor resume versions later without rewriting from scratch.",
  },
  {
    eyebrow: "Step 2 of 3",
    title: "Where are you applying?",
    description: "Country selection changes guidance, section priority, and formatting defaults.",
  },
  {
    eyebrow: "Step 3 of 3",
    title: "Where are you in your career?",
    description: "This helps BorderlessCV decide when education, projects, or skills should lead your resume.",
  },
] as const;

const customHeadlineValue = "__OTHER__";

const professionalHeadlineOptions = [
  "Internship candidate",
  "Graduate trainee",
  "Entry-level data analyst",
  "Entry-level software engineer",
  "Junior frontend developer",
  "Junior backend developer",
  "Junior full-stack developer",
  "Product analyst",
  "Business analyst",
  "Operations associate",
  "Project coordinator",
  "Marketing associate",
  "Customer success associate",
  "Research assistant",
  "UI/UX designer",
  "Administrative assistant",
] as const;

const professionalHeadlineOptionSet = new Set<string>(professionalHeadlineOptions);

export function OnboardingForm({
  initialData,
}: {
  initialData: {
    name: string;
    headline: string;
    location: string;
    phone: string;
    links: LinkEntry[];
    targetCountries: string[];
    targetRoles: string[];
    experienceLevel: "STUDENT" | "GRADUATE" | "EARLY_CAREER";
  };
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState(initialData);
  const [headlineSelection, setHeadlineSelection] = useState<string>(() => {
    if (!initialData.headline) {
      return "";
    }

    return professionalHeadlineOptionSet.has(initialData.headline) ? initialData.headline : customHeadlineValue;
  });
  const [customHeadline, setCustomHeadline] = useState(() => {
    if (!initialData.headline || professionalHeadlineOptionSet.has(initialData.headline)) {
      return "";
    }

    return initialData.headline;
  });

  function handleHeadlineSelectionChange(value: string) {
    setHeadlineSelection(value);

    if (value === customHeadlineValue) {
      const nextCustomHeadline = customHeadline || form.headline;
      setCustomHeadline(nextCustomHeadline);
      setForm((current) => ({ ...current, headline: nextCustomHeadline }));
      return;
    }

    setForm((current) => ({ ...current, headline: value }));
  }

  async function handleSubmit() {
    setPending(true);

    const response = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const payload = await response.json();
    setPending(false);

    if (!response.ok) {
      toast.error("Could not save onboarding", {
        description: typeof payload.error === "string" ? payload.error : "Please review the form and try again.",
      });
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  const currentHeading = stepHeadings[step - 1];

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:items-start">

      {/* ── Step indicator sidebar (desktop) ────────────────── */}
      <div className="hidden lg:block">
        <div className="rounded-[32px] border border-white/75 bg-white/80 p-6 shadow-[0_16px_44px_rgba(15,23,42,0.07)] backdrop-blur-xl">
          <p className="section-label mb-5">Setup progress</p>
          <div>
            {onboardingSteps.map((s, index) => {
              const isCompleted = step > s.number;
              const isActive = step === s.number;
              const isPending = step < s.number;

              return (
                <div key={s.number} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-300",
                        isCompleted && "bg-emerald-500 text-white shadow-[0_6px_16px_rgba(16,185,129,0.30)]",
                        isActive && "bg-slate-950 text-white shadow-[0_6px_16px_rgba(15,23,42,0.22)]",
                        isPending && "bg-slate-100 text-slate-400",
                      )}
                    >
                      {isCompleted ? <Check className="h-4 w-4 stroke-[2.5]" /> : s.number}
                    </div>
                    {index < onboardingSteps.length - 1 && (
                      <div
                        className={cn(
                          "mt-1 w-px transition-colors duration-500",
                          isCompleted ? "bg-emerald-300" : "bg-slate-200",
                        )}
                        style={{ height: "2.75rem" }}
                      />
                    )}
                  </div>
                  <div className={cn("pb-9 pt-1 transition-opacity duration-300", isPending && "opacity-45")}>
                    <p className={cn("text-sm font-semibold", isActive ? "text-slate-950" : "text-slate-600")}>
                      {s.title}
                    </p>
                    <p className="mt-0.5 text-[0.76rem] leading-[1.7] text-slate-400">{s.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Form card ───────────────────────────────────────── */}
      <Card className="overflow-hidden rounded-[36px] border-white/80 bg-white/94 shadow-[0_28px_72px_rgba(15,23,42,0.10)]">
        <CardContent className="space-y-8 p-7 lg:p-9">

          {/* Step header */}
          <div className="space-y-3">
            <p className="section-label">{currentHeading.eyebrow}</p>
            <h2 className="text-[1.65rem] font-semibold leading-tight tracking-[-0.025em] text-slate-950">
              {currentHeading.title}
            </h2>
            <p className="text-[0.87rem] leading-[1.8] text-slate-500">{currentHeading.description}</p>

            {/* Mobile step bar */}
            <div className="flex gap-2 pt-1 lg:hidden">
              {onboardingSteps.map((s) => (
                <div
                  key={s.number}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-all duration-300",
                    step > s.number ? "bg-emerald-500" : step === s.number ? "bg-slate-950" : "bg-slate-200",
                  )}
                />
              ))}
            </div>
          </div>

          {/* ── Step 1: Identity ──────────────────────────────── */}
          {step === 1 && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Full name
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
                  placeholder="Ama Mensah"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <span>Professional headline</span>
                  <span className="group relative inline-flex">
                    <button
                      type="button"
                      className="inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-400 transition-colors hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-200"
                      aria-label="What is a professional headline?"
                    >
                      <CircleHelp className="h-3.5 w-3.5" />
                    </button>
                    <span className="pointer-events-none invisible absolute left-full top-1/2 z-20 ml-3 w-64 -translate-y-1/2 rounded-[18px] border border-slate-200 bg-white/95 px-3.5 py-3 text-[0.74rem] font-normal normal-case tracking-normal text-slate-600 opacity-0 shadow-[0_14px_32px_rgba(15,23,42,0.10)] transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                      A professional headline is the short role description that sits below your name on a resume, for example
                      {" "}
                      <span className="font-medium text-slate-950">Entry-level data analyst</span>.
                    </span>
                  </span>
                </Label>
                <div className="space-y-3">
                  <Select value={headlineSelection || undefined} onValueChange={handleHeadlineSelectionChange}>
                    <SelectTrigger id="headline" className="h-12 rounded-[20px] border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                      <SelectValue placeholder="Choose a headline that fits you best" />
                    </SelectTrigger>
                    <SelectContent>
                      {professionalHeadlineOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                      <SelectItem value={customHeadlineValue}>Other (write my own)</SelectItem>
                    </SelectContent>
                  </Select>
                  {headlineSelection === customHeadlineValue ? (
                    <Input
                      value={customHeadline}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCustomHeadline(value);
                        setForm((current) => ({ ...current, headline: value }));
                      }}
                      placeholder="Write your own headline"
                    />
                  ) : null}
                  <p className="text-[0.76rem] leading-[1.7] text-slate-400">
                    Pick the closest role label for now. You can refine it later in your profile.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Location
                </Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => setForm((c) => ({ ...c, location: e.target.value }))}
                  placeholder="Accra, Ghana"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm((c) => ({ ...c, phone: e.target.value }))}
                  placeholder="+233..."
                />
              </div>
              <div className="md:col-span-2">
                <LinkEditor
                  items={form.links}
                  onChange={(links) => setForm((c) => ({ ...c, links }))}
                  title="Professional links"
                  description="Add only links you are comfortable sharing on resumes and applications."
                />
              </div>
            </div>
          )}

          {/* ── Step 2: Target markets ────────────────────────── */}
          {step === 2 && (
            <div className="space-y-7">
              <div className="space-y-4">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Target countries
                </p>
                <div className="flex flex-wrap gap-3">
                  {countries.map((country) => {
                    const selected = form.targetCountries.includes(country.value);
                    return (
                      <button
                        key={country.value}
                        type="button"
                        onClick={() =>
                          setForm((c) => ({
                            ...c,
                            targetCountries: selected
                              ? c.targetCountries.filter((v) => v !== country.value)
                              : [...c.targetCountries, country.value],
                          }))
                        }
                        className={cn(
                          "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                          selected
                            ? "bg-slate-950 text-white shadow-[0_8px_20px_rgba(15,23,42,0.20)]"
                            : "bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-slate-300 hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)]",
                        )}
                      >
                        <span className="text-base leading-none">{country.flag}</span>
                        {country.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <TagEditor
                label="Target roles"
                values={form.targetRoles}
                onChange={(targetRoles) => setForm((c) => ({ ...c, targetRoles }))}
                placeholder="Product analyst, frontend intern, operations associate..."
                helperText="Roles guide keyword tailoring and resume emphasis modes."
              />
            </div>
          )}

          {/* ── Step 3: Experience level ──────────────────────── */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="grid gap-3">
                {experienceLevels.map((option) => {
                  const selected = form.experienceLevel === option.value;
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setForm((c) => ({ ...c, experienceLevel: option.value }))}
                      className={cn(
                        "flex items-start gap-4 rounded-[24px] border px-5 py-4 text-left transition-all duration-200",
                        selected
                          ? "border-slate-950 bg-slate-950 text-white shadow-[0_12px_32px_rgba(15,23,42,0.20)]"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:shadow-[0_6px_18px_rgba(15,23,42,0.07)]",
                      )}
                    >
                      <div
                        className={cn(
                          "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px]",
                          selected ? "bg-white/15" : "bg-slate-100",
                        )}
                      >
                        <Icon className={cn("h-5 w-5", selected ? "text-white" : "text-slate-600")} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold">{option.label}</p>
                        <p className={cn("mt-0.5 text-[0.82rem] leading-[1.7]", selected ? "text-slate-300" : "text-slate-500")}>
                          {option.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* AI guarantee note */}
              <div className="flex items-start gap-3 rounded-[20px] border border-slate-200/70 bg-slate-50/80 px-4 py-3.5">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white">
                  <Check className="h-3 w-3 stroke-[2.5]" />
                </div>
                <p className="text-[0.8rem] leading-[1.75] text-slate-600">
                  BorderlessCV&apos;s AI tools will only transform the facts you provide. They never invent achievements, dates, tools, or metrics.
                </p>
              </div>
            </div>
          )}

          {/* ── Navigation ────────────────────────────────────── */}
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep((c) => Math.max(1, c - 1))}
              disabled={step === 1 || pending}
              className="text-slate-500"
            >
              Back
            </Button>
            {step < 3 ? (
              <Button
                type="button"
                className="bg-slate-950 shadow-[0_14px_28px_rgba(15,23,42,0.18)] hover:shadow-[0_18px_36px_rgba(15,23,42,0.24)]"
                onClick={() => setStep((c) => Math.min(3, c + 1))}
              >
                Continue
                <MoveRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                className="bg-slate-950 shadow-[0_14px_28px_rgba(15,23,42,0.18)] hover:shadow-[0_18px_36px_rgba(15,23,42,0.24)]"
                onClick={handleSubmit}
                disabled={pending}
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoveRight className="h-4 w-4" />}
                Finish setup
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
