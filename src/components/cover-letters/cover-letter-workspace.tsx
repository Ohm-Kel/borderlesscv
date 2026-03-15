"use client";

import { useMemo, useState } from "react";
import { Loader2, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ResumeDocument } from "@/lib/validations/resume";

type VersionOption = {
  id: string;
  label: string;
  country: "GHANA" | "UK" | "USA" | "CANADA" | "EUROPE" | "REMOTE";
  content: ResumeDocument;
};

function collectFacts(document: ResumeDocument) {
  return [
    document.summary,
    ...document.sections.experience.flatMap((item) => [item.title, item.organization, item.description, ...item.bullets]),
    ...document.sections.internships.flatMap((item) => [item.title, item.organization, item.description, ...item.bullets]),
    ...document.sections.projects.flatMap((item) => [item.title, item.organization, item.description, ...item.bullets]),
    ...document.sections.education.flatMap((item) => [item.title, item.organization, item.description, ...item.bullets]),
    ...document.sections.skills,
  ].filter(Boolean);
}

export function CoverLetterWorkspace({
  versionOptions,
  initialLetters,
}: {
  versionOptions: VersionOption[];
  initialLetters: Array<{
    id: string;
    title: string;
    companyName: string | null;
    jobTitle: string | null;
    content: string;
    createdAt: string;
  }>;
}) {
  const [letters, setLetters] = useState(initialLetters);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    resumeVersionId: versionOptions[0]?.id || "",
    title: "Tailored Cover Letter",
    companyName: "",
    jobTitle: "",
    jobDescription: "",
    content: "",
  });

  const selectedVersion = useMemo(
    () => versionOptions.find((version) => version.id === form.resumeVersionId) ?? versionOptions[0],
    [form.resumeVersionId, versionOptions],
  );

  async function generateLetter() {
    if (!selectedVersion) {
      return;
    }

    setGenerating(true);
    const response = await fetch("/api/ai/cover-letter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        facts: collectFacts(selectedVersion.content).slice(0, 30),
        companyName: form.companyName,
        jobTitle: form.jobTitle,
        jobDescription: form.jobDescription,
        country: selectedVersion.country,
      }),
    });
    const payload = await response.json();
    setGenerating(false);

    if (!response.ok) {
      toast.error("Could not generate cover letter");
      return;
    }

    setForm((current) => ({ ...current, content: payload.content }));
  }

  async function saveLetter() {
    setSaving(true);
    const response = await fetch("/api/cover-letters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const payload = await response.json();
    setSaving(false);

    if (!response.ok) {
      toast.error("Could not save cover letter");
      return;
    }

    setLetters((current) => [
      {
        id: payload.coverLetterId,
        title: form.title,
        companyName: form.companyName || null,
        jobTitle: form.jobTitle || null,
        content: form.content,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    toast.success("Cover letter saved");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <Card className="rounded-[32px] bg-white">
        <CardContent className="space-y-4 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Resume version">
              <Select value={form.resumeVersionId} onValueChange={(value) => setForm((current) => ({ ...current, resumeVersionId: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {versionOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Title">
              <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            </Field>
            <Field label="Company">
              <Input value={form.companyName} onChange={(event) => setForm((current) => ({ ...current, companyName: event.target.value }))} />
            </Field>
            <Field label="Job title">
              <Input value={form.jobTitle} onChange={(event) => setForm((current) => ({ ...current, jobTitle: event.target.value }))} />
            </Field>
          </div>
          <Field label="Job description">
            <Textarea value={form.jobDescription} onChange={(event) => setForm((current) => ({ ...current, jobDescription: event.target.value }))} className="min-h-[180px]" />
          </Field>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={generateLetter} disabled={generating}>
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate from verified facts
            </Button>
            <Button onClick={saveLetter} disabled={saving || !form.content.trim()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save cover letter
            </Button>
          </div>
          <Field label="Content">
            <Textarea value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} className="min-h-[420px]" />
          </Field>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {letters.map((letter) => (
          <Card key={letter.id} className="rounded-[28px] bg-white">
            <CardContent className="space-y-3 p-5">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">{letter.title}</h3>
                <p className="text-sm text-slate-500">
                  {letter.jobTitle || "Role not set"} {letter.companyName ? `• ${letter.companyName}` : ""}
                </p>
              </div>
              <p className="line-clamp-6 text-sm leading-7 text-slate-600 whitespace-pre-wrap">{letter.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
