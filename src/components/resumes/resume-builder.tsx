"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Eye, EyeOff, GripVertical, Loader2, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

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
import { EMPHASIS_MODE_OPTIONS, RESUME_TEMPLATE_OPTIONS } from "@/lib/constants/countries";
import { COUNTRY_GUIDANCE, SECTION_KEYS, SECTION_LABELS, type SectionKey } from "@/lib/constants/resume";
import { estimateResumeFit, type ResumeFitSummary, TARGET_RESUME_LINES } from "@/lib/resume-fit";
import { cn } from "@/lib/utils";
import type { TailoringGuidance } from "@/lib/validations/ai";
import type { ProfileContent, ProfileListEntry } from "@/lib/validations/profile";
import type { ResumeDocument } from "@/lib/validations/resume";

type ResumeMeta = {
  id: string;
  title: string;
  targetRole: string | null;
  targetCountry: "GHANA" | "UK" | "USA" | "CANADA" | "EUROPE" | "REMOTE";
  templateKey: "ATLAS" | "HORIZON" | "EMBER" | "CLASSIC";
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

type VersionFormState = {
  title: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  changeSummary: string;
  tone: "INTERNSHIP" | "GRADUATE" | "PROFESSIONAL";
};

type FitTone = {
  badgeClass: string;
  meterClass: string;
  caption: string;
};

type CountryGuidance = (typeof COUNTRY_GUIDANCE)[ResumeMeta["targetCountry"]];

const emphasisOrders: Record<ResumeMeta["emphasisMode"], SectionKey[]> = {
  AUTO: [...SECTION_KEYS],
  EDUCATION_FIRST: ["education", "projects", "internships", "experience", "skills", "leadership", "certifications", "awards", "volunteer", "languages", "links"],
  SKILLS_FIRST: ["skills", "projects", "experience", "internships", "education", "certifications", "leadership", "awards", "volunteer", "languages", "links"],
  EXPERIENCE_FIRST: ["experience", "internships", "projects", "education", "skills", "certifications", "leadership", "awards", "volunteer", "languages", "links"],
};

const COUNTRY_FLAGS: Record<ResumeMeta["targetCountry"], string> = {
  GHANA: "GH",
  UK: "UK",
  USA: "US",
  CANADA: "CA",
  EUROPE: "EU",
  REMOTE: "RM",
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

function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function collectSectionFacts(document: ResumeDocument, section: SectionKey) {
  if (section === "skills") return document.sections.skills;
  if (section === "languages") return document.sections.languages.map((item) => `${item.name} ${item.proficiency}`);
  if (section === "certifications") return document.sections.certifications.flatMap((item) => [item.title, item.issuer, item.credentialId, item.date, item.url]);
  if (section === "awards") return document.sections.awards.flatMap((item) => [item.title, item.issuer, item.description, item.date]);
  if (section === "links") return document.sections.links.flatMap((item) => [item.label, item.url]);

  return (document.sections[section] as ProfileListEntry[]).flatMap((item) => [
    item.title,
    item.organization,
    item.location,
    item.description,
    item.date,
    ...item.bullets,
    item.url,
  ]);
}

function getSectionKeywordMap(document: ResumeDocument, tailoringGuidance: TailoringGuidance | null) {
  const initialMap = SECTION_KEYS.reduce<Record<SectionKey, string[]>>((accumulator, section) => {
    accumulator[section] = [];
    return accumulator;
  }, {} as Record<SectionKey, string[]>);

  if (!tailoringGuidance) {
    return initialMap;
  }

  tailoringGuidance.matchedKeywords.forEach((match) => {
    const normalizedKeyword = normalizeText(match.keyword);
    const normalizedEvidence = normalizeText(match.evidence);

    SECTION_KEYS.forEach((section) => {
      const sectionFacts = collectSectionFacts(document, section).flatMap((fact) => (fact ? [normalizeText(fact)] : []));
      const hasMatch = sectionFacts.some(
        (fact) => fact.includes(normalizedKeyword) || fact.includes(normalizedEvidence) || normalizedEvidence.includes(fact),
      );

      if (hasMatch && !initialMap[section].includes(match.keyword)) {
        initialMap[section].push(match.keyword);
      }
    });
  });

  return initialMap;
}

function applyPreferredSectionOrder(currentOrder: SectionKey[], preferredOrder: SectionKey[]) {
  return [
    ...preferredOrder.filter((section) => currentOrder.includes(section)),
    ...currentOrder.filter((section) => !preferredOrder.includes(section)),
  ];
}

function buildEvidenceFirstOrder(currentOrder: SectionKey[], sectionKeywordMap: Record<SectionKey, string[]>, preferredOrder: SectionKey[]) {
  const matchedSections = currentOrder.filter((section) => sectionKeywordMap[section].length > 0);

  if (!matchedSections.length) {
    return applyPreferredSectionOrder(currentOrder, preferredOrder);
  }

  const prioritizedMatches = [
    ...preferredOrder.filter((section) => matchedSections.includes(section)),
    ...matchedSections.filter((section) => !preferredOrder.includes(section)),
  ];

  return [...prioritizedMatches, ...currentOrder.filter((section) => !matchedSections.includes(section))];
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
  const [compactPane, setCompactPane] = useState<"editor" | "preview">("editor");
  const [versionForm, setVersionForm] = useState<VersionFormState>({
    title: `${initialResume.title} Tailored`,
    jobTitle: "",
    companyName: "",
    jobDescription: "",
    changeSummary: "",
    tone: "GRADUATE",
  });
  const mountedRef = useRef(false);

  const activeVersion = versions.find((version) => version.id === activeVersionId) ?? versions[0]!;

  const guidance = COUNTRY_GUIDANCE[resume.targetCountry];
  const sectionKeywordMap = getSectionKeywordMap(activeVersion.content, activeVersion.aiGuidance);
  const matchedSectionEntries = activeVersion.content.sectionOrder
    .filter((section) => sectionKeywordMap[section].length > 0)
    .map((section) => ({ section, keywords: sectionKeywordMap[section] }));
  const recommendedSectionOrder = buildEvidenceFirstOrder(activeVersion.content.sectionOrder, sectionKeywordMap, guidance.preferredOrder);
  const fitSummary = estimateResumeFit(activeVersion.content);
  const sectionLineMap = fitSummary.sectionLines.reduce<Record<SectionKey, number>>((accumulator, section) => {
    accumulator[section.section] = section.lines;
    return accumulator;
  }, {} as Record<SectionKey, number>);
  const fitTone: FitTone =
    fitSummary.status === "balanced"
      ? { badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700", meterClass: "bg-emerald-500", caption: "One-page ready" }
      : fitSummary.status === "comfortable"
        ? { badgeClass: "border-blue-200 bg-blue-50 text-blue-700", meterClass: "bg-blue-500", caption: "Room to strengthen" }
        : fitSummary.status === "tight"
          ? { badgeClass: "border-amber-200 bg-amber-50 text-amber-700", meterClass: "bg-amber-500", caption: "Tight fit" }
          : { badgeClass: "border-rose-200 bg-rose-50 text-rose-700", meterClass: "bg-rose-500", caption: "Needs trimming" };
  const fitDeltaLabel =
    fitSummary.remainingLines >= 0 ? `${fitSummary.remainingLines} lines left` : `${Math.abs(fitSummary.remainingLines)} lines over`;
  const countryCode = COUNTRY_FLAGS[resume.targetCountry];
  const lowSignalSectionCandidates = activeVersion.content.sectionOrder.filter(
    (section) =>
      !activeVersion.content.hiddenSections.includes(section) &&
      sectionLineMap[section] > 0 &&
      sectionKeywordMap[section].length === 0 &&
      ["leadership", "volunteer", "certifications", "awards", "languages", "links"].includes(section),
  ) as SectionKey[];
  const lowSignalLines = lowSignalSectionCandidates.reduce((total, section) => total + (sectionLineMap[section] ?? 0), 0);
  const snapshot = JSON.stringify({ resume, activeVersion });

  useEffect(() => {
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

  function applyCountrySectionOrder() {
    updateActiveVersion((current) => ({
      ...current,
      content: {
        ...current.content,
        sectionOrder: applyPreferredSectionOrder(current.content.sectionOrder, guidance.preferredOrder),
      },
    }));
    toast.success(`${resume.targetCountry} section order applied`);
  }

  function prioritizeMatchedEvidence() {
    if (!activeVersion.aiGuidance) {
      toast.error("Run tailoring analysis first");
      return;
    }

    const matchedSections = SECTION_KEYS.filter((section) => sectionKeywordMap[section].length > 0);
    updateActiveVersion((current) => ({
      ...current,
      content: {
        ...current.content,
        sectionOrder: buildEvidenceFirstOrder(current.content.sectionOrder, sectionKeywordMap, guidance.preferredOrder),
        hiddenSections: current.content.hiddenSections.filter((section) => !matchedSections.includes(section)),
      },
    }));
    toast.success("Relevant sections moved higher");
  }

  async function tightenLongestBullet() {
    const candidate = fitSummary.longBullets[0];

    if (!candidate) {
      toast.error("No long bullet needs tightening right now");
      return;
    }

    const entries = activeVersion.content.sections[candidate.section] as ProfileListEntry[];
    const entryIndex = entries.findIndex((entry) => entry.id === candidate.entryId);

    if (entryIndex === -1) {
      toast.error("Could not locate the bullet to tighten");
      return;
    }

    await rewriteBullet(candidate.section, entryIndex, candidate.bulletIndex, candidate.text, `${candidate.entryId}-${candidate.bulletIndex}`);
    toast.success(`Shortened a long bullet in ${candidate.sectionLabel}`);
  }

  function hideLowSignalSections() {
    if (!lowSignalSectionCandidates.length) {
      toast.error("No low-signal sections to hide");
      return;
    }

    updateActiveVersion((current) => ({
      ...current,
      content: {
        ...current.content,
        hiddenSections: [...new Set([...current.content.hiddenSections, ...lowSignalSectionCandidates])],
      },
    }));
    toast.success(`${lowSignalSectionCandidates.length} low-signal section${lowSignalSectionCandidates.length === 1 ? "" : "s"} hidden`);
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 xl:grid xl:grid-cols-[minmax(0,1.18fr)_minmax(360px,0.82fr)] xl:gap-5 2xl:grid-cols-[minmax(0,1.24fr)_430px]">
      <CompactWorkspaceToggle
        activePane={compactPane}
        fitSummary={fitSummary}
        fitTone={fitTone}
        fitDeltaLabel={fitDeltaLabel}
        onChange={setCompactPane}
      />

      <div className={cn("flex min-h-0 flex-1 flex-col gap-5 overflow-hidden", compactPane === "preview" ? "hidden xl:flex" : "flex")}>
        <BuilderHeaderCard
          resume={resume}
          activeVersion={activeVersion}
          saveState={saveState}
          countryCode={countryCode}
          fitSummary={fitSummary}
          fitTone={fitTone}
          fitDeltaLabel={fitDeltaLabel}
          versionForm={versionForm}
          creatingVersion={creatingVersion}
          onVersionFormChange={setVersionForm}
          onCreateVersion={createVersion}
          onResumeChange={setResume}
          onApplyEmphasisMode={applyEmphasisMode}
        />

        <ScrollArea className="min-h-0 flex-1 pr-1 sm:pr-3">
          <div className="grid gap-5 pb-2 xl:grid-cols-[250px_minmax(0,1fr)]">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-1">
              <VersionsRail versions={versions} activeVersionId={activeVersion.id} onSelect={setActiveVersionId} />
              <CountryNotesCard targetCountry={resume.targetCountry} countryCode={countryCode} guidance={guidance} />
            </div>

            <div className="space-y-5">
              <div className="grid gap-5 xl:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
                <VersionDetailsCard activeVersion={activeVersion} onRefreshSummary={refreshSummary} onChange={updateActiveVersion} />
                <TailoringCard
                  activeVersion={activeVersion}
                  countryCode={countryCode}
                  matchedSectionEntries={matchedSectionEntries}
                  analyzingTailoring={analyzingTailoring}
                  onAnalyze={analyzeTailoring}
                  onApplySummary={() =>
                    updateActiveVersion((current) => ({
                      ...current,
                      content: {
                        ...current.content,
                        summary: current.aiGuidance?.tailoredSummary || current.content.summary,
                      },
                    }))
                  }
                  onApplyCountryOrder={applyCountrySectionOrder}
                  onPrioritizeMatchedEvidence={prioritizeMatchedEvidence}
                />
              </div>

              <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
                <SectionMapCard
                  activeVersion={activeVersion}
                  countryCode={countryCode}
                  sectionKeywordMap={sectionKeywordMap}
                  sectionLineMap={sectionLineMap}
                  recommendedSectionOrder={recommendedSectionOrder}
                  sensors={sensors}
                  onDragEnd={handleDragEnd}
                  onApplyCountryOrder={applyCountrySectionOrder}
                  onPrioritizeMatchedEvidence={prioritizeMatchedEvidence}
                  onToggleHidden={(section) =>
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
                <SectionEditorCard activeVersion={activeVersion} pendingBulletKey={pendingBulletKey} onUpdateSection={updateSection} onRewriteBullet={rewriteBullet} />
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      <div className={cn("min-h-0 flex-1", compactPane === "editor" ? "hidden xl:block" : "block")}>
        <PreviewCard
          className="h-full"
          personalDetails={personalDetails}
          document={activeVersion.content}
          templateKey={resume.templateKey}
          countryCode={countryCode}
          guidance={guidance}
          fitSummary={fitSummary}
          fitTone={fitTone}
          lowSignalSectionCandidates={lowSignalSectionCandidates}
          lowSignalLines={lowSignalLines}
          hasTailoring={Boolean(activeVersion.aiGuidance)}
          onTightenLongestBullet={tightenLongestBullet}
          onHideLowSignalSections={hideLowSignalSections}
          onPrioritizeMatchedEvidence={prioritizeMatchedEvidence}
        />
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function CompactWorkspaceToggle({
  activePane,
  fitSummary,
  fitTone,
  fitDeltaLabel,
  onChange,
}: {
  activePane: "editor" | "preview";
  fitSummary: ResumeFitSummary;
  fitTone: FitTone;
  fitDeltaLabel: string;
  onChange: Dispatch<SetStateAction<"editor" | "preview">>;
}) {
  return (
    <div className="rounded-[28px] border border-white/80 bg-white/95 p-3 shadow-[0_14px_34px_rgba(15,23,42,0.06)] xl:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="grid grid-cols-2 rounded-[18px] bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => onChange("editor")}
            className={cn(
              "rounded-[14px] px-4 py-2 text-sm font-semibold transition-colors",
              activePane === "editor" ? "bg-white dark:bg-[var(--surface)] text-slate-950 dark:text-white shadow-sm dark:shadow-none" : "text-slate-500 dark:text-slate-400",
            )}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onChange("preview")}
            className={cn(
              "rounded-[14px] px-4 py-2 text-sm font-semibold transition-colors",
              activePane === "preview" ? "bg-white dark:bg-[var(--surface)] text-slate-950 dark:text-white shadow-sm dark:shadow-none" : "text-slate-500 dark:text-slate-400",
            )}
          >
            Preview
          </button>
        </div>
        <div className="text-right">
          <div className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Line fit</div>
          <div className="mt-1 text-sm font-semibold text-slate-950">
            {fitSummary.adjustedLines}/{TARGET_RESUME_LINES}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className={cn("rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold", fitTone.badgeClass)}>{fitTone.caption}</span>
        <span className="text-[0.76rem] font-medium text-slate-500">{fitDeltaLabel}</span>
      </div>
    </div>
  );
}

function BuilderHeaderCard({
  resume,
  activeVersion,
  saveState,
  countryCode,
  fitSummary,
  fitTone,
  fitDeltaLabel,
  versionForm,
  creatingVersion,
  onVersionFormChange,
  onCreateVersion,
  onResumeChange,
  onApplyEmphasisMode,
}: {
  resume: ResumeMeta;
  activeVersion: ResumeVersionState;
  saveState: string;
  countryCode: string;
  fitSummary: ResumeFitSummary;
  fitTone: FitTone;
  fitDeltaLabel: string;
  versionForm: VersionFormState;
  creatingVersion: boolean;
  onVersionFormChange: Dispatch<SetStateAction<VersionFormState>>;
  onCreateVersion: () => void;
  onResumeChange: Dispatch<SetStateAction<ResumeMeta>>;
  onApplyEmphasisMode: (mode: ResumeMeta["emphasisMode"]) => void;
}) {
  return (
    <Card className="rounded-[34px] border-white/80 dark:border-transparent bg-white/95 dark:bg-[var(--surface)] shadow-[0_18px_45px_rgba(15,23,42,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      <CardContent className="space-y-4 p-4 sm:p-5 xl:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div>
              <p className="section-label">Resume workspace</p>
              <h2 className="mt-2 text-[1.4rem] font-semibold tracking-[-0.03em] text-slate-950 dark:text-white sm:text-[1.65rem]">{resume.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Tighten structure, control density, and keep this version on a strong one-page target before you export.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold",
                  saveState === "Saved"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : saveState === "Saving..."
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-rose-200 bg-rose-50 text-rose-600",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    saveState === "Saved" ? "bg-emerald-500" : saveState === "Saving..." ? "animate-pulse bg-amber-400" : "bg-rose-500",
                  )}
                />
                {saveState}
              </span>
              <span
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold",
                  resume.visibility === "PUBLIC" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-500",
                )}
              >
                {resume.visibility}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[0.68rem] font-semibold text-slate-600">
                {countryCode} format
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="secondary">
              <Link href={`/api/resumes/${resume.id}/versions/${activeVersion.id}/pdf`} target="_blank">
                Export PDF
              </Link>
            </Button>
            <VersionCreationDialog
              versionForm={versionForm}
              creatingVersion={creatingVersion}
              onChange={onVersionFormChange}
              onCreateVersion={onCreateVersion}
            />
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.18fr)_340px]">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Field label="Resume title">
              <Input value={resume.title} onChange={(event) => onResumeChange((current) => ({ ...current, title: event.target.value }))} />
            </Field>
            <Field label="Target role">
              <Input value={resume.targetRole || ""} onChange={(event) => onResumeChange((current) => ({ ...current, targetRole: event.target.value }))} />
            </Field>
            <Field label="Country format">
              <Select value={resume.targetCountry} onValueChange={(value) => onResumeChange((current) => ({ ...current, targetCountry: value as typeof current.targetCountry }))}>
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
              <Select value={resume.templateKey} onValueChange={(value) => onResumeChange((current) => ({ ...current, templateKey: value as typeof current.templateKey }))}>
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
              <Select value={resume.emphasisMode} onValueChange={(value) => onApplyEmphasisMode(value as typeof resume.emphasisMode)}>
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
              <Select value={resume.visibility} onValueChange={(value) => onResumeChange((current) => ({ ...current, visibility: value as typeof current.visibility }))}>
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

          <FitSummaryPanel fitSummary={fitSummary} fitTone={fitTone} fitDeltaLabel={fitDeltaLabel} />
        </div>
      </CardContent>
    </Card>
  );
}

function VersionCreationDialog({
  versionForm,
  creatingVersion,
  onChange,
  onCreateVersion,
}: {
  versionForm: VersionFormState;
  creatingVersion: boolean;
  onChange: Dispatch<SetStateAction<VersionFormState>>;
  onCreateVersion: () => void;
}) {
  return (
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
            <Input value={versionForm.title} onChange={(event) => onChange((current) => ({ ...current, title: event.target.value }))} />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Job title">
              <Input value={versionForm.jobTitle} onChange={(event) => onChange((current) => ({ ...current, jobTitle: event.target.value }))} />
            </Field>
            <Field label="Company">
              <Input value={versionForm.companyName} onChange={(event) => onChange((current) => ({ ...current, companyName: event.target.value }))} />
            </Field>
          </div>
          <Field label="Change summary">
            <Input value={versionForm.changeSummary} onChange={(event) => onChange((current) => ({ ...current, changeSummary: event.target.value }))} />
          </Field>
          <Field label="Tone">
            <Select value={versionForm.tone} onValueChange={(value) => onChange((current) => ({ ...current, tone: value as typeof current.tone }))}>
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
            <Textarea value={versionForm.jobDescription} onChange={(event) => onChange((current) => ({ ...current, jobDescription: event.target.value }))} className="min-h-[150px]" />
          </Field>
        </div>
        <DialogFooter>
          <Button onClick={onCreateVersion} disabled={creatingVersion}>
            {creatingVersion ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Create version
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FitSummaryPanel({
  fitSummary,
  fitTone,
  fitDeltaLabel,
}: {
  fitSummary: ResumeFitSummary;
  fitTone: FitTone;
  fitDeltaLabel: string;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 dark:border-[#334155] bg-slate-50/85 dark:bg-[#0F1117] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="section-label">One-page fit</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-[1.9rem] font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
              {fitSummary.adjustedLines}/{TARGET_RESUME_LINES}
            </span>
            <span className="pb-1 text-sm text-slate-500 dark:text-slate-400">lines</span>
          </div>
        </div>
        <span className={cn("rounded-full border px-3 py-1.5 text-[0.68rem] font-semibold", fitTone.badgeClass)}>{fitTone.caption}</span>
      </div>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200">
        <div className={cn("h-full rounded-full transition-all duration-300", fitTone.meterClass)} style={{ width: `${fitSummary.fillPercentage}%` }} />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-[0.74rem] font-medium text-slate-500">
        <span>{fitSummary.densityLabel}</span>
        <span>{fitDeltaLabel}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{fitSummary.guidance}</p>
      <div className="mt-4 space-y-2">
        {fitSummary.topSections.map((section) => (
          <div key={section.section} className="flex items-center justify-between gap-3 rounded-[18px] border border-white/80 bg-white px-3 py-2.5">
            <span className="text-sm font-medium text-slate-700">{section.label}</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[0.68rem] font-semibold text-slate-500">
              {section.lines} lines
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function VersionsRail({
  versions,
  activeVersionId,
  onSelect,
}: {
  versions: ResumeVersionState[];
  activeVersionId: string;
  onSelect: (versionId: string) => void;
}) {
  return (
    <Card className="rounded-[32px] border-white/80 dark:border-transparent bg-white/95 dark:bg-[var(--surface)] shadow-[0_16px_40px_rgba(15,23,42,0.05)] dark:shadow-none">
      <CardContent className="space-y-4 p-4">
        <div>
          <p className="section-label">Version history</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">Drafts</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">Switch between tailored copies without losing your base story.</p>
        </div>
        <div className="max-h-[340px] space-y-2.5 overflow-y-auto pr-1">
          {versions.map((version) => (
            <button
              key={version.id}
              type="button"
              onClick={() => onSelect(version.id)}
              className={cn(
                "w-full rounded-[22px] border px-4 py-3 text-left transition-all duration-200",
                version.id === activeVersionId
                  ? "border-slate-950 dark:border-white/10 bg-slate-950 dark:bg-[#212530] text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)] dark:shadow-none"
                  : "border-slate-200 dark:border-[#334155]/50 bg-white dark:bg-transparent text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-[#334155] hover:shadow-[0_4px_14px_rgba(15,23,42,0.06)] dark:hover:shadow-none",
              )}
            >
              <div className="text-[0.88rem] font-semibold">{version.title}</div>
              <div
                className={cn(
                  "mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em]",
                  version.id === activeVersionId ? "text-slate-300" : "text-slate-400",
                )}
              >
                v{version.versionNumber}
              </div>
              {version.changeSummary ? (
                <p className={cn("mt-2 text-[0.78rem] leading-6", version.id === activeVersionId ? "text-slate-200" : "text-slate-500")}>
                  {version.changeSummary}
                </p>
              ) : null}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CountryNotesCard({
  targetCountry,
  countryCode,
  guidance,
}: {
  targetCountry: ResumeMeta["targetCountry"];
  countryCode: string;
  guidance: CountryGuidance;
}) {
  return (
    <Card className="rounded-[32px] border-white/80 bg-slate-950 text-white shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="section-label text-slate-400">Country notes</p>
            <h3 className="mt-2 text-base font-semibold text-white">{targetCountry} format</h3>
          </div>
          <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[0.68rem] font-semibold text-slate-200">
            {countryCode}
          </span>
        </div>
        <p className="text-sm leading-6 text-slate-300">{guidance.summaryStyle}</p>
        <div className="space-y-3 rounded-[22px] border border-white/10 bg-white/5 p-4 text-[0.8rem] leading-6 text-slate-300">
          <div>
            <span className="font-semibold text-white">ATS priority:</span> {guidance.atsPriority}
          </div>
          <div>
            <span className="font-semibold text-white">Page target:</span> {guidance.pageTarget}
          </div>
          <div>
            <span className="font-semibold text-white">Do not include:</span> {guidance.doNotInclude}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function VersionDetailsCard({
  activeVersion,
  onRefreshSummary,
  onChange,
}: {
  activeVersion: ResumeVersionState;
  onRefreshSummary: () => void;
  onChange: (updater: (current: ResumeVersionState) => ResumeVersionState) => void;
}) {
  return (
    <Card className="rounded-[32px] border-white/80 dark:border-transparent bg-white/95 dark:bg-[var(--surface)] shadow-[0_16px_40px_rgba(15,23,42,0.05)] dark:shadow-none">
      <CardContent className="space-y-5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="section-label">Current version</p>
            <h3 className="mt-2 text-[1.2rem] font-semibold text-slate-950 dark:text-white">{activeVersion.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{activeVersion.tone}</Badge>
            <Button variant="secondary" size="sm" onClick={onRefreshSummary}>
              <Sparkles className="h-4 w-4" />
              Refresh summary
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Version title">
            <Input value={activeVersion.title} onChange={(event) => onChange((current) => ({ ...current, title: event.target.value }))} />
          </Field>
          <Field label="Tone">
            <Select value={activeVersion.tone} onValueChange={(value) => onChange((current) => ({ ...current, tone: value as typeof current.tone }))}>
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
            <Input value={activeVersion.companyName || ""} onChange={(event) => onChange((current) => ({ ...current, companyName: event.target.value }))} />
          </Field>
          <Field label="Job title">
            <Input value={activeVersion.jobTitle || ""} onChange={(event) => onChange((current) => ({ ...current, jobTitle: event.target.value }))} />
          </Field>
        </div>

        <Field label="Job description">
          <Textarea value={activeVersion.jobDescription || ""} onChange={(event) => onChange((current) => ({ ...current, jobDescription: event.target.value }))} className="min-h-[126px]" />
        </Field>

        <Field label="Professional summary">
          <Textarea
            value={activeVersion.content.summary}
            onChange={(event) =>
              onChange((current) => ({
                ...current,
                content: { ...current.content, summary: event.target.value },
              }))
            }
            className="min-h-[118px]"
          />
        </Field>
      </CardContent>
    </Card>
  );
}

function TailoringCard({
  activeVersion,
  countryCode,
  matchedSectionEntries,
  analyzingTailoring,
  onAnalyze,
  onApplySummary,
  onApplyCountryOrder,
  onPrioritizeMatchedEvidence,
}: {
  activeVersion: ResumeVersionState;
  countryCode: string;
  matchedSectionEntries: Array<{ section: SectionKey; keywords: string[] }>;
  analyzingTailoring: boolean;
  onAnalyze: () => void;
  onApplySummary: () => void;
  onApplyCountryOrder: () => void;
  onPrioritizeMatchedEvidence: () => void;
}) {
  return (
    <Card className="rounded-[32px] border-white/80 dark:border-transparent bg-white/95 dark:bg-[var(--surface)] shadow-[0_16px_40px_rgba(15,23,42,0.05)] dark:shadow-none">
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="section-label">Tailoring</p>
            <h3 className="mt-2 text-[1.1rem] font-semibold text-slate-950 dark:text-white">Job fit analysis</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Ground this version in the job description, then move real evidence higher in the page.
            </p>
          </div>
          <Button variant="accent" size="sm" onClick={onAnalyze} disabled={analyzingTailoring || !activeVersion.jobDescription?.trim()}>
            {analyzingTailoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Analyze fit
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeVersion.aiGuidance ? (
            <Button variant="secondary" size="sm" onClick={onApplySummary}>
              Apply tailored summary
            </Button>
          ) : null}
          {activeVersion.aiGuidance ? (
            <Button variant="secondary" size="sm" onClick={onPrioritizeMatchedEvidence}>
              Prioritize matches
            </Button>
          ) : null}
          <Button variant="secondary" size="sm" onClick={onApplyCountryOrder}>
            Use {countryCode} order
          </Button>
        </div>

        {activeVersion.aiGuidance ? (
          <div className="space-y-4">
            <div className="rounded-[24px] border border-slate-200 dark:border-[#334155]/50 bg-slate-50/80 dark:bg-[#0F1117] p-4">
              <p className="section-label">Tailored summary</p>
              <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-300">{activeVersion.aiGuidance.tailoredSummary}</p>
              <p className="mt-3 text-xs leading-6 text-amber-700 dark:text-amber-500">{activeVersion.aiGuidance.caution}</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[24px] border border-slate-200 dark:border-[#334155]/50 bg-white dark:bg-[#1A1D24] p-4">
                <p className="section-label">Matched keywords</p>
                <div className="mt-3 space-y-2">
                  {activeVersion.aiGuidance.matchedKeywords.length ? (
                    activeVersion.aiGuidance.matchedKeywords.map((match) => (
                      <div key={`${match.keyword}-${match.evidence}`} className="rounded-[18px] bg-emerald-50 px-3 py-2.5">
                        <p className="text-sm font-semibold text-emerald-800">{match.keyword}</p>
                        <p className="mt-1 text-xs leading-5 text-emerald-700">{match.evidence}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No strong explicit keyword matches detected yet.</p>
                  )}
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 dark:border-[#334155]/50 bg-white dark:bg-[#1A1D24] p-4">
                <p className="section-label">Missing evidence</p>
                <div className="mt-3 flex flex-wrap gap-2">
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
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[24px] border border-slate-200 dark:border-[#334155]/50 bg-white dark:bg-[#1A1D24] p-4">
                <p className="section-label">Improvement suggestions</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {activeVersion.aiGuidance.improvementSuggestions.map((suggestion) => (
                    <li key={suggestion} className="ml-5 list-disc pl-1">
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[24px] border border-slate-200 dark:border-[#334155]/50 bg-white dark:bg-[#1A1D24] p-4">
                <p className="section-label">Evidence hotspots</p>
                <div className="mt-3 space-y-2">
                  {matchedSectionEntries.length ? (
                    matchedSectionEntries.map(({ section, keywords }) => (
                      <div key={section} className="rounded-[18px] bg-slate-50 px-3 py-2.5">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-800">{SECTION_LABELS[section]}</p>
                          <Badge variant="outline">{keywords.length} match{keywords.length === 1 ? "" : "es"}</Badge>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-slate-600">{keywords.join(", ")}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No strong section-level evidence clusters detected yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-slate-200 dark:border-[#334155] bg-slate-50/80 dark:bg-[#0F1117] p-4 text-sm leading-7 text-slate-500 dark:text-slate-400">
            Run analysis after adding a target job description to see which requirements your current resume already supports and where the page still needs stronger proof.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SectionMapCard({
  activeVersion,
  countryCode,
  sectionKeywordMap,
  sectionLineMap,
  recommendedSectionOrder,
  sensors,
  onDragEnd,
  onApplyCountryOrder,
  onPrioritizeMatchedEvidence,
  onToggleHidden,
}: {
  activeVersion: ResumeVersionState;
  countryCode: string;
  sectionKeywordMap: Record<SectionKey, string[]>;
  sectionLineMap: Record<SectionKey, number>;
  recommendedSectionOrder: SectionKey[];
  sensors: ReturnType<typeof useSensors>;
  onDragEnd: (event: DragEndEvent) => void;
  onApplyCountryOrder: () => void;
  onPrioritizeMatchedEvidence: () => void;
  onToggleHidden: (section: SectionKey) => void;
}) {
  return (
    <Card className="rounded-[32px] border-white/80 dark:border-transparent bg-white/95 dark:bg-[var(--surface)] shadow-[0_16px_40px_rgba(15,23,42,0.05)] dark:shadow-none">
      <CardContent className="space-y-4 p-4">
        <div>
          <p className="section-label">Section map</p>
          <h3 className="mt-2 text-base font-semibold text-slate-950 dark:text-white">Order and visibility</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">Keep high-signal evidence at the top and trim low-value sections first.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={onApplyCountryOrder}>
            Use {countryCode} order
          </Button>
          {activeVersion.aiGuidance ? (
            <Button variant="secondary" size="sm" onClick={onPrioritizeMatchedEvidence}>
              Prioritize matches
            </Button>
          ) : null}
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={activeVersion.content.sectionOrder} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {activeVersion.content.sectionOrder.map((section) => (
                <SortableSectionRow
                  key={section}
                  id={section}
                  label={SECTION_LABELS[section]}
                  estimatedLines={sectionLineMap[section] ?? 0}
                  hidden={activeVersion.content.hiddenSections.includes(section)}
                  matchedKeywords={sectionKeywordMap[section]}
                  recommended={recommendedSectionOrder.indexOf(section) < 3 && sectionKeywordMap[section].length > 0}
                  onToggleHidden={() => onToggleHidden(section)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
}

function SectionEditorCard({
  activeVersion,
  pendingBulletKey,
  onUpdateSection,
  onRewriteBullet,
}: {
  activeVersion: ResumeVersionState;
  pendingBulletKey: string | null;
  onUpdateSection: (section: keyof ProfileContent, value: ProfileContent[keyof ProfileContent]) => void;
  onRewriteBullet: (section: keyof ProfileContent, entryIndex: number, bulletIndex: number, bullet: string, bulletKey: string) => void;
}) {
  return (
    <Card className="rounded-[32px] border-white/80 dark:border-transparent bg-white/95 dark:bg-[var(--surface)] shadow-[0_16px_40px_rgba(15,23,42,0.05)] dark:shadow-none">
      <CardContent className="flex h-full min-h-0 flex-col p-4 sm:p-5">
        <div className="mb-4">
          <p className="section-label">Section editor</p>
          <h3 className="mt-2 text-base font-semibold text-slate-950 dark:text-white">Tighten content, not just formatting</h3>
        </div>

        <Tabs defaultValue="experience" className="flex min-h-0 flex-1 flex-col">
          <TabsList className="grid w-full grid-cols-3 rounded-[18px] bg-slate-100 p-1">
            <TabsTrigger value="experience" className="rounded-[14px]">
              Experience
            </TabsTrigger>
            <TabsTrigger value="projects" className="rounded-[14px]">
              Projects
            </TabsTrigger>
            <TabsTrigger value="extras" className="rounded-[14px]">
              Extras
            </TabsTrigger>
          </TabsList>

          <TabsContent value="experience" className="mt-5 min-h-0 flex-1">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-5 pb-2">
                <ListSectionEditor
                  title="Education"
                  description="Coursework and academic evidence can lead for early-career roles."
                  items={activeVersion.content.sections.education}
                  onChange={(education) => onUpdateSection("education", education)}
                  onRewriteBullet={(entryIndex, bulletIndex, bullet) =>
                    onRewriteBullet("education", entryIndex, bulletIndex, bullet, `${activeVersion.content.sections.education[entryIndex]?.id}-${bulletIndex}`)
                  }
                  pendingBulletKey={pendingBulletKey}
                  compact
                  defaultOpen
                />
                <ListSectionEditor
                  title="Work experience"
                  description="Improve clarity without overstating outcomes."
                  items={activeVersion.content.sections.experience}
                  onChange={(experience) => onUpdateSection("experience", experience)}
                  onRewriteBullet={(entryIndex, bulletIndex, bullet) =>
                    onRewriteBullet("experience", entryIndex, bulletIndex, bullet, `${activeVersion.content.sections.experience[entryIndex]?.id}-${bulletIndex}`)
                  }
                  pendingBulletKey={pendingBulletKey}
                  compact
                />
                <ListSectionEditor
                  title="Internships"
                  description="Surface tools, ownership, and real results."
                  items={activeVersion.content.sections.internships}
                  onChange={(internships) => onUpdateSection("internships", internships)}
                  onRewriteBullet={(entryIndex, bulletIndex, bullet) =>
                    onRewriteBullet("internships", entryIndex, bulletIndex, bullet, `${activeVersion.content.sections.internships[entryIndex]?.id}-${bulletIndex}`)
                  }
                  pendingBulletKey={pendingBulletKey}
                  compact
                />
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="projects" className="mt-5 min-h-0 flex-1">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-5 pb-2">
                <ListSectionEditor
                  title="Projects"
                  description="Projects are often your strongest proof at this stage."
                  items={activeVersion.content.sections.projects}
                  onChange={(projects) => onUpdateSection("projects", projects)}
                  onRewriteBullet={(entryIndex, bulletIndex, bullet) =>
                    onRewriteBullet("projects", entryIndex, bulletIndex, bullet, `${activeVersion.content.sections.projects[entryIndex]?.id}-${bulletIndex}`)
                  }
                  pendingBulletKey={pendingBulletKey}
                  compact
                  defaultOpen
                />
                <ListSectionEditor
                  title="Leadership & activities"
                  description="Keep this practical and evidence-backed."
                  items={activeVersion.content.sections.leadership}
                  onChange={(leadership) => onUpdateSection("leadership", leadership)}
                  onRewriteBullet={(entryIndex, bulletIndex, bullet) =>
                    onRewriteBullet("leadership", entryIndex, bulletIndex, bullet, `${activeVersion.content.sections.leadership[entryIndex]?.id}-${bulletIndex}`)
                  }
                  pendingBulletKey={pendingBulletKey}
                  compact
                />
                <ListSectionEditor
                  title="Volunteer experience"
                  description="Volunteer work can support employability when it shows responsibility."
                  items={activeVersion.content.sections.volunteer}
                  onChange={(volunteer) => onUpdateSection("volunteer", volunteer)}
                  onRewriteBullet={(entryIndex, bulletIndex, bullet) =>
                    onRewriteBullet("volunteer", entryIndex, bulletIndex, bullet, `${activeVersion.content.sections.volunteer[entryIndex]?.id}-${bulletIndex}`)
                  }
                  pendingBulletKey={pendingBulletKey}
                  compact
                />
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="extras" className="mt-5 min-h-0 flex-1">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-5 pb-2">
                <CompactEditorSection title="Skills" description="Only keep skills supported by your real experience." count={activeVersion.content.sections.skills.length} defaultOpen>
                  <TagEditor
                    label="Skills"
                    values={activeVersion.content.sections.skills}
                    onChange={(skills) => onUpdateSection("skills", skills)}
                    placeholder="SQL, Excel, Figma..."
                    helperText="Only keep skills supported by your real experience."
                  />
                </CompactEditorSection>
                <CompactEditorSection title="Languages" description="Show useful working proficiency only." count={activeVersion.content.sections.languages.length}>
                  <LanguageEditor items={activeVersion.content.sections.languages} onChange={(languages) => onUpdateSection("languages", languages)} />
                </CompactEditorSection>
                <CompactEditorSection title="Certifications" description="Keep only relevant credentials." count={activeVersion.content.sections.certifications.length}>
                  <CertificationEditor items={activeVersion.content.sections.certifications} onChange={(certifications) => onUpdateSection("certifications", certifications)} />
                </CompactEditorSection>
                <CompactEditorSection title="Awards" description="Use awards that add hiring signal." count={activeVersion.content.sections.awards.length}>
                  <AwardEditor items={activeVersion.content.sections.awards} onChange={(awards) => onUpdateSection("awards", awards)} />
                </CompactEditorSection>
                <CompactEditorSection title="Links" description="Link only to high-trust destinations." count={activeVersion.content.sections.links.length}>
                  <LinkEditor items={activeVersion.content.sections.links} onChange={(links) => onUpdateSection("links", links)} />
                </CompactEditorSection>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function CompactEditorSection({
  title,
  description,
  count,
  children,
  defaultOpen = false,
}: {
  title: string;
  description: string;
  count: number;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="group overflow-hidden rounded-[28px] border border-slate-200/80 bg-white" open={defaultOpen || count === 0}>
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-4 py-4 [&::-webkit-details-marker]:hidden">
        <div>
          <h4 className="text-[1rem] font-semibold text-slate-950">{title}</h4>
          <p className="mt-1 text-[0.8rem] leading-[1.65] text-slate-500">{description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[0.68rem] font-semibold text-slate-500">
            {count}
          </span>
          <span className="text-slate-400 transition-transform duration-200 group-open:rotate-180">+</span>
        </div>
      </summary>
      <div className="border-t border-slate-100 p-4">{children}</div>
    </details>
  );
}

function PreviewCard({
  className,
  personalDetails,
  document,
  templateKey,
  countryCode,
  guidance,
  fitSummary,
  fitTone,
  lowSignalSectionCandidates,
  lowSignalLines,
  hasTailoring,
  onTightenLongestBullet,
  onHideLowSignalSections,
  onPrioritizeMatchedEvidence,
}: {
  className?: string;
  personalDetails: { name: string; headline: string; location: string; phone: string };
  document: ResumeDocument;
  templateKey: ResumeMeta["templateKey"];
  countryCode: string;
  guidance: CountryGuidance;
  fitSummary: ResumeFitSummary;
  fitTone: FitTone;
  lowSignalSectionCandidates: SectionKey[];
  lowSignalLines: number;
  hasTailoring: boolean;
  onTightenLongestBullet: () => void;
  onHideLowSignalSections: () => void;
  onPrioritizeMatchedEvidence: () => void;
}) {
  return (
    <div className={cn("min-h-0 xl:sticky xl:top-0 xl:h-[calc(100vh-116px)]", className)}>
      <Card className="rounded-[34px] border-white/80 dark:border-[#334155]/30 bg-white/95 dark:bg-[var(--surface)] shadow-[0_22px_48px_rgba(15,23,42,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] xl:h-full">
        <CardContent className="flex min-h-0 flex-col p-4 sm:p-5 xl:h-full">
          <ScrollArea className="min-h-0 flex-1 pr-2">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="section-label">One-page preview</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">Recruiter view</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    The live preview tightens spacing automatically to stay close to a single exportable page.
                  </p>
                </div>
                <div className="rounded-[20px] border border-slate-200 dark:border-[#334155]/50 bg-slate-50 dark:bg-[#0F1117] px-3 py-2 text-right">
                  <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{countryCode}</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">1 page target</div>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50/90 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Line budget</div>
                    <div className="mt-2 text-[1.5rem] font-semibold tracking-[-0.03em] text-slate-950">
                      {fitSummary.adjustedLines}/{TARGET_RESUME_LINES}
                    </div>
                  </div>
                  <span className={cn("rounded-full border px-3 py-1.5 text-[0.68rem] font-semibold", fitTone.badgeClass)}>{fitSummary.densityLabel}</span>
                </div>
                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200">
                  <div className={cn("h-full rounded-full transition-all duration-300", fitTone.meterClass)} style={{ width: `${fitSummary.fillPercentage}%` }} />
                </div>
                <div className="mt-3 grid gap-2 text-[0.78rem] leading-5 text-slate-600">
                  <div>
                    <span className="font-semibold text-slate-700">ATS priority:</span> {guidance.atsPriority}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Page target:</span> {guidance.pageTarget}
                  </div>
                </div>
              </div>

              <PageFitAssistantCard
                fitSummary={fitSummary}
                lowSignalSectionCandidates={lowSignalSectionCandidates}
                lowSignalLines={lowSignalLines}
                hasTailoring={hasTailoring}
                onTightenLongestBullet={onTightenLongestBullet}
                onHideLowSignalSections={onHideLowSignalSections}
                onPrioritizeMatchedEvidence={onPrioritizeMatchedEvidence}
              />

              <div className="rounded-[30px] bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.18),_transparent_62%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] p-3">
                <div className="mx-auto aspect-[210/297] w-full max-w-[420px] overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
                  <ResumePreview personalDetails={personalDetails} document={document} templateKey={templateKey} density={fitSummary.density} previewMode="builder" />
                </div>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function PageFitAssistantCard({
  fitSummary,
  lowSignalSectionCandidates,
  lowSignalLines,
  hasTailoring,
  onTightenLongestBullet,
  onHideLowSignalSections,
  onPrioritizeMatchedEvidence,
}: {
  fitSummary: ResumeFitSummary;
  lowSignalSectionCandidates: SectionKey[];
  lowSignalLines: number;
  hasTailoring: boolean;
  onTightenLongestBullet: () => void;
  onHideLowSignalSections: () => void;
  onPrioritizeMatchedEvidence: () => void;
}) {
  const longestBullet = fitSummary.longBullets[0];

  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50/90 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="section-label">Page-fit assistant</p>
          <h4 className="mt-2 text-base font-semibold text-slate-950">What to tighten next</h4>
        </div>
        <span className={cn("rounded-full border px-2.5 py-1 text-[0.66rem] font-semibold", fitSummary.status === "overflow" ? "border-rose-200 bg-rose-50 text-rose-700" : fitSummary.status === "tight" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-emerald-200 bg-emerald-50 text-emerald-700")}>
          {fitSummary.status}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {fitSummary.summaryLines > 4 ? (
          <div className="rounded-[18px] border border-slate-200 bg-white px-3 py-3">
            <p className="text-sm font-medium text-slate-800">Summary is taking {fitSummary.summaryLines} lines.</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Keep it direct and recruiter-readable. Aim for 3 to 4 lines.</p>
          </div>
        ) : null}

        {longestBullet ? (
          <div className="rounded-[18px] border border-slate-200 bg-white px-3 py-3">
            <p className="text-sm font-medium text-slate-800">
              Longest bullet: {longestBullet.sectionLabel} / {longestBullet.entryTitle}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {longestBullet.estimatedLines} lines. Tighten this first before trimming good evidence elsewhere.
            </p>
            <Button variant="secondary" size="sm" className="mt-3" onClick={onTightenLongestBullet}>
              <Sparkles className="h-4 w-4" />
              Shorten longest bullet
            </Button>
          </div>
        ) : null}

        {lowSignalSectionCandidates.length ? (
          <div className="rounded-[18px] border border-slate-200 bg-white px-3 py-3">
            <p className="text-sm font-medium text-slate-800">
              Low-signal sections are using {lowSignalLines} line{lowSignalLines === 1 ? "" : "s"}.
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{lowSignalSectionCandidates.map((section) => SECTION_LABELS[section]).join(", ")}</p>
            <Button variant="secondary" size="sm" className="mt-3" onClick={onHideLowSignalSections}>
              Hide low-signal sections
            </Button>
          </div>
        ) : null}

        {hasTailoring ? (
          <div className="rounded-[18px] border border-slate-200 bg-white px-3 py-3">
            <p className="text-sm font-medium text-slate-800">Use matched evidence to earn space.</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Move sections with explicit job evidence higher so the first half of the page carries the strongest proof.</p>
            <Button variant="secondary" size="sm" className="mt-3" onClick={onPrioritizeMatchedEvidence}>
              Prioritize matched evidence
            </Button>
          </div>
        ) : null}

        {!longestBullet && !lowSignalSectionCandidates.length && fitSummary.summaryLines <= 4 ? (
          <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
            The draft is already in a clean one-page shape. Focus on evidence quality rather than cutting more.
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SortableSectionRow({
  id,
  label,
  estimatedLines,
  hidden,
  matchedKeywords,
  recommended,
  onToggleHidden,
}: {
  id: string;
  label: string;
  estimatedLines: number;
  hidden: boolean;
  matchedKeywords: string[];
  recommended: boolean;
  onToggleHidden: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center justify-between gap-3 rounded-[22px] border bg-white px-3.5 py-3 transition-all duration-200",
        recommended ? "border-emerald-200 bg-emerald-50/60" : "border-slate-200",
        hidden && "opacity-60",
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <button type="button" className="mt-0.5 cursor-grab text-slate-400" {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-slate-700">{label}</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[0.66rem] font-semibold text-slate-500">
              {estimatedLines} {estimatedLines === 1 ? "line" : "lines"}
            </span>
            {recommended ? (
              <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-[0.66rem] font-semibold text-emerald-700">
                Lead section
              </span>
            ) : null}
          </div>
          {matchedKeywords.length ? <p className="mt-1 text-xs leading-5 text-slate-500">Matched: {matchedKeywords.join(", ")}</p> : null}
        </div>
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
