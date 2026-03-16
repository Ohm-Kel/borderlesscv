"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { AwardEditor, CertificationEditor, LanguageEditor, LinkEditor } from "@/components/shared/profile-aux-editors";
import { ListSectionEditor } from "@/components/shared/list-section-editor";
import { TagEditor } from "@/components/shared/tag-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import type { ProfileContent } from "@/lib/validations/profile";

function buildFacts(form: {
  professionalSummary: string;
  content: ProfileContent;
}) {
  return [
    form.professionalSummary,
    ...form.content.education.flatMap((item) => [item.title, item.organization, item.description, ...item.bullets]),
    ...form.content.experience.flatMap((item) => [item.title, item.organization, item.description, ...item.bullets]),
    ...form.content.internships.flatMap((item) => [item.title, item.organization, item.description, ...item.bullets]),
    ...form.content.projects.flatMap((item) => [item.title, item.organization, item.description, ...item.bullets]),
    ...form.content.leadership.flatMap((item) => [item.title, item.organization, item.description, ...item.bullets]),
    ...form.content.volunteer.flatMap((item) => [item.title, item.organization, item.description, ...item.bullets]),
    ...form.content.certifications.flatMap((item) => [item.title, item.issuer]),
    ...form.content.awards.flatMap((item) => [item.title, item.issuer, item.description]),
    ...form.content.skills,
    ...form.content.languages.flatMap((item) => [item.name, item.proficiency]),
  ].filter(Boolean);
}

function calculateLocalCompleteness(form: {
  personalDetails: {
    name: string;
  };
  professionalSummary: string;
  content: ProfileContent;
}) {
  const weightedChecks = [
    Boolean(form.personalDetails.name),
    Boolean(form.professionalSummary),
    form.content.education.length > 0,
    form.content.experience.length > 0 || form.content.internships.length > 0,
    form.content.projects.length > 0,
    form.content.skills.length > 0,
    form.content.links.length > 0,
  ];

  return Math.round((weightedChecks.filter(Boolean).length / weightedChecks.length) * 100);
}

function countEvidenceEntries(content: ProfileContent) {
  return (
    content.education.length +
    content.experience.length +
    content.internships.length +
    content.projects.length +
    content.leadership.length +
    content.volunteer.length
  );
}

function countCredentials(content: ProfileContent) {
  return content.certifications.length + content.awards.length;
}

function getNextProfileFocus(form: {
  professionalSummary: string;
  content: ProfileContent;
}) {
  if (!form.professionalSummary.trim()) {
    return "Add a grounded professional summary.";
  }

  if (form.content.projects.length === 0) {
    return "Add at least one project with practical proof.";
  }

  if (form.content.experience.length === 0 && form.content.internships.length === 0) {
    return "Add internships, campus work, or practical experience.";
  }

  if (form.content.links.length === 0) {
    return "Add a trusted LinkedIn or portfolio link.";
  }

  return "Tighten bullets and keep the strongest evidence current.";
}

