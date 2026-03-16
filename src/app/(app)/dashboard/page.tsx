import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, CalendarClock, FileText, Plus, Sparkles, Target } from "lucide-react";

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
      take: 4,
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
    <div className="flex h-full min-h-0 flex-col gap-4">
      <section className="surface-card flex flex-col gap-3 rounded-[26px] border border-white/75 px-5 py-4 shadow-[0_12px_32px_rgba(15,23,42,0.06)] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="section-label">Overview</p>
          <h1 className="mt-1 text-[1.35rem] font-semibold tracking-[-0.03em] text-slate-950">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Keep your profile verified, tailor targeted versions, and track what is moving.
          </p>
        </div>
        <Button asChild className="w-fit shrink-0">
          <Link href="/resumes">
            <Plus className="h-4 w-4" />
            New resume
          </Link>
        </Button>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group rounded-[24px] border border-white/75 bg-white/92 px-4 py-3.5 shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-[14px] bg-slate-950 text-white">
                  <Icon className="h-4 w-4" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
              </div>
              <div className="mt-3">
                <p className="text-[1.55rem] font-semibold tracking-[-0.04em] text-slate-950">{stat.value}</p>
                <p className="text-[0.8rem] font-medium text-slate-500">{stat.label}</p>
                <p className="mt-0.5 text-[0.72rem] text-slate-400">{stat.subtext}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[1.02fr_0.98fr]">
        <section className="min-h-0 rounded-[28px] border border-white/75 bg-white/92 p-4 shadow-[0_12px_36px_rgba(15,23,42,0.06)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="section-label">Recent resumes</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-950">Library activity</h2>
            </div>
            <Button asChild size="sm" variant="secondary">
              <Link href="/resumes">Open library</Link>
            </Button>
          </div>

          {resumes.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center text-sm text-slate-500">
              Start your first base resume to see versions, exports, and fit guidance here.
            </div>
          ) : (
            <ScrollArea className="h-[calc(100%-68px)] pr-3">
              <div className="space-y-3">
                {resumes.map((resume) => (
                  <Link
                    key={resume.id}
                    href={`/resumes/${resume.id}`}
                    className="group flex items-center justify-between rounded-[20px] border border-slate-200/80 px-4 py-3 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50/80"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[0.66rem] font-semibold tracking-[0.18em] text-slate-500">
                          {countryCodes[resume.targetCountry ?? ""] ?? "CV"}
                        </span>
                        <h3 className="truncate text-sm font-semibold text-slate-950">{resume.title}</h3>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">Updated {formatDate(resume.updatedAt)}</p>
                    </div>
                    <span className="ml-3 shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[0.68rem] font-semibold text-slate-500">
                      v{resume.versions[0]?.versionNumber ?? 1}
                    </span>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          )}
        </section>

        <div className="grid min-h-0 gap-4 xl:grid-rows-[1fr_auto]">
          <section className="min-h-0 rounded-[28px] border border-white/75 bg-white/92 p-4 shadow-[0_12px_36px_rgba(15,23,42,0.06)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="section-label">Applications</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-950">Latest movement</h2>
              </div>
              <Button asChild size="sm" variant="secondary">
                <Link href="/applications">Open tracker</Link>
              </Button>
            </div>

            {applications.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center text-sm text-slate-500">
                Add applications once you start submitting so the exact resume version stays attached.
              </div>
            ) : (
              <ScrollArea className="h-[calc(100%-68px)] pr-3">
                <div className="space-y-2.5">
                  {applications.map((application) => (
                    <div key={application.id} className="rounded-[20px] border border-slate-200/80 px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-950">{application.role}</p>
                          <p className="truncate text-xs text-slate-400">{application.company}</p>
                        </div>
                        <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[0.66rem] font-semibold ${statusStyles[application.status] ?? statusStyles.APPLIED}`}>
                          {application.status}
                        </span>
                      </div>
                      <p className="mt-2 text-[0.72rem] text-slate-500">
                        {application.location || application.country || "Location not set"}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </section>

          <section className="rounded-[28px] border border-white/75 bg-white/92 p-4 shadow-[0_12px_36px_rgba(15,23,42,0.06)]">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[14px] bg-slate-950 text-white">
                <CalendarClock className="h-4 w-4" />
              </div>
              <div>
                <p className="section-label">Next up</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-950">Follow-ups</h2>
              </div>
            </div>

            {upcomingFollowUps.length === 0 ? (
              <p className="rounded-[20px] bg-slate-50 px-4 py-4 text-sm text-slate-500">
                No follow-up dates scheduled yet.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {upcomingFollowUps.map((application) => {
                  const urgent = isUrgentFollowUp(application.nextStepAt);
                  return (
                    <div
                      key={application.id}
                      className={`rounded-[20px] border px-4 py-3 ${urgent ? "border-amber-200 bg-amber-50/70" : "border-slate-200 bg-white"}`}
                    >
                      <p className="text-sm font-semibold text-slate-950">{application.role}</p>
                      <p className="text-xs text-slate-400">{application.company}</p>
                      <p className={`mt-2 text-[0.74rem] font-medium ${urgent ? "text-amber-700" : "text-slate-500"}`}>
                        {formatDate(application.nextStepAt, "EEE, MMM d")}
                      </p>
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
