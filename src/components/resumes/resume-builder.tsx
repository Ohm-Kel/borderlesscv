"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Eye, EyeOff, GripVertical, Loader2, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { EMPHASIS_MODE_OPTIONS, RESUME_TEMPLATE_OPTIONS } from "@/lib/constants/countries";
import { COUNTRY_GUIDANCE, SECTION_KEYS, type SectionKey } from "@/lib/constants/resume";
import type { TailoringGuidance } from "@/lib/validations/ai";
import type { ProfileContent, ProfileListEntry } from "@/lib/validations/profile";
import type { ResumeDocument } from "@/lib/validations/resume";
import { cn } from "@/lib/utils";
import { ResumePreview } from "@/components/resumes/resume-preview";
import { AwardEditor, CertificationEditor, LanguageEditor, LinkEditor } from "@/components/shared/profile-aux-editors";
import { ListSectionEditor } from "@/components/shared/list-section-editor";
import { TagEditor } from "@/components/shared/tag-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type ResumeMeta = {
  id: string;
  title: string;
  targetRole: string | null;
  targetCountry: "GHANA" | "UK" | "USA" | "CANADA" | "EUROPE" | "REMOTE";
  templateKey: "ATLAS" | "HORIZON" | "EMBER";
  emphasisMode: "AUTO" | "EDUCATION_FIRST" | "SKILLS_FIRST" | "EXPERIENCE_FIRST";
  visibility: "PRIVATE" | "PUBLIC";
};

type ResumeVersionState = {
  id: string;
  versionNumber: number;
  title: string;
  jobTitle: string | null;
  companyName: string | null;
  jobDescription: string | null;
  changeSummary: string | null;
  tone: "INTERNSHIP" | "GRADUATE" | "PROFESSIONAL";
  aiGuidance: TailoringGuidance | null;
  content: ResumeDocument;
  createdAt: string;
};

const emphasisOrders: Record<ResumeMeta["emphasisMode"], SectionKey[]> = {
  AUTO: [...SECTION_KEYS],
  EDUCATION_FIRST: ["education", "projects", "internships", "experience", "skills", "leadership", "certifications", "awards", "volunteer", "languages", "links"],
  SKILLS_FIRST: ["skills", "projects", "experience", "internships", "education", "certifications", "leadership", "awards", "volunteer", "languages", "links"],
  EXPERIENCE_FIRST: ["experience", "internships", "projects", "education", "skills", "certifications", "leadership", "awards", "volunteer", "languages", "links"],
};

function collectFacts(document: ResumeDocument) {
  return [
    document.summary,
    ...document.sections.education.flatMap((item) => [item.title, item.organization, item.description, ...item.bullets]),
    ...document.sections.experience.flatMap((item) => [item.title, item.organization, item.description, ...item.bullets]),
    ...document.sections.internships.flatMap((item) => [item.title, item.organization, item.description, ...item.bullets]),
    ...document.sections.projects.flatMap((item) => [item.title, item.organization, item.description, ...item.bullets]),
    ...document.sections.leadership.flatMap((item) => [item.title, item.organization, item.description, ...item.bullets]),
    ...document.sections.volunteer.flatMap((item) => [item.title, item.organization, item.description, ...item.bullets]),
    ...document.sections.skills,
    ...document.sections.languages.map((item) => `${item.name} ${item.proficiency}`),
  ].filter(Boolean);
}

