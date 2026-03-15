"use client";

import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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

export function MasterProfileEditor({
  initialData,
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
  primaryCountry: "GHANA" | "UK" | "USA" | "CANADA" | "EUROPE" | "REMOTE";
}) {
  const [form, setForm] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [summaryPending, setSummaryPending] = useState(false);
  const [skillsPending, setSkillsPending] = useState(false);

  async function saveProfile() {
    setSaving(true);

    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const payload = await response.json();
    setSaving(false);

    if (!response.ok) {
      toast.error("Could not save profile", {
        description: typeof payload.error === "string" ? payload.error : "Please review the form and try again.",
      });
      return;
    }

    toast.success("Master profile saved");
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
    <div className="space-y-6">
      <Card className="rounded-[30px] bg-white">
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="section-label">Verified source of truth</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Master Profile</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
              Everything here powers resume versions, cover letters, and AI rewriting. Keep it factual and recruiter-trustworthy.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="accent">Private by default</Badge>
            <Button type="button" variant="secondary" onClick={handleSuggestSkills} disabled={skillsPending}>
              {skillsPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Suggest skills
            </Button>
            <Button type="button" onClick={saveProfile} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save profile
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="core">
        <TabsList>
          <TabsTrigger value="core">Core</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="projects">Projects & leadership</TabsTrigger>
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
        </TabsList>

        <TabsContent value="core" className="space-y-6">
          <Card className="rounded-[30px] bg-white">
            <CardContent className="grid gap-4 p-6 md:grid-cols-2">
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

          <Card className="rounded-[30px] bg-white">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">Professional summary</h3>
                  <p className="text-sm leading-7 text-slate-500">
                    Keep this grounded in facts. BorderlessCV will not invent outcomes or qualifications.
                  </p>
                </div>
                <Button type="button" variant="secondary" onClick={handleGenerateSummary} disabled={summaryPending}>
                  {summaryPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Generate from profile facts
                </Button>
              </div>
              <Textarea value={form.professionalSummary} onChange={(event) => setForm((current) => ({ ...current, professionalSummary: event.target.value }))} className="min-h-[180px]" />
            </CardContent>
          </Card>

          <Card className="rounded-[30px] bg-white">
            <CardContent className="space-y-6 p-6">
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
        </TabsContent>

        <TabsContent value="experience" className="space-y-6">
          <ListSectionEditor
            title="Education"
            description="Include degree, institution, key coursework, thesis, or academic proof when relevant."
            items={form.content.education}
            onChange={(education) => setForm((current) => ({ ...current, content: { ...current.content, education } }))}
          />
          <ListSectionEditor
            title="Work experience"
            description="Focus on facts, scope, and results. If metrics are missing, note the result without inventing numbers."
            items={form.content.experience}
            onChange={(experience) => setForm((current) => ({ ...current, content: { ...current.content, experience } }))}
          />
          <ListSectionEditor
            title="Internships"
            description="Internships matter strongly for low-experience candidates, especially when tied to tools or outcomes."
            items={form.content.internships}
            onChange={(internships) => setForm((current) => ({ ...current, content: { ...current.content, internships } }))}
          />
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <ListSectionEditor
            title="Projects"
            description="Projects are often your strongest proof early on. Be explicit about scope, stack, and outcome."
            items={form.content.projects}
            onChange={(projects) => setForm((current) => ({ ...current, content: { ...current.content, projects } }))}
          />
          <ListSectionEditor
            title="Leadership & activities"
            description="Student clubs, campus leadership, and community work can strengthen hiring confidence when framed well."
            items={form.content.leadership}
            onChange={(leadership) => setForm((current) => ({ ...current, content: { ...current.content, leadership } }))}
          />
          <ListSectionEditor
            title="Volunteer experience"
            description="Volunteer work is especially helpful for early-career candidates when it demonstrates responsibility or initiative."
            items={form.content.volunteer}
            onChange={(volunteer) => setForm((current) => ({ ...current, content: { ...current.content, volunteer } }))}
          />
        </TabsContent>

        <TabsContent value="credentials" className="space-y-6">
          <CertificationEditor
            items={form.content.certifications}
            onChange={(certifications) => setForm((current) => ({ ...current, content: { ...current.content, certifications } }))}
          />
          <AwardEditor
            items={form.content.awards}
            onChange={(awards) => setForm((current) => ({ ...current, content: { ...current.content, awards } }))}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
