"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarClock, ChevronDown, ExternalLink, Loader2, Plus } from "lucide-react";
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
        .slice(0, 4),
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
    <div className="grid h-full min-h-0 gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
      <div className="flex min-h-0 flex-col gap-4">
        <Card className="rounded-[28px] bg-white">
          <CardContent className="space-y-4 p-4">
            <div>
              <p className="section-label">Tracker</p>
              <h2 className="mt-1 text-[1.2rem] font-semibold text-slate-950">Application tracker</h2>
              <p className="mt-1 text-sm text-slate-500">
                Keep each role, resume version, and next step tied together.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {counts.map((item) => (
                <div key={item.status} className="rounded-[18px] border border-slate-200 bg-slate-50/70 px-3 py-2.5">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {item.status}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">{item.count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <details className="group overflow-hidden rounded-[28px] border border-white/75 bg-white/92 shadow-[0_10px_30px_rgba(15,23,42,0.05)]" open={!applications.length}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4">
            <div>
              <p className="section-label">New application</p>
              <h3 className="mt-1 text-base font-semibold text-slate-950">Capture role, source, and resume used</h3>
            </div>
            <span className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition group-open:bg-slate-950 group-open:text-white">
              Add
              <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-open:rotate-180" />
            </span>
          </summary>
          <div className="border-t border-slate-100 px-4 pb-4 pt-3">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
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
              <Field label="Notes">
                <Textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} className="min-h-[92px]" />
              </Field>
            </div>
            <div className="mt-3">
              <Button onClick={createApplication} disabled={creating}>
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add application
              </Button>
            </div>
          </div>
        </details>

        <Card className="min-h-0 rounded-[28px] bg-white">
          <CardContent className="flex h-full min-h-0 flex-col p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-slate-950 text-white">
                <CalendarClock className="h-4 w-4" />
              </div>
              <div>
                <p className="section-label">Upcoming</p>
                <h3 className="mt-1 text-base font-semibold text-slate-950">Follow-ups</h3>
              </div>
            </div>
            {upcomingFollowUps.length ? (
              <ScrollArea className="min-h-0 flex-1 pr-3">
                <div className="space-y-3">
                  {upcomingFollowUps.map((application) => (
                    <div key={application.id} className="rounded-[20px] border border-slate-200 px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-semibold text-slate-950">{application.role}</h4>
                          <p className="text-xs text-slate-500">{application.company}</p>
                        </div>
                        <Badge variant="outline">{application.status}</Badge>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        Next step: {formatDate(application.nextStepAt, "EEE, MMM d")}
                      </p>
                      {application.resumeVersionLabel ? (
                        <p className="mt-1 text-[0.68rem] uppercase tracking-[0.18em] text-slate-400">
                          {application.resumeVersionLabel}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="rounded-[20px] bg-slate-50 px-4 py-4 text-sm text-slate-500">
                No follow-up dates scheduled yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="min-h-0 rounded-[28px] bg-white">
        <CardContent className="flex h-full min-h-0 flex-col p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="section-label">Pipeline</p>
              <h2 className="mt-1 text-[1.2rem] font-semibold text-slate-950">Stage view</h2>
            </div>
            <Badge variant="outline">{applications.length} total</Badge>
          </div>
          <ScrollArea className="min-h-0 flex-1 pr-3">
            <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
              {STATUSES.map((status) => {
                const items = applications.filter((item) => item.status === status);
                return (
                  <section key={status} className="rounded-[22px] border border-slate-200 bg-slate-50/40 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="section-label">{status}</p>
                        <h3 className="mt-1 text-sm font-semibold text-slate-950">
                          {items.length} item{items.length === 1 ? "" : "s"}
                        </h3>
                      </div>
                      <Badge variant="outline">{items.length}</Badge>
                    </div>
                    <div className="mt-3 space-y-3">
                      {items.length === 0 ? (
                        <div className="rounded-[18px] border border-dashed border-slate-200 bg-white px-3 py-4 text-sm text-slate-400">
                          No applications here yet.
                        </div>
                      ) : (
                        items.map((application) => (
                          <div key={application.id} className="rounded-[18px] border border-slate-200 bg-white px-3.5 py-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h4 className="truncate text-sm font-semibold text-slate-950">{application.role}</h4>
                                <p className="truncate text-xs text-slate-500">{application.company}</p>
                              </div>
                              {application.jobUrl ? (
                                <Link href={application.jobUrl} target="_blank" className="shrink-0 text-slate-400 transition hover:text-slate-700">
                                  <ExternalLink className="h-4 w-4" />
                                </Link>
                              ) : null}
                            </div>
                            <p className="mt-2 text-[0.7rem] uppercase tracking-[0.16em] text-slate-400">
                              {application.location || application.country || "No location"}
                            </p>
                            {application.resumeVersionLabel ? (
                              <p className="mt-2 text-xs text-slate-500">{application.resumeVersionLabel}</p>
                            ) : null}
                            {application.nextStepAt ? (
                              <p className="mt-1 text-xs text-slate-500">Next step: {formatDate(application.nextStepAt, "MMM d")}</p>
                            ) : null}
                            {application.notes ? (
                              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{application.notes}</p>
                            ) : null}
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
                        ))
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
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
