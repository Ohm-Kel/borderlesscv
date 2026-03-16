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
          <div>
            <p className="section-label">Verified source of truth</p>
            <h2 className="mt-1.5 text-[1.35rem] font-semibold text-slate-950">Master profile</h2>
            <p className="mt-1 text-sm text-slate-500">
              Verified facts only. Everything here powers resumes, cover letters, and tailoring.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2.5 text-[0.76rem] text-slate-500">
              <span>Complete: {profileCompleteness || initialProfileCompleteness}%</span>
              <span>Autosave: {saveState}</span>
              {lastSavedAt ? <span>Saved {formatDate(lastSavedAt, "MMM d, h:mm a")}</span> : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="accent">Private by default</Badge>
            <Badge variant="outline">Autosave on</Badge>
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

      <Tabs defaultValue="core" className="flex min-h-0 flex-1 flex-col gap-3">
        <TabsList className="h-10 self-start">
          <TabsTrigger value="core">Core</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="projects">Projects & leadership</TabsTrigger>
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
        </TabsList>

        <TabsContent value="core" className="mt-0 min-h-0 flex-1">
          <ScrollArea className="h-full pr-3">
            <div className="space-y-4">
              <Card className="rounded-[28px] bg-white">
                <CardContent className="grid gap-4 p-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Full name</Label>
                    <Input value={form.personalDetails.name} onChange={(event) => setForm((current) => ({ ...current, personalDetails: { ...current.personalDetails, name: event.target.value } }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Headline</Label>
                    <Input value={form.personalDetails.headline} onChange={(event) => setForm((current) => ({ ...current, personalDetails: { ...current.personalDetails, headline: event.target.value } }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input value={form.personalDetails.location} onChange={(event) => setForm((current) => ({ ...current, personalDetails: { ...current.personalDetails, location: event.target.value } }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={form.personalDetails.phone} onChange={(event) => setForm((current) => ({ ...current, personalDetails: { ...current.personalDetails, phone: event.target.value } }))} />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[28px] bg-white">
                <CardContent className="space-y-4 p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-slate-950">Professional summary</h3>
                      <p className="text-sm text-slate-500">
                        Keep it grounded in facts you can defend.
                      </p>
                    </div>
                    <Button type="button" variant="secondary" onClick={handleGenerateSummary} disabled={summaryPending}>
                      {summaryPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      Generate from profile facts
                    </Button>
                  </div>
                  <Textarea value={form.professionalSummary} onChange={(event) => setForm((current) => ({ ...current, professionalSummary: event.target.value }))} className="min-h-[150px]" />
                </CardContent>
              </Card>

              <Card className="rounded-[28px] bg-white">
                <CardContent className="space-y-5 p-5">
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
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="experience" className="mt-0 min-h-0 flex-1">
          <ScrollArea className="h-full pr-3">
            <div className="space-y-4">
              <ListSectionEditor
                title="Education"
                description="Include degree, institution, coursework, thesis, or academic proof when relevant."
                items={form.content.education}
                onChange={(education) => setForm((current) => ({ ...current, content: { ...current.content, education } }))}
              />
              <ListSectionEditor
                title="Work experience"
                description="Focus on facts, scope, and defensible outcomes."
                items={form.content.experience}
                onChange={(experience) => setForm((current) => ({ ...current, content: { ...current.content, experience } }))}
              />
              <ListSectionEditor
                title="Internships"
                description="Internships matter strongly for low-experience candidates."
                items={form.content.internships}
                onChange={(internships) => setForm((current) => ({ ...current, content: { ...current.content, internships } }))}
              />
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="projects" className="mt-0 min-h-0 flex-1">
          <ScrollArea className="h-full pr-3">
            <div className="space-y-4">
              <ListSectionEditor
                title="Projects"
                description="Be explicit about scope, stack, and outcome."
                items={form.content.projects}
                onChange={(projects) => setForm((current) => ({ ...current, content: { ...current.content, projects } }))}
              />
              <ListSectionEditor
                title="Leadership & activities"
                description="Student clubs and leadership can strengthen hiring confidence."
                items={form.content.leadership}
                onChange={(leadership) => setForm((current) => ({ ...current, content: { ...current.content, leadership } }))}
              />
              <ListSectionEditor
                title="Volunteer experience"
                description="Use volunteer work that demonstrates ownership or initiative."
                items={form.content.volunteer}
                onChange={(volunteer) => setForm((current) => ({ ...current, content: { ...current.content, volunteer } }))}
              />
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="credentials" className="mt-0 min-h-0 flex-1">
          <ScrollArea className="h-full pr-3">
            <div className="space-y-4">
              <CertificationEditor
                items={form.content.certifications}
                onChange={(certifications) => setForm((current) => ({ ...current, content: { ...current.content, certifications } }))}
              />
              <AwardEditor
                items={form.content.awards}
                onChange={(awards) => setForm((current) => ({ ...current, content: { ...current.content, awards } }))}
              />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
