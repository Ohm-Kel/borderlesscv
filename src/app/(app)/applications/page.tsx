import { PageHeader } from "@/components/shared/page-header";
import { ApplicationBoard } from "@/components/applications/application-board";
import { prisma } from "@/lib/prisma";
import { requireOnboardedUser } from "@/lib/session";

export default async function ApplicationsPage() {
  const user = await requireOnboardedUser();

  const [applications, resumes] = await Promise.all([
    prisma.application.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        resume: {
          select: {
            title: true,
          },
        },
        resumeVersion: {
          select: {
            versionNumber: true,
            title: true,
          },
        },
      },
    }),
    prisma.resume.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        versions: {
          orderBy: {
            versionNumber: "desc",
          },
          select: {
            id: true,
            versionNumber: true,
            title: true,
          },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Applications"
        title="Application tracker"
        description="Keep jobs, resume versions, and next steps in the same workspace so you can see what is working across markets."
      />
      <ApplicationBoard
        initialApplications={applications.map((application) => ({
          id: application.id,
          company: application.company,
          role: application.role,
          location: application.location,
          country: application.country,
          jobUrl: application.jobUrl,
          source: application.source,
          notes: application.notes,
          status: application.status,
          appliedAt: application.appliedAt?.toISOString() ?? null,
          nextStepAt: application.nextStepAt?.toISOString() ?? null,
          resumeId: application.resumeId,
          resumeVersionId: application.resumeVersionId,
          resumeTitle: application.resume?.title ?? null,
          resumeVersionLabel: application.resumeVersion ? `${application.resume?.title ?? "Resume"} • v${application.resumeVersion.versionNumber}` : null,
        }))}
        resumeOptions={resumes.map((resume) => ({ value: resume.id, label: resume.title }))}
        resumeVersionOptions={resumes.flatMap((resume) =>
          resume.versions.map((version) => ({
            value: version.id,
            label: `${resume.title} • v${version.versionNumber} • ${version.title}`,
            resumeId: resume.id,
          })),
        )}
      />
    </div>
  );
}
