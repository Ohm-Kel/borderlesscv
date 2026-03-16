"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarClock, ExternalLink, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [showComposer, setShowComposer] = useState(initialApplications.length === 0);
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

  const upcomingFollowUps = useMemo(
    () =>
      [...applications]
        .filter((application) => application.nextStepAt)
        .sort((left, right) => new Date(left.nextStepAt!).getTime() - new Date(right.nextStepAt!).getTime())
        .slice(0, 6),
    [applications],
  );

  const counts = useMemo(
    () =>
      STATUSES.map((status) => ({
        status,
        count: applications.filter((item) => item.status === status).length,
      })),
    [applications],
  );

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
    setShowComposer(false);
    toast.success("Application added");
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

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <section className="surface-card flex h-[56px] items-center justify-between gap-4 rounded-[24px] border border-white/75 px-4 shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-700">
            Application tracker. {applications.length} role{applications.length === 1 ? "" : "s"} tracked with version-aware follow-up history.
          </p>
        </div>
        <Button size="sm" variant={showComposer ? "default" : "secondary"} className="shrink-0" onClick={() => setShowComposer((current) => !current)}>
          <Plus className="h-4 w-4" />
          Add application
        </Button>
      </section>

      <div className="grid gap-2 lg:grid-cols-6">
        {counts.map((item) => (
          <div key={item.status} className="rounded-[18px] border border-white/75 bg-white/92 px-3 py-2.5 shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-400">{item.status}</p>
            <p className="mt-1 text-lg font-semibold text-slate-950">{item.count}</p>
          </div>
        ))}
      </div>

      {showComposer ? (
        <Card className="rounded-[26px] bg-white">
          <CardContent className="space-y-4 p-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
              <Field label="Job URL">
                <Input value={form.jobUrl} onChange={(event) => setForm((current) => ({ ...current, jobUrl: event.target.value }))} />
              </Field>
              <Field label="Applied date">
                <Input type="date" value={form.appliedAt} onChange={(event) => setForm((current) => ({ ...current, appliedAt: event.target.value }))} />
              </Field>
              <Field label="Next step">
                <Input type="date" value={form.nextStepAt} onChange={(event) => setForm((current) => ({ ...current, nextStepAt: event.target.value }))} />
              </Field>
              <div className="md:col-span-2 xl:col-span-4">
                <Field label="Notes">
                  <Textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} className="min-h-[96px]" />
                </Field>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowComposer(false)}>
                Cancel
              </Button>
              <Button onClick={createApplication} disabled={creating}>
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Save application
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[1.18fr_0.82fr]">
        <section className="min-h-0 rounded-[26px] border border-white/75 bg-white/92 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3.5">
            <div>
              <p className="section-label">Pipeline</p>
              <h2 className="mt-1 text-[1.05rem] font-semibold text-slate-950">Tracked applications</h2>
            </div>
            <Badge variant="outline">{applications.length} total</Badge>
          </div>

          {applications.length === 0 ? (
            <div className="m-4 rounded-[22px] border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center text-sm text-slate-500">
              Add your first application to connect the role, resume version, and next step in one place.
            </div>
          ) : (
            <div className="flex h-[calc(100%-78px)] min-h-0 flex-col">
              <div className="hidden grid-cols-[minmax(0,1.35fr)_1fr_0.8fr_0.85fr_0.3fr] gap-4 border-b border-slate-200 px-4 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-500 lg:grid">
                <span>Role</span>
                <span>Resume version</span>
                <span>Status</span>
                <span>Next step</span>
                <span />
              </div>
              <ScrollArea className="min-h-0 flex-1">
                <div className="divide-y divide-slate-200">
                  {applications.map((application) => (
                    <div key={application.id} className="px-4 py-3">
                      <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1.35fr)_1fr_0.8fr_0.85fr_0.3fr] lg:items-center lg:gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-950">{application.role}</p>
                          <p className="truncate text-xs text-slate-400">
                            {application.company} • {application.location || application.country || "No location"}
                          </p>
                          {application.notes ? <p className="mt-1 line-clamp-2 text-xs text-slate-500">{application.notes}</p> : null}
                        </div>

                        <div>
                          <p className="truncate text-sm text-slate-700">{application.resumeVersionLabel || "No version attached"}</p>
                          {application.source ? <p className="truncate text-xs text-slate-400">{application.source}</p> : null}
                        </div>

                        <div>
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

                        <div className="text-sm text-slate-600">
                          {application.nextStepAt ? formatDate(application.nextStepAt, "MMM d, yyyy") : "Not scheduled"}
                        </div>

                        <div className="flex justify-start lg:justify-end">
                          {application.jobUrl ? (
                            <Link href={application.jobUrl} target="_blank" className="text-slate-400 transition hover:text-slate-700">
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          ) : (
                            <span className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </section>

        <div className="grid min-h-0 gap-3 xl:grid-rows-[auto_minmax(0,1fr)]">
          <section className="rounded-[26px] border border-white/75 bg-white/92 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-slate-950 text-white">
                <CalendarClock className="h-4 w-4" />
              </div>
              <div>
                <p className="section-label">Upcoming</p>
                <h2 className="mt-1 text-[1.05rem] font-semibold text-slate-950">Follow-ups</h2>
              </div>
            </div>

            {upcomingFollowUps.length === 0 ? (
              <div className="m-4 rounded-[20px] bg-slate-50 px-4 py-4 text-sm text-slate-500">
                No follow-up dates scheduled yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {upcomingFollowUps.map((application) => (
                  <div key={application.id} className="grid gap-3 px-4 py-3 md:grid-cols-[minmax(0,1.2fr)_0.8fr_0.8fr] md:items-center">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-950">{application.role}</p>
                      <p className="truncate text-xs text-slate-400">{application.company}</p>
                    </div>
                    <p className="text-sm text-slate-600">{formatDate(application.nextStepAt, "EEE, MMM d")}</p>
                    <div className="md:text-right">
                      <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[0.66rem] font-semibold text-slate-500">
                        {application.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="min-h-0 rounded-[26px] border border-white/75 bg-white/92 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3.5">
              <div>
                <p className="section-label">Stage mix</p>
                <h2 className="mt-1 text-[1.05rem] font-semibold text-slate-950">Pipeline counts</h2>
              </div>
            </div>
            <ScrollArea className="h-[calc(100%-78px)]">
              <div className="grid gap-2 p-4 sm:grid-cols-2">
                {counts.map((item) => (
                  <div key={item.status} className="rounded-[18px] border border-slate-200 bg-slate-50/70 px-3 py-3">
                    <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-400">{item.status}</p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">{item.count}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </section>
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
