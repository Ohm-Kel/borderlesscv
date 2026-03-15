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
    }),
    prisma.resume.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
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
        }))}
        resumeOptions={resumes.map((resume) => ({ value: resume.id, label: resume.title }))}
      />
    </div>
  );
}