export function ResumeBuilder({
  resume: initialResume,
  versions: initialVersions,
  personalDetails,
}: {
  resume: ResumeMeta;
  versions: ResumeVersionState[];
  personalDetails: {
    name: string;
    headline: string;
    location: string;
    phone: string;
  };
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const [resume, setResume] = useState(initialResume);
  const [versions, setVersions] = useState(initialVersions);
  const [activeVersionId, setActiveVersionId] = useState(initialVersions[0]?.id);
  const [saveState, setSaveState] = useState("Saved");
  const [pendingBulletKey, setPendingBulletKey] = useState<string | null>(null);
  const [analyzingTailoring, setAnalyzingTailoring] = useState(false);
  const [creatingVersion, setCreatingVersion] = useState(false);
  const [versionForm, setVersionForm] = useState({
    title: `${initialResume.title} Tailored`,
    jobTitle: "",
    companyName: "",
    jobDescription: "",
    changeSummary: "",
    tone: "GRADUATE" as const,
  });
  const mountedRef = useRef(false);

  const activeVersion = versions.find((version) => version.id === activeVersionId) ?? versions[0];
  const guidance = COUNTRY_GUIDANCE[resume.targetCountry];
  const snapshot = JSON.stringify({ resume, activeVersion });

  useEffect(() => {
    if (!activeVersion) {
      return;
    }

    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    const timeout = setTimeout(async () => {
      setSaveState("Saving...");
      const [resumeResponse, versionResponse] = await Promise.all([
        fetch(`/api/resumes/${resume.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(resume),
        }),
        fetch(`/api/resumes/${resume.id}/versions/${activeVersion.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: activeVersion.title,
            jobTitle: activeVersion.jobTitle || "",
            companyName: activeVersion.companyName || "",
            jobDescription: activeVersion.jobDescription || "",
            changeSummary: activeVersion.changeSummary || "",
            tone: activeVersion.tone,
            aiGuidance: activeVersion.aiGuidance || undefined,
            content: activeVersion.content,
          }),
        }),
      ]);

      setSaveState(resumeResponse.ok && versionResponse.ok ? "Saved" : "Autosave failed");
    }, 900);

    return () => clearTimeout(timeout);
  }, [activeVersion, resume, snapshot]);

  function updateActiveVersion(updater: (current: ResumeVersionState) => ResumeVersionState) {
    setVersions((current) => current.map((version) => (version.id === activeVersion.id ? updater(version) : version)));
  }

  function updateSection(section: keyof ProfileContent, value: ProfileContent[keyof ProfileContent]) {
    updateActiveVersion((current) => ({
      ...current,
      content: {
        ...current.content,
        sections: {
          ...current.content.sections,
          [section]: value,
        },
      },
    }));
  }

  function applyEmphasisMode(mode: ResumeMeta["emphasisMode"]) {
    setResume((current) => ({ ...current, emphasisMode: mode }));
    updateActiveVersion((current) => ({
      ...current,
      content: {
        ...current.content,
        sectionOrder: emphasisOrders[mode],
      },
    }));
  }

  async function refreshSummary() {
    const response = await fetch("/api/ai/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        facts: collectFacts(activeVersion.content).slice(0, 30),
        country: resume.targetCountry,
        tone: activeVersion.tone,
      }),
    });
    const payload = await response.json();

    if (!response.ok) {
      toast.error("Summary generation failed");
      return;
    }

    updateActiveVersion((current) => ({
      ...current,
      content: {
        ...current.content,
        summary: payload.summary,
      },
    }));
  }

  async function rewriteBullet(section: keyof ProfileContent, entryIndex: number, bulletIndex: number, bullet: string, bulletKey: string) {
    setPendingBulletKey(bulletKey);
    const response = await fetch("/api/ai/rewrite-bullet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bullet,
        tone: activeVersion.tone,
        role: resume.targetRole,
      }),
    });
    const payload = await response.json();
    setPendingBulletKey(null);

    if (!response.ok) {
      toast.error("Bullet rewrite failed");
      return;
    }

    const entries = activeVersion.content.sections[section] as ProfileListEntry[];
    updateSection(
      section,
      entries.map((entry, currentIndex) =>
        currentIndex === entryIndex
          ? {
              ...entry,
              bullets: entry.bullets.map((currentBullet: string, currentBulletIndex: number) =>
                currentBulletIndex === bulletIndex ? payload.rewrittenBullet : currentBullet,
              ),
            }
          : entry,
      ) as ProfileContent[keyof ProfileContent],
    );
  }

  async function createVersion() {
    setCreatingVersion(true);
    const response = await fetch(`/api/resumes/${resume.id}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...versionForm,
        sourceVersionId: activeVersion.id,
        aiGuidance: activeVersion.aiGuidance || undefined,
        content: activeVersion.content,
      }),
    });
    const payload = await response.json();
    setCreatingVersion(false);

    if (!response.ok) {
      toast.error("Could not create version");
      return;
    }

    const createdVersion: ResumeVersionState = {
      id: payload.versionId,
      versionNumber: Math.max(...versions.map((version) => version.versionNumber)) + 1,
      title: versionForm.title,
      jobTitle: versionForm.jobTitle,
      companyName: versionForm.companyName,
      jobDescription: versionForm.jobDescription,
      changeSummary: versionForm.changeSummary,
      tone: versionForm.tone,
      aiGuidance: activeVersion.aiGuidance,
      content: activeVersion.content,
      createdAt: new Date().toISOString(),
    };

    setVersions((current) => [createdVersion, ...current]);
    setActiveVersionId(createdVersion.id);
    setVersionForm({
      title: `${resume.title} Tailored`,
      jobTitle: "",
      companyName: "",
      jobDescription: "",
      changeSummary: "",
      tone: "GRADUATE",
    });
    toast.success("New resume version created");
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const order = activeVersion.content.sectionOrder;
    updateActiveVersion((current) => ({
      ...current,
      content: {
        ...current.content,
        sectionOrder: arrayMove(order, order.indexOf(active.id as SectionKey), order.indexOf(over.id as SectionKey)),
      },
    }));
  }

  async function analyzeTailoring() {
    if (!activeVersion.jobDescription?.trim()) {
      toast.error("Add a job description first");
      return;
    }

    setAnalyzingTailoring(true);
    const response = await fetch("/api/ai/tailor-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        facts: collectFacts(activeVersion.content).slice(0, 40),
        currentSummary: activeVersion.content.summary,
        jobDescription: activeVersion.jobDescription,
        country: resume.targetCountry,
        tone: activeVersion.tone,
      }),
    });
    const payload = await response.json();
    setAnalyzingTailoring(false);

    if (!response.ok) {
      toast.error("Tailoring analysis failed");
      return;
    }

    updateActiveVersion((current) => ({
      ...current,
      aiGuidance: payload,
    }));
    toast.success("Tailoring analysis updated");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-6">
        <Card className="rounded-[32px] bg-white">
          <CardContent className="space-y-5 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="section-label">Builder</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">{resume.title}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-500">Autosave: {saveState}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline">{resume.visibility}</Badge>
                <Button asChild variant="secondary">
                  <Link href={`/api/resumes/${resume.id}/versions/${activeVersion.id}/pdf`} target="_blank">
                    Export PDF
                  </Link>
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="accent">
                      <Plus className="h-4 w-4" />
                      New version
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create a tailored version</DialogTitle>
                      <DialogDescription>Duplicate the current draft for a specific role or company.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                      <Field label="Version title">
                        <Input value={versionForm.title} onChange={(event) => setVersionForm((current) => ({ ...current, title: event.target.value }))} />
                      </Field>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Job title">
                          <Input value={versionForm.jobTitle} onChange={(event) => setVersionForm((current) => ({ ...current, jobTitle: event.target.value }))} />
                        </Field>
                        <Field label="Company">
                          <Input value={versionForm.companyName} onChange={(event) => setVersionForm((current) => ({ ...current, companyName: event.target.value }))} />
                        </Field>
                      </div>
                      <Field label="Change summary">
                        <Input value={versionForm.changeSummary} onChange={(event) => setVersionForm((current) => ({ ...current, changeSummary: event.target.value }))} />
                      </Field>
                      <Field label="Tone">
                        <Select value={versionForm.tone} onValueChange={(value) => setVersionForm((current) => ({ ...current, tone: value as typeof current.tone }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INTERNSHIP">Internship</SelectItem>
                            <SelectItem value="GRADUATE">Graduate</SelectItem>
                            <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Job description">
                        <Textarea value={versionForm.jobDescription} onChange={(event) => setVersionForm((current) => ({ ...current, jobDescription: event.target.value }))} className="min-h-[160px]" />
                      </Field>
                    </div>
                    <DialogFooter>
                      <Button onClick={createVersion} disabled={creatingVersion}>
                        {creatingVersion ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        Create version
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Resume title">
                <Input value={resume.title} onChange={(event) => setResume((current) => ({ ...current, title: event.target.value }))} />
              </Field>
              <Field label="Target role">
                <Input value={resume.targetRole || ""} onChange={(event) => setResume((current) => ({ ...current, targetRole: event.target.value }))} />
              </Field>
              <Field label="Country format">
                <Select value={resume.targetCountry} onValueChange={(value) => setResume((current) => ({ ...current, targetCountry: value as typeof current.targetCountry }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(COUNTRY_GUIDANCE).map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Template">
                <Select value={resume.templateKey} onValueChange={(value) => setResume((current) => ({ ...current, templateKey: value as typeof current.templateKey }))}>
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
              </Field>
              <Field label="Emphasis mode">
                <Select value={resume.emphasisMode} onValueChange={(value) => applyEmphasisMode(value as typeof resume.emphasisMode)}>
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
              </Field>
              <Field label="Visibility">
                <Select value={resume.visibility} onValueChange={(value) => setResume((current) => ({ ...current, visibility: value as typeof current.visibility }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRIVATE">Private</SelectItem>
                    <SelectItem value="PUBLIC">Public</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <Card className="rounded-[32px] bg-white">
            <CardContent className="space-y-5 p-5">
              <div>
                <p className="section-label">Version history</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-950">Drafts</h3>
              </div>
              <div className="space-y-3">
                {versions.map((version) => (
                  <button
                    key={version.id}
                    type="button"
                    onClick={() => setActiveVersionId(version.id)}
                    className={cn(
                      "w-full rounded-[24px] border px-4 py-3 text-left transition",
                      version.id === activeVersion.id ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300",
                    )}
                  >
                    <div className="font-semibold">{version.title}</div>
                    <div className={cn("mt-1 text-xs uppercase tracking-[0.18em]", version.id === activeVersion.id ? "text-slate-200" : "text-slate-400")}>
                      v{version.versionNumber}
                    </div>
                    {version.changeSummary ? <p className={cn("mt-2 text-sm leading-6", version.id === activeVersion.id ? "text-slate-200" : "text-slate-500")}>{version.changeSummary}</p> : null}
                  </button>
                ))}
              </div>
              <div className="rounded-[24px] bg-slate-100 p-4 text-sm leading-7 text-slate-600">{guidance.headline}</div>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] bg-white">
            <CardContent className="space-y-5 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="section-label">Current version</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950">{activeVersion.title}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{activeVersion.tone}</Badge>
                  <Button variant="secondary" onClick={refreshSummary}>
                    <Sparkles className="h-4 w-4" />
                    Refresh summary
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Version title">
                  <Input value={activeVersion.title} onChange={(event) => updateActiveVersion((current) => ({ ...current, title: event.target.value }))} />
                </Field>
                <Field label="Tone">
                  <Select value={activeVersion.tone} onValueChange={(value) => updateActiveVersion((current) => ({ ...current, tone: value as typeof current.tone }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INTERNSHIP">Internship</SelectItem>
                      <SelectItem value="GRADUATE">Graduate</SelectItem>
                      <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Company">
                  <Input value={activeVersion.companyName || ""} onChange={(event) => updateActiveVersion((current) => ({ ...current, companyName: event.target.value }))} />
                </Field>
                <Field label="Job title">
                  <Input value={activeVersion.jobTitle || ""} onChange={(event) => updateActiveVersion((current) => ({ ...current, jobTitle: event.target.value }))} />
                </Field>
              </div>

              <Field label="Job description">
                <Textarea value={activeVersion.jobDescription || ""} onChange={(event) => updateActiveVersion((current) => ({ ...current, jobDescription: event.target.value }))} className="min-h-[160px]" />
              </Field>

              <Field label="Professional summary">
                <Textarea value={activeVersion.content.summary} onChange={(event) => updateActiveVersion((current) => ({ ...current, content: { ...current.content, summary: event.target.value } }))} className="min-h-[140px]" />
              </Field>
              <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-slate-950">Job tailoring analysis</h4>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Compare this version against the job description and get a tailored summary, keyword matches, and evidence gaps without inventing qualifications.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {activeVersion.aiGuidance ? (
                      <Button
                        variant="secondary"
                        onClick={() =>
                          updateActiveVersion((current) => ({
                            ...current,
                            content: {
                              ...current.content,
                              summary: current.aiGuidance?.tailoredSummary || current.content.summary,
                            },
                          }))
                        }
                      >
                        Apply tailored summary
                      </Button>
                    ) : null}
                    <Button variant="accent" onClick={analyzeTailoring} disabled={analyzingTailoring || !activeVersion.jobDescription?.trim()}>
                      {analyzingTailoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      Analyze fit
                    </Button>
                  </div>
                </div>
                {activeVersion.aiGuidance ? (
                  <div className="mt-5 grid gap-4 xl:grid-cols-2">
                    <div className="space-y-4 rounded-[24px] bg-white p-4 ring-1 ring-slate-200">
                      <div>
                        <p className="section-label">Tailored summary</p>
                        <p className="mt-2 text-sm leading-7 text-slate-700">{activeVersion.aiGuidance.tailoredSummary}</p>
                      </div>
                      <div>
                        <p className="section-label">Caution</p>
                        <p className="mt-2 text-sm leading-7 text-amber-700">{activeVersion.aiGuidance.caution}</p>
                      </div>
                    </div>
                    <div className="space-y-4 rounded-[24px] bg-white p-4 ring-1 ring-slate-200">
                      <div>
                        <p className="section-label">Matched keywords</p>
                        <div className="mt-2 space-y-2">
                          {activeVersion.aiGuidance.matchedKeywords.length ? (
                            activeVersion.aiGuidance.matchedKeywords.map((match) => (
                              <div key={`${match.keyword}-${match.evidence}`} className="rounded-2xl bg-emerald-50 px-3 py-2">
                                <p className="text-sm font-semibold text-emerald-800">{match.keyword}</p>
                                <p className="text-xs leading-6 text-emerald-700">{match.evidence}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-slate-500">No strong explicit keyword matches detected yet.</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="section-label">Missing evidence</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {activeVersion.aiGuidance.missingKeywords.length ? (
                            activeVersion.aiGuidance.missingKeywords.map((keyword) => (
                              <Badge key={keyword} variant="danger">
                                {keyword}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-slate-500">No major unsupported keywords were flagged.</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="section-label">Improvement suggestions</p>
                        <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
                          {activeVersion.aiGuidance.improvementSuggestions.map((suggestion) => (
                            <li key={suggestion} className="list-disc pl-1 ml-5">
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-[22px] bg-white p-4 text-sm leading-7 text-slate-500 ring-1 ring-slate-200">
                    Run analysis after adding a target job description to see which requirements your current resume already supports and which ones still need real evidence.
                  </div>
                )}
              </div>
              <div className="rounded-[28px] bg-slate-100 p-5">
                <h4 className="font-semibold text-slate-950">Section order and visibility</h4>
                <p className="mt-1 text-sm leading-6 text-slate-500">Drag to reorder. Toggle off sections that do not help this version.</p>
                <div className="mt-4">
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={activeVersion.content.sectionOrder} strategy={verticalListSortingStrategy}>
                      <div className="space-y-2">
                        {activeVersion.content.sectionOrder.map((section) => (
                          <SortableSectionRow
                            key={section}
                            id={section}
                            hidden={activeVersion.content.hiddenSections.includes(section)}
                            onToggleHidden={() =>
                              updateActiveVersion((current) => ({
                                ...current,
                                content: {
                                  ...current.content,
                                  hiddenSections: current.content.hiddenSections.includes(section)
                                    ? current.content.hiddenSections.filter((item) => item !== section)
                                    : [...current.content.hiddenSections, section],
                                },
                              }))
                            }
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              </div>

              <Tabs defaultValue="experience">
                <TabsList>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                  <TabsTrigger value="extras">Extras</TabsTrigger>
                </TabsList>
                <TabsContent value="experience" className="space-y-6">
                  <ListSectionEditor
                    title="Education"
                    description="Coursework and academic evidence can lead for early-career roles."
                    items={activeVersion.content.sections.education}
                    onChange={(education) => updateSection("education", education)}
                    onRewriteBullet={(entryIndex, bulletIndex, bullet) => rewriteBullet("education", entryIndex, bulletIndex, bullet, `${activeVersion.content.sections.education[entryIndex]?.id}-${bulletIndex}`)}
                    pendingBulletKey={pendingBulletKey}
                  />
                  <ListSectionEditor
                    title="Work experience"
                    description="Improve clarity without overstating outcomes."
                    items={activeVersion.content.sections.experience}
                    onChange={(experience) => updateSection("experience", experience)}
                    onRewriteBullet={(entryIndex, bulletIndex, bullet) => rewriteBullet("experience", entryIndex, bulletIndex, bullet, `${activeVersion.content.sections.experience[entryIndex]?.id}-${bulletIndex}`)}
                    pendingBulletKey={pendingBulletKey}
                  />
                  <ListSectionEditor
                    title="Internships"
                    description="Surface tools, ownership, and real results."
                    items={activeVersion.content.sections.internships}
                    onChange={(internships) => updateSection("internships", internships)}
                    onRewriteBullet={(entryIndex, bulletIndex, bullet) => rewriteBullet("internships", entryIndex, bulletIndex, bullet, `${activeVersion.content.sections.internships[entryIndex]?.id}-${bulletIndex}`)}
                    pendingBulletKey={pendingBulletKey}
                  />
                </TabsContent>
                <TabsContent value="projects" className="space-y-6">
                  <ListSectionEditor
                    title="Projects"
                    description="Projects are often your strongest proof at this stage."
                    items={activeVersion.content.sections.projects}
                    onChange={(projects) => updateSection("projects", projects)}
                    onRewriteBullet={(entryIndex, bulletIndex, bullet) => rewriteBullet("projects", entryIndex, bulletIndex, bullet, `${activeVersion.content.sections.projects[entryIndex]?.id}-${bulletIndex}`)}
                    pendingBulletKey={pendingBulletKey}
                  />
                  <ListSectionEditor
                    title="Leadership & activities"
                    description="Keep this practical and evidence-backed."
                    items={activeVersion.content.sections.leadership}
                    onChange={(leadership) => updateSection("leadership", leadership)}
                    onRewriteBullet={(entryIndex, bulletIndex, bullet) => rewriteBullet("leadership", entryIndex, bulletIndex, bullet, `${activeVersion.content.sections.leadership[entryIndex]?.id}-${bulletIndex}`)}
                    pendingBulletKey={pendingBulletKey}
                  />
                  <ListSectionEditor
                    title="Volunteer experience"
                    description="Volunteer work can support employability when it shows responsibility."
                    items={activeVersion.content.sections.volunteer}
                    onChange={(volunteer) => updateSection("volunteer", volunteer)}
                    onRewriteBullet={(entryIndex, bulletIndex, bullet) => rewriteBullet("volunteer", entryIndex, bulletIndex, bullet, `${activeVersion.content.sections.volunteer[entryIndex]?.id}-${bulletIndex}`)}
                    pendingBulletKey={pendingBulletKey}
                  />
                </TabsContent>
                <TabsContent value="extras" className="space-y-6">
                  <TagEditor
                    label="Skills"
                    values={activeVersion.content.sections.skills}
                    onChange={(skills) => updateSection("skills", skills)}
                    placeholder="SQL, Excel, Figma..."
                    helperText="Only keep skills supported by your real experience."
                  />
                  <LanguageEditor items={activeVersion.content.sections.languages} onChange={(languages) => updateSection("languages", languages)} />
                  <CertificationEditor items={activeVersion.content.sections.certifications} onChange={(certifications) => updateSection("certifications", certifications)} />
                  <AwardEditor items={activeVersion.content.sections.awards} onChange={(awards) => updateSection("awards", awards)} />
                  <LinkEditor items={activeVersion.content.sections.links} onChange={(links) => updateSection("links", links)} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="xl:sticky xl:top-6 xl:self-start">
        <div className="space-y-4">
          <Card className="rounded-[32px] bg-white">
            <CardContent className="space-y-3 p-5">
              <p className="section-label">Country guidance</p>
              <h3 className="text-lg font-semibold text-slate-950">{resume.targetCountry} hiring notes</h3>
              <p className="text-sm leading-7 text-slate-600">{guidance.summaryStyle}</p>
              <ul className="space-y-2 text-sm leading-7 text-slate-500">
                <li>ATS priority: {guidance.atsPriority}</li>
                <li>Page target: {guidance.pageTarget}</li>
                <li>Do not include: {guidance.doNotInclude}</li>
              </ul>
            </CardContent>
          </Card>
          <ScrollArea className="max-h-[calc(100vh-2rem)] rounded-[32px]">
            <ResumePreview
              personalDetails={personalDetails}
              document={activeVersion.content}
              templateKey={resume.templateKey}
              targetCountry={resume.targetCountry}
              targetRole={resume.targetRole}
            />
          </ScrollArea>
        </div>
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

function SortableSectionRow({
  id,
  hidden,
  onToggleHidden,
}: {
  id: string;
  hidden: boolean;
  onToggleHidden: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center justify-between rounded-2xl border border-white/70 bg-white px-4 py-3"
    >
      <div className="flex items-center gap-3">
        <button type="button" className="cursor-grab text-slate-400" {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium text-slate-700">{id}</span>
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={!hidden} onCheckedChange={onToggleHidden} />
        <button type="button" onClick={onToggleHidden} className="text-slate-500">
          {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