export function MasterProfileEditor({
  initialData,
  initialProfileCompleteness,
  initialLastAutosavedAt,
  primaryCountry,
}: {
  initialData: {
    personalDetails: {
      name: string;
      headline: string;
      location: string;
      phone: string;
    };
    professionalSummary: string;
    content: ProfileContent;
  };
  initialProfileCompleteness: number;
  initialLastAutosavedAt: string | null;
  primaryCountry: "GHANA" | "UK" | "USA" | "CANADA" | "EUROPE" | "REMOTE";
}) {
  const [form, setForm] = useState(initialData);
  const [manualSaving, setManualSaving] = useState(false);
  const [summaryPending, setSummaryPending] = useState(false);
  const [skillsPending, setSkillsPending] = useState(false);
  const [saveState, setSaveState] = useState(initialLastAutosavedAt ? "Saved" : "Ready to save");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(initialLastAutosavedAt);
  const mountedRef = useRef(false);
  const profileCompleteness = calculateLocalCompleteness(form);
  const evidenceEntries = countEvidenceEntries(form.content);
  const credentialEntries = countCredentials(form.content);
  const skillsLinksCount = form.content.skills.length + form.content.links.length;
  const savedLabel = lastSavedAt ? formatDate(lastSavedAt, "MMM d, h:mm a") : "Not yet saved";
  const nextProfileFocus = getNextProfileFocus(form);

  const persistProfile = useCallback(async (nextForm: typeof form, notify: boolean) => {
    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nextForm),
    });

    const responseData = await response.json();

    if (!response.ok) {
      setSaveState("Autosave failed");
      if (notify) {
        toast.error("Could not save profile", {
          description: typeof responseData.error === "string" ? responseData.error : "Please review the form and try again.",
        });
      }
      return;
    }

    setLastSavedAt(responseData.profile.lastAutosavedAt);
    setSaveState("Saved");

    if (notify) {
      toast.success("Master profile saved");
    }
  }, []);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    const timeout = setTimeout(() => {
      setSaveState("Saving...");
      void persistProfile(form, false);
    }, 900);

    return () => clearTimeout(timeout);
  }, [form, persistProfile]);

  async function saveProfile() {
    setManualSaving(true);
    setSaveState("Saving...");
    await persistProfile(form, true);
    setManualSaving(false);
  }

  async function handleGenerateSummary() {
    setSummaryPending(true);
    const response = await fetch("/api/ai/summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        facts: buildFacts(form).slice(0, 30),
        country: primaryCountry,
        tone: "GRADUATE",
      }),
    });
    const payload = await response.json();
    setSummaryPending(false);

    if (!response.ok) {
      toast.error("Summary generation failed");
      return;
    }

    setForm((current) => ({
      ...current,
      professionalSummary: payload.summary,
    }));
    toast.success("Summary generated from your verified facts");
  }

  async function handleSuggestSkills() {
    setSkillsPending(true);
    const response = await fetch("/api/ai/skills", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        facts: buildFacts(form).slice(0, 40),
      }),
    });
    const payload = await response.json();
    setSkillsPending(false);

    if (!response.ok) {
      toast.error("Skill suggestions failed");
      return;
    }

    setForm((current) => ({
      ...current,
      content: {
        ...current.content,
        skills: Array.from(new Set([...current.content.skills, ...(payload.skills || [])])),
      },
    }));
    toast.success("Added supported skill suggestions");
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <Card className="rounded-[28px] bg-white">
        <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="section-label">Profile workspace</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h2 className="text-[1.15rem] font-semibold text-slate-950 sm:text-[1.25rem]">Master profile</h2>
              <Badge variant="outline">{primaryCountry}</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              One verified source for resumes, cover letters, tailoring, and applications.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="accent">Private by default</Badge>
            <Badge variant="outline">Autosave {saveState.toLowerCase()}</Badge>
            <Button type="button" variant="secondary" onClick={handleSuggestSkills} disabled={skillsPending}>
              {skillsPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Suggest skills
            </Button>
            <Button type="button" onClick={saveProfile} disabled={manualSaving}>
              {manualSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save profile
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Completeness"
          value={`${profileCompleteness || initialProfileCompleteness}%`}
          note={profileCompleteness >= 72 ? "Strong enough to tailor" : "Add more verified proof"}
        />
        <MetricCard
          label="Evidence entries"
          value={`${evidenceEntries}`}
          note={evidenceEntries ? "Projects, work, internships, leadership" : "No experience proof yet"}
        />
        <MetricCard
          label="Skills + links"
          value={`${skillsLinksCount}`}
          note={skillsLinksCount ? "Supported by current profile facts" : "Add trust signals"}
        />
        <MetricCard
          label="Last saved"
          value={savedLabel}
          note={nextProfileFocus}
        />
      </div>

      <Tabs defaultValue="core" className="flex min-h-0 flex-1 flex-col gap-3">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-[18px] bg-white p-1 sm:w-auto sm:grid-cols-4">
          <TabsTrigger value="core">Core</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="projects">Projects & leadership</TabsTrigger>
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
        </TabsList>

        <TabsContent value="core" className="mt-0 min-h-0 flex-1">
          <ScrollArea className="h-full pr-3">
            <div className="grid gap-4 pb-2 xl:grid-cols-[320px_minmax(0,1fr)]">
              <div className="space-y-4">
                <EditorPanel
                  eyebrow="Identity"
                  title="Core details"
                  description="Keep this clean and consistent across every application."
                >
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Full name</Label>
                      <Input value={form.personalDetails.name} onChange={(event) => setForm((current) => ({ ...current, personalDetails: { ...current.personalDetails, name: event.target.value } }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Headline</Label>
                      <Input value={form.personalDetails.headline} onChange={(event) => setForm((current) => ({ ...current, personalDetails: { ...current.personalDetails, headline: event.target.value } }))} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input value={form.personalDetails.location} onChange={(event) => setForm((current) => ({ ...current, personalDetails: { ...current.personalDetails, location: event.target.value } }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input value={form.personalDetails.phone} onChange={(event) => setForm((current) => ({ ...current, personalDetails: { ...current.personalDetails, phone: event.target.value } }))} />
                      </div>
                    </div>
                  </div>
                </EditorPanel>

                <EditorPanel
                  eyebrow="Profile signals"
                  title="What this profile still needs"
                  description="Keep the master profile evidence-first before tailoring versions."
                >
                  <div className="space-y-2">
                    <SignalRow label="Projects" value={form.content.projects.length ? `${form.content.projects.length} added` : "Missing"} />
                    <SignalRow label="Work or internships" value={form.content.experience.length || form.content.internships.length ? `${form.content.experience.length + form.content.internships.length} entries` : "Missing"} />
                    <SignalRow label="Credentials" value={credentialEntries ? `${credentialEntries} listed` : "Optional"} />
                    <SignalRow label="Trusted links" value={form.content.links.length ? `${form.content.links.length} added` : "Add LinkedIn/portfolio"} />
                  </div>
                </EditorPanel>
              </div>

              <div className="space-y-4">
                <EditorPanel
                  eyebrow="Summary"
                  title="Professional summary"
                  description="Keep this grounded in facts you can defend."
                  action={
                    <Button type="button" variant="secondary" onClick={handleGenerateSummary} disabled={summaryPending}>
                      {summaryPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      Generate from facts
                    </Button>
                  }
                >
                  <Textarea value={form.professionalSummary} onChange={(event) => setForm((current) => ({ ...current, professionalSummary: event.target.value }))} className="min-h-[160px]" />
                </EditorPanel>

                <EditorPanel
                  eyebrow="Capabilities"
                  title="Skills, languages, and links"
                  description="Only keep items you can support with real evidence."
                >
                  <div className="space-y-5">
                    <TagEditor
                      label="Skills"
                      values={form.content.skills}
                      onChange={(skills) => setForm((current) => ({ ...current, content: { ...current.content, skills } }))}
                      placeholder="SQL, stakeholder communication, Canva..."
                      helperText="Only list skills you can confidently defend in an interview."
                    />
                    <LanguageEditor
                      items={form.content.languages}
                      onChange={(languages) => setForm((current) => ({ ...current, content: { ...current.content, languages } }))}
                    />
                    <LinkEditor items={form.content.links} onChange={(links) => setForm((current) => ({ ...current, content: { ...current.content, links } }))} />
                  </div>
                </EditorPanel>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="experience" className="mt-0 min-h-0 flex-1">
          <ScrollArea className="h-full pr-3">
            <div className="grid gap-4 pb-2 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-4">
                <ListSectionEditor
                  title="Education"
                  description="Include degree, institution, coursework, thesis, or academic proof when relevant."
                  items={form.content.education}
                  onChange={(education) => setForm((current) => ({ ...current, content: { ...current.content, education } }))}
                  compact
                  defaultOpen
                />
                <ListSectionEditor
                  title="Work experience"
                  description="Focus on facts, scope, and defensible outcomes."
                  items={form.content.experience}
                  onChange={(experience) => setForm((current) => ({ ...current, content: { ...current.content, experience } }))}
                  compact
                />
                <ListSectionEditor
                  title="Internships"
                  description="Internships matter strongly for low-experience candidates."
                  items={form.content.internships}
                  onChange={(internships) => setForm((current) => ({ ...current, content: { ...current.content, internships } }))}
                  compact
                />
              </div>
              <div className="space-y-4">
                <EditorPanel
                  eyebrow="Coverage"
                  title="Experience snapshot"
                  description="Recruiters should find your strongest evidence quickly."
                >
                  <div className="space-y-2">
                    <SignalRow label="Education entries" value={`${form.content.education.length}`} />
                    <SignalRow label="Work entries" value={`${form.content.experience.length}`} />
                    <SignalRow label="Internships" value={`${form.content.internships.length}`} />
                  </div>
                </EditorPanel>
                <EditorPanel
                  eyebrow="Guidance"
                  title="What to prioritize"
                  description="Students and graduates should lead with practical, recent, and defensible proof."
                >
                  <p className="text-sm leading-7 text-slate-600">
                    Keep dates clear, roles easy to scan, and bullets grounded in execution, tools, and outcomes you can explain.
                  </p>
                </EditorPanel>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="projects" className="mt-0 min-h-0 flex-1">
          <ScrollArea className="h-full pr-3">
            <div className="grid gap-4 pb-2 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-4">
                <ListSectionEditor
                  title="Projects"
                  description="Be explicit about scope, stack, and outcome."
                  items={form.content.projects}
                  onChange={(projects) => setForm((current) => ({ ...current, content: { ...current.content, projects } }))}
                  compact
                  defaultOpen
                />
                <ListSectionEditor
                  title="Leadership & activities"
                  description="Student clubs and leadership can strengthen hiring confidence."
                  items={form.content.leadership}
                  onChange={(leadership) => setForm((current) => ({ ...current, content: { ...current.content, leadership } }))}
                  compact
                />
                <ListSectionEditor
                  title="Volunteer experience"
                  description="Use volunteer work that demonstrates ownership or initiative."
                  items={form.content.volunteer}
                  onChange={(volunteer) => setForm((current) => ({ ...current, content: { ...current.content, volunteer } }))}
                  compact
                />
              </div>
              <div className="space-y-4">
                <EditorPanel
                  eyebrow="Coverage"
                  title="Project proof"
                  description="This is often the strongest evidence for low-experience candidates."
                >
                  <div className="space-y-2">
                    <SignalRow label="Projects" value={`${form.content.projects.length}`} />
                    <SignalRow label="Leadership" value={`${form.content.leadership.length}`} />
                    <SignalRow label="Volunteer" value={`${form.content.volunteer.length}`} />
                  </div>
                </EditorPanel>
                <EditorPanel
                  eyebrow="Guidance"
                  title="What to highlight"
                  description="Practical execution matters more than broad claims."
                >
                  <p className="text-sm leading-7 text-slate-600">
                    Show ownership, tools used, user impact, collaboration, and the actual thing you built or delivered.
                  </p>
                </EditorPanel>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="credentials" className="mt-0 min-h-0 flex-1">
          <ScrollArea className="h-full pr-3">
            <div className="grid gap-4 pb-2 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-4">
                <EditorPanel
                  eyebrow="Credentials"
                  title="Certifications"
                  description="Keep only credentials that add real hiring signal."
                >
                  <CertificationEditor
                    items={form.content.certifications}
                    onChange={(certifications) => setForm((current) => ({ ...current, content: { ...current.content, certifications } }))}
                  />
                </EditorPanel>
                <EditorPanel
                  eyebrow="Recognition"
                  title="Awards"
                  description="Add awards that strengthen trust or demonstrate excellence."
                >
                  <AwardEditor
                    items={form.content.awards}
                    onChange={(awards) => setForm((current) => ({ ...current, content: { ...current.content, awards } }))}
                  />
                </EditorPanel>
              </div>
              <div className="space-y-4">
                <EditorPanel
                  eyebrow="Coverage"
                  title="Credential snapshot"
                  description="Optional, but useful when directly relevant to a role."
                >
                  <div className="space-y-2">
                    <SignalRow label="Certifications" value={`${form.content.certifications.length}`} />
                    <SignalRow label="Awards" value={`${form.content.awards.length}`} />
                    <SignalRow label="Languages" value={`${form.content.languages.length}`} />
                  </div>
                </EditorPanel>
                <EditorPanel
                  eyebrow="Guidance"
                  title="Keep this selective"
                  description="Do not overload the profile with low-signal extras."
                >
                  <p className="text-sm leading-7 text-slate-600">
                    Keep only credentials and awards that strengthen a target application or show meaningful proof of capability.
                  </p>
                </EditorPanel>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <Card className="rounded-[24px] bg-white">
      <CardContent className="space-y-2 p-4">
        <p className="section-label">{label}</p>
        <div className="text-[1.1rem] font-semibold text-slate-950">{value}</div>
        <p className="text-[0.8rem] leading-6 text-slate-500">{note}</p>
      </CardContent>
    </Card>
  );
}

function EditorPanel({
  eyebrow,
  title,
  description,
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-[28px] bg-white">
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="section-label">{eyebrow}</p>
            <h3 className="mt-1.5 text-base font-semibold text-slate-950">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
          </div>
          {action}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function SignalRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[18px] border border-slate-200 bg-slate-50 px-3.5 py-3">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span className="text-sm font-semibold text-slate-950">{value}</span>
    </div>
  );
}
