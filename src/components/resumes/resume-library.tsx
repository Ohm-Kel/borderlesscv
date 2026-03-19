"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Copy, FileText, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { EMPHASIS_MODE_OPTIONS, RESUME_TEMPLATE_OPTIONS } from "@/lib/constants/countries";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, cn } from "@/lib/utils";

type ResumeCard = {
  id: string;
  title: string;
  targetRole: string | null;
  targetCountry: string | null;
  templateKey: "ATLAS" | "HORIZON" | "EMBER" | "CLASSIC";
  updatedAt: string;
  versionCount: number;
};

export function ResumeLibrary({
  initialResumes,
  defaultCountry,
}: {
  initialResumes: ResumeCard[];
  defaultCountry: "GHANA" | "UK" | "USA" | "CANADA" | "EUROPE" | "REMOTE";
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [showComposer, setShowComposer] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [form, setForm] = useState({
    title: "Global Resume",
    targetRole: "",
    targetCountry: defaultCountry,
    templateKey: "ATLAS" as const,
    emphasisMode: "AUTO" as const,
  });

  async function createResume() {
    setCreating(true);
    const response = await fetch("/api/resumes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const payload = await response.json();
    setCreating(false);

    if (!response.ok) {
      toast.error("Could not create resume");
      return;
    }

    router.push(`/resumes/${payload.resumeId}`);
    router.refresh();
  }

  async function duplicateResume(resumeId: string) {
    setDuplicatingId(resumeId);
    const response = await fetch(`/api/resumes/${resumeId}/duplicate`, {
      method: "POST",
    });

    const payload = await response.json();
    setDuplicatingId(null);

    if (!response.ok) {
      toast.error("Could not duplicate resume");
      return;
    }

    router.push(`/resumes/${payload.resumeId}`);
    router.refresh();
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="section-label">Resumes</p>
          <h2 className="mt-1 text-[1.25rem] font-semibold text-slate-950">Resume library</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
            {initialResumes.length} base resume{initialResumes.length === 1 ? "" : "s"}
          </span>
          <Button variant="secondary" size="sm" onClick={() => setShowComposer((current) => !current)}>
            <Plus className="h-4 w-4" />
            New resume
            <ChevronDown className={cn("h-4 w-4 transition", showComposer && "rotate-180")} />
          </Button>
        </div>
      </div>

      {showComposer ? (
        <Card className="rounded-[26px] bg-white">
          <CardContent className="space-y-4 p-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_180px]">
              <div className="space-y-2">
                <Label>Resume title</Label>
                <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Target role</Label>
                <Input
                  value={form.targetRole}
                  onChange={(event) => setForm((current) => ({ ...current, targetRole: event.target.value }))}
                  placeholder="Graduate analyst"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={createResume} className="w-full" disabled={creating}>
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Create resume
                </Button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced((current) => !current)}
              className="flex w-full items-center justify-between rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-slate-300"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">Advanced defaults</p>
                <p className="mt-0.5 text-xs leading-5 text-slate-500">
                  {form.targetCountry} - {form.templateKey} - {form.emphasisMode.replaceAll("_", " ")}
                </p>
              </div>
              <ChevronDown className={cn("h-4 w-4 text-slate-500 transition", showAdvanced && "rotate-180")} />
            </button>

            {showAdvanced ? (
              <div className="grid gap-3 rounded-[22px] border border-slate-200 bg-slate-50/70 p-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Country format</Label>
                  <Select value={form.targetCountry} onValueChange={(value) => setForm((current) => ({ ...current, targetCountry: value as typeof form.targetCountry }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["GHANA", "UK", "USA", "CANADA", "EUROPE", "REMOTE"].map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Template</Label>
                  <Select value={form.templateKey} onValueChange={(value) => setForm((current) => ({ ...current, templateKey: value as typeof form.templateKey }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RESUME_TEMPLATE_OPTIONS.map((template) => (
                        <SelectItem key={template.value} value={template.value}>
                          {template.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Emphasis mode</Label>
                  <Select value={form.emphasisMode} onValueChange={(value) => setForm((current) => ({ ...current, emphasisMode: value as typeof form.emphasisMode }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPHASIS_MODE_OPTIONS.map((mode) => (
                        <SelectItem key={mode.value} value={mode.value}>
                          {mode.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Card className="min-h-0 rounded-[28px] bg-white">
        <CardContent className="flex h-full min-h-0 flex-col p-0">
          <div className="hidden grid-cols-[minmax(0,1.7fr)_0.8fr_0.7fr_0.9fr_1.1fr] gap-4 border-b border-slate-200 px-5 py-4 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500 md:grid">
            <span>Resume</span>
            <span>Country</span>
            <span>Versions</span>
            <span>Last update</span>
            <span className="text-right">Actions</span>
          </div>

          {initialResumes.length === 0 ? (
            <div className="m-4 rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 p-8 text-sm leading-7 text-slate-600">
              No resumes yet. Create one from your master profile, then branch versions for specific jobs and countries.
            </div>
          ) : (
            <ScrollArea className="min-h-0 flex-1">
              <div className="divide-y divide-slate-200">
                {initialResumes.map((resume) => (
                  <div key={resume.id} className="px-4 py-4 md:px-5">
                    <div className="flex flex-col gap-4 md:grid md:grid-cols-[minmax(0,1.7fr)_0.8fr_0.7fr_0.9fr_1.1fr] md:items-center md:gap-4">
                      <div className="min-w-0">
                        <Link href={`/resumes/${resume.id}`} className="truncate text-[1rem] font-semibold text-slate-950 transition hover:text-[var(--accent)]">
                          {resume.title}
                        </Link>
                        <p className="mt-1 truncate text-sm text-slate-500">{resume.targetRole || "No target role set"}</p>
                      </div>

                      <div>
                        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[0.72rem] font-semibold text-slate-600">
                          {resume.targetCountry || "REMOTE"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <FileText className="h-4 w-4 text-slate-400" />
                        {resume.versionCount}
                      </div>

                      <div className="text-sm text-slate-600">{formatDate(resume.updatedAt, "MMM d, yyyy")}</div>

                      <div className="flex items-center gap-2 md:justify-end">
                        <Button asChild variant="secondary" size="sm">
                          <Link href={`/resumes/${resume.id}`}>Open</Link>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => duplicateResume(resume.id)} disabled={duplicatingId === resume.id}>
                          {duplicatingId === resume.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
                          Duplicate
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
