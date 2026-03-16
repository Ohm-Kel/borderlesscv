import Link from "next/link";
import { BriefcaseBusiness, CalendarClock, FileText, Plus, Sparkles, Target } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { requireOnboardedUser } from "@/lib/session";

const countryCodes: Record<string, string> = {
  GHANA: "GH",
  UK: "UK",
  USA: "US",
  CANADA: "CA",
  EUROPE: "EU",
  REMOTE: "RM",
};

const statusStyles: Record<string, string> = {
  APPLYING: "border-blue-200 bg-blue-50 text-blue-700",
  APPLIED: "border-slate-200 bg-slate-50 text-slate-600",
  INTERVIEW: "border-amber-200 bg-amber-50 text-amber-700",
  OFFER: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-600",
  WITHDRAWN: "border-slate-200 bg-slate-50 text-slate-500",
};

function isUrgentFollowUp(nextStepAt: Date | null) {
  if (!nextStepAt) {
    return false;
  }

  return Math.ceil((nextStepAt.getTime() - Date.now()) / 86400000) <= 2;
}

export default async function DashboardPage() {
  const user = await requireOnboardedUser();

  const [profile, resumes, applications, applicationCount, upcomingFollowUps, coverLetterCount] = await Promise.all([
    prisma.masterProfile.findUnique({
      where: { userId: user.id },
      select: { profileCompleteness: true },
    }),
    prisma.resume.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        versions: { orderBy: { versionNumber: "desc" }, take: 1 },
      },
    }),
    prisma.application.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.application.count({ where: { userId: user.id } }),
    prisma.application.findMany({
      where: { userId: user.id, nextStepAt: { not: null } },
      orderBy: { nextStepAt: "asc" },
      take: 4,
    }),
    prisma.coverLetter.count({ where: { userId: user.id } }),
  ]);

  const completeness = profile?.profileCompleteness ?? 0;
  const versionCount = resumes.reduce((count, resume) => count + resume.versions.length, 0);
  const firstName = user.name?.split(" ")[0] || "there";

  const stats = [
    {
      label: "Profile",
      value: `${completeness}%`,
      icon: Target,
      href: "/profile",
      subtext: completeness < 80 ? "Needs more proof" : "In good shape",
    },
    {
      label: "Resume versions",
      value: versionCount.toString(),
      icon: FileText,
      href: "/resumes",
      subtext: resumes.length === 0 ? "No drafts yet" : `${resumes.length} base resume${resumes.length === 1 ? "" : "s"}`,
    },
    {
      label: "Applications",
      value: applicationCount.toString(),
      icon: BriefcaseBusiness,
      href: "/applications",
      subtext: applicationCount === 0 ? "Tracker empty" : "Actively tracked",
    },
    {
      label: "Cover letters",
      value: coverLetterCount.toString(),
      icon: Sparkles,
      href: "/cover-letters",
      subtext: coverLetterCount === 0 ? "No drafts saved" : "Reusable drafts",
    },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <section className="surface-card flex h-[58px] items-center justify-between gap-4 rounded-[24px] border border-white/75 px-4 shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-700">
            Welcome back, {firstName}. Keep your profile verified and track what is moving.
          </p>
        </div>
        <Button asChild size="sm" className="shrink-0">
          <Link href="/resumes">
            <Plus className="h-4 w-4" />
            New resume
          </Link>
        </Button>
      </section>

      <div className="grid gap-3 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="rounded-[22px] border border-white/75 bg-white/92 px-4 py-3 shadow-[0_8px_22px_rgba(15,23,42,0.05)] transition hover:border-slate-200 hover:shadow-[0_12px_30px_rgba(15,23,42,0.07)]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] bg-slate-950 text-white">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-end gap-2">
                    <p className="text-[1.35rem] font-semibold tracking-[-0.04em] text-slate-950">{stat.value}</p>
                    <p className="pb-0.5 text-[0.76rem] font-medium text-slate-500">{stat.label}</p>
                  </div>
                  <p className="truncate text-[0.72rem] text-slate-400">{stat.subtext}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="min-h-0 rounded-[26px] border border-white/75 bg-white/92 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3.5">
            <div>
              <p className="section-label">Recent resumes</p>
              <h2 className="mt-1 text-[1.05rem] font-semibold text-slate-950">Library activity</h2>
            </div>
            <Button asChild size="sm" variant="secondary">
              <Link href="/resumes">Open library</Link>
            </Button>
          </div>

          {resumes.length === 0 ? (
            <div className="m-4 rounded-[22px] border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center text-sm text-slate-500">
              Start your first base resume to see versions, exports, and fit guidance here.
            </div>
          ) : (
            <div className="flex h-[calc(100%-78px)] min-h-0 flex-col">
              <div className="hidden grid-cols-[minmax(0,1.7fr)_0.7fr_0.8fr_0.7fr] gap-4 border-b border-slate-200 px-4 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-500 md:grid">
                <span>Resume</span>
                <span>Country</span>
                <span>Updated</span>
                <span className="text-right">Version</span>
              </div>
              <ScrollArea className="min-h-0 flex-1">
                <div className="divide-y divide-slate-200">
                  {resumes.map((resume) => (
                    <Link
                      key={resume.id}
                      href={`/resumes/${resume.id}`}
                      className="block px-4 py-3 transition hover:bg-slate-50/70"
                    >
                      <div className="flex flex-col gap-3 md:grid md:grid-cols-[minmax(0,1.7fr)_0.7fr_0.8fr_0.7fr] md:items-center md:gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-950">{resume.title}</p>
                          <p className="truncate text-xs text-slate-400">{resume.targetRole || "No target role set"}</p>
                        </div>
                        <div>
                          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[0.66rem] font-semibold text-slate-600">
                            {countryCodes[resume.targetCountry ?? ""] ?? "CV"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{formatDate(resume.updatedAt, "MMM d, yyyy")}</p>
                        <div className="text-left md:text-right">
                          <span className="inline-flex rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[0.66rem] font-semibold text-slate-500">
                            v{resume.versions[0]?.versionNumber ?? 1}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </section>

        <div className="grid min-h-0 gap-3 xl:grid-rows-[minmax(0,1fr)_minmax(220px,auto)]">
          <section className="min-h-0 rounded-[26px] border border-white/75 bg-white/92 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3.5">
              <div>
                <p className="section-label">Applications</p>
                <h2 className="mt-1 text-[1.05rem] font-semibold text-slate-950">Latest movement</h2>
              </div>
              <Button asChild size="sm" variant="secondary">
                <Link href="/applications">Open tracker</Link>
              </Button>
            </div>

            {applications.length === 0 ? (
              <div className="m-4 rounded-[22px] border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center text-sm text-slate-500">
                Add applications once you start submitting so the exact resume version stays attached.
              </div>
            ) : (
              <div className="flex h-[calc(100%-78px)] min-h-0 flex-col">
                <div className="hidden grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_0.8fr_0.85fr] gap-4 border-b border-slate-200 px-4 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-500 md:grid">
                  <span>Role</span>
                  <span>Company</span>
                  <span>Status</span>
                  <span>Location</span>
                </div>
                <ScrollArea className="min-h-0 flex-1">
                  <div className="divide-y divide-slate-200">
                    {applications.map((application) => (
                      <div key={application.id} className="px-4 py-3">
                        <div className="flex flex-col gap-3 md:grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_0.8fr_0.85fr] md:items-center md:gap-4">
                          <p className="truncate text-sm font-semibold text-slate-950">{application.role}</p>
                          <p className="truncate text-sm text-slate-600">{application.company}</p>
                          <div>
                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-[0.66rem] font-semibold ${statusStyles[application.status] ?? statusStyles.APPLIED}`}>
                              {application.status}
                            </span>
                          </div>
                          <p className="truncate text-sm text-slate-500">{application.location || application.country || "No location"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </section>

          <section className="rounded-[26px] border border-white/75 bg-white/92 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-slate-950 text-white">
                  <CalendarClock className="h-4 w-4" />
                </div>
                <div>
                  <p className="section-label">Next up</p>
                  <h2 className="mt-1 text-[1.05rem] font-semibold text-slate-950">Follow-ups</h2>
                </div>
              </div>
            </div>

            {upcomingFollowUps.length === 0 ? (
              <div className="m-4 rounded-[20px] bg-slate-50 px-4 py-4 text-sm text-slate-500">
                No follow-up dates scheduled yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {upcomingFollowUps.map((application) => {
                  const urgent = isUrgentFollowUp(application.nextStepAt);
                  return (
                    <div key={application.id} className="grid gap-3 px-4 py-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_0.8fr] md:items-center">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950">{application.role}</p>
                        <p className="truncate text-xs text-slate-400">{application.company}</p>
                      </div>
                      <p className="text-sm text-slate-600">{formatDate(application.nextStepAt, "EEE, MMM d")}</p>
                      <div className="md:text-right">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[0.66rem] font-semibold ${urgent ? "border-amber-200 bg-amber-50 text-amber-700" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
                          {urgent ? "Soon" : "Scheduled"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
