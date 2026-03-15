import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, CalendarClock, FileText, Plus, Sparkles, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { requireOnboardedUser } from "@/lib/session";

const countryFlags: Record<string, string> = {
  GHANA: "🇬🇭",
  UK: "🇬🇧",
  USA: "🇺🇸",
  CANADA: "🇨🇦",
  EUROPE: "🇪🇺",
  REMOTE: "🌐",
};

const statusStyles: Record<string, { label: string; className: string }> = {
  APPLYING: { label: "Applying", className: "border-blue-200 bg-blue-50 text-blue-700" },
  APPLIED: { label: "Applied", className: "border-slate-200 bg-slate-50 text-slate-600" },
  INTERVIEW: { label: "Interview", className: "border-amber-200 bg-amber-50 text-amber-700" },
  OFFER: { label: "Offer", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  REJECTED: { label: "Rejected", className: "border-rose-200 bg-rose-50 text-rose-600" },
  WITHDRAWN: { label: "Withdrawn", className: "border-slate-200 bg-slate-50 text-slate-500" },
};

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
      take: 3,
      include: {
        versions: { orderBy: { versionNumber: "desc" }, take: 1 },
      },
    }),
    prisma.application.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 5,
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
  const currentTime = Date.now();

  const firstName = user.name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const stats = [
    {
      label: "Profile completeness",
      value: `${completeness}%`,
      icon: Target,
      href: "/profile",
      subtext: completeness < 80 ? "Keep building" : "Looking strong",
    },
    {
      label: "Resume versions",
      value: versionCount.toString(),
      icon: FileText,
      href: "/resumes",
      subtext: versionCount === 0 ? "None yet" : `Across ${resumes.length} resume${resumes.length === 1 ? "" : "s"}`,
    },
    {
      label: "Applications tracked",
      value: applicationCount.toString(),
      icon: BriefcaseBusiness,
      href: "/applications",
      subtext: applicationCount === 0 ? "Start tracking" : "In your pipeline",
    },
    {
      label: "Cover letters",
      value: coverLetterCount.toString(),
      icon: Sparkles,
      href: "/cover-letters",
      subtext: coverLetterCount === 0 ? "None drafted yet" : "Drafted",
    },
  ];

  return (
    <div className="space-y-7">

      {/* ── Greeting header ─────────────────────────────────── */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <p className="section-label">Overview</p>
          <h1 className="text-[1.85rem] font-semibold tracking-[-0.025em] text-slate-950">
            {greeting}, {firstName}
          </h1>
          <p className="text-[0.9rem] leading-[1.7] text-slate-500">
            Keep your profile fresh, create targeted resume versions, and track how each application is progressing.
          </p>
        </div>
        <Button asChild className="w-fit shrink-0 shadow-[0_14px_28px_rgba(15,23,42,0.16)] hover:shadow-[0_18px_36px_rgba(15,23,42,0.22)]">
          <Link href="/resumes">
            <Plus className="h-4 w-4" />
            Create resume
          </Link>
        </Button>
      </div>

      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group rounded-[28px] border border-white/75 bg-white/92 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm transition-all duration-200 hover:shadow-[0_16px_40px_rgba(15,23,42,0.10)] hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-slate-950 text-white shadow-[0_6px_18px_rgba(15,23,42,0.22)] transition-all duration-200 group-hover:shadow-[0_10px_26px_rgba(15,23,42,0.28)]">
                  <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-slate-500" />
              </div>
              <div className="mt-4">
                <p className="text-[2rem] font-bold tracking-[-0.04em] text-slate-950 leading-none">{stat.value}</p>
                <p className="mt-1 text-[0.8rem] font-medium text-slate-500">{stat.label}</p>
                <p className="mt-0.5 text-[0.72rem] text-slate-400">{stat.subtext}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Main content grid ───────────────────────────────── */}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">

        {/* Recent resumes */}
        <div className="rounded-[32px] border border-white/75 bg-white/92 p-6 shadow-[0_12px_36px_rgba(15,23,42,0.07)] backdrop-blur-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="section-label">Resume momentum</p>
              <h2 className="mt-1.5 text-[1.1rem] font-semibold text-slate-950">Recent resumes</h2>
            </div>
            <Button asChild variant="secondary" size="sm">
              <Link href="/resumes">Open library</Link>
            </Button>
          </div>

          {resumes.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-[24px] border border-dashed border-slate-200 bg-slate-50/50 px-5 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-slate-100 text-slate-400">
                <FileText className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-600">No resumes yet</p>
                <p className="text-xs text-slate-400">Start with your master profile, then create a country-aware base resume.</p>
              </div>
              <Button asChild size="sm">
                <Link href="/resumes">
                  <Plus className="h-3.5 w-3.5" />
                  Create first resume
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.map((resume) => (
                <Link
                  key={resume.id}
                  href={`/resumes/${resume.id}`}
                  className="group flex items-center justify-between rounded-[22px] border border-slate-200/70 px-5 py-4 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50/80 hover:shadow-[0_6px_18px_rgba(15,23,42,0.06)]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">
                        {countryFlags[resume.targetCountry ?? ""] ?? "📄"}
                      </span>
                      <h3 className="truncate text-[0.9rem] font-semibold text-slate-950">{resume.title}</h3>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Updated {formatDate(resume.updatedAt)}
                    </p>
                  </div>
                  <div className="ml-3 flex shrink-0 items-center gap-2">
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[0.7rem] font-semibold text-slate-500">
                      v{resume.versions[0]?.versionNumber ?? 1}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Latest applications */}
        <div className="rounded-[32px] border border-white/75 bg-white/92 p-6 shadow-[0_12px_36px_rgba(15,23,42,0.07)] backdrop-blur-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="section-label">Pipeline</p>
              <h2 className="mt-1.5 text-[1.1rem] font-semibold text-slate-950">Latest applications</h2>
            </div>
            <Button asChild variant="secondary" size="sm">
              <Link href="/applications">Manage tracker</Link>
            </Button>
          </div>

          {applications.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-[24px] border border-dashed border-slate-200 bg-slate-50/50 px-5 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-slate-100 text-slate-400">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-600">Tracker is empty</p>
                <p className="text-xs text-slate-400">Add opportunities once you start applying so resume, cover letter, and stage history stay connected.</p>
              </div>
              <Button asChild size="sm" variant="secondary">
                <Link href="/applications">Open tracker</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {applications.map((application) => {
                const status = statusStyles[application.status] ?? statusStyles["APPLIED"];
                const companyInitial = application.company?.[0]?.toUpperCase() ?? "?";
                return (
                  <div
                    key={application.id}
                    className="flex items-center gap-3.5 rounded-[20px] border border-slate-200/70 px-4 py-3.5"
                  >
                    {/* Company initial avatar */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-slate-100 text-[0.8rem] font-bold text-slate-600">
                      {companyInitial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.87rem] font-semibold text-slate-950">
                        {application.role}
                      </p>
                      <p className="truncate text-xs text-slate-400">{application.company}</p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[0.68rem] font-semibold ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Follow-up reminders ──────────────────────────────── */}
      <div className="rounded-[32px] border border-white/75 bg-white/92 p-6 shadow-[0_12px_36px_rgba(15,23,42,0.07)] backdrop-blur-sm">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-slate-950 text-white shadow-[0_6px_18px_rgba(15,23,42,0.20)]">
              <CalendarClock className="h-4.5 w-4.5 h-[18px] w-[18px]" />
            </div>
            <div>
              <p className="section-label">Upcoming</p>
              <h2 className="mt-0.5 text-[1.1rem] font-semibold text-slate-950">Follow-up reminders</h2>
            </div>
          </div>
          <Button asChild variant="secondary" size="sm">
            <Link href="/applications">Open tracker</Link>
          </Button>
        </div>

        {upcomingFollowUps.length === 0 ? (
          <div className="flex items-center gap-4 rounded-[22px] border border-dashed border-slate-200 bg-slate-50/50 px-5 py-6">
            <CalendarClock className="h-5 w-5 shrink-0 text-slate-300" />
            <p className="text-[0.83rem] text-slate-400">
              No follow-up dates scheduled yet. Add interview dates, check-ins, and response deadlines in the application tracker.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {upcomingFollowUps.map((application) => {
              const status = statusStyles[application.status] ?? statusStyles["APPLIED"];
              const daysUntil = application.nextStepAt
                ? Math.ceil((new Date(application.nextStepAt).getTime() - currentTime) / 86400000)
                : null;
              const isUrgent = daysUntil !== null && daysUntil <= 2;
              return (
                <div
                  key={application.id}
                  className={`rounded-[22px] border p-4 ${isUrgent ? "border-amber-200 bg-amber-50/60" : "border-slate-200 bg-white"}`}
                >
                  <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[0.68rem] font-semibold ${status.className}`}>
                    {status.label}
                  </span>
                  <h3 className="mt-3 text-[0.88rem] font-semibold text-slate-950">{application.role}</h3>
                  <p className="text-xs text-slate-400">{application.company}</p>
                  <p className={`mt-3 text-xs font-medium ${isUrgent ? "text-amber-700" : "text-slate-500"}`}>
                    {isUrgent ? "⚡ " : ""}
                    {formatDate(application.nextStepAt, "EEE, MMM d")}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
