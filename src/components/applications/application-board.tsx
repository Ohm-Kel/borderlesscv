"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarClock, ExternalLink, FileText, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";

const STATUSES = ["SAVED", "APPLIED", "INTERVIEW", "OFFER", "REJECTED", "WITHDRAWN"] as const;

type Application = {
  id: string;
  company: string;
  role: string;
  location: string | null;
  country: string | null;
  jobUrl: string | null;
  source: string | null;
  notes: string | null;
  status: (typeof STATUSES)[number];
  appliedAt: string | null;
  nextStepAt: string | null;
  resumeId: string | null;
  resumeVersionId: string | null;
  resumeTitle: string | null;
  resumeVersionLabel: string | null;
};

export function ApplicationBoard({
  initialApplications,
  resumeOptions,
  resumeVersionOptions,
}: {
  initialApplications: Application[];
  resumeOptions: Array<{ value: string; label: string }>;
  resumeVersionOptions: Array<{ value: string; label: string; resumeId: string }>;
}) {
  const [applications, setApplications] = useState(initialApplications);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    company: "",
    role: "",
    location: "",
    country: "",
    jobUrl: "",
    source: "",
    notes: "",
    status: "SAVED" as Application["status"],
    appliedAt: "",
    nextStepAt: "",
    resumeId: "",
    resumeVersionId: "",
  });

  const filteredVersionOptions = form.resumeId
    ? resumeVersionOptions.filter((option) => option.resumeId === form.resumeId)
    : resumeVersionOptions;

  async function createApplication() {
    setCreating(true);
    const response = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const payload = await response.json();
    setCreating(false);

    if (!response.ok) {
      toast.error("Could not save application");
      return;
    }

    setApplications((current) => [
      {
        id: payload.applicationId,
        company: form.company,
        role: form.role,
        location: form.location || null,
        country: form.country || null,
        jobUrl: form.jobUrl || null,
        source: form.source || null,
        notes: form.notes || null,
        status: form.status,
        appliedAt: form.appliedAt || null,
        nextStepAt: form.nextStepAt || null,
        resumeId: form.resumeId || null,
        resumeVersionId: form.resumeVersionId || null,
        resumeTitle: resumeOptions.find((option) => option.value === form.resumeId)?.label || null,
        resumeVersionLabel: resumeVersionOptions.find((option) => option.value === form.resumeVersionId)?.label || null,
      },
      ...current,
    ]);
    setForm({
      company: "",
      role: "",
      location: "",
      country: "",
      jobUrl: "",
      source: "",
      notes: "",
      status: "SAVED",
      appliedAt: "",
      nextStepAt: "",
      resumeId: "",
      resumeVersionId: "",
    });
  }

  async function updateStatus(applicationId: string, status: Application["status"]) {
    const application = applications.find((item) => item.id === applicationId);
    if (!application) return;

    setApplications((current) => current.map((item) => (item.id === applicationId ? { ...item, status } : item)));
    await fetch(`/api/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...application,
        status,
      }),
    });
  }

  const upcomingFollowUps = [...applications]
    .filter((application) => application.nextStepAt)
    .sort((left, right) => new Date(left.nextStepAt!).getTime() - new Date(right.nextStepAt!).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <Card className="rounded-[32px] bg-white">
        <CardContent className="grid gap-4 p-6 xl:grid-cols-3">
          <Field label="Company">
            <Input value={form.company} onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))} />
          </Field>
          <Field label="Role">
            <Input value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} />
          </Field>
          <Field label="Location">
            <Input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} />
          </Field>
          <Field label="Country">
            <Select value={form.country || ""} onValueChange={(value) => setForm((current) => ({ ...current, country: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {["GHANA", "UK", "USA", "CANADA", "EUROPE", "REMOTE"].map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Resume">
            <Select
              value={form.resumeId || ""}
              onValueChange={(value) =>
                setForm((current) => ({
                  ...current,
                  resumeId: value,
                  resumeVersionId:
                    resumeVersionOptions.some((option) => option.value === current.resumeVersionId && option.resumeId === value)
                      ? current.resumeVersionId
                      : "",
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Attach resume" />
              </SelectTrigger>
              <SelectContent>
                {resumeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Resume version">
            <Select
              value={form.resumeVersionId || ""}
              onValueChange={(value) => {
                const selectedVersion = resumeVersionOptions.find((option) => option.value === value);
                setForm((current) => ({
                  ...current,
                  resumeVersionId: value,
                  resumeId: selectedVersion?.resumeId || current.resumeId,
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Attach version used" />
              </SelectTrigger>
              <SelectContent>
                {filteredVersionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Source">
            <Input value={form.source} onChange={(event) => setForm((current) => ({ ...current, source: event.target.value }))} placeholder="LinkedIn, referral..." />
          </Field>
          <div className="xl:col-span-2">
            <Field label="Job URL">
              <Input value={form.jobUrl} onChange={(event) => setForm((current) => ({ ...current, jobUrl: event.target.value }))} />
            </Field>
          </div>
          <Field label="Applied date">
            <Input type="date" value={form.appliedAt} onChange={(event) => setForm((current) => ({ ...current, appliedAt: event.target.value }))} />
          </Field>
          <Field label="Next step date">
            <Input type="date" value={form.nextStepAt} onChange={(event) => setForm((current) => ({ ...current, nextStepAt: event.target.value }))} />
          </Field>
          <div className="xl:col-span-3">
            <Field label="Notes">
              <Textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} className="min-h-[110px]" />
            </Field>
          </div>
          <div className="xl:col-span-3">
            <Button onClick={createApplication} disabled={creating}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add application
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="rounded-[30px] bg-white">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div>
                <p className="section-label">Upcoming follow-ups</p>
                <h3 className="mt-1 font-semibold text-slate-950">What needs attention next</h3>
              </div>
            </div>
            {upcomingFollowUps.length ? (
              <div className="space-y-3">
                {upcomingFollowUps.map((application) => (
                  <div key={application.id} className="rounded-[24px] border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-slate-950">{application.role}</h4>
                        <p className="text-sm text-slate-500">{application.company}</p>
                      </div>
                      <Badge variant="outline">{application.status}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      Next step: {formatDate(application.nextStepAt, "EEE, MMM d")}
                    </p>
                    {application.resumeVersionLabel ? (
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{application.resumeVersionLabel}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[24px] bg-slate-100 p-4 text-sm leading-7 text-slate-500">
                No upcoming follow-ups yet. Add a next step date when you schedule an interview, send a follow-up, or expect a recruiter response.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[30px] bg-white">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="section-label">Version tracking</p>
                <h3 className="mt-1 font-semibold text-slate-950">Know which resume was used</h3>
              </div>
            </div>
            <div className="rounded-[24px] bg-slate-100 p-4 text-sm leading-7 text-slate-500">
              Attach the exact resume version you used for each application so you can learn which tailored drafts perform best over time.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-6">
        {STATUSES.map((status) => (
          <Card key={status} className="rounded-[28px] bg-white">
            <CardContent className="space-y-4 p-4">
              <div>
                <p className="section-label">{status}</p>
                <h3 className="mt-2 font-semibold text-slate-950">
                  {applications.filter((item) => item.status === status).length} item{applications.filter((item) => item.status === status).length === 1 ? "" : "s"}
                </h3>
              </div>
              <div className="space-y-3">
                {applications
                  .filter((item) => item.status === status)
                  .map((application) => (
                    <div key={application.id} className="rounded-[22px] border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-semibold text-slate-950">{application.role}</h4>
                          <p className="text-sm text-slate-500">{application.company}</p>
                        </div>
                        {application.jobUrl ? (
                          <Link href={application.jobUrl} target="_blank" className="text-slate-400 transition hover:text-slate-700">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        ) : null}
                      </div>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">{application.location || application.country || "No location"}</p>
                      {application.resumeVersionLabel ? <p className="mt-2 text-xs font-medium text-slate-500">{application.resumeVersionLabel}</p> : null}
                      {application.nextStepAt ? <p className="mt-2 text-xs text-slate-500">Next step: {formatDate(application.nextStepAt, "MMM d")}</p> : null}
                      {application.notes ? <p className="mt-3 text-sm leading-6 text-slate-600">{application.notes}</p> : null}
                      <div className="mt-3">
                        <Select value={application.status} onValueChange={(value) => updateStatus(application.id, value as Application["status"])}>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
              </div>
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
