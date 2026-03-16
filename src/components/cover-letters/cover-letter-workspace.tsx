"use client";

import { useMemo, useState } from "react";
import { Copy, Loader2, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
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
  const [showJobDescription, setShowJobDescription] = useState(false);
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

  async function copyLetter(content: string) {
    await navigator.clipboard.writeText(content);
    toast.success("Cover letter copied");
  }

  function loadLetter(letter: (typeof letters)[number]) {
    setForm((current) => ({
      ...current,
      title: letter.title,
      companyName: letter.companyName || "",
      jobTitle: letter.jobTitle || "",
      content: letter.content,
    }));
    toast.success("Draft loaded into editor");
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <section className="surface-card flex h-[56px] items-center justify-between gap-4 rounded-[24px] border border-white/75 px-4 shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-700">
            Cover letter workspace. Draft letters from verified resume facts and reuse them per application.
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500">
          {letters.length} draft{letters.length === 1 ? "" : "s"}
        </span>
      </section>

      <div className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="min-h-0 rounded-[26px] bg-white">
          <CardContent className="flex h-full min-h-0 flex-col p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="section-label">Editor</p>
                <h2 className="mt-1 text-[1.05rem] font-semibold text-slate-950">Draft from verified facts</h2>
              </div>
              {selectedVersion ? (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
                  {selectedVersion.country}
                </span>
              ) : null}
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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

            <div className="mt-3 rounded-[20px] border border-slate-200 bg-slate-50/70">
              <button
                type="button"
                onClick={() => setShowJobDescription((current) => !current)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <span className="text-sm font-medium text-slate-700">Job description</span>
                <span className="text-xs font-semibold text-slate-500">{showJobDescription ? "Hide" : "Show"}</span>
              </button>
              {showJobDescription ? (
                <div className="border-t border-slate-200 px-4 pb-4 pt-3">
                  <Field label="Paste the role requirements">
                    <Textarea
                      value={form.jobDescription}
                      onChange={(event) => setForm((current) => ({ ...current, jobDescription: event.target.value }))}
                      className="min-h-[130px]"
                    />
                  </Field>
                </div>
              ) : null}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Button variant="secondary" onClick={generateLetter} disabled={generating}>
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate
              </Button>
              <Button onClick={saveLetter} disabled={saving || !form.content.trim()}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </Button>
              <Button variant="ghost" onClick={() => copyLetter(form.content)} disabled={!form.content.trim()}>
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </div>

            <div className="mt-4 min-h-0 flex-1">
              <Field label="Content">
                <Textarea
                  value={form.content}
                  onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                  className="h-[calc(100vh-342px)] min-h-[260px]"
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card className="min-h-0 rounded-[26px] bg-white">
          <CardContent className="flex h-full min-h-0 flex-col p-0">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3.5">
              <div>
                <p className="section-label">Saved drafts</p>
                <h2 className="mt-1 text-[1.05rem] font-semibold text-slate-950">Reusable letters</h2>
              </div>
            </div>

            {letters.length === 0 ? (
              <div className="m-4 rounded-[22px] border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center text-sm text-slate-500">
                No cover letters saved yet.
              </div>
            ) : (
              <div className="flex h-[calc(100%-78px)] min-h-0 flex-col">
                <div className="hidden grid-cols-[minmax(0,1.35fr)_1fr_0.8fr_0.95fr] gap-4 border-b border-slate-200 px-4 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-500 lg:grid">
                  <span>Title</span>
                  <span>Role</span>
                  <span>Created</span>
                  <span className="text-right">Actions</span>
                </div>
                <ScrollArea className="min-h-0 flex-1">
                  <div className="divide-y divide-slate-200">
                    {letters.map((letter) => (
                      <div key={letter.id} className="px-4 py-3">
                        <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1.35fr)_1fr_0.8fr_0.95fr] lg:items-center lg:gap-4">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-950">{letter.title}</p>
                            <p className="truncate text-xs text-slate-400">{letter.companyName || "No company set"}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm text-slate-700">{letter.jobTitle || "Role not set"}</p>
                            <p className="line-clamp-1 text-xs text-slate-400">{letter.content}</p>
                          </div>
                          <p className="text-sm text-slate-600">{formatDate(letter.createdAt, "MMM d, yyyy")}</p>
                          <div className="flex items-center gap-2 lg:justify-end">
                            <Button size="sm" variant="secondary" onClick={() => loadLetter(letter)}>
                              Use
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => copyLetter(letter.content)}>
                              <Copy className="h-4 w-4" />
                              Copy
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>
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
