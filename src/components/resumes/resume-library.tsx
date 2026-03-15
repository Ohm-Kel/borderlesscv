"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Copy, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { EMPHASIS_MODE_OPTIONS, RESUME_TEMPLATE_OPTIONS } from "@/lib/constants/countries";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <Card className="rounded-[32px] bg-white">
        <CardContent className="space-y-5 p-6">
          <div>
            <p className="section-label">New base resume</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Create a tailored starting point</h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              BorderlessCV will pull from your master profile and create the first version automatically.
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Resume title</Label>
              <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Target role</Label>
              <Input value={form.targetRole} onChange={(event) => setForm((current) => ({ ...current, targetRole: event.target.value }))} placeholder="Graduate analyst" />
            </div>
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
          <Button onClick={createResume} className="w-full" disabled={creating}>
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create resume
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {initialResumes.length === 0 ? (
          <Card className="rounded-[32px] bg-white">
            <CardContent className="p-8 text-sm leading-7 text-slate-600">
              No resumes yet. Create one from your master profile, then branch versions for specific jobs and countries.
            </CardContent>
          </Card>
        ) : (
          initialResumes.map((resume) => (
            <Card key={resume.id} className="rounded-[32px] bg-white">
              <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <Link href={`/resumes/${resume.id}`} className="text-xl font-semibold text-slate-950 transition hover:text-[var(--accent)]">
                    {resume.title}
                  </Link>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    {resume.targetRole || "No target role"} • {resume.targetCountry || "No country"} • {resume.versionCount} version{resume.versionCount === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button asChild variant="secondary">
                    <Link href={`/resumes/${resume.id}`}>Open builder</Link>
                  </Button>
                  <Button variant="ghost" onClick={() => duplicateResume(resume.id)} disabled={duplicatingId === resume.id}>
                    {duplicatingId === resume.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
                    Duplicate
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
