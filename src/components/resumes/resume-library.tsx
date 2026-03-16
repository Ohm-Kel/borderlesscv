"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Copy, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { EMPHASIS_MODE_OPTIONS, RESUME_TEMPLATE_OPTIONS } from "@/lib/constants/countries";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type ResumeCard = {
  id: string;
  title: string;
  targetRole: string | null;
  targetCountry: string | null;
  templateKey: "ATLAS" | "HORIZON" | "EMBER";
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
    <div className="grid h-full min-h-0 gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
      <Card className="rounded-[28px] bg-white">
        <CardContent className="space-y-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="section-label">Resumes</p>
              <h2 className="mt-1 text-[1.2rem] font-semibold text-slate-950">Resume library</h2>
              <p className="mt-1 text-sm text-slate-500">
                Pull from your master profile and generate the first version automatically.
              </p>
            </div>
            <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Library</p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {initialResumes.length} base resume{initialResumes.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="grid gap-3">
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
            <div className="grid gap-3 rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
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

          <Button onClick={createResume} className="w-full" disabled={creating}>
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create resume
          </Button>
        </CardContent>
      </Card>

      <Card className="min-h-0 rounded-[28px] bg-white">
        <CardContent className="flex h-full min-h-0 flex-col p-4">
          <div className="mb-4">
            <p className="section-label">Library</p>
            <h3 className="mt-1 text-[1.1rem] font-semibold text-slate-950">Base resumes</h3>
          </div>

          {initialResumes.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 p-8 text-sm leading-7 text-slate-600">
              No resumes yet. Create one from your master profile, then branch versions for specific jobs and countries.
            </div>
          ) : (
            <ScrollArea className="min-h-0 flex-1 pr-3">
              <div className="space-y-3">
                {initialResumes.map((resume) => (
                  <Card key={resume.id} className="rounded-[24px] bg-slate-50/60 shadow-none">
                    <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <Link href={`/resumes/${resume.id}`} className="text-[1.05rem] font-semibold text-slate-950 transition hover:text-[var(--accent)]">
                          {resume.title}
                        </Link>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {resume.targetRole || "No target role"} - {resume.targetCountry || "No country"} - {resume.versionCount} version{resume.versionCount === 1 ? "" : "s"}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Button asChild variant="secondary" size="sm">
                          <Link href={`/resumes/${resume.id}`}>Open builder</Link>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => duplicateResume(resume.id)} disabled={duplicatingId === resume.id}>
                          {duplicatingId === resume.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
                          Duplicate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
