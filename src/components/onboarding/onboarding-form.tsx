"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { LinkEditor } from "@/components/shared/profile-aux-editors";
import { TagEditor } from "@/components/shared/tag-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import type { LinkEntry } from "@/lib/validations/profile";

const countries = [
  { value: "GHANA", label: "Ghana" },
  { value: "UK", label: "UK" },
  { value: "USA", label: "US" },
  { value: "CANADA", label: "Canada" },
  { value: "EUROPE", label: "Europe" },
  { value: "REMOTE", label: "Remote" },
] as const;

const experienceLevels = [
  { value: "STUDENT", label: "Student" },
  { value: "GRADUATE", label: "Recent graduate" },
  { value: "EARLY_CAREER", label: "Early career" },
] as const;

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

  async function handleSubmit() {
    setPending(true);

    const response = await fetch("/api/onboarding", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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

  const progress = (step / 3) * 100;

  return (
    <Card className="overflow-hidden rounded-[34px] border-white/70 bg-white/90">
      <CardContent className="space-y-8 p-6 lg:p-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="accent">Step {step} of 3</Badge>
            <p className="text-sm text-slate-500">This creates your private master profile foundation.</p>
          </div>
          <Progress value={progress} />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Set up your BorderlessCV workspace</h1>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              Start with verified facts. You can tailor resume versions later without rewriting from scratch.
            </p>
          </div>
        </div>

        {step === 1 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Ama Mensah" />
            </div>
            <div className="space-y-2">
              <Label>Professional headline</Label>
              <Input value={form.headline} onChange={(event) => setForm((current) => ({ ...current, headline: event.target.value }))} placeholder="Entry-level data analyst" />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} placeholder="Accra, Ghana" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder="+233..." />
            </div>
            <div className="md:col-span-2">
              <LinkEditor items={form.links} onChange={(links) => setForm((current) => ({ ...current, links }))} title="Professional links" description="Add only links you are comfortable sharing on resumes and applications." />
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-6">
            <div>
              <Label>Target countries</Label>
              <p className="mt-1 text-sm text-slate-500">Country selection changes guidance, section priority, and formatting defaults.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {countries.map((country) => {
                  const selected = form.targetCountries.includes(country.value);
                  return (
                    <button
                      key={country.value}
                      type="button"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          targetCountries: selected
                            ? current.targetCountries.filter((item) => item !== country.value)
                            : [...current.targetCountries, country.value],
                        }))
                      }
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        selected ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {country.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <TagEditor
              label="Target roles"
              values={form.targetRoles}
              onChange={(targetRoles) => setForm((current) => ({ ...current, targetRoles }))}
              placeholder="Product analyst, frontend intern, operations associate..."
              helperText="Roles guide keyword tailoring and resume emphasis modes."
            />
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-5">
            <div>
              <Label>Experience level</Label>
              <p className="mt-1 text-sm text-slate-500">This helps BorderlessCV decide when education, projects, or skills should lead the resume.</p>
              <div className="mt-4 grid gap-3">
                {experienceLevels.map((option) => {
                  const selected = form.experienceLevel === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, experienceLevel: option.value }))}
                      className={`rounded-[24px] border px-5 py-4 text-left transition ${
                        selected ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="font-semibold">{option.label}</div>
                      <div className={`mt-1 text-sm leading-6 ${selected ? "text-slate-200" : "text-slate-500"}`}>
                        {option.value === "STUDENT"
                          ? "Prioritize education, coursework, student leadership, and projects."
                          : option.value === "GRADUATE"
                            ? "Balance internships, projects, and education for early-career relevance."
                            : "Bring work experience and proven execution higher in the layout."}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="rounded-[28px] bg-slate-100 p-5 text-sm leading-7 text-slate-600">
              BorderlessCV’s AI tools will only transform the facts you provide. They never invent achievements, dates, tools, or metrics.
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3">
          <Button type="button" variant="ghost" onClick={() => setStep((current) => Math.max(1, current - 1))} disabled={step === 1 || pending}>
            Back
          </Button>
          {step < 3 ? (
            <Button type="button" onClick={() => setStep((current) => Math.min(3, current + 1))}>
              Continue
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Finish onboarding
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
