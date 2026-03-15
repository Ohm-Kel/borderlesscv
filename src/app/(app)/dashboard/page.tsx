import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, CalendarClock, FileText, Sparkles, Target } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { formatDate } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { requireOnboardedUser } from "@/lib/session";

export default async function DashboardPage() {
  const user = await requireOnboardedUser();

  const [profile, resumes, applications, applicationCount, upcomingFollowUps, coverLetters] = await Promise.all([
    prisma.masterProfile.findUnique({
      where: { userId: user.id },
      select: {
        profileCompleteness: true,
      },
    }),
    prisma.resume.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 3,
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
        },
      },
    }),
    prisma.application.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.application.count({
      where: { userId: user.id },
    }),
    prisma.application.findMany({
      where: {
        userId: user.id,
        nextStepAt: {
          not: null,
        },
      },
      orderBy: { nextStepAt: "asc" },
      take: 4,
    }),
    prisma.coverLetter.count({
      where: { userId: user.id },
    }),
  ]);

  const stats = [
    {
      label: "Profile completeness",
      value: `${profile?.profileCompleteness ?? 0}%`,
      icon: Target,
    },
    {
      label: "Resume versions",
      value: resumes.reduce((count, resume) => count + resume.versions.length, 0).toString(),
      icon: FileText,
    },
    {
      label: "Tracked applications",
      value: applicationCount.toString(),
      icon: BriefcaseBusiness,
    },
    {
      label: "Cover letters",
      value: coverLetters.toString(),
      icon: Sparkles,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="Your global hiring dashboard"
        description="Keep your profile fresh, create targeted resume versions, and track how each application is progressing."
        actions={
          <Button asChild>
            <Link href="/resumes">
              Create resume
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="rounded-[30px] bg-white">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <h3 className="text-2xl font-semibold text-slate-950">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[32px] bg-white">
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="section-label">Resume momentum</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">Recent resumes</h2>
              </div>
              <Button asChild variant="secondary">
                <Link href="/resumes">Open library</Link>
              </Button>
            </div>
            <div className="space-y-4">
              {resumes.length === 0 ? (
                <div className="rounded-[28px] bg-slate-100 p-5 text-sm leading-7 text-slate-600">
                  No resume versions yet. Start with your master profile, then create a country-aware base resume for your target market.
                </div>
              ) : (
                resumes.map((resume) => (
                  <Link
                    key={resume.id}
                    href={`/resumes/${resume.id}`}
                    className="flex items-center justify-between rounded-[24px] border border-slate-200 px-5 py-4 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <div>
                      <h3 className="font-semibold text-slate-950">{resume.title}</h3>
                      <p className="text-sm text-slate-500">
                        {resume.targetCountry || "No target country"} • Updated {formatDate(resume.updatedAt)}
                      </p>
                    </div>
                    <Badge variant="outline">v{resume.versions[0]?.versionNumber ?? 1}</Badge>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[32px] bg-white">
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="section-label">Pipeline</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">Latest applications</h2>
              </div>
              <Button asChild variant="secondary">
                <Link href="/applications">Manage tracker</Link>
              </Button>
            </div>
            <div className="space-y-3">
              {applications.length === 0 ? (
                <div className="rounded-[28px] bg-slate-100 p-5 text-sm leading-7 text-slate-600">
                  Your application tracker is empty. Add opportunities once you start applying so the resume, cover letter, and next-step history stay connected.
                </div>
              ) : (
                applications.map((application) => (
                  <div key={application.id} className="rounded-[24px] border border-slate-200 px-5 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-slate-950">
                          {application.role} at {application.company}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {application.location || application.country || "Location not set"} • Updated {formatDate(application.updatedAt)}
                        </p>
                      </div>
                      <Badge variant={application.status === "OFFER" ? "success" : application.status === "REJECTED" ? "danger" : "outline"}>
                        {application.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[32px] bg-white">
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div>
                <p className="section-label">Upcoming follow-ups</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">What needs action next</h2>
              </div>
            </div>
            <Button asChild variant="secondary">
              <Link href="/applications">Open tracker</Link>
            </Button>
          </div>
          {upcomingFollowUps.length === 0 ? (
            <div className="rounded-[28px] bg-slate-100 p-5 text-sm leading-7 text-slate-600">
              No follow-up dates scheduled yet. Add interview dates, check-ins, and response deadlines in the application tracker.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {upcomingFollowUps.map((application) => (
                <div key={application.id} className="rounded-[24px] border border-slate-200 p-4">
                  <Badge variant="outline">{application.status}</Badge>
                  <h3 className="mt-3 font-semibold text-slate-950">{application.role}</h3>
                  <p className="text-sm text-slate-500">{application.company}</p>
                  <p className="mt-3 text-sm text-slate-600">Next step: {formatDate(application.nextStepAt, "EEE, MMM d")}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
